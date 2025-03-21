namespace Quiz.DTOs
{
    public class TokenResponse
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public string FullName { get; set; } = null!;
    }
}
