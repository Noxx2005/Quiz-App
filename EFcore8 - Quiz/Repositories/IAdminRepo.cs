using Quiz.Models;

namespace Quiz.Repositories
{
    public interface IAdminRepo
    {
        Task<User?> GetAdminByEmailAsync(string email);
        Task CreateAdminAsync(User admin);
    }
}
