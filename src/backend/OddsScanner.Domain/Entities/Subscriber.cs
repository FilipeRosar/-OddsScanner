using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Subscriber : BaseEntity
    {
        public string Email { get; init; } = string.Empty;
        public DateTime SubscribedAt { get; init; }

        protected Subscriber() { }

        public Subscriber(string email)
        {
            Email = email.Trim().ToLowerInvariant();
            SubscribedAt = DateTime.UtcNow;
        }
    }
}
