using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OddsScanner.Domain.Entities;
using OddsScanner.Domain.Interfaces;

namespace OddsScanner.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubscribeController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<SubscribeController> _logger;

        public SubscribeController(IUnitOfWork unitOfWork, ILogger<SubscribeController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
            {
                return BadRequest(new { message = "Email inválido" });
            }

            try
            {
                var normalizedEmail = request.Email.Trim().ToLowerInvariant();

                // Verifica se já está inscrito
                var existing = await _unitOfWork.Subscribers.GetByEmailAsync(normalizedEmail);
                if (existing != null)
                {
                    return Ok(new { message = "Você já está inscrito!" });
                }

                var subscriber = new Subscriber(normalizedEmail);

                await _unitOfWork.Subscribers.AddAsync(subscriber);
                await _unitOfWork.CommitAsync();

                _logger.LogInformation($"Novo inscrito: {normalizedEmail}");

                return Ok(new { message = "Inscrito com sucesso! Você receberá alertas de surebets." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao inscrever email: {Email IEnumerator}", request.Email);
                return StatusCode(500, new { message = "Erro interno. Tente novamente mais tarde." });
            }
        }
    }

    public class SubscribeRequest
    {
        public string Email { get; set; } = string.Empty;
    }
}
