using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace OddsScanner.Application.Services;

public interface INotificationService
{
    Task SendSurebetAlertAsync(string homeTeam, string awayTeam, decimal profitPercent);
}

public class NotificationService : INotificationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NotificationService> _logger;
    private readonly string _oneSignalAppId;
    private readonly string _oneSignalApiKey;
    private readonly string _resendApiKey;
    private readonly string _siteUrl;

    public NotificationService(HttpClient httpClient, IConfiguration config, ILogger<NotificationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _oneSignalAppId = config["OneSignal:AppId"] ?? throw new ArgumentNullException("OneSignal:AppId não configurado");
        _oneSignalApiKey = config["OneSignal:ApiKey"] ?? throw new ArgumentNullException("OneSignal:ApiKey não configurado");
        _resendApiKey = config["Resend:ApiKey"] ?? throw new ArgumentNullException("Resend:ApiKey não configurado");
        _siteUrl = config["SiteUrl"] ?? "https://seu-odds-scanner.com";
    }

    public async Task SendSurebetAlertAsync(string homeTeam, string awayTeam, decimal profitPercent)
    {
        var message = $"SUREBET DETECTADA! {homeTeam} x {awayTeam} → +{profitPercent:F2}% lucro garantido!";
        var shortMessage = $"{homeTeam} x {awayTeam}: +{profitPercent:F2}%";

        try
        {
            var pushPayload = new
            {
                app_id = _oneSignalAppId,
                include_all_segments = new[] { "All" }, 
                headings = new { en = "🚨 SUREBET ENCONTRADA!" },
                contents = new { en = shortMessage },
                url = _siteUrl,
                large_icon = "https://seu-site.com/icon-512.png", 
                chrome_web_icon = "https://seu-site.com/icon-192.png"
            };

            var pushContent = new StringContent(JsonSerializer.Serialize(pushPayload), Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", _oneSignalApiKey);

            var pushResponse = await _httpClient.PostAsync("https://onesignal.com/api/v1/notifications", pushContent);

            if (!pushResponse.IsSuccessStatusCode)
            {
                var error = await pushResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Falha ao enviar push OneSignal: {pushResponse.StatusCode} - {error}");
            }
            else
            {
                _logger.LogInformation($"Push enviado com sucesso: {shortMessage}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar push notification via OneSignal");
        }

        try
        {
            // 2. Email via Resend (para lista de inscritos ou admin)
            var emailPayload = new
            {
                from = "alertas@seuodds scanner.com",
                to = new[] { "seu-email@gmail.com" }, // substitua por lista real ou banco
                subject = "🚨 Surebet Encontrada!",
                html = $"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h1 style="color: #10b981;">🚨 SUREBET DETECTADA!</h1>
                        <h2 style="color: #1f2937;">{homeTeam} x {awayTeam}</h2>
                        <p style="font-size: 24px; color: #059669; font-weight: bold;">
                            Lucro garantido: +{profitPercent:F2}%
                        </p>
                        <p>Aposte nos 3 resultados em casas diferentes e garanta lucro independente do resultado!</p>
                        <a href="{_siteUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Ver Surebet Agora
                        </a>
                        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                            Você recebeu este alerta porque está inscrito nas notificações de Surebets do OddsScanner.
                        </p>
                    </div>
                    """
            };

            var emailContent = new StringContent(JsonSerializer.Serialize(emailPayload), Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _resendApiKey);

            var emailResponse = await _httpClient.PostAsync("https://api.resend.com/emails", emailContent);

            if (!emailResponse.IsSuccessStatusCode)
            {
                var error = await emailResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Falha ao enviar email Resend: {emailResponse.StatusCode} - {error}");
            }
            else
            {
                _logger.LogInformation($"Email enviado com sucesso: {shortMessage}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar email via Resend");
        }
    }
}