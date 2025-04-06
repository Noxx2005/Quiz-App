using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class Quiz
{
    public int Id { get; set; }

    public string Subject { get; set; } = null!;

    public string Topic { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public string? SubjectLower { get; set; }

    public string? TopicLower { get; set; }

    public string? Description { get; set; }

    public int? Time { get; set; }

    public int? QuestionAmount { get; set; }

    public int? AdminId { get; set; }

    public virtual User? Admin { get; set; }

    public virtual ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();

    public virtual ICollection<StudentQuizResult> StudentQuizResults { get; set; } = new List<StudentQuizResult>();
}
