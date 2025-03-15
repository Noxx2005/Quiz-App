using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class PasswordResetToken
{
    public int Id { get; set; }

    public string Email { get; set; } = null!;

    public string Token { get; set; } = null!;

    public DateTime ExpiryTime { get; set; }
}
