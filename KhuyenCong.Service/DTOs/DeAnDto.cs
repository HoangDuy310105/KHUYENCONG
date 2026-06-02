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

    public string? DiaDiem { get; set; }
    public Guid? DonViGiamSatId { get; set; }
    public DateTime? ThoiGianGiamSat { get; set; }
    public DateTime? NgayNghiemThu { get; set; }
    public JsonDocument? BienBanGiamSat { get; set; }
    public JsonDocument? BienBanNghiemThu { get; set; }

    // Thông tin mở rộng (tùy chọn)
    public string? TenLinhVuc { get; set; }
    public string? TenDonViThuHuong { get; set; }
    public string? DiaChi { get; set; }
    
    // Thêm các trường hiển thị chi tiết (đơn vị thi công, giám sát, tài chính)
    public string? TenDonViThiCong { get; set; }
    public string? DonViGiamSat { get; set; }
    public decimal KinhPhiTamUng { get; set; }
    public decimal KinhPhiQuyetToan { get; set; }

    // Tọa độ GIS
    public double? ViDo { get; set; }
    public double? KinhDo { get; set; }
    
    // Đếm số lượng báo cáo tiến độ
    public int SoLuongBaoCaoTienDo { get; set; }
}
