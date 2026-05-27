using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOcopFieldsToSanPhamOcop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CapChungNhan",
                table: "SanPhamOcops",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "QuyetDinhCongNhan",
                table: "SanPhamOcops",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CapChungNhan",
                table: "SanPhamOcops");

            migrationBuilder.DropColumn(
                name: "QuyetDinhCongNhan",
                table: "SanPhamOcops");
        }
    }
}
