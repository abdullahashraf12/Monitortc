using Microsoft.EntityFrameworkCore;
using MonitorRTC.Models.UserModel;
namespace MonitorRTC.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Optionally, you can pass the connection string here
        public ApplicationDbContext(string connectionString)
            : base(new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlServer(connectionString)
                    .Options)
        {
        }

        // DbSets for your entities
        public DbSet<UserModel> Users { get; set; }
    }
}