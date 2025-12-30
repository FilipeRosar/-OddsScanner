using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using OddsScanner.Application.Interfaces;
using OddsScanner.Application.Services;
using OddsScanner.Domain.Interfaces;
using OddsScanner.Infrastructure.Persistence;
using OddsScanner.Infrastructure.Repositories;
using OddsScanner.Infrastructure.Services;

namespace OddsScanner.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<OddsScannerDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(OddsScannerDbContext).Assembly.FullName)));

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis");
            });

            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddHttpClient();

            services.AddScoped<IMatchService, OddsScanner.Application.Services.MatchService>();
            services.AddSingleton<INotificationService, NotificationService>();
            return services;
        }
    }
}