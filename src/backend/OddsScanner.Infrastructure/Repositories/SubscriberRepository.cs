using Microsoft.EntityFrameworkCore;
using OddsScanner.Domain.Entities;
using OddsScanner.Domain.Interfaces;
using OddsScanner.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Infrastructure.Repositories
{
    public class SubscriberRepository : ISubscriberRepository
    {
        private readonly OddsScannerDbContext _context;

        public SubscriberRepository(OddsScannerDbContext context)
        {
            _context = context;
        }

        public async Task<Subscriber?> GetByEmailAsync(string email)
        {
            return await _context.Subscribers
                .FirstOrDefaultAsync(s => s.Email == email);
        }

        public async Task AddAsync(Subscriber subscriber)
        {
            await _context.Subscribers.AddAsync(subscriber);
        }
    }
}
