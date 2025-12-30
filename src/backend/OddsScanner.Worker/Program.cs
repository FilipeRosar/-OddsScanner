using OddsScanner.Application.Services;
using OddsScanner.Infrastructure;
using OddsScanner.Worker;

var builder = Host.CreateApplicationBuilder(args);

// Infraestrutura (DbContext, Repositórios, UnitOfWork)
builder.Services.AddInfrastructure(builder.Configuration);

// ESSENCIAL: HttpClient genérico para NotificationService e OddsApiClient
builder.Services.AddHttpClient();

// Clients específicos
builder.Services.AddHttpClient<OddsApiClient>();

// Worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();