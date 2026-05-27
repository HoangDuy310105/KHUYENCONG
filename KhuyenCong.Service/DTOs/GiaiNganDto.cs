using System;

namespace KhuyenCong.Service.DTOs;

public class GiaiNganDto
{
    public Guid Id { get; set; }
    public Guid DeAnId { get; set; }
    
    /// <summary>1 = Tạm ứng, 2 = Quyết toán</summary>
    public int LoaiGiaiNgan { get; set; }
    public decimal SoTien { get; set; }
    public DateTime NgayGiaiNgan { get; set; }
    
    // Metadata chứng từ (JSON string)
    public string? ChungTuDinhKem { get; set; }
    
    // Thông tin mở rộng
    public string? TenDeAn { get; set; }
    public string? TenLoaiGiaiNgan => LoaiGiaiNgan == 1 ? "Tạm ứng" : "Quyết toán";
}

public class GiaiNganCreateDto
{
    public Guid DeAnId { get; set; }
    public int LoaiGiaiNgan { get; set; }  // 1 = TamUng, 2 = QuyetToan
    public decimal SoTien { get; set; }
    public DateTime NgayGiaiNgan { get; set; }
    public string? GhiChu { get; set; }
}

public class DeAnGiaiNganSummaryDto
{
    public Guid Id { get; set; }
    public string MaDeAn { get; set; } = string.Empty;
    public string TenDeAn { get; set; } = string.Empty;
    public string? TenDonViThuHuong { get; set; }
    public decimal KinhPhiDuKien { get; set; }
    public int NguonKinhPhi { get; set; }
    public string? TenNguonKinhPhi => NguonKinhPhi switch
    {
        1 => "Trung ương",
        2 => "Địa phương",
        3 => "Kết hợp",
        _ => "Khác"
    };
    public int TrangThai { get; set; }
    public decimal TongTamUng { get; set; }
    public decimal TongQuyetToan { get; set; }
    public decimal TongGiaiNgan => TongTamUng + TongQuyetToan;
    public int TyLeGiaiNgan => KinhPhiDuKien > 0 ? (int)Math.Min(100, Math.Round(TongGiaiNgan / KinhPhiDuKien * 100)) : 0;
}
