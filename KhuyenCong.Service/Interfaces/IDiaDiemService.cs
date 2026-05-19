using System.Threading.Tasks;

namespace KhuyenCong.Service.Interfaces;

public interface IDiaDiemService
{
    Task<string> GetTinhThanhAsync();
    Task<string> GetQuanHuyenAsync(string maTinh);
    Task<string> GetPhuongXaAsync(string maHuyen);
}
