using Quiz.Models;

namespace Quiz.Repositories
{
    public interface IStudentRepo
    {
        Task<Student?> GetStudentByEmailAsync(string email);
        Task<Student> CreateStudentAsync(Student student);
    }
}
