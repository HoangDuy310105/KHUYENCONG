using System;
using System.Collections.Generic;

namespace KhuyenCong.Core.Entities;

public class LinhVuc : BaseEntity
{
    public string MaLinhVuc { get; set; } = string.Empty;
    public string TenLinhVuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public decimal? DinhMucHoTroMax { get; set; }

    // Navigation Property
    public virtual ICollection<DeAn> DeAns { get; set; } = new List<DeAn>();
}
