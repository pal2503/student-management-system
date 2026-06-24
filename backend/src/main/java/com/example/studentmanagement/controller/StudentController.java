package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Enrollment;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.service.EnrollmentService;
import com.example.studentmanagement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*") // Allow React frontend to access these APIs
public class StudentController {

    private final StudentService studentService;
    private final EnrollmentService enrollmentService;

    @Autowired
    public StudentController(StudentService studentService, EnrollmentService enrollmentService) {
        this.studentService = studentService;
        this.enrollmentService = enrollmentService;
    }

    // Get all students or search them by keyword
    @GetMapping
    public ResponseEntity<List<Student>> getStudents(@RequestParam(value = "search", required = false) String search) {
        if (search != null) {
            return ResponseEntity.ok(studentService.searchStudents(search));
        }
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // Create a new student
    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        Student createdStudent = studentService.createStudent(student);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }

    // Update student details
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @Valid @RequestBody Student studentDetails) {
        Student updatedStudent = studentService.updateStudent(id, studentDetails);
        return ResponseEntity.ok(updatedStudent);
    }

    // Delete a student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // Get all enrollments for a specific student
    @GetMapping("/{id}/enrollments")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(id));
    }

    // Get student by email
    @GetMapping("/email/{email:.+}")
    public ResponseEntity<Student> getStudentByEmail(@PathVariable String email) {
        return ResponseEntity.ok(studentService.getStudentByEmail(email));
    }
}
