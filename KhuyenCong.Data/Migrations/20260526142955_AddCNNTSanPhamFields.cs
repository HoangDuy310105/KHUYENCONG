using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCNNTSanPhamFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LoaiSanPham",
                table: "SanPhamOcops",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NamBinhChon",
                table: "SanPhamOcops",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrangThai",
                table: "SanPhamOcops",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoaiSanPham",
                table: "SanPhamOcops");

            migrationBuilder.DropColumn(
                name: "NamBinhChon",
                table: "SanPhamOcops");

            migrationBuilder.DropColumn(
                name: "TrangThai",
                table: "SanPhamOcops");
        }
    }
}
