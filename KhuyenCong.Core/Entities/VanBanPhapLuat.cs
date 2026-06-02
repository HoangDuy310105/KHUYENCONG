using System;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class VanBanPhapLuat : BaseEntity
{
    public string SoKyHieu { get; set; } = string.Empty;
    public string TrichYeu { get; set; } = string.Empty;
    public DateTime? NgayHieuLuc { get; set; }
    public TrangThaiVanBan TrangThai { get; set; } = TrangThaiVanBan.ConHieuLuc;
    public string? FileDinhKem { get; set; } // URL to PDF/Docx
    
    // 1: Văn bản pháp luật, 2: Hội nghị xúc tiến TM
    public int LoaiTaiLieu { get; set; } = 1; 
}
