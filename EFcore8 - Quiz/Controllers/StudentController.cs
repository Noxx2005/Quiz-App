using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Quiz.Data;
using Quiz.DTOs;
using Quiz.Models;

namespace Quiz.Controllers
{
    //[EnableCors("AllowAllOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly QuizAppContext _context;

        public StudentController(QuizAppContext context)
        {
            _context = context;
        }

        [HttpGet("get-student-quizzes/{studentId}")]
        public async Task<IActionResult> GetStudentQuizzes(int studentId)
        {
            var student = await _context.Students.FindAsync(studentId);

            if (student == null)
            {
                return NotFound(new { message = "Student not found." });
            }

            if (string.IsNullOrEmpty(student.Subjects))
            {
                return NotFound(new { message = "No subjects found for this student." });
            }

            var subjects = student.Subjects.Split(',').Select(s => s.Trim()).ToList();

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

            if (!quizzes.Any())
            {
                return NotFound(new { message = "No quizzes available for the student's subjects." });
            }

            return Ok(quizzes);
        }

        [HttpPut("profile/update-subjects")]
        public async Task<IActionResult> UpdateSubjects(int studentId, [FromBody] SubjectUpdateDTO request)
        {
            var student = await _context.Students.FindAsync(studentId);

            if (student == null)
            {
                return NotFound(new { message = "Student not found." });
            }

            var subjectsList = string.IsNullOrEmpty(student.Subjects)
                ? new List<string>()
                : student.Subjects.Split(',').Select(s => s.Trim()).ToList();

            if (request.Action == "add")
            {
                if (!subjectsList.Contains(request.Subject, StringComparer.OrdinalIgnoreCase))
                {
                    subjectsList.Add(request.Subject);
                }
            }
            else if (request.Action == "remove")
            {
                subjectsList.RemoveAll(s => s.Equals(request.Subject, StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                return BadRequest(new { message = "Invalid action. Use 'add' or 'remove'." });
            }

            student.Subjects = string.Join(", ", subjectsList);
            _context.Students.Update(student);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Subjects updated successfully.", updatedSubjects = student.Subjects });
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetStudentProfile(string email)
        {
            var student = await _context.Students
                .Where(s => s.Email == email)
                .Select(s => new
                {
                    s.Id,
                    s.FullName,
                    s.Email,
                    s.Subjects,
                    s.IsSuspended
                })
                .FirstOrDefaultAsync();

            if (student == null)
            {
                return NotFound(new { message = "Student not found." });
            }

            return Ok(student);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetQuizHistory(int studentId)
        {
            var quizHistory = await _context.StudentQuizResults
                .Where(sqr => sqr.StudentId == studentId)
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

        [HttpPost("submit-quiz")]
        public async Task<IActionResult> SubmitQuizResult([FromBody] StudentQuizResultDto quizResultDto)
        {
            if (quizResultDto == null)
            {
                return BadRequest("Invalid data.");
            }

            // Check if the QuizId exists in the Quizzes table
            var quizExists = await _context.Quizzes.AnyAsync(q => q.Id == quizResultDto.QuizId);
            if (!quizExists)
            {
                return NotFound("Quiz not found.");
            }

            try
            {
                // Call the stored procedure to insert or update the quiz result
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC InsertOrUpdateStudentQuizResult @StudentId, @QuizId, @Score",
                    new SqlParameter("@StudentId", quizResultDto.StudentId),
                    new SqlParameter("@QuizId", quizResultDto.QuizId),
                    new SqlParameter("@Score", quizResultDto.Score)
                );

                return Ok(new { message = "Quiz result submitted successfully!" });
            }
            catch (Exception ex)
            {
                // Log the error (optional)
                Console.Error.WriteLine($"Error submitting quiz result: {ex.Message}");
                return StatusCode(500, "An error occurred while submitting the quiz result.");
            }
        }



    }
}
