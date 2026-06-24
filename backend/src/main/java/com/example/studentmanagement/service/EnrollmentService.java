package com.example.studentmanagement.service;

import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.model.Course;
import com.example.studentmanagement.model.Enrollment;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.CourseRepository;
import com.example.studentmanagement.repository.EnrollmentRepository;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             StudentRepository studentRepository,
                             CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Enrollment getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));
    }

    @Transactional
    public Enrollment enrollStudent(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new IllegalArgumentException("Student is already enrolled in this course.");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrollmentDate(LocalDate.now())
                .grade("Pending") // Default grade is Pending
                .build();

        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public Enrollment updateGrade(Long enrollmentId, String grade) {
        Enrollment enrollment = getEnrollmentById(enrollmentId);
        
        // Normalize grade values
        String cleanGrade = grade != null ? grade.trim().toUpperCase() : "PENDING";
        enrollment.setGrade(cleanGrade);
        
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void cancelEnrollment(Long enrollmentId) {
        Enrollment enrollment = getEnrollmentById(enrollmentId);
        enrollmentRepository.delete(enrollment);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with id: " + courseId);
        }
        return enrollmentRepository.findByCourseId(courseId);
    }
}
