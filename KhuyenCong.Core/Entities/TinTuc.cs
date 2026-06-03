using System;

namespace KhuyenCong.Core.Entities;

public class TinTuc : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "Thông báo"; // Thông báo, Quyết định, Hướng dẫn, Sự kiện, Chính sách
    public string? ImageUrl { get; set; }
    public int Views { get; set; } = 0;
    public bool IsHot { get; set; } = false;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public int Status { get; set; } = 1; // 1: Active, 0: Inactive/Draft
}
