using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DiaDiemController : ControllerBase
{
    private readonly IDiaDiemService _diaDiemService;

    public DiaDiemController(IDiaDiemService diaDiemService)
    {
        _diaDiemService = diaDiemService;
    }

    [HttpGet("tinh")]
    public async Task<IActionResult> GetTinhThanh()
    {
        var result = await _diaDiemService.GetTinhThanhAsync();
        return Content(result, "application/json");
    }

    [HttpGet("huyen/{maTinh}")]
    public async Task<IActionResult> GetQuanHuyen(string maTinh)
    {
        var result = await _diaDiemService.GetQuanHuyenAsync(maTinh);
        return Content(result, "application/json");
    }

    [HttpGet("xa/{maHuyen}")]
    public async Task<IActionResult> GetPhuongXa(string maHuyen)
    {
        var result = await _diaDiemService.GetPhuongXaAsync(maHuyen);
        return Content(result, "application/json");
    }
}
