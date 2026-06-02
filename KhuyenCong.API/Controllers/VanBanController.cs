using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/van-ban")]
[ApiController]
public class VanBanController : ControllerBase
{
    private readonly IVanBanService _vanBanService;

    public VanBanController(IVanBanService vanBanService)
    {
        _vanBanService = vanBanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? keyword = null, [FromQuery] int? loaiTaiLieu = null)
    {
        var (items, totalCount) = await _vanBanService.GetPagedAsync(page, pageSize, keyword, loaiTaiLieu);
        return Ok(new { Items = items, TotalCount = totalCount });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _vanBanService.GetByIdAsync(id);
        if (result == null) return NotFound("Không tìm thấy văn bản.");
        return Ok(result);
    }

    // Chỉ Admin và Sở mới được thêm, sửa, xóa
    [Authorize(Roles = "Role_Admin,Role_So")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VanBanDto vanBanDto)
    {
        try
        {
            var result = await _vanBanService.CreateAsync(vanBanDto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize(Roles = "Role_Admin,Role_So")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] VanBanDto vanBanDto)
    {
        try
        {
            var isUpdated = await _vanBanService.UpdateAsync(id, vanBanDto);
            if (!isUpdated) return NotFound("Không tìm thấy văn bản để cập nhật.");
            return Ok(new { Message = "Cập nhật thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize(Roles = "Role_Admin,Role_So")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var isDeleted = await _vanBanService.DeleteAsync(id);
        if (!isDeleted) return NotFound("Không tìm thấy văn bản để xóa.");
        return Ok(new { Message = "Xóa thành công" });
    }
}
