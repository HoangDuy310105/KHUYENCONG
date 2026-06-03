using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/tin-tuc")]
[ApiController]
public class TinTucController : ControllerBase
{
    private readonly ITinTucService _tinTucService;

    public TinTucController(ITinTucService tinTucService)
    {
        _tinTucService = tinTucService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? keyword = null, [FromQuery] string? category = null)
    {
        var result = await _tinTucService.GetPagedAsync(page, pageSize, keyword, category);
        return Ok(new 
        {
            items = result.Items,
            totalCount = result.TotalCount,
            totalPages = (int)Math.Ceiling(result.TotalCount / (double)pageSize)
        });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Khi người dùng bấm vào xem chi tiết, tự động tăng lượt xem
        await _tinTucService.IncrementViewCountAsync(id);
        
        var result = await _tinTucService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize] // Chỉ cho phép user đã đăng nhập
    public async Task<IActionResult> Create([FromBody] CreateTinTucDto request)
    {
        var result = await _tinTucService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTinTucDto request)
    {
        var success = await _tinTucService.UpdateAsync(id, request);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _tinTucService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
