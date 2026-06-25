using System;
using System.Text.Json;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class TienDoThucHien : BaseEntity
{
    public Guid DeAnId { get; set; }
    public DateTime ThangBaoCao { get; set; }
    
    // Phần Cơ sở báo cáo
    public int PhanTramHoanThanh { get; set; }
    public string? GhiChuThucTe { get; set; }
    public JsonDocument? FileBaoCao { get; set; } // JSONB

    // Phần Cán bộ Sở/TTKC kiểm tra thực địa
    public int? PhanTramThucTe { get; set; }
    public JsonDocument? BienBanKiemTra { get; set; } // JSONB

    // Trạng thái phê duyệt của Lãnh đạo Sở
    public TrangThaiDuyetTienDo TrangThaiDuyet { get; set; } = TrangThaiDuyetTienDo.ChoKiemTra;
    public string? LyDoTuChoi { get; set; }

    // Navigation
    public virtual DeAn? DeAn { get; set; }
}
