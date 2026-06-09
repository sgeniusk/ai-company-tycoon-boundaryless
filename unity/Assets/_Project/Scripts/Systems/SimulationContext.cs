// 코어 시뮬레이션 합성 루트 (Godot 오토로드 13개 대체). 모델 초기화 + 서비스 의존성 배선을 한곳에서 한다.
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class SimulationContext
    {
        public GameModel Model;
        public DataCatalog Catalog;
        public ResourceService Resources;
        public DomainService Domains;
        public CapabilityService Capabilities;
        public ProductService Products;
        public UpgradeService Upgrades;
        public AutomationService Automation;
        public CompanyStageService Stages;
        public RandomEventService Events;
        public MarketService Market;
        public MonthController Month;

        public static SimulationContext Create(DataCatalog catalog, int seed = 12345)
        {
            var m = NewGameModel(catalog);
            var ctx = new SimulationContext { Model = m, Catalog = catalog };
            ctx.Resources = new ResourceService(m, catalog);
            ctx.Domains = new DomainService(m, catalog);
            ctx.Capabilities = new CapabilityService(m, catalog, ctx.Resources, ctx.Domains);
            ctx.Products = new ProductService(m, catalog, ctx.Resources);
            ctx.Upgrades = new UpgradeService(m, catalog, ctx.Resources);
            ctx.Automation = new AutomationService(m, catalog, ctx.Resources);
            ctx.Stages = new CompanyStageService(m, catalog);
            ctx.Events = new RandomEventService(m, catalog, ctx.Resources, new SeededRng(seed));
            ctx.Market = new MarketService(m, catalog);
            ctx.Month = new MonthController(m, catalog, ctx.Resources, ctx.Products, ctx.Automation, ctx.Stages, ctx.Market);
            ctx.Domains.InitDefaults();
            ctx.Market.InitStates();
            return ctx;
        }

        static GameModel NewGameModel(DataCatalog c)
        {
            var m = new GameModel();
            if (c != null && c.resources != null)
                foreach (var r in c.resources)
                    if (r != null && ResourceIds.TryParse(r.id, out var id))
                        m.Set(id, r.initialValue);
            m.CurrentMonth = 1;
            m.CompanyStageId = "garage_prototype";
            m.Capabilities["language"] = 1; // 시작 능력
            return m;
        }
    }
}
