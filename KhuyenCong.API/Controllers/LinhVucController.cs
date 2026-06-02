using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace KhuyenCong.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LinhVucController : ControllerBase
{
    private readonly ILinhVucService _linhVucService;

    public LinhVucController(ILinhVucService linhVucService)
    {
        _linhVucService = linhVucService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _linhVucService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Role_So,Role_Admin,Role_Bo,Role_CoSo,Role_TTKC")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(System.Guid id)
    {
        var result = await _linhVucService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize(Roles = "Role_Admin,Role_Bo")]
    [HttpPost]
    public async Task<IActionResult> Create(KhuyenCong.Service.DTOs.LinhVucDto linhVucDto)
    {
        var result = await _linhVucService.CreateAsync(linhVucDto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Roles = "Role_Admin,Role_Bo")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(System.Guid id, KhuyenCong.Service.DTOs.LinhVucDto linhVucDto)
    {
        var result = await _linhVucService.UpdateAsync(id, linhVucDto);
        if (!result) return NotFound();
        return NoContent();
    }


}
