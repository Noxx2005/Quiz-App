namespace Quiz.DTOs
{
    public class CreateQuizDTO
    {
        public string Subject { get; set; } = null!;
        public string Topic { get; set; } = null!;
        public bool IsActive { get; set; } = true;

        public int? QuizAmount { get; set; }
    }
}
