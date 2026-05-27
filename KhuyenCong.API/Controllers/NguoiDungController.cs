using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Authorize(Roles = "Role_Admin")]
[Route("api/nguoi-dung")]
[ApiController]
public class NguoiDungController : ControllerBase
{
    private readonly INguoiDungService _nguoiDungService;

    public NguoiDungController(INguoiDungService nguoiDungService)
    {
        _nguoiDungService = nguoiDungService;
    }

    // Lấy toàn bộ danh sách tài khoản
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _nguoiDungService.GetAllAsync();
        return Ok(result);
    }

    // Lấy chi tiết tài khoản theo ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _nguoiDungService.GetByIdAsync(id);
        if (result == null) return NotFound(new { Message = "Không tìm thấy người dùng." });
        return Ok(result);
    }

    // Thêm mới một tài khoản
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NguoiDungDto dto)
    {
        try
        {
            var result = await _nguoiDungService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // Cập nhật thông tin tài khoản (trừ mật khẩu)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NguoiDungDto dto)
    {
        var isSuccess = await _nguoiDungService.UpdateAsync(id, dto);
        if (!isSuccess) return NotFound(new { Message = "Không tìm thấy người dùng để cập nhật." });
        
        return NoContent();
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var isSuccess = await _nguoiDungService.ApproveAsync(id);
        if (!isSuccess) return NotFound(new { Message = "Không tìm thấy người dùng." });
        return Ok(new { Message = "Duyệt tài khoản thành công." });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var isSuccess = await _nguoiDungService.RejectAsync(id);
        if (!isSuccess) return NotFound(new { Message = "Không tìm thấy người dùng." });
        return Ok(new { Message = "Từ chối và xóa yêu cầu tài khoản thành công." });
    }

    // Khóa/Vô hiệu hóa tài khoản (Thay vì xóa vĩnh viễn)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var isSuccess = await _nguoiDungService.DeleteAsync(id);
        if (!isSuccess) return NotFound(new { Message = "Không tìm thấy người dùng để xóa." });
        
        return NoContent();
    }
}
