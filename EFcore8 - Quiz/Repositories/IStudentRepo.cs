using Quiz.Models;

namespace Quiz.Repositories
{
    public interface IStudentRepo
    {
        Task<User?> GetStudentByEmailAsync(string email);
        Task CreateStudentAsync(User student);
    }
}
