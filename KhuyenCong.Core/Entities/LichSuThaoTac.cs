using System;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class LichSuThaoTac : BaseEntity
{
    public Guid? DeAnId { get; set; }
    public Guid NguoiDungId { get; set; }
    
    public string HanhDong { get; set; } = string.Empty;
    public TrangThaiDeAn? TrangThaiCu { get; set; }
    public TrangThaiDeAn? TrangThaiMoi { get; set; }
    public string? LyDo { get; set; }

    // Navigation
    public virtual DeAn? DeAn { get; set; }
    public virtual NguoiDung? NguoiDung { get; set; }
}
