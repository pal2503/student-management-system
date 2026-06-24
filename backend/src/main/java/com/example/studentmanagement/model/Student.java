package com.example.studentmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @NotNull(message = "Date of birth is required")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Department is required")
    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "profile_image", columnDefinition = "LONGTEXT")
    private String profileImage;

    @Column(name = "gender")
    private String gender;

    @Column(name = "address")
    private String address;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<Enrollment> enrollments = new ArrayList<>();

    // Default Constructor
    public Student() {}

    // All-args Constructor
    public Student(Long id, String firstName, String lastName, String email, String phone, LocalDate dateOfBirth, String department, String profileImage, String gender, String address, String bio, List<Enrollment> enrollments) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.department = department;
        this.profileImage = profileImage;
        this.gender = gender;
        this.address = address;
        this.bio = bio;
        if (enrollments != null) {
            this.enrollments = enrollments;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }

    // Manual Builder Pattern
    public static StudentBuilder builder() {
        return new StudentBuilder();
    }

    public static class StudentBuilder {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String department;
        private String profileImage;
        private String gender;
        private String address;
        private String bio;
        private List<Enrollment> enrollments = new ArrayList<>();

        public StudentBuilder id(Long id) { this.id = id; return this; }
        public StudentBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public StudentBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder phone(String phone) { this.phone = phone; return this; }
        public StudentBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public StudentBuilder department(String department) { this.department = department; return this; }
        public StudentBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public StudentBuilder gender(String gender) { this.gender = gender; return this; }
        public StudentBuilder address(String address) { this.address = address; return this; }
        public StudentBuilder bio(String bio) { this.bio = bio; return this; }
        public StudentBuilder enrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; return this; }

        public Student build() {
            return new Student(id, firstName, lastName, email, phone, dateOfBirth, department, profileImage, gender, address, bio, enrollments);
        }
    }
}
