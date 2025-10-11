#!/bin/bash

# NCP Cloud Functions 빌드 스크립트
# 이 스크립트는 /ncp/build 디렉토리에 날짜시간이 포함된 zip 파일을 생성합니다

set -e

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

# 루트의 .env 파일에서 NCP 키 추출 (선택사항)
if [ -f "../../.env" ]; then
  echo "📝 .env 파일에서 NCP 환경 변수 추출 중..."
  grep "^NCP_" ../../.env > .env 2>/dev/null || echo "⚠️  .env에 NCP 키가 없습니다. NCP Console에서 설정하세요."
else
  echo "⚠️  루트에 .env 파일이 없습니다."
  echo "💡 로컬 테스트를 위해 .env 파일을 생성하거나, NCP Console에서 환경 변수를 설정하세요."
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
  echo "⚠️  .env 파일이 없습니다. 배포 후 NCP Console에서 환경 변수를 설정하세요."
fi

# 빌드 완료
echo "✅ 빌드 완료!"
echo "📄 생성된 파일: $ZIP_PATH"
ls -lh "$ZIP_PATH"
echo ""
echo "💡 배포 파일 위치:"
echo "   $(cd "$BUILD_DIR" && pwd)/$ZIP_FILENAME"

# 임시 .env 파일 정리 (보안을 위해)
if [ -f ".env" ]; then
  echo "🧹 임시 .env 파일 정리..."
  rm -f .env
fi

