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

        var donViSoId = Guid.Parse("00000000-0000-0000-0000-000000000002");
        modelBuilder.Entity<DonVi>().HasData(new DonVi
        {
            Id = donViSoId,
            TenDonVi = "Sở Công Thương",
            MaSoThue = "0202020202",
            LoaiDonVi = LoaiDonVi.QuanLyNhaNuoc,
            DiaChi = "Tỉnh/TP",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<NguoiDung>().HasData(new NguoiDung
        {
            Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
            Username = "canboso",
            PasswordHash = "so@123", 
            Role = RoleType.Role_So,
            DonViId = donViSoId,
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // 3. Seed TinTuc
        var tinTucs = new List<TinTuc>
        {
            new TinTuc { Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"), Category = "Thông báo", IsHot = true, PublishedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc), Views = 1240, Title = "Quyết định phê duyệt danh mục đề án khuyến công quốc gia năm 2026", Excerpt = "Cục Công Thương địa phương thông báo tới các Sở Công Thương về việc phê duyệt danh mục các đề án khuyến công điểm và đề án nhóm thuộc Chương trình khuyến công quốc gia.", CreatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc) },
            new TinTuc { Id = Guid.Parse("c2222222-2222-2222-2222-222222222222"), Category = "Chính sách", IsHot = true, PublishedAt = new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc), Views = 876, Title = "Chính sách hỗ trợ doanh nghiệp nhỏ và vừa trong lĩnh vực công nghiệp nông thôn", Excerpt = "Nhằm thúc đẩy phát triển kinh tế địa phương, Bộ Công Thương ban hành chính sách hỗ trợ đặc biệt dành cho các doanh nghiệp vừa và nhỏ tham gia chương trình khuyến công.", CreatedAt = new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc) },
            new TinTuc { Id = Guid.Parse("c3333333-3333-3333-3333-333333333333"), Category = "Sự kiện", IsHot = false, PublishedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc), Views = 512, Title = "Hội nghị tổng kết Chương trình Khuyến công Quốc gia giai đoạn 2021–2025", Excerpt = "Hội nghị sẽ diễn ra tại Hà Nội vào ngày 25/05/2026, tổng kết những thành tích nổi bật và định hướng phát triển cho giai đoạn 2026–2030 của Chương trình Khuyến công.", CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc) },
            new TinTuc { Id = Guid.Parse("c4444444-4444-4444-4444-444444444444"), Category = "Quyết định", IsHot = false, PublishedAt = new DateTime(2026, 5, 12, 0, 0, 0, DateTimeKind.Utc), Views = 398, Title = "Ban hành Thông tư hướng dẫn quản lý, sử dụng kinh phí khuyến công quốc gia", Excerpt = "Thông tư số 05/2026/TT-BCT quy định chi tiết về quy trình lập dự toán, phân bổ, quản lý và quyết toán kinh phí thực hiện các hoạt động khuyến công quốc gia.", CreatedAt = new DateTime(2026, 5, 12, 0, 0, 0, DateTimeKind.Utc) },
            new TinTuc { Id = Guid.Parse("c5555555-5555-5555-5555-555555555555"), Category = "Hướng dẫn", IsHot = false, PublishedAt = new DateTime(2026, 5, 8, 0, 0, 0, DateTimeKind.Utc), Views = 721, Title = "Hướng dẫn nộp hồ sơ đề án khuyến công trực tuyến trên Cổng thông tin điện tử", Excerpt = "Để tạo thuận lợi cho các tổ chức, cá nhân, Cục Công Thương địa phương hướng dẫn chi tiết quy trình nộp hồ sơ đề án khuyến công trực tuyến qua hệ thống.", CreatedAt = new DateTime(2026, 5, 8, 0, 0, 0, DateTimeKind.Utc) },
            new TinTuc { Id = Guid.Parse("c6666666-6666-6666-6666-666666666666"), Category = "Thông báo", IsHot = false, PublishedAt = new DateTime(2026, 5, 5, 0, 0, 0, DateTimeKind.Utc), Views = 289, Title = "Thông báo lịch tiếp nhận hồ sơ khuyến công quốc gia đợt 2 năm 2026", Excerpt = "Cục Công Thương địa phương thông báo thời gian tiếp nhận hồ sơ đề án khuyến công quốc gia đợt 2 năm 2026 bắt đầu từ ngày 01/06/2026 đến 30/06/2026.", CreatedAt = new DateTime(2026, 5, 5, 0, 0, 0, DateTimeKind.Utc) }
        };
        modelBuilder.Entity<TinTuc>().HasData(tinTucs);
    }
}
