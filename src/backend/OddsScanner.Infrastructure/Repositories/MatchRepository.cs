using Microsoft.EntityFrameworkCore;
using OddsScanner.Domain.Entities;
using OddsScanner.Domain.Interfaces;
using OddsScanner.Infrastructure.Persistence;

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
                .Include(m => m.Surebets)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<Match>> GetAllAsync()
        {
            return await _context.Matches
                .AsNoTracking()
                .Include(m => m.Odds)
                    .ThenInclude(o => o.Bookmaker)
                .Include(m => m.Surebets)
                .OrderBy(m => m.StartTime)
                .ToListAsync();
        }

        public async Task<List<Match>> GetAllForUpdateAsync()
        {
            return await _context.Matches
                .Include(m => m.Odds)
                    .ThenInclude(o => o.Bookmaker)
                .Include(m => m.Surebets)
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
                .Include(m => m.Surebets)
                .OrderBy(m => m.StartTime)
                .ToListAsync();
        }

        public async Task UpdateAsync(Match match)
        {
            _context.Matches.Update(match);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}