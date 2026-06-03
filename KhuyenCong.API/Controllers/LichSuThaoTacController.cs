using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
// [Authorize] // Có thể thêm Authorize để bảo mật
public class LichSuThaoTacController : ControllerBase
{
    private readonly ILichSuThaoTacService _lichSuThaoTacService;

    public LichSuThaoTacController(ILichSuThaoTacService lichSuThaoTacService)
    {
        _lichSuThaoTacService = lichSuThaoTacService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _lichSuThaoTacService.GetAllAsync();
        return Ok(logs);
    }
}
