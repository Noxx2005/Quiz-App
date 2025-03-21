using Quiz.DTOs;

namespace Quiz.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> RegisterAsync(RegisterDTO registerDto);
        Task<AuthResponse?> LoginAsync(LoginDTO loginDto);

        public bool RequestPasswordReset(ForgotPasswordDTO request);
        public bool ResetPassword(ResetPasswordDTO request);
        public Task<TokenResponse?> AdminRegister(RegisterDTO registerDto);
        public Task<TokenResponse?> AdminLogin(LoginDTO loginDto);

    }
}
