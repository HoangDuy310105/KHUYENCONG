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

    private Guid? GetUserDonViId()
    {
        var donViIdClaim = User.FindFirst("DonViId")?.Value;
        if (!string.IsNullOrEmpty(donViIdClaim) && Guid.TryParse(donViIdClaim, out var parsed)) return parsed;
        return null;
    }

    private bool IsCoSoRole()
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return role == "Role_CoSo" || role == "1";
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

        // Kiểm tra IDOR: Cơ sở chỉ được xem sản phẩm OCOP của đơn vị mình
        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || item.DonViId != userDonViId)
                return Forbid();
        }

        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin")]
    public async Task<IActionResult> Create([FromBody] SanPhamOcopDto dto)
    {
        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || dto.DonViId != userDonViId)
                return Forbid(); // Cơ sở không được tạo OCOP cho đơn vị khác
        }
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SanPhamOcopDto dto)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();

        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || existing.DonViId != userDonViId || dto.DonViId != userDonViId)
                return Forbid(); // Cơ sở không được sửa OCOP của đơn vị khác hoặc đổi sang đơn vị khác
            
            // Chặn Cơ sở tự nâng trạng thái
            if (dto.TrangThai > 1)
            {
                return BadRequest(new { Message = "Cơ sở không có quyền tự phê duyệt sản phẩm." });
            }
        }

        var result = await _service.UpdateAsync(id, dto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();

        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || existing.DonViId != userDonViId)
                return Forbid(); // Cơ sở không được xóa OCOP của đơn vị khác
        }

        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
