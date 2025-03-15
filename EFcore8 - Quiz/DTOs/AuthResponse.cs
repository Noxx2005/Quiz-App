namespace Quiz.DTOs
{
    public class AuthResponse
    {
        public int StudentId { get; set; }
        public string Token { get; set; } = null!;
        public string FullName { get; set; } = null!;
    }
}
