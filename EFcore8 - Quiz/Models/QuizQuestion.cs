using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Quiz.Models;

public partial class QuizQuestion
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Ensure auto-increment
    public int Id { get; set; }

    public int QuizId { get; set; } // Foreign Key
    public string QuestionText { get; set; }
    public string OptionA { get; set; }
    public string OptionB { get; set; }
    public string OptionC { get; set; }
    public string OptionD { get; set; }
    public string CorrectOption { get; set; }

    public virtual Quiz? Quiz { get; set; }
}
