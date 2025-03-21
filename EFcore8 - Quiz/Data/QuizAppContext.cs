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

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public virtual DbSet<Models.Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizQuestion> QuizQuestions { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<StudentQuizResult> StudentQuizResults { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-C7NEL36;Database=QuizApp;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Admin__3214EC076DD4B4A1");

            entity.ToTable("Admin");

            entity.HasIndex(e => e.Email, "UQ__Admin__A9D10534B14F6D08").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
        });

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
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizQues__3214EC071CD82382");

            entity.ToTable(tb => tb.HasTrigger("trg_LimitQuizQuestions"));

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
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_QuizQuestions_Quiz");
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

            entity.ToTable(tb => tb.HasTrigger("trg_UpdateIsPassed"));

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
