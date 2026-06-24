package com.example.studentmanagement.service;

import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.model.Professor;
import com.example.studentmanagement.model.User;
import com.example.studentmanagement.repository.ProfessorRepository;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;

    @Autowired
    public ProfessorService(ProfessorRepository professorRepository, UserRepository userRepository) {
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
    }

    public List<Professor> getAllProfessors() {
        return professorRepository.findAll();
    }

    public Professor getProfessorById(Long id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: " + id));
    }

    @Transactional
    public Professor createProfessor(Professor professor) {
        if (professorRepository.findByEmail(professor.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + professor.getEmail());
        }

        // Save Professor record
        Professor savedProfessor = professorRepository.save(professor);

        // Auto-create associated User login account if not exists
        if (!userRepository.existsByEmail(professor.getEmail())) {
            User user = new User();
            String baseUsername = (professor.getFirstName() + "_" + professor.getLastName()).toLowerCase().replaceAll("\\s+", "");
            String username = baseUsername;
            int count = 1;
            while (userRepository.existsByUsername(username)) {
                username = baseUsername + count;
                count++;
            }
            user.setUsername(username);
            user.setEmail(professor.getEmail());
            
            // Use the password assigned by the Admin, default to "prof123" if blank
            String rawPassword = professor.getPassword();
            if (rawPassword == null || rawPassword.trim().isEmpty()) {
                rawPassword = "prof123";
            }
            user.setPassword(SecurityUtils.hashPassword(rawPassword));
            user.setRole("PROFESSOR");
            userRepository.save(user);
        }

        return savedProfessor;
    }

    @Transactional
    public Professor updateProfessor(Long id, Professor professorDetails) {
        Professor professor = getProfessorById(id);

        if (!professor.getEmail().equalsIgnoreCase(professorDetails.getEmail())) {
            if (professorRepository.findByEmail(professorDetails.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use: " + professorDetails.getEmail());
            }
            // Sync email in User table
            userRepository.findByEmail(professor.getEmail()).ifPresent(user -> {
                user.setEmail(professorDetails.getEmail());
                userRepository.save(user);
            });
        }

        professor.setFirstName(professorDetails.getFirstName());
        professor.setLastName(professorDetails.getLastName());
        professor.setEmail(professorDetails.getEmail());
        professor.setPhone(professorDetails.getPhone());
        professor.setDepartment(professorDetails.getDepartment());
        professor.setProfileImage(professorDetails.getProfileImage());
        professor.setGender(professorDetails.getGender());
        professor.setOfficeLocation(professorDetails.getOfficeLocation());
        professor.setBio(professorDetails.getBio());

        return professorRepository.save(professor);
    }

    @Transactional
    public void deleteProfessor(Long id) {
        Professor professor = getProfessorById(id);
        
        // Also delete associated User account
        userRepository.findByEmail(professor.getEmail()).ifPresent(userRepository::delete);
        
        professorRepository.delete(professor);
    }

    public List<Professor> searchProfessors(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return professorRepository.findAll();
        }
        return professorRepository.searchProfessors(keyword.trim());
    }

    public Professor getProfessorByEmail(String email) {
        return professorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with email: " + email));
    }
}
