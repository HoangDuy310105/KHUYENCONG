using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GiaiNganController : ControllerBase
{
    private readonly IGiaiNganService _giaiNganService;

    public GiaiNganController(IGiaiNganService giaiNganService)
    {
        _giaiNganService = giaiNganService;
    }

    /// <summary>
    /// Lấy danh sách tất cả đề án kèm tóm tắt thông tin giải ngân (cho trang Kinh phí & Quyết toán)
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _giaiNganService.GetDeAnGiaiNganSummaryAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy lịch sử giải ngân chi tiết của một đề án
    /// </summary>
    [HttpGet("dean/{deAnId}")]
    public async Task<IActionResult> GetByDeAn(Guid deAnId)
    {
        var result = await _giaiNganService.GetByDeAnIdAsync(deAnId);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới một đợt giải ngân (Tạm ứng hoặc Quyết toán) — Chỉ Sở, Bộ, Admin
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> Create([FromBody] GiaiNganCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _giaiNganService.CreateAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa một đợt giải ngân — Chỉ Admin
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Role_Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _giaiNganService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
