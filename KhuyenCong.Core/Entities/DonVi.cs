using System;
using System.Collections.Generic;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class DonVi : BaseEntity
{
    public string MaSoThue { get; set; } = string.Empty;
    public string TenDonVi { get; set; } = string.Empty;
    public LoaiDonVi LoaiDonVi { get; set; }
    public string? QuyMo { get; set; } // DNNVV, HTX, Tổ hợp tác...
    public string? DiaChi { get; set; }
    public string? MaTinh { get; set; }
    public string? MaHuyen { get; set; }
    public string? MaXa { get; set; }
    public string? SoDienThoai { get; set; }

    // Navigation Properties
    public virtual ICollection<NguoiDung> NguoiDungs { get; set; } = new List<NguoiDung>();
    public virtual ICollection<DeAn> DeAnThuHuongs { get; set; } = new List<DeAn>();
    public virtual ICollection<DeAn> DeAnThiCongs { get; set; } = new List<DeAn>();
    public virtual ICollection<SanPhamOcop> SanPhamOcops { get; set; } = new List<SanPhamOcop>();
}
