using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LoaiDeAnController : ControllerBase
{
    private readonly ILoaiDeAnService _loaiDeAnService;

    public LoaiDeAnController(ILoaiDeAnService loaiDeAnService)
    {
        _loaiDeAnService = loaiDeAnService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _loaiDeAnService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Role_So,Role_Admin,Role_Bo,Role_CoSo,Role_TTKC")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _loaiDeAnService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize(Roles = "Role_Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(LoaiDeAnDto loaiDeAnDto)
    {
        var result = await _loaiDeAnService.CreateAsync(loaiDeAnDto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Roles = "Role_Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, LoaiDeAnDto loaiDeAnDto)
    {
        var updated = await _loaiDeAnService.UpdateAsync(id, loaiDeAnDto);
        if (!updated) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "Role_Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _loaiDeAnService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
