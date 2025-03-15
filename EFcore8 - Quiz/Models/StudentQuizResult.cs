using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class StudentQuizResult
{
    public int Id { get; set; }

    public int? StudentId { get; set; }

    public int? QuizId { get; set; }

    public int Score { get; set; }

    public DateTime? AttemptedAt { get; set; }

    public bool IsPassed { get; set; }

    public virtual Quiz? Quiz { get; set; }

    public virtual Student? Student { get; set; }
}
