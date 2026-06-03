using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTinTuc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TinTucs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Excerpt = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Views = table.Column<int>(type: "integer", nullable: false),
                    IsHot = table.Column<bool>(type: "boolean", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TinTucs", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "TinTucs",
                columns: new[] { "Id", "Category", "Content", "CreatedAt", "Excerpt", "ImageUrl", "IsHot", "PublishedAt", "Status", "Title", "UpdatedAt", "Views" },
                values: new object[,]
                {
                    { new Guid("c1111111-1111-1111-1111-111111111111"), "Thông báo", "", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Cục Công Thương địa phương thông báo tới các Sở Công Thương về việc phê duyệt danh mục các đề án khuyến công điểm và đề án nhóm thuộc Chương trình khuyến công quốc gia.", null, true, new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Quyết định phê duyệt danh mục đề án khuyến công quốc gia năm 2026", null, 1240 },
                    { new Guid("c2222222-2222-2222-2222-222222222222"), "Chính sách", "", new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Nhằm thúc đẩy phát triển kinh tế địa phương, Bộ Công Thương ban hành chính sách hỗ trợ đặc biệt dành cho các doanh nghiệp vừa và nhỏ tham gia chương trình khuyến công.", null, true, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Chính sách hỗ trợ doanh nghiệp nhỏ và vừa trong lĩnh vực công nghiệp nông thôn", null, 876 },
                    { new Guid("c3333333-3333-3333-3333-333333333333"), "Sự kiện", "", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Hội nghị sẽ diễn ra tại Hà Nội vào ngày 25/05/2026, tổng kết những thành tích nổi bật và định hướng phát triển cho giai đoạn 2026–2030 của Chương trình Khuyến công.", null, false, new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Hội nghị tổng kết Chương trình Khuyến công Quốc gia giai đoạn 2021–2025", null, 512 },
                    { new Guid("c4444444-4444-4444-4444-444444444444"), "Quyết định", "", new DateTime(2026, 5, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Thông tư số 05/2026/TT-BCT quy định chi tiết về quy trình lập dự toán, phân bổ, quản lý và quyết toán kinh phí thực hiện các hoạt động khuyến công quốc gia.", null, false, new DateTime(2026, 5, 12, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Ban hành Thông tư hướng dẫn quản lý, sử dụng kinh phí khuyến công quốc gia", null, 398 },
                    { new Guid("c5555555-5555-5555-5555-555555555555"), "Hướng dẫn", "", new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Để tạo thuận lợi cho các tổ chức, cá nhân, Cục Công Thương địa phương hướng dẫn chi tiết quy trình nộp hồ sơ đề án khuyến công trực tuyến qua hệ thống.", null, false, new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Hướng dẫn nộp hồ sơ đề án khuyến công trực tuyến trên Cổng thông tin điện tử", null, 721 },
                    { new Guid("c6666666-6666-6666-6666-666666666666"), "Thông báo", "", new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Cục Công Thương địa phương thông báo thời gian tiếp nhận hồ sơ đề án khuyến công quốc gia đợt 2 năm 2026 bắt đầu từ ngày 01/06/2026 đến 30/06/2026.", null, false, new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Thông báo lịch tiếp nhận hồ sơ khuyến công quốc gia đợt 2 năm 2026", null, 289 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TinTucs");
        }
    }
}
