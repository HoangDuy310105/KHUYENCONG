using System;
using System.Text.Json;

namespace KhuyenCong.Service.DTOs;

public class ChiTieuKPIDto
{
    public Guid Id { get; set; }
    public Guid DeAnId { get; set; }
    public JsonDocument? ThongKeHieuQua { get; set; }
}

public class CreateChiTieuKPIDto
{
    public Guid DeAnId { get; set; }
    public JsonDocument ThongKeHieuQua { get; set; } = default!;
}

public class UpdateChiTieuKPIDto
{
    public JsonDocument ThongKeHieuQua { get; set; } = default!;
}
