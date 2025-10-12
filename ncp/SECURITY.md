# NCP Cloud Functions 보안 가이드

## 환경 변수 관리 방법 비교

### 방법 1: zip 파일에 .env 포함

**사용 시나리오**: 개발/테스트 환경

**빌드**:
```bash
npm run ncp:build
# 또는
./build.sh
```

**장점**:
- ✅ 배포가 간편 (zip 업로드만 하면 됨)
- ✅ 빠른 테스트 가능

**단점**:
- ❌ **zip 파일이 노출되면 키가 유출됨**
- ❌ 여러 개발자가 zip 파일에 접근 가능하면 키 노출
- ❌ 실수로 zip 파일을 Git에 커밋할 위험
- ❌ 키 변경 시 재빌드/재배포 필요
- ❌ 환경별(dev/prod) 다른 키 사용 어려움

**보안 등급**: ⚠️ 낮음

---

### 방법 2: NCP Console에서 환경 변수 설정 ✅

**사용 시나리오**: 프로덕션 환경 (강력 권장)

**빌드**:
```bash
npm run ncp:build:prod
# 또는
./build.sh --no-env
```

**배포 후 Console 설정**:
1. https://console.ncloud.com 접속
2. Cloud Functions > Actions > mapDirection
3. **디폴트 파라미터** 탭 선택
4. 파라미터 추가:
   ```json
   {
     "NCP_APIGW_API_KEY_ID": "your_client_id",
     "NCP_APIGW_API_KEY": "your_client_key"
   }
   ```

**장점**:
- ✅ **키가 빌드 결과물에 포함되지 않음** (가장 중요!)
- ✅ Console 접근 권한이 있는 사람만 키를 볼 수 있음
- ✅ 키 변경이 쉬움 (재배포 불필요, Console에서만 수정)
- ✅ 환경별 다른 키 관리 용이 (dev/staging/prod)
- ✅ 감사 로그로 변경 이력 추적 가능
- ✅ IAM 권한으로 세밀한 접근 제어 가능

**단점**:
- ⚠️ 초기 배포 시 한 단계 추가 필요

**보안 등급**: ✅ 높음 (업계 표준)

---

## 권장 워크플로우

### 개발 단계
```bash
# 1. 로컬 .env에 개발용 키 설정
echo "VITE_NCP_CLIENT_ID=dev_key_id" >> .env
echo "VITE_NCP_CLIENT_KEY=dev_key" >> .env

# 2. 빌드 (.env 포함)
npm run ncp:build

# 3. 테스트 환경에 배포
# NCP Console에서 업로드
```

### 프로덕션 배포
```bash
# 1. 보안 빌드 (.env 제외)
npm run ncp:build:prod

# 2. NCP Console 배포
# - zip 파일 업로드

# 3. Console에서 프로덕션 키 설정
# - NCP_APIGW_API_KEY_ID=prod_key_id
# - NCP_APIGW_API_KEY=prod_key
```

---

## 보안 체크리스트

- [ ] 프로덕션 배포 시 `--no-env` 옵션 사용
- [ ] NCP Console에서 환경 변수 직접 설정
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `ncp/build/` 디렉토리가 `.gitignore`에 포함되어 있는지 확인
- [ ] 개발/프로덕션 환경별로 다른 키 사용
- [ ] 정기적으로 API 키 로테이션 (교체)
- [ ] 불필요한 권한은 제거
- [ ] API 사용량 모니터링 설정

---

## 키 유출 시 대응 방안

1. **즉시 NCP Console에서 해당 키 비활성화**
2. **새 키 생성**
3. **Console에서 환경 변수 업데이트**
4. **재배포 불필요** (Console 설정만으로 즉시 적용)

---

## 참고 자료

- [NCP Cloud Functions 보안 가이드](https://guide.ncloud-docs.com/docs/cloudfunction-security)
- [환경 변수 관리 모범 사례](https://12factor.net/config)

