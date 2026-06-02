using System.Collections.Generic;

namespace KhuyenCong.Service.DTOs;

public class DashboardSummaryDto
{
    public int TotalDeAn { get; set; }
    public int TotalDoanhNghiep { get; set; }
    public decimal TotalKinhPhi { get; set; }
    public int InProgressDeAn { get; set; }
    public int TotalOcop { get; set; }
}

public class ChartDataDto
{
    public string Label { get; set; } = string.Empty;
    public int Value { get; set; }
    public decimal Amount { get; set; }
}

public class MapMarkerDto
{
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public int Type { get; set; } // 1: DN Thụ hưởng, 2: Hội nghị, 3: OCOP
}
