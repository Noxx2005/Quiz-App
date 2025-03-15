namespace Quiz.DTOs
{
    public class QuizHistoryDTO
    {
        public int QuizId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Score { get; set; }
        public bool IsPassed { get; set; }
        public DateTime? AttemptedAt { get; set; }
    }
}
