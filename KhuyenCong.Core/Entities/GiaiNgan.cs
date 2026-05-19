using System;
using System.Text.Json;
using KhuyenCong.Core.Enums;

namespace KhuyenCong.Core.Entities;

public class GiaiNgan : BaseEntity
{
    public Guid DeAnId { get; set; }
    public LoaiGiaiNgan LoaiGiaiNgan { get; set; }
    public decimal SoTien { get; set; }
    public DateTime NgayGiaiNgan { get; set; }
    
    // JSONB
    public JsonDocument? ChungTuDinhKem { get; set; }

    // Navigation
    public virtual DeAn? DeAn { get; set; }
}
