using System;

namespace KhuyenCong.Service.DTOs;

public class LinhVucDto
{
    public Guid Id { get; set; }
    public string MaLinhVuc { get; set; } = string.Empty;
    public string TenLinhVuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public decimal? DinhMucHoTroMax { get; set; }
}
