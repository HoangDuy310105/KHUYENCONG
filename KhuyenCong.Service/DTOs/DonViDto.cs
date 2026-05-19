using System;

namespace KhuyenCong.Service.DTOs;

public class DonViDto
{
    public Guid Id { get; set; }
    public string MaSoThue { get; set; } = string.Empty;
    public string TenDonVi { get; set; } = string.Empty;
    public int LoaiDonVi { get; set; }
    public string? QuyMo { get; set; }
    public string? DiaChi { get; set; }
    public string? MaTinh { get; set; }
    public string? MaHuyen { get; set; }
    public string? MaXa { get; set; }
    public string? SoDienThoai { get; set; }
}
