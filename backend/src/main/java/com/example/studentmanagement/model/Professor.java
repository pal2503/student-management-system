package com.example.studentmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "professors")
public class Professor {

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

    @NotBlank(message = "Department is required")
    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "profile_image", columnDefinition = "LONGTEXT")
    private String profileImage;

    @Column(name = "gender")
    private String gender;

    @Column(name = "office_location")
    private String officeLocation;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Transient
    private String password;

    // Default Constructor
    public Professor() {}

    // Getters and Setters
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // All-args Constructor
    public Professor(Long id, String firstName, String lastName, String email, String phone, String department, String profileImage, String gender, String officeLocation, String bio) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.profileImage = profileImage;
        this.gender = gender;
        this.officeLocation = officeLocation;
        this.bio = bio;
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

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getOfficeLocation() { return officeLocation; }
    public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
