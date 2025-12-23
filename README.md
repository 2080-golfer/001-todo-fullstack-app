# TODO 풀스택 애플리케이션

React + Node.js + Express + SQLite로 구현한 TODO 애플리케이션입니다.

## 기능

- ✅ TODO 추가
- ✅ TODO 완료 체크/해제
- ✅ TODO 수정
- ✅ TODO 삭제
- ✅ 데이터 서버에 영구 저장 (SQLite)

## 기술 스택

### 백엔드
- Node.js
- Express
- SQLite3
- CORS

### 프론트엔드
- React 18
- Vite
- CSS3

## 설치 및 실행

### 1. 백엔드 설치 및 실행

```bash
cd backend
npm install
npm start
```

서버가 http://localhost:5555 에서 실행됩니다.

### 2. 프론트엔드 설치 및 실행

새 터미널을 열고:

```bash
cd client
npm install
npm run dev
```

클라이언트가 http://localhost:3000 에서 실행됩니다.

### 3. 애플리케이션 사용

브라우저에서 http://localhost:3000 을 열어 TODO 앱을 사용할 수 있습니다.

## API 엔드포인트

- `GET /api/todos` - 모든 TODO 조회
- `POST /api/todos` - 새 TODO 생성
- `PUT /api/todos/:id` - TODO 수정
- `DELETE /api/todos/:id` - TODO 삭제

## 프로젝트 구조

```
001_Testing/
├── backend/
│   ├── server.js          # Express 서버
│   ├── database.js        # SQLite 데이터베이스 설정
│   ├── package.json
│   └── todos.db           # SQLite 데이터베이스 파일 (자동 생성)
├── client/
│   ├── src/
│   │   ├── App.jsx        # 메인 React 컴포넌트
│   │   ├── App.css        # 스타일
│   │   ├── main.jsx       # React 진입점
│   │   └── index.css      # 전역 스타일
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 개발 모드

개발 중에는 두 개의 터미널을 열어 백엔드와 프론트엔드를 동시에 실행해야 합니다.

백엔드에서 nodemon을 사용하려면:

```bash
cd backend
npm install -g nodemon
npm run dev
```
