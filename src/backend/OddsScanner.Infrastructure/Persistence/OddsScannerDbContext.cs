using Microsoft.EntityFrameworkCore;
using OddsScanner.Domain.Entities;

namespace OddsScanner.Infrastructure.Persistence
{
    public class OddsScannerDbContext : DbContext
    {
        public OddsScannerDbContext(DbContextOptions<OddsScannerDbContext> options) : base(options)
        {
        }

        public DbSet<Match> Matches { get; set; } = null!;
        public DbSet<Bookmaker> Bookmakers { get; set; } = null!;
        public DbSet<Odd> Odds { get; set; } = null!;
        public DbSet<Subscriber> Subscribers { get; set; } = null!;
        public DbSet<Surebet> Surebets { get; set; } = null!; 
        public DbSet<OddHistory> OddHistories { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Match>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.HomeTeam).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AwayTeam).IsRequired().HasMaxLength(100);
                entity.Property(e => e.League).IsRequired().HasMaxLength(100);
                entity.Property(e => e.StartTime).IsRequired();

                entity.Property(e => e.AvgGoals).HasPrecision(5, 2);
                entity.Property(e => e.AvgCorners).HasPrecision(5, 2);

                entity.HasMany(m => m.Odds)
                      .WithOne(o => o.Match)
                      .HasForeignKey(o => o.MatchId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.Surebets)
                      .WithOne(s => s.Match)
                      .HasForeignKey(s => s.MatchId)
                      .OnDelete(DeleteBehavior.Cascade);

  
                entity.OwnsMany(e => e.HeadToHead, h =>
                {
                    h.ToTable("MatchHeadToHead");
                    h.WithOwner().HasForeignKey("MatchId");
                    h.Property<int>("Id"); 
                    h.HasKey("Id");
                    h.Property(x => x.Winner).HasMaxLength(50);
                });

                entity.OwnsMany(e => e.HomeForm, f =>
                {
                    f.ToTable("MatchHomeForm");
                    f.WithOwner().HasForeignKey("MatchId");
                    f.Property<int>("Id");
                    f.HasKey("Id");
                    f.Property(x => x.Result).HasMaxLength(1); 
                    f.Property(x => x.Opponent).HasMaxLength(100);
                });

                entity.OwnsMany(e => e.AwayForm, f =>
                {
                    f.ToTable("MatchAwayForm");
                    f.WithOwner().HasForeignKey("MatchId");
                    f.Property<int>("Id");
                    f.HasKey("Id");
                    f.Property(x => x.Result).HasMaxLength(1); 
                    f.Property(x => x.Opponent).HasMaxLength(100);
                });
            });

            modelBuilder.Entity<Bookmaker>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.WebsiteUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.AffiliateUrl).HasMaxLength(500); 
            });
            modelBuilder.Entity<OddHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).HasPrecision(10, 2);
                entity.HasOne(e => e.Odd)
                      .WithMany()
                      .HasForeignKey(e => e.OddId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.OddId, e.RecordedAt });
            });
            modelBuilder.Entity<Odd>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).HasPrecision(10, 2);
                entity.Property(e => e.Selection).IsRequired().HasMaxLength(20);

                entity.HasOne(o => o.Bookmaker)
                      .WithMany()
                      .HasForeignKey(o => o.BookmakerId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(o => o.History)
                  .WithOne(h => h.Odd)
                  .HasForeignKey(h => h.OddId);
            });

            modelBuilder.Entity<Subscriber>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Surebet>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ProfitPercent).HasPrecision(10, 2);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });
        }
    }
}