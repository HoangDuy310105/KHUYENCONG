using System;

namespace KhuyenCong.Service.DTOs;

public class LoaiDeAnDto
{
    public Guid Id { get; set; }
    public string MaLoai { get; set; } = string.Empty;
    public string TenLoai { get; set; } = string.Empty;
}
