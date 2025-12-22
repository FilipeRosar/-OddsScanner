using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OddsScanner.Application.Interfaces;

namespace OddsScanner.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly IMatchService _service;

        public MatchesController(IMatchService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetMatches()
        {
            var result = await _service.GetAllMatchesAsync();
            return Ok(result);
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            await _service.CreateTestMatchAsync();
            return Ok("Dados criados via Service!");
        }
    }
}
