using Microsoft.EntityFrameworkCore;
using Quiz.Data;
using Quiz.Models;

namespace Quiz.Repositories
{
    public class AdminRepo:IAdminRepo
    {
        private readonly QuizAppContext _context;
        public AdminRepo(QuizAppContext context)
        {
            _context = context;
        }
        public async Task<Admin?> GetAdminByEmailAsync(string email)
        {
            return await _context.Admins.FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task CreateAdminAsync(Admin admin)
        {
            await _context.Admins.AddAsync(admin);
            await _context.SaveChangesAsync();
        }
    }
}
