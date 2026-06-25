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
    /// Lấy đường dẫn tĩnh nội bộ (API proxy) để frontend lưu DB
    /// </summary>
    Task<string> GetFileUrlAsync(string fileName);

    /// <summary>
    /// Tạo URL tạm thời (Presigned URL) có chữ ký để tải file an toàn từ MinIO
    /// </summary>
    Task<string> GetPresignedUrlAsync(string fileName);
}
