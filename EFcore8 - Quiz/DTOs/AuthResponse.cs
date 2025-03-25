namespace Quiz.DTOs
{
    public class AuthResponse
    {
        public int UserId { get; set; }
        public string Token { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
}
