using Quiz.Models;
using Quiz.Data;
using Microsoft.EntityFrameworkCore;

namespace Quiz.Repositories
{
    public class StudentRepo:IStudentRepo
    {
        private readonly QuizAppContext _context;
        public StudentRepo(QuizAppContext context)
        {
            _context = context;
        }

        public async Task<Student?> GetStudentByEmailAsync(string email)
        {
            return await _context.Students.FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<Student> CreateStudentAsync(Student student)
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return student;
        }

    }
}
