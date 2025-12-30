using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Subscriber : BaseEntity
    {
        public string Email { get; private set; } = string.Empty;
        public DateTime SubscribedAt { get; private set; }

        protected Subscriber() { }

        public Subscriber(string email)
        {
            Email = email.ToLowerInvariant().Trim();
            SubscribedAt = DateTime.UtcNow;
        }
    }
}
