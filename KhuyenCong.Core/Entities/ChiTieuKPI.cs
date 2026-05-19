using System;
using System.Text.Json;

namespace KhuyenCong.Core.Entities;

public class ChiTieuKPI : BaseEntity
{
    public Guid DeAnId { get; set; }
    
    // JSONB - Lưu trữ 12 chỉ số linh hoạt theo Thông tư
    public JsonDocument? ThongKeHieuQua { get; set; }

    // Navigation
    public virtual DeAn? DeAn { get; set; }
}
