using System;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class NguoiDung : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RoleType Role { get; set; }
    
    // Foreign Key
    public Guid? DonViId { get; set; }
    
    // Navigation Property
    public virtual DonVi? DonVi { get; set; }
    
    public bool IsActive { get; set; } = true;
}
