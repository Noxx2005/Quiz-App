using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class User
{
    public int Id { get; set; }

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? PasswordHash { get; set; }

    public string? UserType { get; set; }

    public string? Subjects { get; set; }

    public bool? IsSuspended { get; set; }

    public virtual ICollection<StudentQuizResult> StudentQuizResults { get; set; } = new List<StudentQuizResult>();
}
