using System;

namespace KhuyenCong.Core.Entities;

public class SanPhamOcop : BaseEntity
{
    public Guid DonViId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int PhanHangSao { get; set; }
    public DateTime? NgayCongNhan { get; set; }
    public string CapChungNhan { get; set; } = string.Empty;
    public string QuyetDinhCongNhan { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public string? MoTa { get; set; }

    // Bổ sung các trường quản lý CNNT Tiêu biểu
    public int LoaiSanPham { get; set; } = 1; // 1: OCOP, 2: CNNT Tiêu biểu
    public int TrangThai { get; set; } = 1; // 1: Đăng ký dự thi, 2: Đạt bình chọn, 3: Không đạt
    public int? NamBinhChon { get; set; }

    // Navigation
    public virtual DonVi? DonVi { get; set; }
}
