package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Enrollment;
import com.example.studentmanagement.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @Autowired
    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // Get all enrollments
    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    // Get enrollment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentById(id));
    }

    // Enroll a student in a course
    @PostMapping
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody EnrollmentRequest request) {
        if (request.getStudentId() == null || request.getCourseId() == null) {
            throw new IllegalArgumentException("Student ID and Course ID are required.");
        }
        Enrollment enrollment = enrollmentService.enrollStudent(request.getStudentId(), request.getCourseId());
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    // Update grade for an enrollment
    @PutMapping("/{id}/grade")
    public ResponseEntity<Enrollment> updateGrade(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String grade = payload.get("grade");
        if (grade == null) {
            throw new IllegalArgumentException("Grade is required.");
        }
        Enrollment updatedEnrollment = enrollmentService.updateGrade(id, grade);
        return ResponseEntity.ok(updatedEnrollment);
    }

    // Cancel / Delete enrollment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelEnrollment(@PathVariable Long id) {
        enrollmentService.cancelEnrollment(id);
        return ResponseEntity.noContent().build();
    }

    // Request helper class for binding JSON parameters
    public static class EnrollmentRequest {
        private Long studentId;
        private Long courseId;

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }
    }
}
