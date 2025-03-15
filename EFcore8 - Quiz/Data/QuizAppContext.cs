using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Quiz.Models;

namespace Quiz.Data;

public partial class QuizAppContext : DbContext
{
    public QuizAppContext()
    {
    }

    public QuizAppContext(DbContextOptions<QuizAppContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Models.Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizQuestion> QuizQuestions { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public virtual DbSet<StudentQuizResult> StudentQuizResults { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.Quiz>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Quizzes__3214EC072CBE37E8");

            entity.HasIndex(e => e.Subject, "IDX_Quizzes_Subject");

            entity.HasIndex(e => e.Topic, "IDX_Quizzes_Topic");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Subject).HasMaxLength(100);
            entity.Property(e => e.SubjectLower)
                .HasMaxLength(100)
                .HasComputedColumnSql("(lower([Subject]))", true);
            entity.Property(e => e.Topic).HasMaxLength(100);
            entity.Property(e => e.TopicLower)
                .HasMaxLength(100)
                .HasComputedColumnSql("(lower([Topic]))", true);

            modelBuilder.Entity<StudentQuizResult>()
            .ToTable("StudentQuizResults");
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizQues__3214EC071CD82382");

            entity.Property(e => e.CorrectOption)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.OptionA).HasMaxLength(255);
            entity.Property(e => e.OptionB).HasMaxLength(255);
            entity.Property(e => e.OptionC).HasMaxLength(255);
            entity.Property(e => e.OptionD).HasMaxLength(255);

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizQuestions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__QuizQuest__QuizI__4222D4EF");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Students__3214EC0785DDDF75");

            entity.HasIndex(e => e.Email, "UQ__Students__A9D105340749DAEE").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsSuspended).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
        });

        modelBuilder.Entity<StudentQuizResult>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__StudentQ__3214EC0778FC72BE");

            entity.Property(e => e.AttemptedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Quiz).WithMany(p => p.StudentQuizResults)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__StudentQu__QuizI__45F365D3");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentQuizResults)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__StudentQu__Stude__44FF419A");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);


}
