using System.Collections.Generic;

namespace KhuyenCong.Core.Entities;

public class LoaiDeAn : BaseEntity
{
    public string MaLoai { get; set; } = string.Empty;
    public string TenLoai { get; set; } = string.Empty;

    public virtual ICollection<DeAn> DeAns { get; set; } = new List<DeAn>();
}
