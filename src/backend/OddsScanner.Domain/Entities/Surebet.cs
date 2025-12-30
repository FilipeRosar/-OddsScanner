using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Surebet : BaseEntity
    {
        public Guid MatchId { get; private set; }
        public Match Match { get; private set; } = null!;
        public decimal ProfitPercent { get; private set; }
        public DateTime DetectedAt { get; private set; }
        public bool IsActive { get; private set; } = true;

        protected Surebet() { } 

        public Surebet(Guid matchId, decimal profitPercent)
        {
            MatchId = matchId;
            ProfitPercent = profitPercent;
            DetectedAt = DateTime.UtcNow;
        }

        public void UpdateProfit(decimal newProfit)
        {
            ProfitPercent = newProfit;
        }

        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
