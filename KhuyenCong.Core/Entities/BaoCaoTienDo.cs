using System;

namespace KhuyenCong.Core.Entities;

public class BaoCaoTienDo : BaseEntity
{
    public Guid DeAnId { get; set; }
    public int ThangBaoCao { get; set; }
    public int NamBaoCao { get; set; }
    public int PhanTramHoanThanh { get; set; }
    public string? NoiDungBaoCao { get; set; }
    public string? FileMinhChung { get; set; }
    public DateTime NgayBaoCao { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual DeAn? DeAn { get; set; }
}
