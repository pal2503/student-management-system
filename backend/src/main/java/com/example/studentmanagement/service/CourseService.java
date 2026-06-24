package com.example.studentmanagement.service;

import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.model.Course;
import com.example.studentmanagement.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    @Autowired
    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Transactional
    public Course createCourse(Course course) {
        if (courseRepository.findByCourseCode(course.getCourseCode()).isPresent()) {
            throw new IllegalArgumentException("Course code already in use: " + course.getCourseCode());
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = getCourseById(id);

        // Check courseCode uniqueness if courseCode is changed
        if (!course.getCourseCode().equalsIgnoreCase(courseDetails.getCourseCode())) {
            if (courseRepository.findByCourseCode(courseDetails.getCourseCode()).isPresent()) {
                throw new IllegalArgumentException("Course code already in use: " + courseDetails.getCourseCode());
            }
        }

        course.setCourseCode(courseDetails.getCourseCode());
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setCredits(courseDetails.getCredits());
        course.setInstructor(courseDetails.getInstructor());

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }

    public List<Course> searchCourses(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return courseRepository.findAll();
        }
        return courseRepository.searchCourses(keyword.trim());
    }
}
