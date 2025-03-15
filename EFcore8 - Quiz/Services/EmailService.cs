using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using Microsoft.Extensions.Configuration;
using Quiz.Data;
using Quiz.Models;
using System;
using System.Linq;
using System.Security.Cryptography;

namespace Quiz.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly QuizAppContext _context;

        public EmailService(IConfiguration config, QuizAppContext context)
        {
            _config = config;
            _context = context;
        }

        public void SendPasswordResetEmail(string email, string message)
        {
            // Generate a secure 6-digit token
            var token = new Random().Next(100000, 999999).ToString();
            var expiryTime = DateTime.UtcNow.AddMinutes(10); // Token valid for 10 minutes

            // Store token in the database
            var resetToken = new PasswordResetToken
            {
                Email = email,
                Token = token,
                ExpiryTime = expiryTime
            };

            _context.PasswordResetTokens.Add(resetToken);
            _context.SaveChanges();

            // Email content
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(MailboxAddress.Parse(_config["EmailSettings:EmailUsername"]));
            emailMessage.To.Add(MailboxAddress.Parse(email));
            emailMessage.Subject = "Password Reset Code";
            emailMessage.Body = new TextPart(TextFormat.Plain)
            {
                Text = $"Your password reset code is: {token}. It will expire in 10 minutes."
            };

            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(_config["EmailSettings:EmailHost"], 587, SecureSocketOptions.StartTls);
                client.Authenticate(_config["EmailSettings:EmailUsername"], _config["EmailSettings:EmailPassword"]);
                client.Send(emailMessage);
                client.Disconnect(true);
            }
        }
    }
}
