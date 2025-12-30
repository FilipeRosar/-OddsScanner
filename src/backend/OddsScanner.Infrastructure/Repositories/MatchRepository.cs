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
    public class MatchRepository : IMatchRepository
    {
        private readonly OddsScannerDbContext _context;

        public MatchRepository(OddsScannerDbContext context)
        {
            _context = context;
        }

        public async Task<Match?> GetByIdAsync(Guid id)
        {
            return await _context.Matches
                .Include(m => m.Odds) 
                .ThenInclude(o => o.Bookmaker) 
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<Match>> GetAllAsync()
        {
            return await _context.Matches
                .AsNoTracking() 
                .Include(m => m.Odds)              
                    .ThenInclude(o => o.Bookmaker)  
                .OrderBy(m => m.StartTime)
                .ToListAsync();
        }
        public async Task<List<Match>> GetAllForUpdateAsync()
        {
            return await _context.Matches
                .Include(m => m.Odds)
                .ThenInclude(o => o.Bookmaker)
                .ToListAsync();
        }

        public async Task AddAsync(Match match)
        {
            await _context.Matches.AddAsync(match);
        }
        public async Task<List<Match>> GetAllWithOddsAndBookmakersAsync()
        {
            return await _context.Matches
                .AsNoTracking()
                .Include(m => m.Odds)
                    .ThenInclude(o => o.Bookmaker)
                .OrderBy(m => m.StartTime)
                .ToListAsync();
        }
        public async Task UpdateAsync(Match match)
        {
            _context.Matches.Update(match);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
