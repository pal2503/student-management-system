package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Professor;
import com.example.studentmanagement.service.ProfessorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professors")
@CrossOrigin(origins = "*")
public class ProfessorController {

    private final ProfessorService professorService;

    @Autowired
    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @GetMapping
    public ResponseEntity<List<Professor>> getProfessors(@RequestParam(value = "search", required = false) String search) {
        if (search != null) {
            return ResponseEntity.ok(professorService.searchProfessors(search));
        }
        return ResponseEntity.ok(professorService.getAllProfessors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Professor> getProfessorById(@PathVariable Long id) {
        return ResponseEntity.ok(professorService.getProfessorById(id));
    }

    @PostMapping
    public ResponseEntity<Professor> createProfessor(@Valid @RequestBody Professor professor) {
        Professor createdProfessor = professorService.createProfessor(professor);
        return new ResponseEntity<>(createdProfessor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Professor> updateProfessor(@PathVariable Long id, @Valid @RequestBody Professor professorDetails) {
        Professor updatedProfessor = professorService.updateProfessor(id, professorDetails);
        return ResponseEntity.ok(updatedProfessor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfessor(@PathVariable Long id) {
        professorService.deleteProfessor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/email/{email:.+}")
    public ResponseEntity<Professor> getProfessorByEmail(@PathVariable String email) {
        return ResponseEntity.ok(professorService.getProfessorByEmail(email));
    }
}
