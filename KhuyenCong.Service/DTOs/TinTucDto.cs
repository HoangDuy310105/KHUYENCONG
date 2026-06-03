using System;

namespace KhuyenCong.Service.DTOs;

public class TinTucDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Views { get; set; }
    public bool IsHot { get; set; }
    public DateTime PublishedAt { get; set; }
    public int Status { get; set; }
}

public class CreateTinTucDto
{
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsHot { get; set; }
    public int Status { get; set; } = 1;
}

public class UpdateTinTucDto
{
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsHot { get; set; }
    public int Status { get; set; }
}
