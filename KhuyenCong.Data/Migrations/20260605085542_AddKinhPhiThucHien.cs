using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddKinhPhiThucHien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "KinhPhiThucHien",
                table: "DeAns",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KinhPhiThucHien",
                table: "DeAns");
        }
    }
}
