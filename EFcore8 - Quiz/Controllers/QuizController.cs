using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
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
            try
            {
                // 🔍 Log incoming data
                Console.WriteLine(JsonConvert.SerializeObject(quizQuestionDto));

                // Check if QuizId exists
                var existingQuiz = await _context.Quizzes.FindAsync(quizQuestionDto.QuizId);
                if (existingQuiz == null)
                {
                    return BadRequest("Quiz does not exist.");
                }

                // Get the number of questions already added for this QuizId
                int currentQuestionCount = await _context.QuizQuestions
                    .CountAsync(q => q.QuizId == quizQuestionDto.QuizId);

                // Ensure we do not exceed the allowed number of questions
                if (currentQuestionCount >= existingQuiz.QuestionAmount)
                {
                    return BadRequest($"Cannot add more questions. Maximum allowed: {existingQuiz.QuestionAmount}");
                }

                // Create new QuizQuestion object
                var newQuestion = new QuizQuestion
                {
                    QuizId = quizQuestionDto.QuizId,
                    QuestionText = quizQuestionDto.QuestionText,
                    OptionA = quizQuestionDto.OptionA,
                    OptionB = quizQuestionDto.OptionB,
                    OptionC = quizQuestionDto.OptionC,
                    OptionD = quizQuestionDto.OptionD,
                    CorrectOption = quizQuestionDto.CorrectOption // Ensure this is within allowed constraints
                };

                // Add and save
                _context.QuizQuestions.Add(newQuestion);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Question added successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
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
