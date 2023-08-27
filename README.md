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
