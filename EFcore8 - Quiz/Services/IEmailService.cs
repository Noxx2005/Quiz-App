namespace Quiz.Services
{
    public interface IEmailService
    {
        void SendPasswordResetEmail(string email, string message);
    }
}
    