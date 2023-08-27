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
