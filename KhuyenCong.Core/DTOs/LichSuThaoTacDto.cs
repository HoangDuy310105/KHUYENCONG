using System;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.DTOs;

public class LichSuThaoTacDto
{
    public Guid Id { get; set; }
    public Guid? DeAnId { get; set; }
    public string? TenDeAn { get; set; }
    public Guid NguoiDungId { get; set; }
    public string? TenNguoiDung { get; set; }
    public string HanhDong { get; set; } = string.Empty;
    public TrangThaiDeAn? TrangThaiCu { get; set; }
    public TrangThaiDeAn? TrangThaiMoi { get; set; }
    public string? LyDo { get; set; }
    public DateTime CreatedAt { get; set; }
}
