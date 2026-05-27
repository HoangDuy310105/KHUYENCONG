using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FileController : ControllerBase
{
    private readonly string _uploadsFolder;

    public FileController()
    {
        _uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
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

            // Đảm bảo thư mục tồn tại
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }

            // Tạo tên file an toàn
            var originalName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var safeName = $"{Guid.NewGuid()}_{originalName}{extension}";
            
            var filePath = Path.Combine(_uploadsFolder, safeName);

            // Lưu file vật lý
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn truy cập file tĩnh
            var fileUrl = $"/uploads/{safeName}";

            return Ok(new
            {
                FileName = file.FileName,
                FileUrl = fileUrl,
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
