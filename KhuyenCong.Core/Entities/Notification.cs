using System;

namespace KhuyenCong.Core.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string Type { get; set; } = "System"; // e.g., System, Message, Alert
    public bool IsRead { get; set; } = false;
    
    // Navigation
    public virtual NguoiDung? User { get; set; }
}
