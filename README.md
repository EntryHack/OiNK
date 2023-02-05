# OiNK

## 모듈 설치

```bash
$ npm i
# 또는
$ yarn
```

## 환경변수 설정

```
BOT_USERNAME=examplebot
BOT_PASSWORD=p@ssw0rd

# 계정 생성 기능 사용 시에만 설정
SUB_BOT_SAVE_FILE=./accounts.json
SUB_BOT_USERNAME_PREFIX=examplebot
SUB_BOT_NICKNAME_PREFIX=ExBot_
SUB_BOT_PASSWORD=p@ssw0rd
```

## 봇 실행

```bash
$ npm run build
$ npm start
# 또는
$ yarn build
$ yarn start
```

## 봇 실행 (PM2)

```bash
$ npm run build
$ npm run start:pm2
# 또는
$ yarn build
$ yarn start:pm2
```

## 봇 실행 (Nodemon)

```bash
$ npm run build
$ npm run dev
# 또는
$ yarn build
$ yarn dev
```

## 봇 부계정 생성

```bash
$ npm run create-accounts
# 또는
$ yarn create-accounts
```

- 실행한 뒤 나오는 `COUNT: ` 뒤에 생성할 계정의 개수 입력 (10개 이하 권장, 너무 큰 수 입력 시 에러가 발생할 수 있음)
- `./accounts.json`에 저장됨
