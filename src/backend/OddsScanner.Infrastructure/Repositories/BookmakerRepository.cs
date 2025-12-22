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
    public class BookmakerRepository : IBookmakerRepository
    {
        private readonly OddsScannerDbContext _context;

        public BookmakerRepository(OddsScannerDbContext context)
        {
            _context = context;
        }
        public async Task<Bookmaker?> GetByNameAsync(string name)
        {
            return await _context.Bookmakers.FirstOrDefaultAsync(b => b.Name == name);
        }
        public async Task AddAsync(Bookmaker bookmaker)
        {
            await _context.Bookmakers.AddAsync(bookmaker);
        }
    }
}
