using System;
using System.Text.Json;

namespace KhuyenCong.Core.Entities;

public class TienDoThucHien : BaseEntity
{
    public Guid DeAnId { get; set; }
    public DateTime ThangBaoCao { get; set; }
    public int PhanTramHoanThanh { get; set; }
    public string? GhiChuThucTe { get; set; }
    
    // JSONB
    public JsonDocument? FileBaoCao { get; set; }

    // Navigation
    public virtual DeAn? DeAn { get; set; }
}
