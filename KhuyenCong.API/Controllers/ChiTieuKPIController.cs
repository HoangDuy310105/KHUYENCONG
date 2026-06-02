using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChiTieuKPIController : ControllerBase
{
    private readonly IChiTieuKPIService _service;

    public ChiTieuKPIController(IChiTieuKPIService service)
    {
        _service = service;
    }

    [HttpGet("{deAnId}")]
    public async Task<IActionResult> GetByDeAnId(Guid deAnId)
    {
        var item = await _service.GetByDeAnIdAsync(deAnId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] CreateChiTieuKPIDto dto)
    {
        var result = await _service.SaveAsync(dto);
        return Ok(result);
    }
}
