using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class Student
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Subjects { get; set; }

    public bool? IsSuspended { get; set; }

    public virtual ICollection<StudentQuizResult> StudentQuizResults { get; set; } = new List<StudentQuizResult>();
}
