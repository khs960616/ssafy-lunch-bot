# ssafy-lunch-bot
SSAFY Lunch Menu Bot

## Build & Deploy (AWS lambda function & EventBridge Scheduler)

### Build
```
npm i
npm build
```

### Deploy
```
0. aws lambda function 생성 (런타임: Node.js 18.x)
1. aws lambda function name과 동일한 이름의 폴더 생성
2. 빌드 결과물인 dist/index.js, node_modules를 1에서 만든 폴더로 옮긴 후 압축한다.
3. 0에서 만든 lambda function -> 코드 -> zip 업로드
4. Aws EventBridge 일정 생성 ->  EventBridge 일정 -> 반복 일정 -> cron 기반 일정 
5. Invoke 대상 설정 -> 0에서 만든 lambda function 선택
```

추가적으로 .env 파일의 경우 aws lambda function -> 구성 -> 환경변수에서 key, value 형태로 등록
```
WELLSTORY_ID   웰스토리 아이디
WELLSTORY_PASSWORD 웰스토리 패스워드 
CHANNEL_NAME   Matter Most에서 만든  채널명
MATTER_MOST_HOOK  Matter Most Hook 주소
WELLSTORY_BASE_URL https://welplus.welstory.com
```

### 배포 과정에서 겪은 오류 
<strong>[상황] </strong>
```
기존 코드를 로컬에서 실행시켰을 때는 웰스토리에서 점심 메뉴를 불러오고, matter most web hook을 이용해 채널에 알람을 잘 보내졌으나,

aws lambda에 해당 코드를 배포하고나니, 웰스토리에서 메뉴까지는 잘 불러와졌으나, 채널에 알림이 가지 않는 오류가 발생
```

<strong>[분석] </strong>
```
초기에는 Matter most로 점심메뉴를 보내는 request 자체가 정상적으로 보내지지 않는다고 생각해서, 해당부분을 로깅하고자함. 
1. 로그를 남기기 위해 node_mattermost 코드를 열어봄
```

```javascript
"use strict";

var request  = require('request');
var deferred = require('deferred');

function Mattermost(hook_url, http_proxy_options) {
  this.hook_url = hook_url;
  this.http_proxy_options = http_proxy_options;
}

Mattermost.prototype.send = function(message, cb) {
  if (!message.text) {
    if (cb) cb.call(null,{message:'No text specified'},null);
    return;
  }

  var command = this.hook_url;
  var body = {
    text:     message.text,
  };

  if (message.username) { body.username = message.username; }
  if (message.channel) { body.channel = message.channel; }
  if (message.icon_url) { body.icon_url = message.icon_url; }
  if (message.icon_emoji) { body.icon_emoji = message.icon_emoji; }
  if (message.attachments) { body.attachments = message.attachments; }
  if (message.unfurl_links) { body.unfurl_links = message.unfurl_links; }
  if (message.link_names) { body.link_names = message.link_names; }

  var option = {
    proxy: (this.http_proxy_options && this.http_proxy_options.proxy) || process.env.https_proxy || process.env.http_proxy,
    url:   command,
    json:  body
  };

  if(!cb) var d = deferred();

  var req = request.post(option, function(err, res, body) {
    if (!err && body!='ok') {
      err = {message: body};
      body = null;
    }
    if (d) return err ? d.reject(err) : d.resolve({res: res, body: body});
    if (cb) return cb.call(null, err, body);
    return null;
  });

  return d ? d.promise : req;
};


Mattermost.prototype.respond = function(query,cb) {
  var obj = {};

  obj.token = query.token;
  obj.team_id = query.team_id;
  obj.channel_id = query.channel_id;
  obj.channel_name = query.channel_name;
  obj.timestamp = new Date(query.timestamp);
  obj.user_id = query.user_id;
  obj.user_name = query.user_name;
  obj.text = query.text;

  if (!cb) {
    return {text:''};
  } else {
    return cb.call(null,obj);
  }
};

module.exports = Mattermost;
```

```
해당 코드는 단순히 작성한 메시지를, matter most webhook주소로 post 요청을 보내고, promise를 return 해주는 함수였음. [1차적으로 비동기 함수가 정상적으로 처리되지 않아서 발생한 오류라 생각]

cloud watch를 확인해보니, 코드상에서 남겨둔 로그가 찍히지 않고, lambda에서 실행된 request가 종료됨을 발견함 [비동기 함수처리가 정상적으로 마무리 되지 않은 상태에서 request가 종료되었음을 확신함] 

```

[docs](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
```
If your code performs an asynchronous task, use the async/await pattern to make sure that the handler finishes running. Async/await is a concise and readable way to write asynchronous code in Node.js, without the need for nested callbacks or chaining promises. With async/await, you can write code that reads like synchronous code, while still being asynchronous and non-blocking.

The async keyword marks a function as asynchronous, and the await keyword pauses the execution of the function until a Promise is resolved.
```

<strong>[해결] </strong>
```
모든 비동기 함수에 await 함수를 추가하여, 요청이 정상적으로 종료되지 않았음에도 event로 발생한 request가 종료되지 않도록 수정함

느낀점
1. npmjs에서 라이브러리 사용 시, 각 소스 코드를 미리 살펴봐야할 필요가 있음
2. docs를 좀 더 꼼꼼히 읽는 습관을 들이자
```
