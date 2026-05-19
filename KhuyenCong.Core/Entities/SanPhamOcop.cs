using System;

namespace KhuyenCong.Core.Entities;

public class SanPhamOcop : BaseEntity
{
    public Guid DonViId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int PhanHangSao { get; set; }
    public DateTime? NgayCongNhan { get; set; }

    // Navigation
    public virtual DonVi? DonVi { get; set; }
}
