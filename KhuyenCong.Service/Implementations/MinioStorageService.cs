using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using System;
using System.IO;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

public class MinioStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;

    public MinioStorageService(IMinioClient minioClient, IConfiguration configuration)
    {
        _minioClient = minioClient;
        _bucketName = configuration["MinioSettings:BucketName"] ?? "khuyencong-files";
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null.");

        // Kiểm tra xem bucket đã tồn tại chưa, nếu chưa thì tạo
        var bktExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
        bool found = await _minioClient.BucketExistsAsync(bktExistsArgs);
        if (!found)
        {
            var mkBktArgs = new MakeBucketArgs().WithBucket(_bucketName);
            await _minioClient.MakeBucketAsync(mkBktArgs);

            // Tùy chọn: Set policy public cho bucket để Frontend có thể lấy file không cần auth
            string policy = $"{{\"Version\":\"2012-10-17\",\"Statement\":[{{\"Action\":[\"s3:GetObject\"],\"Effect\":\"Allow\",\"Principal\":{{\"AWS\":[\"*\"]}},\"Resource\":[\"arn:aws:s3:::{_bucketName}/*\"]}}]}}";
            var setPolicyArgs = new SetPolicyArgs().WithBucket(_bucketName).WithPolicy(policy);
            await _minioClient.SetPolicyAsync(setPolicyArgs);
        }

        // Tạo tên file ngẫu nhiên an toàn
        var originalName = Path.GetFileNameWithoutExtension(file.FileName);
        var extension = Path.GetExtension(file.FileName);
        var safeName = $"{Guid.NewGuid()}_{originalName}{extension}";

        using (var stream = file.OpenReadStream())
        {
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(safeName)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(file.ContentType);

            await _minioClient.PutObjectAsync(putObjectArgs);
        }

        return safeName; // Hoặc trả về URL đầy đủ tùy cấu hình
    }

    public async Task<string> GetFileUrlAsync(string fileName)
    {
        return $"http://localhost:9000/{_bucketName}/{fileName}";
    }
}
