package com.example.studentmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Course code is required")
    @Column(name = "course_code", unique = true, nullable = false)
    private String courseCode;

    @NotBlank(message = "Course title is required")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @NotNull(message = "Credits are required")
    @Min(value = 1, message = "Credits must be at least 1")
    @Max(value = 8, message = "Credits cannot exceed 8")
    @Column(name = "credits", nullable = false)
    private Integer credits;

    @NotBlank(message = "Instructor is required")
    @Column(name = "instructor", nullable = false)
    private String instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("course")
    private List<Enrollment> enrollments = new ArrayList<>();

    // Default Constructor
    public Course() {}

    // All-args Constructor
    public Course(Long id, String courseCode, String title, String description, Integer credits, String instructor, List<Enrollment> enrollments) {
        this.id = id;
        this.courseCode = courseCode;
        this.title = title;
        this.description = description;
        this.credits = credits;
        this.instructor = instructor;
        if (enrollments != null) {
            this.enrollments = enrollments;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }

    // Manual Builder Pattern
    public static CourseBuilder builder() {
        return new CourseBuilder();
    }

    public static class CourseBuilder {
        private Long id;
        private String courseCode;
        private String title;
        private String description;
        private Integer credits;
        private String instructor;
        private List<Enrollment> enrollments = new ArrayList<>();

        public CourseBuilder id(Long id) { this.id = id; return this; }
        public CourseBuilder courseCode(String courseCode) { this.courseCode = courseCode; return this; }
        public CourseBuilder title(String title) { this.title = title; return this; }
        public CourseBuilder description(String description) { this.description = description; return this; }
        public CourseBuilder credits(Integer credits) { this.credits = credits; return this; }
        public CourseBuilder instructor(String instructor) { this.instructor = instructor; return this; }
        public CourseBuilder enrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; return this; }

        public Course build() {
            return new Course(id, courseCode, title, description, credits, instructor, enrollments);
        }
    }
}
