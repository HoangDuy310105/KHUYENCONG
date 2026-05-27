using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNguonKinhPhiGhiChuToDeAn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GhiChu",
                table: "DeAns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NguonKinhPhi",
                table: "DeAns",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GhiChu",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "NguonKinhPhi",
                table: "DeAns");
        }
    }
}
