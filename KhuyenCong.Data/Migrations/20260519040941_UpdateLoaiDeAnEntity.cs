using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLoaiDeAnEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoaiDeAn",
                table: "DeAns");

            migrationBuilder.AddColumn<Guid>(
                name: "LoaiDeAnId",
                table: "DeAns",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "LoaiDeAns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaLoai = table.Column<string>(type: "text", nullable: false),
                    TenLoai = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoaiDeAns", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeAns_LoaiDeAnId",
                table: "DeAns",
                column: "LoaiDeAnId");

            migrationBuilder.AddForeignKey(
                name: "FK_DeAns_LoaiDeAns_LoaiDeAnId",
                table: "DeAns",
                column: "LoaiDeAnId",
                principalTable: "LoaiDeAns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeAns_LoaiDeAns_LoaiDeAnId",
                table: "DeAns");

            migrationBuilder.DropTable(
                name: "LoaiDeAns");

            migrationBuilder.DropIndex(
                name: "IX_DeAns_LoaiDeAnId",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "LoaiDeAnId",
                table: "DeAns");

            migrationBuilder.AddColumn<int>(
                name: "LoaiDeAn",
                table: "DeAns",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
