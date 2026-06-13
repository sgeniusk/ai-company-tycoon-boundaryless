// 성급 비주얼 사다리 — 회사 단계가 오르면 오피스 배경이 진화한다 (feat-014 #5).
// 헤드리스 키 매핑만 담당(UnityEngine.UI 비의존). 실제 텍스처는 Codex 절차 생성으로 반입, 없으면 기본 office로 폴백.
namespace AICompanyTycoon.Systems
{
    public static class StageVisual
    {
        // 단계 id → 배경 리소스 키. 미존재 시 로더가 "Art/Background/office"로 폴백한다.
        // garage/seed = 기본 차고 오피스, 성장기 = 확장 오피스, 대기업 = 데이터센터, 정점 = 랜드마크 본사.
        public static string BackgroundKey(string stageId)
        {
            switch (stageId)
            {
                case "viral_app_company":
                case "enterprise_ai_vendor":
                    return "Art/Background/office_growth";
                case "ai_platform_giant":
                    return "Art/Background/office_datacenter";
                case "boundaryless_intelligence":
                    return "Art/Background/office_landmark";
                default: // garage_prototype, seed_startup
                    return "Art/Background/office";
            }
        }

        public const string FallbackKey = "Art/Background/office";
    }
}
