using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class Admin
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Subjects { get; set; }
}
