using System;

namespace KhuyenCong.Service.DTOs;

public class TienDoThucHienDto
{
    public Guid Id { get; set; }
    public Guid DeAnId { get; set; }
    public DateTime ThangBaoCao { get; set; }
    public int PhanTramHoanThanh { get; set; }
    public string? GhiChuThucTe { get; set; }
    public string? FileBaoCaoUrl { get; set; } // Will map to JsonDocument or simple string if needed
}
