using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "DonVis",
                columns: new[] { "Id", "CreatedAt", "DiaChi", "LoaiDonVi", "MaSoThue", "QuyMo", "SoDienThoai", "TenDonVi", "UpdatedAt" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Hà Nội", 4, "0101010101", null, null, "Trung tâm Khuyến công Quốc gia", null });

            migrationBuilder.InsertData(
                table: "LinhVucs",
                columns: new[] { "Id", "CreatedAt", "MaLinhVuc", "MoTa", "TenLinhVuc", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("a1111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "DAOTAO", "Hỗ trợ đào tạo nghề, truyền nghề cho lao động nông thôn", "Đào tạo nghề, truyền nghề và phát triển nhân lực", null },
                    { new Guid("a2222222-2222-2222-2222-222222222222"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "CONGNGHE", "Hỗ trợ đầu tư máy móc thiết bị tiên tiến vào sản xuất", "Xây dựng mô hình trình diễn kỹ thuật, chuyển giao công nghệ và ứng dụng máy móc", null },
                    { new Guid("a3333333-3333-3333-3333-333333333333"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "SANPHAM", "Tổ chức bình chọn, hỗ trợ phát triển sản phẩm OCOP, tiêu biểu", "Phát triển sản phẩm công nghiệp nông thôn tiêu biểu", null },
                    { new Guid("a4444444-4444-4444-4444-444444444444"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "LIENKET", "Tư vấn thiết kế mẫu mã, bao bì, quản lý doanh nghiệp", "Tư vấn, trợ giúp các cơ sở CNNT", null },
                    { new Guid("a5555555-5555-5555-5555-555555555555"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "HOICHО", "Hỗ trợ thuê gian hàng hội chợ, quảng bá sản phẩm CNNT", "Hỗ trợ cung cấp thông tin, triển lãm, hội chợ, quảng bá sản phẩm", null },
                    { new Guid("a6666666-6666-6666-6666-666666666666"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "QUANLY", "Tổ chức tham quan, học tập kinh nghiệm trong và ngoài nước", "Nâng cao năng lực quản lý cho các cơ sở CNNT", null },
                    { new Guid("a7777777-7777-7777-7777-777777777777"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "CUMCN", "Đầu tư xây dựng hạ tầng kỹ thuật cụm công nghiệp nông thôn", "Hỗ trợ phát triển hạ tầng cụm công nghiệp", null },
                    { new Guid("a8888888-8888-8888-8888-888888888888"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "TUVAN", "Nâng cao năng lực cho đội ngũ cộng tác viên khuyến công", "Phát triển hoạt động tư vấn khuyến công", null },
                    { new Guid("a9999999-9999-9999-9999-999999999999"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "KHAC", "Các nội dung hỗ trợ khác theo quy định của Chính phủ", "Các chương trình khuyến công khác", null }
                });

            migrationBuilder.InsertData(
                table: "NguoiDungs",
                columns: new[] { "Id", "CreatedAt", "DonViId", "IsActive", "PasswordHash", "Role", "UpdatedAt", "Username" },
                values: new object[] { new Guid("b1111111-1111-1111-1111-111111111111"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("00000000-0000-0000-0000-000000000001"), true, "admin@123", 4, null, "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a2222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a3333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a4444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a5555555-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a6666666-6666-6666-6666-666666666666"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a7777777-7777-7777-7777-777777777777"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a8888888-8888-8888-8888-888888888888"));

            migrationBuilder.DeleteData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a9999999-9999-9999-9999-999999999999"));

            migrationBuilder.DeleteData(
                table: "NguoiDungs",
                keyColumn: "Id",
                keyValue: new Guid("b1111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "DonVis",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));
        }
    }
}
