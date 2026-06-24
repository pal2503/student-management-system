package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Course;
import com.example.studentmanagement.model.Enrollment;
import com.example.studentmanagement.service.CourseService;
import com.example.studentmanagement.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;

    @Autowired
    public CourseController(CourseService courseService, EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }

    // Get all courses or search by keyword
    @GetMapping
    public ResponseEntity<List<Course>> getCourses(@RequestParam(value = "search", required = false) String search) {
        if (search != null) {
            return ResponseEntity.ok(courseService.searchCourses(search));
        }
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // Get course by ID
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // Create a new course
    @PostMapping
    public ResponseEntity<Course> createCourse(@Valid @RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
    }

    // Update course details
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @Valid @RequestBody Course courseDetails) {
        Course updatedCourse = courseService.updateCourse(id, courseDetails);
        return ResponseEntity.ok(updatedCourse);
    }

    // Delete a course
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // Get all enrollments for a specific course
    @GetMapping("/{id}/enrollments")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourse(id));
    }
}
