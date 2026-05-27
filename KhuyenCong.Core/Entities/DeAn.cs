using System;
using System.Collections.Generic;
using System.Text.Json;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class DeAn : BaseEntity
{
    public string MaDeAn { get; set; } = string.Empty;
    public string TenDeAn { get; set; } = string.Empty;
    
    // Foreign Keys
    public Guid LinhVucId { get; set; }
    public Guid DonViThuHuongId { get; set; }
    public Guid? DonViThiCongId { get; set; }

    public decimal KinhPhiDuKien { get; set; }
    public NguonKinhPhi NguonKinhPhi { get; set; } = NguonKinhPhi.DiaPhуong;
    public string? GhiChu { get; set; }
    public DateTime? ThoiGianBatDau { get; set; }
    public DateTime? ThoiGianKetThuc { get; set; }
    public Guid LoaiDeAnId { get; set; }
    public TrangThaiDeAn TrangThai { get; set; } = TrangThaiDeAn.BanNhap;
    
    // JSONB in PostgreSQL
    public JsonDocument? HoSoDinhKem { get; set; }

    // Navigation Properties
    public virtual LoaiDeAn? LoaiDeAn { get; set; }
    public virtual LinhVuc? LinhVuc { get; set; }
    public virtual DonVi? DonViThuHuong { get; set; }
    public virtual DonVi? DonViThiCong { get; set; }
    
    public virtual ICollection<GiaiNgan> GiaiNgans { get; set; } = new List<GiaiNgan>();
    public virtual ICollection<TienDoThucHien> TienDoThucHiens { get; set; } = new List<TienDoThucHien>();
    public virtual ICollection<LichSuThaoTac> LichSuThaoTacs { get; set; } = new List<LichSuThaoTac>();
    public virtual ChiTieuKPI? ChiTieuKPI { get; set; }
}
