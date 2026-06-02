using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Upload file lên hệ thống lưu trữ và trả về URL
    /// </summary>
    Task<string> UploadFileAsync(IFormFile file);

    /// <summary>
    /// Lấy đường dẫn (URL) để xem/tải file
    /// </summary>
    Task<string> GetFileUrlAsync(string fileName);
}
