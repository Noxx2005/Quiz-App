using Microsoft.AspNetCore.Mvc;
using Quiz.Models;
using Quiz.DTOs;
using Quiz.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace Quiz.Controllers
{
    //[EnableCors("AllowAllOrigins")]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly QuizAppContext _context;

        public AdminController(QuizAppContext context)
        {
            _context = context;
        }

        [HttpPost("create-quiz")]
        public IActionResult CreateQuiz([FromBody] CreateQuizDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Topic))
            {
                return BadRequest("Subject and Topic are required.");
            }

            var quiz = new Quiz.Models.Quiz
            {
                Subject = request.Subject,
                Topic = request.Topic,
                SubjectLower = request.Subject.ToLower(),
                TopicLower = request.Topic.ToLower(),
                QuestionAmount =request.QuizAmount,
                CreatedAt = DateTime.UtcNow,
                IsActive = request.IsActive
            };

            _context.Quizzes.Add(quiz);
            _context.SaveChanges();

            return Ok(new { message = "Quiz created successfully!", quizId = quiz.Id });
        }

        [HttpPut("toggle-quiz/{quizId}")]
        public async Task<IActionResult> ToggleQuiz(int quizId)
        {
            var quiz = await _context.Quizzes.FindAsync(quizId);
            if (quiz == null)
            {
                return NotFound(new { message = "Quiz not found" });
            }

            // Toggle the IsActive status
            quiz.IsActive = quiz.IsActive.HasValue ? !quiz.IsActive.Value : true;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Quiz {(quiz.IsActive == true ? "enabled" : "disabled")} successfully", quiz });
        }

        [HttpPut("suspend-student/{studentId}")]
        public async Task<IActionResult> SuspendStudent(int studentId)
        {
            var student = await _context.Students.FindAsync(studentId);

            if (student == null)
            {
                return NotFound(new { message = "Student not found." });
            }

            // Ensure IsSuspended is not null before toggling
            student.IsSuspended = !(student.IsSuspended ?? false);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = student.IsSuspended == true
                    ? $"Student {student.FullName} has been suspended."
                    : $"Student {student.FullName} has been reinstated."
            });
        }

        [HttpGet("get-results/{quizId}")]
        public async Task<IActionResult> GetQuizResults(int quizId)
        {
            var results = await _context.StudentQuizResults
                .Where(r => r.QuizId == quizId)
                .AsQueryable() // ✅ Ensure IQueryable from EF Core
                .Select(r => new
                {
                    r.Id,
                    r.StudentId,
                    StudentName = r.Student.FullName,
                    r.QuizId,
                    QuizSubject = r.Quiz.Subject,
                    QuizTopic = r.Quiz.Topic,
                    r.Score,
                    r.AttemptedAt
                })
                .ToListAsync(); // ✅ Ensure EF Core's async operation

            if (!results.Any())
            {
                return NotFound(new { message = "No results found for this quiz." });
            }

            return Ok(results);
        }

        [HttpGet("get-all-quizzes")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var quizzes = await _context.Quizzes
                .Select(q => new
                {
                    q.Id,
                    q.Subject,
                    q.Topic,
                    q.Description,
                    q.CreatedAt,
                    q.IsActive
                })
                .ToListAsync();

            if (!quizzes.Any())
            {
                return NotFound(new { message = "No quizzes found." });
            }

            return Ok(quizzes);
        }



    }
}
