using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Core.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ILichSuThaoTacService
{
    Task<IEnumerable<LichSuThaoTacDto>> GetAllAsync();
}
