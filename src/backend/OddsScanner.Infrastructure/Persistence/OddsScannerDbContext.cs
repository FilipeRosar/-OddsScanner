using Microsoft.EntityFrameworkCore;
using OddsScanner.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Infrastructure.Persistence
{
    public class OddsScannerDbContext : DbContext
    {
        public OddsScannerDbContext(DbContextOptions<OddsScannerDbContext> options) : base(options)
        {
        }

        public DbSet<Match> Matches { get; set; }
        public DbSet<Bookmaker> Bookmakers { get; set; }
        public DbSet<Odd> Odds { get; set; }
        public DbSet<Subscriber> Subscribers { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Match>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.HomeTeam).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AwayTeam).IsRequired().HasMaxLength(100);

                entity.HasMany(m => m.Odds)
                      .WithOne(o => o.Match)
                      .HasForeignKey(o => o.MatchId)
                      .OnDelete(DeleteBehavior.Cascade); 
            });

            modelBuilder.Entity<Bookmaker>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<Odd>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Value).HasPrecision(10, 2); 

                entity.HasOne(o => o.Bookmaker)
                      .WithMany()
                      .HasForeignKey(o => o.BookmakerId)
                      .OnDelete(DeleteBehavior.Restrict); 
            });
        }
    }
}
