using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Data;
using Quiz.DTOs;
using Quiz.Models;

namespace Quiz.Controllers
{
    //[EnableCors("AllowAllOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly QuizAppContext _context;

        public QuizController(QuizAppContext context)
        {
            _context = context;
        }


        [HttpPost]
        public async Task<IActionResult> AddQuizQuestion([FromBody] QuizQuestionDTO quizQuestionDto)
        {
            // ✅ Check if QuizId exists in Quizzes table before adding the question
            var existingQuiz = await _context.Quizzes.FindAsync(quizQuestionDto.QuizId);
            if (existingQuiz == null)
            {
                return BadRequest("Quiz does not exist.");
            }

            // ✅ Create a new QuizQuestion object
            var newQuestion = new QuizQuestion
            {
                QuizId = quizQuestionDto.QuizId,
                QuestionText = quizQuestionDto.QuestionText,
                OptionA = quizQuestionDto.OptionA,
                OptionB = quizQuestionDto.OptionB,
                OptionC = quizQuestionDto.OptionC,
                OptionD = quizQuestionDto.OptionD,
                CorrectOption = quizQuestionDto.CorrectOption
            };

            // ✅ Add to the database
            _context.QuizQuestions.Add(newQuestion);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question added successfully!" });
        }

        [HttpGet("GetQuizQuestions/{quizId}")]
        public async Task<IActionResult> GetQuizQuestions(int quizId)
        {
            var questions = await _context.QuizQuestions
                .Where(q => q.QuizId == quizId)
                .Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    Options = new List<string> { q.OptionA, q.OptionB, q.OptionC, q.OptionD },
                    q.CorrectOption
                    
                })
                .ToListAsync();

            if (questions == null || !questions.Any())
            {
                return NotFound(new { message = "No questions found for this quiz." });
            }

            return Ok(questions);
        }
    }
}
