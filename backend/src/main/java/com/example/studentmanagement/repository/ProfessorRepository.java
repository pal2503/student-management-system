package com.example.studentmanagement.repository;

import com.example.studentmanagement.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    
    Optional<Professor> findByEmail(String email);
    
    List<Professor> findByDepartment(String department);
    
    @Query("SELECT p FROM Professor p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.department) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Professor> searchProfessors(@Param("keyword") String keyword);
}
