namespace Quiz.DTOs
{
    public class StudentQuizResultDto
    {
        public int StudentId { get; set; }
        public int QuizId { get; set; }
        public int Score { get; set; }
        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
        public bool IsPassed { get; set; }
    }

}
