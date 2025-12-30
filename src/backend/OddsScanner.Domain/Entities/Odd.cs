using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Odd : BaseEntity
    {
        public decimal Value { get; private set; } 
        public string MarketName { get; private set; } 
        public string Selection { get; private set; } 
        public DateTime LastUpdated { get; private set; }

        public Guid MatchId { get; private set; }
        public Match Match { get; private set; }

        public Guid BookmakerId { get; private set; }
        public Bookmaker Bookmaker { get; private set; }
        public ICollection<OddHistory> History { get; private set; } = new List<OddHistory>();
        public Odd(decimal value, string marketName, string selection, Guid matchId, Guid bookmakerId)
        {
            if (value <= 1) throw new ArgumentException("Odd deve ser maior que 1.0");

            Value = value;
            MarketName = marketName;
            Selection = selection;
            MatchId = matchId;
            BookmakerId = bookmakerId;
            LastUpdated = DateTime.UtcNow;
        }

        public void UpdateValue(decimal newValue)
        {
            if (Value != newValue)
            {
                Value = newValue;
                LastUpdated = DateTime.UtcNow;
            }
        }
    }
}
