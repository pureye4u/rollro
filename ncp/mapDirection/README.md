# NCP Cloud Functions - Map Direction

Naver Map Direction API를 프록시하는 Cloud Functions입니다.

## 개요

이 함수는 클라이언트에서 직접 API 키를 노출하지 않고 안전하게 Naver Map Direction API를 호출할 수 있도록 프록시 역할을 합니다.

## 함수 구조

```
ncp/mapDirection/
├── index.js           # 메인 함수 코드
├── package.json       # 의존성 정의
├── package-lock.json  # 의존성 락 파일
├── build.sh          # 빌드 스크립트
├── deploy.sh         # 배포 스크립트
├── README.md         # 이 문서
└── action.zip        # 빌드 결과물 (gitignore됨)
```

## 환경 설정

### 1. 환경 변수 설정

NCP API 키는 환경 변수로 관리됩니다. 두 가지 방법이 있습니다:

### NCP Console에서 디폴트 파라미터 설정 (필수)

배포 후 NCP Console에서 디폴트 파라미터를 설정해야 합니다:

1. [NCP Console](https://console.ncloud.com) 접속
2. Cloud Functions > Actions > mapDirection 선택
3. **디폴트 파라미터** 탭 선택
4. 다음 파라미터 추가:
   ```json
   {
     "NCP_APIGW_API_KEY_ID": "95uqsbhft5",
     "NCP_APIGW_API_KEY": "M19r1m5znwNWuImEs96aURFIDF6L4cz07gdfibCY"
   }
   ```
   또는 개별 추가:
   - 키: `NCP_APIGW_API_KEY_ID`, 값: 실제 Client ID
   - 키: `NCP_APIGW_API_KEY`, 값: 실제 Client Key
5. **저장** 클릭

### 2. .env.example 파일

`.env.example`은 참고용 파일입니다. 로컬 테스트가 필요한 경우에만 `.env` 파일을 생성하세요:

```bash
cd ncp/mapDirection
cp .env.example .env
# .env 파일을 열어서 실제 키 값으로 수정
```

**참고**: 빌드 시에는 **프로젝트 루트의 `.env`** 파일에서 자동으로 NCP 키를 추출하므로, 이 디렉토리에 `.env` 파일을 만들 필요가 없습니다.

## 로컬 개발

### 1. 의존성 설치

```bash
cd ncp/mapDirection
npm install
```

### 2. 환경 변수 설정 (선택 사항)

로컬에서 함수를 직접 테스트하려는 경우에만 `.env` 파일을 생성합니다:

```bash
# ncp/mapDirection/.env (선택 사항)
NCP_APIGW_API_KEY_ID=your_actual_key_id
NCP_APIGW_API_KEY=your_actual_key
```

**일반적으로는 필요하지 않습니다.** 빌드 시 프로젝트 루트의 `.env`에서 자동으로 가져옵니다.

### 3. 함수 테스트

Node.js 환경에서 직접 테스트할 수 있습니다:

```javascript
const { main } = require('./index');

// 테스트 파라미터
const params = {
  start: '127.1058342,37.359708',
  goal: '129.075986,35.179470',
  waypoints: '127.3595316,36.350819|127.5595316,36.550819',
  option: 'traavoidcaronly'
};

main(params).then(result => {
  console.log('Result:', result);
});
```

## 빌드

날짜시간이 포함된 배포 파일을 `/ncp/build` 디렉토리에 생성합니다:

### 프로덕션용 빌드 (.env 제외 - 기본, 권장 🔒)
```bash
chmod +x build.sh
./build.sh
```

### 개발/테스트용 빌드 (.env 포함)
```bash
./build.sh --with-env
```

### 빌드 결과

빌드가 완료되면 다음과 같은 형식의 파일이 생성됩니다:

```
/ncp/build/mapDirection_YYYYMMDD_HHMMSS.zip
예: /ncp/build/mapDirection_20251012_001301.zip
```

### 빌드 과정

1. `/ncp/build` 디렉토리 생성
2. 날짜시간 기반 파일명 생성 (`mapDirection_YYYYMMDD_HHMMSS.zip`)
3. 임시 파일 정리 (`node_modules` 삭제)
4. 프로젝트 루트의 `.env`에서 `VITE_NCP_CLIENT_ID`, `VITE_NCP_CLIENT_KEY` 추출 (있는 경우)
5. `npm install --production` 실행 (프로덕션 의존성만 설치)
6. 코드, 의존성, `.env`(있는 경우)를 zip으로 압축하여 `/ncp/build`에 저장
7. 임시 `.env` 파일 정리

**빌드 옵션**:
- **기본 모드** (`./build.sh`): 루트 `.env`에서 NCP 변수를 추출하여 zip에 포함
- **보안 모드** (`./build.sh --no-env`): .env 제외, Console에서 환경 변수 설정 필요

**주의**: 
- 빌드 파일은 Git에 추적되지 않습니다 (`.gitignore`에 포함됨)

## 배포

### 방법 1: 배포 스크립트 사용 (추천)

```bash
chmod +x deploy.sh
./deploy.sh [action-name]
```

스크립트가 자동으로 빌드를 수행하고 배포 안내를 출력합니다.

### 방법 2: NCP Console에서 수동 배포

1. **빌드 실행**
   ```bash
   ./build.sh
   ```
   → `/ncp/build/mapDirection_YYYYMMDD_HHMMSS.zip` 파일 생성

2. **NCP Console 접속**
   - https://console.ncloud.com 로그인
   - Services > Cloud Functions 메뉴 선택

3. **Action 생성 또는 선택**
   - Actions 탭에서 `mapDirection` 액션 선택
   - 없다면 새로 생성

4. **배포**
   - '배포' 버튼 클릭
   - `/ncp/build/` 디렉토리에서 가장 최근의 zip 파일 업로드
   - 배포 완료 대기

### 방법 3: NCP CLI 사용 (고급)

NCP CLI가 설치되어 있다면:

```bash
# NCP CLI 설치 (Node.js 필요)
npm install -g @ncloud/cli

# 인증 설정
ncloud configure

# 배포
ncloud cloud-functions deploy \
  --action mapDirection \
  --file action.zip \
  --region kr
```

## API 사용 방법

### 입력 파라미터

```javascript
{
  start: string,      // 출발지 좌표 "경도,위도"
  goal: string,       // 도착지 좌표 "경도,위도"
  waypoints: string,  // 경유지 좌표들 "|"로 구분
  option: string      // 경로 옵션 (예: 'traavoidcaronly')
}
```

### 응답 형식

```javascript
{
  responseData: {
    // Naver Map Direction API의 응답 데이터
    route: {
      traavoidcaronly: [{
        path: [[경도, 위도], ...],
        ...
      }]
    }
  }
}
```

### 클라이언트에서 호출 예제

```javascript
// NCP Cloud Functions 엔드포인트 URL
const functionUrl = 'https://your-cloud-function-url.apigw.ntruss.com/api/v1/web/your-namespace/mapDirection';

const params = {
  start: '127.1058342,37.359708',
  goal: '129.075986,35.179470',
  waypoints: '127.3595316,36.350819',
  option: 'traavoidcaronly'
};

const response = await fetch(functionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(params)
});

const data = await response.json();
console.log(data.responseData.route);
```

## 환경 변수 관리

이 함수는 환경 변수를 통해 API 키를 안전하게 관리합니다.

### 환경 변수 우선순위

1. **NCP Console 환경 변수** (최우선)
2. **빌드 시 포함된 .env 파일**
3. **환경 변수 없음** → 에러 반환

### 프로덕션 배포 시 권장 사항

보안을 위해 다음 중 하나의 방법을 선택하세요:

#### 옵션 1: 빌드 시 .env 포함 (간편)

프로젝트 루트의 `.env` 파일에 키를 추가하면 빌드 시 자동으로 포함됩니다:

```bash
# .env (프로젝트 루트)
NCP_APIGW_API_KEY_ID=your_actual_key_id
NCP_APIGW_API_KEY=your_actual_key
```

#### 옵션 2: NCP Console에서 설정 (더 안전)

배포 후 NCP Console에서 환경 변수를 설정:

1. Cloud Functions > Actions > mapDirection 선택
2. '환경 변수' 탭 선택
3. 변수 추가:
   - `NCP_APIGW_API_KEY_ID`: 실제 키 값
   - `NCP_APIGW_API_KEY`: 실제 키 값

**💡 추천**: 프로덕션 환경에서는 **옵션 2**를 사용하여 소스 코드나 빌드 결과물에 키가 포함되지 않도록 하세요.

## 주의사항

1. **API 키 보안**: 프로덕션 환경에서는 반드시 환경 변수를 사용하세요.
2. **요청 제한**: Naver API의 호출 제한을 고려하여 사용하세요.
3. **에러 처리**: 클라이언트에서 적절한 에러 처리를 구현하세요.
4. **비용**: NCP Cloud Functions의 사용량에 따라 요금이 부과됩니다.

## 트러블슈팅

### action.zip이 생성되지 않는 경우

```bash
# 스크립트 실행 권한 확인
chmod +x build.sh

# zip 명령어 설치 확인 (macOS는 기본 설치됨)
which zip
```

### 함수 호출 시 에러가 발생하는 경우

1. NCP Console에서 함수 로그 확인
2. API 키가 올바른지 확인
3. 파라미터 형식이 올바른지 확인

### 의존성 설치 실패

```bash
# npm 캐시 삭제
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 참고 자료

- [NCP Cloud Functions 문서](https://guide.ncloud-docs.com/docs/cloudfunction-overview)
- [Naver Map Direction API](https://api.ncloud-docs.com/docs/ai-naver-mapsdirections)
- [NCP API Gateway](https://guide.ncloud-docs.com/docs/apigw-overview)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

