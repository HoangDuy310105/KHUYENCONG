using System;

namespace KhuyenCong.Service.DTOs;

public class VanBanDto
{
    public Guid Id { get; set; }
    public string SoKyHieu { get; set; } = string.Empty;
    public string TrichYeu { get; set; } = string.Empty;
    public DateTime? NgayHieuLuc { get; set; }
    public int TrangThai { get; set; } // 1: ConHieuLuc, 2: HetHieuLuc
    public string? FileDinhKem { get; set; }
    public int LoaiTaiLieu { get; set; } = 1; // 1: Văn bản, 2: Hội nghị
    public string? NguoiKy { get; set; }
    public DateTime CreatedAt { get; set; }
}
