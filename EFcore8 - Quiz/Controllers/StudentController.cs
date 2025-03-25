using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Quiz.Data;
using Quiz.DTOs;
using Quiz.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Quiz.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly QuizAppContext _context;

        public UserController(QuizAppContext context)
        {
            _context = context;
        }

        // ✅ Get quizzes based on user's subjects
        [HttpGet("get-user-quizzes/{userId}")]
        public async Task<IActionResult> GetUserQuizzes(int userId)
        {
            var user = await _context.Users.FindAsync(userId); // Update to Users

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (string.IsNullOrEmpty(user.Subjects))
                return NotFound(new { message = "No subjects found for this user." });

            var subjects = user.Subjects.Split(',').Select(s => s.Trim()).ToList();

            var quizzes = await _context.Quizzes
                .Where(q => subjects.Contains(q.Subject))
                .Select(q => new
                {
                    q.Id,
                    q.Subject,
                    q.Topic,
                    q.Description,
                    q.CreatedAt,
                    q.IsActive,
                    q.Time
                })
                .ToListAsync();

            return quizzes.Any() ? Ok(quizzes) : NotFound(new { message = "No quizzes available." });
        }

        // ✅ Update user subjects (add/remove)
        [HttpPut("profile/update-subjects")]
        public async Task<IActionResult> UpdateSubjects(int userId, [FromBody] SubjectUpdateDTO request)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var subjectsList = string.IsNullOrEmpty(user.Subjects)
                ? new List<string>()
                : user.Subjects.Split(',').Select(s => s.Trim()).ToList();

            if (request.Action == "add" && !subjectsList.Contains(request.Subject, StringComparer.OrdinalIgnoreCase))
            {
                subjectsList.Add(request.Subject);
            }
            else if (request.Action == "remove")
            {
                subjectsList.RemoveAll(s => s.Equals(request.Subject, StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                return BadRequest(new { message = "Invalid action. Use 'add' or 'remove'." });
            }

            user.Subjects = string.Join(", ", subjectsList);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Subjects updated successfully.", updatedSubjects = user.Subjects });
        }

        // ✅ Get user profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile(string email)
        {
            var user = await _context.Users
                .Where(u => u.Email == email)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Subjects,
                    u.IsSuspended
                })
                .FirstOrDefaultAsync();

            return user != null ? Ok(user) : NotFound(new { message = "User not found." });
        }

        // ✅ Get quiz history for user
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetQuizHistory(int userId)
        {
            var quizHistory = await _context.StudentQuizResults
                .Where(sqr => sqr.StudentId == userId) // Ensure `StudentId` is updated to `UserId` if necessary
                .Join(
                    _context.Quizzes,
                    sqr => sqr.QuizId,
                    q => q.Id,
                    (sqr, q) => new QuizHistoryDTO
                    {
                        QuizId = q.Id,
                        Subject = q.Subject,
                        Topic = q.Topic,
                        Description = q.Description,
                        Score = sqr.Score,
                        IsPassed = sqr.IsPassed,
                        AttemptedAt = sqr.AttemptedAt ?? DateTime.MinValue
                    })
                .ToListAsync();

            return Ok(quizHistory);
        }

        // ✅ Submit quiz result using a stored procedure
        [HttpPost("submit-quiz")]
        public async Task<IActionResult> SubmitQuizResult([FromBody] StudentQuizResultDto quizResultDto)
        {
            if (quizResultDto == null)
                return BadRequest("Invalid data.");

            var quizExists = await _context.Quizzes.AnyAsync(q => q.Id == quizResultDto.QuizId);
            if (!quizExists)
                return NotFound("Quiz not found.");

            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC InsertOrUpdateStudentQuizResult @UserId, @QuizId, @Score",
                    new SqlParameter("@UserId", quizResultDto.StudentId),  // Change `StudentId` to `UserId` if applicable
                    new SqlParameter("@QuizId", quizResultDto.QuizId),
                    new SqlParameter("@Score", quizResultDto.Score)
                );

                return Ok(new { message = "Quiz result submitted successfully!" });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error submitting quiz result: {ex.Message}");
                return StatusCode(500, "An error occurred while submitting the quiz result.");
            }
        }

        // ✅ Suspend or reinstate a user
        [HttpPut("suspend-user/{userId}")]
        public async Task<IActionResult> SuspendUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.IsSuspended = !(user.IsSuspended ?? false);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = user.IsSuspended == true
                    ? $"User {user.FullName} has been suspended."
                    : $"User {user.FullName} has been reinstated."
            });
        }
    }
}
