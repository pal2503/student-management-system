package com.example.studentmanagement.service;

import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Transactional
    public Student createStudent(Student student) {
        if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + student.getEmail());
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = getStudentById(id);

        // Check email uniqueness if email is changed
        if (!student.getEmail().equalsIgnoreCase(studentDetails.getEmail())) {
            if (studentRepository.findByEmail(studentDetails.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use: " + studentDetails.getEmail());
            }
        }

        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        student.setEmail(studentDetails.getEmail());
        student.setPhone(studentDetails.getPhone());
        student.setDateOfBirth(studentDetails.getDateOfBirth());
        student.setDepartment(studentDetails.getDepartment());
        student.setProfileImage(studentDetails.getProfileImage());
        student.setGender(studentDetails.getGender());
        student.setAddress(studentDetails.getAddress());
        student.setBio(studentDetails.getBio());

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    public List<Student> searchStudents(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        return studentRepository.searchStudents(keyword.trim());
    }

    public Student getStudentByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
    }
}
