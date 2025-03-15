using Quiz.DTOs;

namespace Quiz.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> RegisterAsync(RegisterDTO registerDto);
        Task<AuthResponse?> LoginAsync(LoginDTO loginDto);

        public bool RequestPasswordReset(ForgotPasswordDTO request);
        public bool ResetPassword(ResetPasswordDTO request);
    }
}
