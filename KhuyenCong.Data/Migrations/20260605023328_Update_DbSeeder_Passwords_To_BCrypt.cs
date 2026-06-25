using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class Update_DbSeeder_Passwords_To_BCrypt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "Id",
                keyValue: new Guid("b1111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$PlXjHmRvDP47AePRB6F2Uu.cfUqOXiiS5k7Qotxt/apiK4ST2BJ52");

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "Id",
                keyValue: new Guid("b2222222-2222-2222-2222-222222222222"),
                column: "PasswordHash",
                value: "$2a$11$MXxcVGaKDj9GsoWlWkIAzOM1a/OIEyR9DvhX3Jd20fCPofvFZl75u");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "Id",
                keyValue: new Guid("b1111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "admin@123");

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "Id",
                keyValue: new Guid("b2222222-2222-2222-2222-222222222222"),
                column: "PasswordHash",
                value: "so@123");
        }
    }
}
