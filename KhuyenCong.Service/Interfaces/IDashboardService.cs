using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<List<ChartDataDto>> GetProjectsByFieldAsync();
    Task<List<MapMarkerDto>> GetMapMarkersAsync();
}
