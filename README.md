# Rollro

웨이포인트 기반 경로 저장 및 탐색 서비스

## 프로젝트 소개

Rollro는 여행 경로를 웨이포인트 단위로 저장하고 관리할 수 있는 서비스입니다.

### 주요 기능

- 🗺️ **웨이포인트 기반 경로 생성**: 지도에서 직접 클릭하여 여정 생성
- 🔗 **네이버 지도 경로 가져오기**: 네이버 지도 URL에서 경로 임포트
- 👥 **권한 관리 시스템**: Owner, Editor, Viewer 3단계 권한
- 🔐 **공개/비공개 설정**: 여정을 공개하거나 특정 사용자와만 공유
- 🔍 **검색 및 필터링**: 여정 검색과 권한별 필터링
- 📄 **페이지네이션**: 많은 여정을 효율적으로 탐색

## 기술 스택

- **Frontend**: SvelteKit, TypeScript
- **UI Framework**: SMUI (Svelte Material UI)
- **Backend**: Firebase (Firestore, Authentication, Functions)
- **Map**: Naver Maps API
- **Deployment**: Firebase Hosting

## 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Firebase CLI

### 1. Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### 2. 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/pureye4u/rollro.git
cd rollro

# 의존성 설치
npm install

# Functions 의존성 설치
cd functions
npm install
cd ..
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Firebase 설정을 추가합니다:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_USE_EMULATOR=false
```

### 4. Firebase 프로젝트 설정

```bash
# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화 (기존 프로젝트와 연결)
firebase use --add
```

## 개발 서버 실행

### 로컬 개발 (프로덕션 Firebase 사용)

```bash
# SMUI 테마 컴파일 및 개발 서버 시작
npm start

# 또는
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### Firebase Emulator 사용 (추천)

로컬에서 Firebase Emulator를 사용하여 개발하면 프로덕션 데이터를 건드리지 않고 안전하게 개발할 수 있습니다.

```bash
# 1. 환경 변수 설정
# .env 파일에서 VITE_FIREBASE_USE_EMULATOR=true로 설정

# 2. 터미널 1: Firebase Emulator 실행
firebase emulators:start

# 3. 터미널 2: 개발 서버 실행
npm run dev
```

Firebase Emulator UI는 `http://localhost:4000`에서 접근할 수 있습니다.

**Emulator 포트:**
- Authentication: `http://localhost:9099`
- Firestore: `http://localhost:9098`
- Hosting: `http://localhost:9097`
- Emulator UI: `http://localhost:4000`

## 빌드

프로덕션 빌드를 생성합니다:

```bash
npm run build
```

빌드된 파일은 `build/` 디렉토리에 생성됩니다.

빌드 결과를 로컬에서 미리보기:

```bash
npm run preview
```

## 배포

### Firebase Hosting에 배포

#### 1. 전체 배포 (Hosting + Functions)

```bash
# 빌드 및 배포
npm run build
firebase deploy
```

#### 2. Hosting만 배포

```bash
npm run build
firebase deploy --only hosting
```

#### 3. Functions만 배포

```bash
firebase deploy --only functions
```

### 배포 전 체크리스트

- [ ] 환경 변수가 올바르게 설정되어 있는지 확인
- [ ] `.env` 파일에서 `VITE_FIREBASE_USE_EMULATOR=false`로 설정
- [ ] `npm run build`가 오류 없이 완료되는지 확인
- [ ] Firebase 프로젝트가 올바르게 설정되어 있는지 확인 (`firebase use`)

## 프로젝트 구조

```
rollro/
├── src/
│   ├── components/        # Svelte 컴포넌트
│   │   ├── Map.svelte
│   │   ├── NavBarContainer.svelte
│   │   └── ...
│   ├── lib/              # 유틸리티 및 공통 라이브러리
│   │   ├── firebase.client.ts
│   │   └── session.ts
│   ├── models/           # 데이터 모델 및 타입 정의
│   │   └── RouteModel.ts
│   ├── routes/           # SvelteKit 라우트
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── route/
│   │   │   ├── +page.svelte      # 여정 목록
│   │   │   └── [slug]/
│   │   │       └── +page.svelte  # 여정 상세
│   │   ├── login/
│   │   ├── register/
│   │   └── ...
│   ├── services/         # 비즈니스 로직
│   │   ├── routeService.ts
│   │   └── userService.ts
│   └── theme/            # SMUI 테마 설정
├── functions/            # Firebase Functions
│   └── src/
├── static/              # 정적 파일
├── firebase.json        # Firebase 설정
├── svelte.config.js     # SvelteKit 설정
└── vite.config.ts       # Vite 설정
```

## 주요 스크립트

```bash
# 개발 서버 시작 (SMUI 테마 컴파일 포함)
npm start

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# TypeScript 타입 체크
npm run check

# TypeScript 타입 체크 (watch 모드)
npm run check:watch

# SMUI 테마 컴파일
npm run smui-theme
```

## 권한 시스템

### 권한 레벨

- **Owner**: 여정 소유자, 모든 권한 보유
  - 여정 수정/삭제
  - 권한 관리 (Editor/Viewer 추가/제거)
  - 공개/비공개 설정
  
- **Editor**: 편집 권한
  - 여정 수정 가능
  - 여정 조회 가능
  
- **Viewer**: 읽기 전용 권한
  - 여정 조회만 가능

### 공개/비공개 설정

- **공개 여정**: 모든 사용자가 조회 가능
- **비공개 여정**: Owner, Editor, Viewer만 조회 가능

## 사용 방법

### 1. 새 여정 만들기

1. 로그인 후 여정 목록 페이지에서 우측 하단의 `+` 버튼 클릭
2. 지도에서 원하는 위치를 클릭하여 웨이포인트 추가
3. 편집 완료 후 `저장` 버튼 클릭

### 2. 네이버 지도에서 경로 가져오기

1. 여정 상세 페이지에서 편집 모드 진입
2. `input` 아이콘(화살표) 버튼 클릭
3. 네이버 지도 경로 URL 입력
4. 자동으로 웨이포인트가 추가됨

### 3. 여정 공유하기

1. 여정 상세 페이지에서 편집 모드 진입
2. `share` 아이콘 버튼 클릭
3. Editor 또는 Viewer로 추가할 사용자 이메일 입력
4. 또는 공개 여정으로 설정

### 4. 여정 검색 및 필터링

1. 여정 목록 페이지에서 검색창에 키워드 입력
2. 필터 칩으로 여정 유형 선택:
   - 전체: 모든 접근 가능한 여정
   - 내 여정: 내가 소유한 여정
   - 공개: 공개 여정
   - 공유됨: 다른 사용자가 공유한 여정

## 트러블슈팅

### Firebase Emulator가 시작되지 않는 경우

```bash
# Java Runtime이 필요합니다
# macOS
brew install java

# 포트가 이미 사용 중인 경우
lsof -ti:9099,9098,9097,4000 | xargs kill -9
```

### SMUI 스타일이 적용되지 않는 경우

```bash
# SMUI 테마 재컴파일
npm run smui-theme
```

### 빌드 오류가 발생하는 경우

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제
rm -rf .svelte-kit
npm run build
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/pureye4u/rollro/issues)
