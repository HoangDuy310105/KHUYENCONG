using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace KhuyenCong.Data.Context;

public static class DbSeeder
{
    public static void SeedData(ModelBuilder modelBuilder)
    {
        // 1. Seed Linh Vuc (9 nhóm theo Nghị định 45)
        var linhVucs = new List<LinhVuc>
        {
            new LinhVuc { Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"), MaLinhVuc = "DAOTAO", TenLinhVuc = "Đào tạo nghề, truyền nghề và phát triển nhân lực", MoTa = "Hỗ trợ đào tạo nghề, truyền nghề cho lao động nông thôn", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a2222222-2222-2222-2222-222222222222"), MaLinhVuc = "CONGNGHE", TenLinhVuc = "Xây dựng mô hình trình diễn kỹ thuật, chuyển giao công nghệ và ứng dụng máy móc", MoTa = "Hỗ trợ đầu tư máy móc thiết bị tiên tiến vào sản xuất", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a3333333-3333-3333-3333-333333333333"), MaLinhVuc = "SANPHAM", TenLinhVuc = "Phát triển sản phẩm công nghiệp nông thôn tiêu biểu", MoTa = "Tổ chức bình chọn, hỗ trợ phát triển sản phẩm OCOP, tiêu biểu", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a4444444-4444-4444-4444-444444444444"), MaLinhVuc = "LIENKET", TenLinhVuc = "Tư vấn, trợ giúp các cơ sở CNNT", MoTa = "Tư vấn thiết kế mẫu mã, bao bì, quản lý doanh nghiệp", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a5555555-5555-5555-5555-555555555555"), MaLinhVuc = "HOICHО", TenLinhVuc = "Hỗ trợ cung cấp thông tin, triển lãm, hội chợ, quảng bá sản phẩm", MoTa = "Hỗ trợ thuê gian hàng hội chợ, quảng bá sản phẩm CNNT", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a6666666-6666-6666-6666-666666666666"), MaLinhVuc = "QUANLY", TenLinhVuc = "Nâng cao năng lực quản lý cho các cơ sở CNNT", MoTa = "Tổ chức tham quan, học tập kinh nghiệm trong và ngoài nước", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a7777777-7777-7777-7777-777777777777"), MaLinhVuc = "CUMCN", TenLinhVuc = "Hỗ trợ phát triển hạ tầng cụm công nghiệp", MoTa = "Đầu tư xây dựng hạ tầng kỹ thuật cụm công nghiệp nông thôn", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a8888888-8888-8888-8888-888888888888"), MaLinhVuc = "TUVAN", TenLinhVuc = "Phát triển hoạt động tư vấn khuyến công", MoTa = "Nâng cao năng lực cho đội ngũ cộng tác viên khuyến công", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LinhVuc { Id = Guid.Parse("a9999999-9999-9999-9999-999999999999"), MaLinhVuc = "KHAC", TenLinhVuc = "Các chương trình khuyến công khác", MoTa = "Các nội dung hỗ trợ khác theo quy định của Chính phủ", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        };
        modelBuilder.Entity<LinhVuc>().HasData(linhVucs);

        // 2. Seed Đơn vị quản lý mặc định (Trung tâm Khuyến công)
        var donViAdminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        modelBuilder.Entity<DonVi>().HasData(new DonVi
        {
            Id = donViAdminId,
            TenDonVi = "Trung tâm Khuyến công Quốc gia",
            MaSoThue = "0101010101",
            LoaiDonVi = LoaiDonVi.QuanLyNhaNuoc,
            DiaChi = "Hà Nội",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<NguoiDung>().HasData(new NguoiDung
        {
            Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
            Username = "admin",
            PasswordHash = "admin@123", // Lưu ý: Sau này sẽ dùng BCrypt để mã hóa
            Role = RoleType.Role_Admin,
            DonViId = donViAdminId,
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
