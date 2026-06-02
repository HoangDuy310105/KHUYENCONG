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
public class SanPhamOcopController : ControllerBase
{
    private readonly ISanPhamOcopService _service;

    public SanPhamOcopController(ISanPhamOcopService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? capChungNhan = null, [FromQuery] int? phanHangSao = null, [FromQuery] int? loaiSanPham = null, [FromQuery] string? trangThaiList = null)
    {
        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var donViIdClaim = User.FindFirst("DonViId")?.Value;

        Guid? userDonViId = null;
        if (!string.IsNullOrEmpty(donViIdClaim) && Guid.TryParse(donViIdClaim, out var parsedDonViId))
        {
            userDonViId = parsedDonViId;
        }

        var (items, totalCount) = await _service.GetPagedAsync(page, pageSize, search, capChungNhan, phanHangSao, loaiSanPham, trangThaiList, userDonViId, userRoleClaim);
        return Ok(new
        {
            data = items,
            total = totalCount,
            page,
            pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SanPhamOcopDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SanPhamOcopDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
