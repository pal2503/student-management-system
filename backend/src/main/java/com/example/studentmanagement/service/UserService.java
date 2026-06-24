package com.example.studentmanagement.service;

import com.example.studentmanagement.model.User;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.model.Professor;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.ProfessorRepository;
import com.example.studentmanagement.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;

    @Autowired
    public UserService(UserRepository userRepository, StudentRepository studentRepository, ProfessorRepository professorRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.professorRepository = professorRepository;
    }

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username is already taken.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        // Hash the password for security
        user.setPassword(SecurityUtils.hashPassword(user.getPassword()));
        
        // Normalize role or default to ADMIN
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("ADMIN");
        } else {
            String roleUpper = user.getRole().trim().toUpperCase();
            if (roleUpper.equals("STUDENT") || roleUpper.equals("ADMIN") || roleUpper.equals("PROFESSOR")) {
                user.setRole(roleUpper);
            } else {
                user.setRole("ADMIN");
            }
        }

        // If role is STUDENT, ensure a corresponding Student entity exists
        if ("STUDENT".equals(user.getRole())) {
            if (!studentRepository.findByEmail(user.getEmail()).isPresent()) {
                String username = user.getUsername();
                // Create a basic Student record
                Student student = new Student();
                student.setFirstName(username);
                student.setLastName("Student");
                student.setEmail(user.getEmail());
                student.setDateOfBirth(LocalDate.of(2003, 1, 1));
                student.setDepartment("Computer Science");
                studentRepository.save(student);
            }
        }

        // If role is PROFESSOR, ensure a corresponding Professor entity exists
        if ("PROFESSOR".equals(user.getRole())) {
            if (!professorRepository.findByEmail(user.getEmail()).isPresent()) {
                String username = user.getUsername();
                // Create a basic Professor record
                Professor professor = new Professor();
                professor.setFirstName(username);
                professor.setLastName("Professor");
                professor.setEmail(user.getEmail());
                professor.setDepartment("Computer Science");
                professorRepository.save(professor);
            }
        }

        return userRepository.save(user);
    }

    public User authenticate(String usernameOrEmail, String password) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid username or password.")));

        String hashedInputPassword = SecurityUtils.hashPassword(password);
        if (!user.getPassword().equals(hashedInputPassword)) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        return user;
    }
}
