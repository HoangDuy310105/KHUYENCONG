using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TienDoThucHienController : ControllerBase
{
    private readonly ITienDoThucHienService _tienDoService;

    public TienDoThucHienController(ITienDoThucHienService tienDoService)
    {
        _tienDoService = tienDoService;
    }

    [HttpGet("dean/{deAnId}")]
    public async Task<IActionResult> GetByDeAn(Guid deAnId)
    {
        var result = await _tienDoService.GetByDeAnIdAsync(deAnId);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Role_CoSo,Role_TTKC,Role_Admin")]
    public async Task<IActionResult> Create([FromBody] TienDoThucHienDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        try
        {
            var result = await _tienDoService.CreateAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
