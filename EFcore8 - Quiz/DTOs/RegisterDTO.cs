namespace Quiz.DTOs
{
    public class RegisterDTO
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Subjects { get; set; }

        public bool isSuspended { get; set; }
    }
}
