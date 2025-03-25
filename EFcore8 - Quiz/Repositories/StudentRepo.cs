using Microsoft.EntityFrameworkCore;
using Quiz.Data;
using Quiz.Models;

namespace Quiz.Repositories
{
    public class StudentRepo : IStudentRepo
    {
        private readonly QuizAppContext _context;
        public StudentRepo(QuizAppContext context)
        {
            _context = context;
        }

        public async Task<User?> GetStudentByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(s => s.Email == email && s.UserType == "Student");
        }

        public async Task CreateStudentAsync(User student)
        {
            var sql = "INSERT INTO Users (FullName, Email, PasswordHash, UserType, Subjects, IsSuspended) VALUES (@p0, @p1, @p2, 'Student', @p3, @p4)";

            await _context.Database.ExecuteSqlRawAsync(
                sql, student.FullName, student.Email, student.PasswordHash, student.Subjects, student.IsSuspended);
        }
    }
}
