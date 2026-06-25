using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Core.Interfaces;

namespace KhuyenCong.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var notifs = await _unitOfWork.Notifications.FindAsync(n => n.UserId == userId);
        return Ok(notifs.OrderByDescending(n => n.CreatedAt).Take(50).ToList());
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var notif = await _unitOfWork.Notifications.GetByIdAsync(id);
        if (notif == null) return NotFound();

        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (notif.UserId.ToString() != userIdStr) return Forbid();

        notif.IsRead = true;
        _unitOfWork.Notifications.Update(notif);
        await _unitOfWork.CompleteAsync();
        
        return Ok(new { Message = "Đã đánh dấu đọc." });
    }
}
