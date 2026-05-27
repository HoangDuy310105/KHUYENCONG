using System;
using System.Text.Json;

namespace KhuyenCong.Service.DTOs;

public class DeAnDto
{
    public Guid Id { get; set; }
    public string MaDeAn { get; set; } = string.Empty;
    public string TenDeAn { get; set; } = string.Empty;
    
    public Guid LinhVucId { get; set; }
    public Guid LoaiDeAnId { get; set; }
    public Guid DonViThuHuongId { get; set; }
    public Guid? DonViThiCongId { get; set; }

    public decimal KinhPhiDuKien { get; set; }
    public int NguonKinhPhi { get; set; } = 2; // 1=TrungUong, 2=DiaPhương, 3=KetHop, 4=Khac
    public string? GhiChu { get; set; }
    public DateTime? ThoiGianBatDau { get; set; }
    public DateTime? ThoiGianKetThuc { get; set; }
    public int TrangThai { get; set; }
    
    public JsonDocument? HoSoDinhKem { get; set; }

    // Thông tin mở rộng (tùy chọn)
    public string? TenLinhVuc { get; set; }
    public string? TenDonViThuHuong { get; set; }
}
