#!/bin/bash

# NCP Cloud Functions 배포 스크립트
# 사용법: ./deploy.sh [action-name]

set -e

# 설정
ACTION_NAME="${1:-mapDirection}"  # 첫 번째 인자로 액션 이름을 받거나 기본값 사용
REGION="kr"  # 기본 리전

echo "🚀 NCP Cloud Functions 배포 시작..."
echo "📦 Action Name: $ACTION_NAME"
echo "🌏 Region: $REGION"

# 현재 스크립트 위치로 이동
cd "$(dirname "$0")"

# 빌드 실행
echo ""
echo "📦 빌드 실행..."
./build.sh

# 배포 안내
echo ""
echo "✅ 빌드가 완료되었습니다!"
echo ""

# 가장 최근 빌드 파일 찾기
LATEST_BUILD=$(ls -t ../build/mapDirection_*.zip 2>/dev/null | head -1)

if [ -n "$LATEST_BUILD" ]; then
  echo "📦 최신 빌드 파일: $(basename "$LATEST_BUILD")"
  echo ""
fi

echo "📋 수동 배포 방법:"
echo "1. NCP Console (https://console.ncloud.com)에 로그인"
echo "2. Services > Cloud Functions 메뉴로 이동"
echo "3. Actions 탭에서 '$ACTION_NAME' 액션 선택"
echo "4. '배포' 버튼 클릭"
if [ -n "$LATEST_BUILD" ]; then
  echo "5. '$(basename "$LATEST_BUILD")' 파일 업로드"
else
  echo "5. '/ncp/build/' 디렉토리의 최신 zip 파일 업로드"
fi
echo "6. 배포 완료 대기"
echo ""
echo "📋 CLI로 배포하려면 (준비 중):"
echo "ncloud-cli cloud-functions deploy --action $ACTION_NAME --file action.zip --region $REGION"
echo ""
echo "💡 Tip: NCP CLI를 사용하여 자동 배포를 설정할 수 있습니다."
echo "    자세한 내용은 README.md를 참고하세요."

