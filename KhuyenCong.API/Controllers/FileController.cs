using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FileController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;

    public FileController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { Message = "Không có file được chọn." });
        }

        try
        {
            // Kiểm tra dung lượng (Tối đa 10MB)
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { Message = "Dung lượng file vượt quá 10MB." });
            }

            // Gọi service upload lên MinIO
            var fileName = await _fileStorageService.UploadFileAsync(file);
            var fileUrl = await _fileStorageService.GetFileUrlAsync(fileName);

            return Ok(new
            {
                FileName = file.FileName,
                FileUrl = fileUrl,
                MinioFileName = fileName,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Lỗi khi upload file.", Error = ex.Message });
        }
    }
}
