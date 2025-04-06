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

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public virtual DbSet<Models.Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizQuestion> QuizQuestions { get; set; }

    public virtual DbSet<StudentQuizResult> StudentQuizResults { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-C7NEL36;Database=QuizApp;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Password__3214EC0785B4AA7D");

            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.ExpiryTime).HasColumnType("datetime");
            entity.Property(e => e.Token).HasMaxLength(255);
        });

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

            entity.HasOne(d => d.Admin).WithMany(p => p.Quizzes)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Quizzes_AdminId");
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizQues__3214EC071CD82382");

            entity.Property(e => e.CorrectOption).HasMaxLength(10);
            entity.Property(e => e.OptionA).HasMaxLength(255);
            entity.Property(e => e.OptionB).HasMaxLength(255);
            entity.Property(e => e.OptionC).HasMaxLength(255);
            entity.Property(e => e.OptionD).HasMaxLength(255);

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizQuestions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK_QuizQuestions_Quiz");
        });

        modelBuilder.Entity<StudentQuizResult>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__StudentQ__3214EC0778FC72BE");

            entity.ToTable(tb => tb.HasTrigger("trg_UpdateIsPassed"));

            entity.Property(e => e.AttemptedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Quiz).WithMany(p => p.StudentQuizResults)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__StudentQu__QuizI__45F365D3");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentQuizResults)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK_StudentQuizResults_Users");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Subject__3214EC07F5889897");

            entity.ToTable("Subject");

            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC279D5D4B0C");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053425CBD5A3").IsUnique();

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.UserType).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
