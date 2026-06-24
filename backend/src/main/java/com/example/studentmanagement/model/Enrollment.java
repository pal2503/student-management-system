package com.example.studentmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties("enrollments")
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties("enrollments")
    private Course course;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(name = "grade")
    private String grade;

    // Default Constructor
    public Enrollment() {}

    // All-args Constructor
    public Enrollment(Long id, Student student, Course course, LocalDate enrollmentDate, String grade) {
        this.id = id;
        this.student = student;
        this.course = course;
        this.enrollmentDate = enrollmentDate;
        this.grade = grade;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    // Manual Builder Pattern
    public static EnrollmentBuilder builder() {
        return new EnrollmentBuilder();
    }

    public static class EnrollmentBuilder {
        private Long id;
        private Student student;
        private Course course;
        private LocalDate enrollmentDate;
        private String grade;

        public EnrollmentBuilder id(Long id) { this.id = id; return this; }
        public EnrollmentBuilder student(Student student) { this.student = student; return this; }
        public EnrollmentBuilder course(Course course) { this.course = course; return this; }
        public EnrollmentBuilder enrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; return this; }
        public EnrollmentBuilder grade(String grade) { this.grade = grade; return this; }

        public Enrollment build() {
            return new Enrollment(id, student, course, enrollmentDate, grade);
        }
    }
}
