using System;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

/// <summary>
/// Sản phẩm OCOP và Công nghiệp nông thôn tiêu biểu (CNNT Tiêu biểu)
/// Theo tài liệu V2 mục "Quản lý sản phẩm nông nghiệp nông thôn tiêu biểu"
/// và Tuần 1 mục 8.1 (Phân hệ 8: Xúc tiến thương mại & Sản phẩm tiêu biểu)
/// </summary>
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

    // MISSING-04 FIX: Đổi từ int thô sang Enum rõ ràng để tránh lỗi logic
    // Theo tài liệu Tuần 1, mục 8.1: Quản lý sản phẩm OCOP và CNNT Tiêu biểu
    public LoaiSanPhamOcop LoaiSanPham { get; set; } = LoaiSanPhamOcop.OCOP;

    // Trạng thái trong quy trình bình chọn: Đăng ký → Đạt/Không đạt
    public TrangThaiSanPhamOcop TrangThai { get; set; } = TrangThaiSanPhamOcop.DangKyDuThi;

    /// <summary>
    /// Năm tổ chức bình chọn (VD: 2024, 2025)
    /// </summary>
    public int? NamBinhChon { get; set; }

    // Navigation
    public virtual DonVi? DonVi { get; set; }
}

