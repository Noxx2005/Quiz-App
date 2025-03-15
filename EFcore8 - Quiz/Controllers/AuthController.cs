using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Quiz.DTOs;
using Quiz.Services;

namespace Quiz.Controllers
{
    //[EnableCors("AllowAllOrigins")]
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            if (result == null) return BadRequest(new { message = "Email already in use" });

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null) return Unauthorized(new { message = "Invalid credentials" });

            return Ok(result);
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordDTO request)
        {
            var result = _authService.RequestPasswordReset(request);
            if (!result) return BadRequest("Email not found.");
            return Ok("Password reset email sent.");
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDTO request)
        {
            var result = _authService.ResetPassword(request);
            if (!result) return BadRequest("Invalid token or email.");
            return Ok("Password reset successful.");
        }
    }
}
