using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class OddHistory : BaseEntity
    {
        public Guid OddId { get; private set; }
        public Odd Odd { get; private set; } = null!;
        public decimal Value { get; private set; }
        public DateTime RecordedAt { get; private set; }

        protected OddHistory() { }

        public OddHistory(Guid oddId, decimal value)
        {
            OddId = oddId;
            Value = value;
            RecordedAt = DateTime.UtcNow;
        }
    }
}
