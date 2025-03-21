using Quiz.Repositories;
using Quiz.Models;
using Quiz.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Quiz.Utility;
using Quiz.Data;
using System.Security.Cryptography;

namespace Quiz.Services
{
    public class AuthService : IAuthService
    {
        private readonly IStudentRepo _studentRepository;
        private readonly IAdminRepo _adminRepository; // 🔹 Added Admin repository
        private readonly IConfiguration _config;
        private readonly QuizAppContext _context;
        private readonly IEmailService _emailService;
        private static Dictionary<string, string> _resetTokens = new Dictionary<string, string>(); // Stores email-token pairs

        public AuthService(IStudentRepo studentRepository, IAdminRepo adminRepository, IConfiguration config, QuizAppContext context, IEmailService emailService)
        {
            _studentRepository = studentRepository;
            _adminRepository = adminRepository; // 🔹 Injected admin repository
            _config = config;
            _context = context;
            _emailService = emailService;
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterDTO registerDto)
        {
            var existingStudent = await _studentRepository.GetStudentByEmailAsync(registerDto.Email);
            if (existingStudent != null) return null; // Email already exists

            var newStudent = new Student
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                Subjects = registerDto.Subjects
            };

            await _studentRepository.CreateStudentAsync(newStudent);
            return GenerateAuthResponse(newStudent);
        }

        public async Task<AuthResponse?> LoginAsync(LoginDTO loginDto)
        {
            var student = await _studentRepository.GetStudentByEmailAsync(loginDto.Email);
            if (student == null || !PasswordHasher.VerifyPassword(loginDto.Password, student.PasswordHash))
                return null;

            return GenerateAuthResponse(student);
        }

        private AuthResponse GenerateAuthResponse(Student student)
        {
            var token = GenerateJwtToken(student, "Student");
            return new AuthResponse { StudentId = student.Id, Token = token, FullName = student.FullName };
        }

        private TokenResponse AdminAuthResponse(Admin admin)
        {
            var token = GenerateJwtToken(admin, "Admin");
            return new TokenResponse { Id = admin.Id, Token = token, FullName = admin.FullName };
        }

        private string GenerateJwtToken(object user, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Role, role)
            };

            if (user is Student student)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, student.Id.ToString()));
                claims.Add(new Claim(ClaimTypes.Name, student.FullName));
                claims.Add(new Claim(ClaimTypes.Email, student.Email));
            }
            else if (user is Admin admin)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()));
                claims.Add(new Claim(ClaimTypes.Name, admin.FullName));
                claims.Add(new Claim(ClaimTypes.Email, admin.Email));
            }

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool RequestPasswordReset(ForgotPasswordDTO request)
        {
            var user = _context.Students.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return false;

            var token = new Random().Next(100000, 999999).ToString(); // 🔹 Generate a 6-digit OTP
            _resetTokens[user.Email] = token; // 🔹 Store the token in memory

            // Send email
            _emailService.SendPasswordResetEmail(user.Email, $"Your password reset code is: {token}");

            return true;
        }

        public bool ResetPassword(ResetPasswordDTO request)
        {
            var resetToken = _context.PasswordResetTokens
                .FirstOrDefault(t => t.Email == request.Email && t.Token == request.Token);

            if (resetToken == null || resetToken.ExpiryTime < DateTime.UtcNow)
                return false; // 🔹 Token is invalid or expired

            var user = _context.Students.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return false;

            // 🔹 Securely update password
            user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
            _context.SaveChanges();

            _context.PasswordResetTokens.Remove(resetToken);
            _context.SaveChanges();

            return true;
        }

        public async Task<TokenResponse?> AdminRegister(RegisterDTO registerDto)
        {
            var existingAdmin = await _adminRepository.GetAdminByEmailAsync(registerDto.Email);
            if (existingAdmin != null) return null; // Email already exists

            var newAdmin = new Admin
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                Subjects = registerDto.Subjects
            };

            await _adminRepository.CreateAdminAsync(newAdmin);
            return AdminAuthResponse(newAdmin);
        }

        public async Task<TokenResponse?> AdminLogin(LoginDTO loginDto)
        {
            var admin = await _adminRepository.GetAdminByEmailAsync(loginDto.Email);
            if (admin == null || !PasswordHasher.VerifyPassword(loginDto.Password, admin.PasswordHash))
                return null;

            return AdminAuthResponse(admin);
        }
    }
}
