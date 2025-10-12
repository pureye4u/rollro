#!/bin/bash

# NCP Cloud Functions 빌드 스크립트
# 이 스크립트는 /ncp/build 디렉토리에 날짜시간이 포함된 zip 파일을 생성합니다
#
# 사용법:
#   ./build.sh              - .env 제외 (기본, 프로덕션 권장)
#   ./build.sh --with-env   - .env 포함 (개발/테스트용)

set -e

# 옵션 파싱
INCLUDE_ENV=false  # 기본값: 보안을 위해 제외
if [ "$1" = "--with-env" ]; then
  INCLUDE_ENV=true
  echo "⚠️  개발 모드: .env 파일을 포함합니다."
fi

echo "🔧 NCP Cloud Functions 빌드 시작..."

# 현재 스크립트 위치로 이동
cd "$(dirname "$0")"

# 빌드 디렉토리 생성
BUILD_DIR="../build"
mkdir -p "$BUILD_DIR"

# 날짜시간 형식 생성 (YYYYMMDD_HHMMSS)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_FILENAME="mapDirection_${TIMESTAMP}.zip"
ZIP_PATH="$BUILD_DIR/$ZIP_FILENAME"

echo "📦 빌드 파일: $ZIP_FILENAME"

# 기존 빌드 결과물 정리 (현재 디렉토리의 임시 파일만)
echo "🧹 임시 파일 정리..."
rm -rf node_modules

# 루트의 .env 파일에서 NCP 키 추출 및 변환 (선택사항)
if [ "$INCLUDE_ENV" = true ]; then
  if [ -f "../../.env" ]; then
    echo "📝 .env 파일에서 NCP 환경 변수 추출 중..."
    
    # VITE_NCP_ 변수를 NCP_APIGW_ 형식으로 변환하여 추출
    if grep -q "^VITE_NCP_" ../../.env; then
      {
        grep "^VITE_NCP_CLIENT_ID=" ../../.env | sed 's/^VITE_NCP_CLIENT_ID=/NCP_APIGW_API_KEY_ID=/'
        grep "^VITE_NCP_CLIENT_KEY=" ../../.env | sed 's/^VITE_NCP_CLIENT_KEY=/NCP_APIGW_API_KEY=/'
      } > .env 2>/dev/null || true
      
      if [ -s ".env" ]; then
        echo "✅ NCP 환경 변수를 추출하고 변환했습니다."
        echo "   VITE_NCP_CLIENT_ID → NCP_APIGW_API_KEY_ID"
        echo "   VITE_NCP_CLIENT_KEY → NCP_APIGW_API_KEY"
      else
        rm -f .env
        echo "⚠️  .env에 VITE_NCP_CLIENT_ID 또는 VITE_NCP_CLIENT_KEY가 없습니다."
      fi
    else
      echo "⚠️  .env에 VITE_NCP_ 변수가 없습니다."
    fi
  fi
else
  echo "⏭️  .env 파일 제외 모드 - Console에서 환경 변수를 설정하세요."
fi

# 의존성 설치
echo "📦 의존성 설치..."
npm install --production

# zip 파일 생성 (.env 파일이 있으면 포함)
echo "📦 압축 파일 생성 중..."
if [ -f ".env" ]; then
  zip -r "$ZIP_PATH" index.js package.json package-lock.json node_modules .env
  echo "✅ .env 파일이 포함되었습니다."
else
  zip -r "$ZIP_PATH" index.js package.json package-lock.json node_modules
  echo "⚠️  .env 파일이 없습니다."
fi

# 빌드 완료
echo "✅ 빌드 완료!"
echo "📄 생성된 파일: $ZIP_PATH"
ls -lh "$ZIP_PATH"
echo ""
echo "💡 배포 파일 위치:"
echo "   $(cd "$BUILD_DIR" && pwd)/$ZIP_FILENAME"

# .env 파일 정리 및 안내
echo ""
if [ -f ".env" ]; then
  echo "🧹 임시 .env 파일 정리..."
  rm -f .env
  echo "✅ 환경 변수가 zip에 포함되었습니다."
  echo ""
  echo "⚠️  보안 주의사항:"
  echo "   - 개발/테스트 용도로만 사용하세요"
  echo "   - 프로덕션에서는 NCP Console에서 환경 변수를 직접 설정하는 것이 더 안전합니다"
else
  echo "🔒 .env 파일이 포함되지 않았습니다."
  echo ""
  echo "📋 배포 후 NCP Console에서 디폴트 파라미터를 설정하세요:"
  echo "   (Actions > mapDirection > 디폴트 파라미터 탭)"
  echo "   NCP_APIGW_API_KEY_ID=your_client_id"
  echo "   NCP_APIGW_API_KEY=your_client_key"
fi

