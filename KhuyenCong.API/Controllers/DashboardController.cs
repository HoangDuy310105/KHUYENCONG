using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("charts")]
    public async Task<IActionResult> GetCharts()
    {
        var data = await _service.GetProjectsByFieldAsync();
        return Ok(data);
    }

    [HttpGet("gis-map")]
    public async Task<IActionResult> GetGisMap()
    {
        var markers = await _service.GetMapMarkersAsync();
        return Ok(markers);
    }
}
