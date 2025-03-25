using Quiz.Repositories;
using Quiz.Models;
using Quiz.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Quiz.Utility;
using Quiz.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System;

namespace Quiz.Services
{
    public class AuthService : IAuthService
    {
        private readonly IStudentRepo _studentRepository;
        private readonly IAdminRepo _adminRepository;
        private readonly IConfiguration _config;
        private readonly QuizAppContext _context;
        private readonly IEmailService _emailService;
        private static Dictionary<string, string> _resetTokens = new Dictionary<string, string>(); // Email-Token pairs

        public AuthService(IStudentRepo studentRepository, IAdminRepo adminRepository, IConfiguration config, QuizAppContext context, IEmailService emailService)
        {
            _studentRepository = studentRepository;
            _adminRepository = adminRepository;
            _config = config;
            _context = context;
            _emailService = emailService;
        }

        // 🔹 Register Student
        public async Task<AuthResponse?> RegisterAsync(RegisterDTO registerDto)
        {
            var existingStudent = await _studentRepository.GetStudentByEmailAsync(registerDto.Email);
            if (existingStudent != null) return null; // Email already exists

            var newStudent = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                UserType = "Student",
                Subjects = registerDto.Subjects
            };

            await _studentRepository.CreateStudentAsync(newStudent);
            return GenerateAuthResponse(newStudent);
        }

        // 🔹 Login Student or Admin
        public async Task<AuthResponse?> LoginAsync(LoginDTO loginDto)
        {
            // Check Admin login
            var admin = await _adminRepository.GetAdminByEmailAsync(loginDto.Email);
            if (admin != null && PasswordHasher.VerifyPassword(loginDto.Password, admin.PasswordHash))
            {
                return GenerateAuthResponse(admin);
            }

            // Check Student login
            var student = await _studentRepository.GetStudentByEmailAsync(loginDto.Email);
            if (student != null && PasswordHasher.VerifyPassword(loginDto.Password, student.PasswordHash))
            {
                return GenerateAuthResponse(student);
            }

            return null; // No matching user found
        }

        // 🔹 Generate Authentication Response
        private AuthResponse GenerateAuthResponse(User user)
        {
            string token = GenerateJwtToken(user.Id, user.FullName, user.Email, user.UserType);

            return new AuthResponse
            {
                UserId = user.Id,
                Token = token,
                FullName = user.FullName,
                Role = user.UserType
            };
        }

        // 🔹 Generate JWT Token
        private string GenerateJwtToken(int userId, string fullName, string email, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, fullName),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // 🔹 Password Reset Request
        public bool RequestPasswordReset(ForgotPasswordDTO request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return false;

            var token = new Random().Next(100000, 999999).ToString(); // 6-digit OTP
            _resetTokens[user.Email] = token;

            // Send email with OTP
            _emailService.SendPasswordResetEmail(user.Email, $"Your password reset code is: {token}");

            return true;
        }

        // 🔹 Reset Password
        public bool ResetPassword(ResetPasswordDTO request)
        {
            if (!_resetTokens.ContainsKey(request.Email) || _resetTokens[request.Email] != request.Token)
                return false; // Invalid or expired token

            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return false;

            user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
            _context.SaveChanges();

            _resetTokens.Remove(request.Email); // Remove token after reset

            return true;
        }

        // 🔹 Register Admin
        public async Task<AuthResponse?> AdminRegister(RegisterDTO registerDto)
        {
            var existingAdmin = await _adminRepository.GetAdminByEmailAsync(registerDto.Email);
            if (existingAdmin != null) return null; // Email already exists

            var newAdmin = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                UserType = "Admin"
            };

            await _adminRepository.CreateAdminAsync(newAdmin);
            return GenerateAuthResponse(newAdmin);
        }
    }
}
