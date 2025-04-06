namespace Quiz.DTOs
{
    public class CreateQuizDTO
    {
        public string Subject { get; set; } = null!;
        public string Topic { get; set; } = null!;
        public bool IsActive { get; set; } = true;

        public string Description { get; set; } = null!;

        public int? Time { get; set; }
        public int AdminId { get; set; }    

        public int? QuizAmount { get; set; }
    }
}
