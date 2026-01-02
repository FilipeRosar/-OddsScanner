using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OddsScanner.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLogo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AwayTeamLogo",
                table: "Matches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HomeTeamLogo",
                table: "Matches",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwayTeamLogo",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "HomeTeamLogo",
                table: "Matches");
        }
    }
}
