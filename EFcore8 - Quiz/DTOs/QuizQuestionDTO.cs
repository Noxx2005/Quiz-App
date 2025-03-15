namespace Quiz.DTOs
{
    public class QuizQuestionDTO
    {
        public int QuizId { get; set; }  // Ensure this exists in Quizzes table
        public string QuestionText { get; set; } = null!;
        public string OptionA { get; set; } = null!;
        public string OptionB { get; set; } = null!;
        public string OptionC { get; set; } = null!;
        public string OptionD { get; set; } = null!;
        public string CorrectOption { get; set; } = null!;
    }
}
