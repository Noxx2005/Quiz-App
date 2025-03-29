using Microsoft.EntityFrameworkCore;
using Quiz.Data;
using Quiz.Models;

namespace Quiz.Repositories
{
    public class AdminRepo : IAdminRepo
    {
        private readonly QuizAppContext _context;
        public AdminRepo(QuizAppContext context)
        {
            _context = context;
        }

        public async Task<User?> GetAdminByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(a => a.Email == email && a.UserType == "Admin");
        }

        public async Task CreateAdminAsync(User admin)
        {
            var sql = "INSERT INTO Users (FullName, Email, PasswordHash, UserType, Subjects, IsSuspended) VALUES (@p0, @p1, @p2, 'Admin', @p3, @p4)";

            await _context.Database.ExecuteSqlRawAsync(
                sql, admin.FullName, admin.Email, admin.PasswordHash, admin.Subjects, admin.IsSuspended);
        }

    }
}
