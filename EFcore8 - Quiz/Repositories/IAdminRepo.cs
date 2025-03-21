using Quiz.Models;

namespace Quiz.Repositories
{
    public interface IAdminRepo
    {
        Task<Admin?> GetAdminByEmailAsync(string email);
        Task CreateAdminAsync(Admin admin);
    }
}
