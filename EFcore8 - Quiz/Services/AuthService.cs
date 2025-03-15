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
        private readonly IConfiguration _config;
        private readonly QuizAppContext _context;
        private readonly IEmailService _emailService;
        private static Dictionary<string, string> _resetTokens = new Dictionary<string, string>(); // Stores email-token pairs

        public AuthService(IStudentRepo studentRepository, IConfiguration config,QuizAppContext context, IEmailService emailService)
        {
            _studentRepository = studentRepository;
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
            var token = GenerateJwtToken(student);
            return new AuthResponse { StudentId = student.Id, Token = token, FullName = student.FullName };
        }

        private string GenerateJwtToken(Student student)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, student.Id.ToString()),
                new Claim(ClaimTypes.Name, student.FullName),
                new Claim(ClaimTypes.Email, student.Email)
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

        public bool RequestPasswordReset(ForgotPasswordDTO request)
        {
            var user = _context.Students.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return false;

            var token = new Random().Next(100000, 999999).ToString(); // 🔹 Changed to a 6-digit numeric token instead of a Base64 string
            _resetTokens[user.Email] = token; // 🔹 Store the token in memory

            // Send email
            _emailService.SendPasswordResetEmail(user.Email, $"Your password reset code is: {token}"); // 🔹 Send only the numeric token, no reset link

            return true;
        }

        public bool ResetPassword(ResetPasswordDTO request)
        {
            // 🔹 Find the token in the database
            var resetToken = _context.PasswordResetTokens
                .FirstOrDefault(t => t.Email == request.Email && t.Token == request.Token);

            if (resetToken == null || resetToken.ExpiryTime < DateTime.UtcNow)
            {
                return false; // 🔹 Token is invalid or expired
            }

            // 🔹 Find the user by email
            var user = _context.Students.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return false;

            // 🔹 Update password securely
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            _context.SaveChanges();

            // 🔹 Remove the used reset token
            _context.PasswordResetTokens.Remove(resetToken);
            _context.SaveChanges();

            return true;
        }

    }
}
