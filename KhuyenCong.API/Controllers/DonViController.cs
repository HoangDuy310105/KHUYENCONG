using System;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace KhuyenCong.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DonViController : ControllerBase
{
    private readonly IDonViService _donViService;

    public DonViController(IDonViService donViService)
    {
        _donViService = donViService;
    }

    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin,Role_CoSo,Role_TTKC")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
    {
        var (items, totalCount) = await _donViService.GetPagedAsync(page, pageSize, search);
        return Ok(new { TotalCount = totalCount, Page = page, PageSize = pageSize, Data = items });
    }

    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin,Role_TTKC")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _donViService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize(Roles = "Role_So,Role_Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(DonViDto donViDto)
    {
        var result = await _donViService.CreateAsync(donViDto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Roles = "Role_So,Role_Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, DonViDto donViDto)
    {
        var result = await _donViService.UpdateAsync(id, donViDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "Role_Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _donViService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "Role_So,Role_Admin")]
    [HttpPost("import-excel")]
    public async Task<IActionResult> ImportExcel(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");
        var count = await _donViService.ImportExcelAsync(file.OpenReadStream());
        return Ok(new { Message = $"Đã nhập thành công {count} bản ghi." });
    }

    [Authorize(Roles = "Role_So,Role_Admin")]
    [HttpGet("export-excel")]
    public async Task<IActionResult> ExportExcel()
    {
        var fileBytes = await _donViService.ExportExcelAsync();
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "DanhSachDonVi.xlsx");
    }
}
