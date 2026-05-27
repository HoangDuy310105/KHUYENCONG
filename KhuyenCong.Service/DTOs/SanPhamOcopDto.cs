using System;
using System.ComponentModel.DataAnnotations;

namespace KhuyenCong.Service.DTOs;

public class SanPhamOcopDto
{
    public Guid Id { get; set; }

    [Required]
    public Guid DonViId { get; set; }

    public string? TenDonVi { get; set; }

    [Required]
    [StringLength(255)]
    public string TenSanPham { get; set; } = string.Empty;

    public int PhanHangSao { get; set; }

    public DateTime? NgayCongNhan { get; set; }

    public string CapChungNhan { get; set; } = string.Empty;

    public string QuyetDinhCongNhan { get; set; } = string.Empty;

    public string? HinhAnh { get; set; }

    public int LoaiSanPham { get; set; } = 1;
    public int TrangThai { get; set; } = 1;
    public int? NamBinhChon { get; set; }
}
