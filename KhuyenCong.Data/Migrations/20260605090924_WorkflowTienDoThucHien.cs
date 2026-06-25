using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class WorkflowTienDoThucHien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<JsonDocument>(
                name: "BienBanKiemTra",
                table: "TienDoThucHiens",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LyDoTuChoi",
                table: "TienDoThucHiens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PhanTramThucTe",
                table: "TienDoThucHiens",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrangThaiDuyet",
                table: "TienDoThucHiens",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BienBanKiemTra",
                table: "TienDoThucHiens");

            migrationBuilder.DropColumn(
                name: "LyDoTuChoi",
                table: "TienDoThucHiens");

            migrationBuilder.DropColumn(
                name: "PhanTramThucTe",
                table: "TienDoThucHiens");

            migrationBuilder.DropColumn(
                name: "TrangThaiDuyet",
                table: "TienDoThucHiens");
        }
    }
}
