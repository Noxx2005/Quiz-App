using System;
using System.Collections.Generic;

namespace Quiz.Models;

public partial class QuizQuestion
{
    public int Id { get; set; }

    public int? QuizId { get; set; }

    public string QuestionText { get; set; } = null!;

    public string OptionA { get; set; } = null!;

    public string OptionB { get; set; } = null!;

    public string OptionC { get; set; } = null!;

    public string OptionD { get; set; } = null!;

    public string CorrectOption { get; set; } = null!;

    public virtual Quiz? Quiz { get; set; }
}
