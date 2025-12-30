using OddsScanner.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Interfaces
{
    public interface ISubscriberRepository
    {
        Task<Subscriber?> GetByEmailAsync(string email);
        Task AddAsync(Subscriber subscriber);
    }
}
