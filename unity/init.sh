#!/bin/bash
# Unity 하네스 검증 — EditMode 테스트를 배치모드로 돌린다.
set -e
PROJ="$(cd "$(dirname "$0")" && pwd)"
echo "=== AI Company Tycoon (Unity) 검증 ==="

# Unity 에디터 탐지 (UNITY_BIN 우선, 없으면 Hub 설치본 중 최신)
if [ -n "$UNITY_BIN" ] && [ -x "$UNITY_BIN" ]; then
  UNITY="$UNITY_BIN"
else
  UNITY="$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity 2>/dev/null | sort -V | tail -1)"
fi
if [ -z "$UNITY" ] || [ ! -x "$UNITY" ]; then
  echo "Unity 에디터를 못 찾음. UNITY_BIN 환경변수로 지정하라."
  exit 1
fi
echo "Unity: $UNITY"

mkdir -p "$PROJ/Logs"
RESULTS="$PROJ/Logs/editmode-results.xml"
echo "=== EditMode 테스트 ==="
"$UNITY" -batchmode -nographics -projectPath "$PROJ" \
  -runTests -testPlatform EditMode \
  -testResults "$RESULTS" -logFile - \
  || { echo "EditMode 테스트 실패 또는 실행 오류 — $RESULTS 확인"; exit 1; }

echo "=== 검증 완료 (Verification Complete) ==="
echo "결과 — $RESULTS"
echo ""
echo "다음 단계 — clean restart 가능 상태"
echo "1. feature_list.json 에서 현재 피처 상태 확인"
echo "2. 미완 피처 하나 선택 (지금은 feat-001 Data Pipeline)"
echo "3. 그 피처만 구현 후 검증 재실행"
