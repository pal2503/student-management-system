package com.example.studentmanagement.config;

import com.example.studentmanagement.model.Course;
import com.example.studentmanagement.model.Enrollment;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.model.User;
import com.example.studentmanagement.model.Professor;
import com.example.studentmanagement.repository.CourseRepository;
import com.example.studentmanagement.repository.EnrollmentRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.repository.ProfessorRepository;
import com.example.studentmanagement.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final ProfessorRepository professorRepository;

    @Autowired
    public DataInitializer(StudentRepository studentRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           UserRepository userRepository,
                           ProfessorRepository professorRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
    }

    @Override
    public void run(String... args) {
        // Seed default administrator if not present
        if (!userRepository.existsByUsername("admin")) {
            System.out.println("Seeding default administrator: admin / admin123");
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@nexusacademy.edu");
            admin.setPassword(SecurityUtils.hashPassword("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        // Granularly seed default professors if not present
        if (professorRepository.count() == 0) {
            System.out.println("Seeding default professors...");
            Professor prof1 = new Professor(null, "Alan", "Turing", "alan.turing@university.edu", "+1-555-0201", "Computer Science", null, "Male", "Turing Hall, Room 101", "Father of theoretical computer science and artificial intelligence.");
            Professor prof2 = new Professor(null, "Edgar", "Codd", "edgar.codd@university.edu", "+1-555-0202", "Information Technology", null, "Male", "Codd Wing, Room 202", "Invented the relational model for database management.");
            Professor prof3 = new Professor(null, "Tim", "Berners-Lee", "tim.blee@university.edu", "+1-555-0203", "Computer Science", null, "Male", "Web Lab, Room 303", "Inventor of the World Wide Web.");
            Professor prof4 = new Professor(null, "Katherine", "Johnson", "katherine.j@university.edu", "+1-555-0204", "Mathematics", null, "Female", "Math Space, Room 201", "Calculated trajectories for early NASA crewed space flights.");

            professorRepository.saveAll(List.of(prof1, prof2, prof3, prof4));

            User u1 = new User(null, "alan_turing", "alan.turing@university.edu", SecurityUtils.hashPassword("prof123"), "PROFESSOR");
            User u2 = new User(null, "edgar_codd", "edgar.codd@university.edu", SecurityUtils.hashPassword("prof123"), "PROFESSOR");
            User u3 = new User(null, "tim_blee", "tim.blee@university.edu", SecurityUtils.hashPassword("prof123"), "PROFESSOR");
            User u4 = new User(null, "katherine_j", "katherine.j@university.edu", SecurityUtils.hashPassword("prof123"), "PROFESSOR");

            userRepository.saveAll(List.of(u1, u2, u3, u4));
        }

        // Auto-heal: Ensure all existing professors have a corresponding User login account
        List<Professor> existingProfs = professorRepository.findAll();
        for (Professor p : existingProfs) {
            if (!userRepository.existsByEmail(p.getEmail())) {
                System.out.println("Auto-healing missing login account for Professor: " + p.getEmail());
                User user = new User();
                String baseUsername = (p.getFirstName() + "_" + p.getLastName()).toLowerCase().replaceAll("\\s+", "");
                String username = baseUsername;
                int count = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + count;
                    count++;
                }
                user.setUsername(username);
                user.setEmail(p.getEmail());
                user.setPassword(SecurityUtils.hashPassword("prof123")); // Default password
                user.setRole("PROFESSOR");
                userRepository.save(user);
            }
        }

        // Auto-heal: Ensure all existing students have a corresponding User login account
        List<Student> existingStudents = studentRepository.findAll();
        for (Student s : existingStudents) {
            if (!userRepository.existsByEmail(s.getEmail())) {
                System.out.println("Auto-healing missing login account for Student: " + s.getEmail());
                User user = new User();
                String baseUsername = (s.getFirstName() + "_" + s.getLastName()).toLowerCase().replaceAll("\\s+", "");
                String username = baseUsername;
                int count = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + count;
                    count++;
                }
                user.setUsername(username);
                user.setEmail(s.getEmail());
                user.setPassword(SecurityUtils.hashPassword("student123")); // Default password
                user.setRole("STUDENT");
                userRepository.save(user);
            }
        }

        // Skip seeding courses/students if they are already present
        if (studentRepository.count() > 0 || courseRepository.count() > 0) {
            return;
        }

        System.out.println("Initializing sample data for Student Management System...");

        // 1. Create Courses
        Course course1 = Course.builder()
                .courseCode("CS101")
                .title("Introduction to Computer Science")
                .description("Fundamental concepts of computer programming, structures, and algorithms.")
                .credits(4)
                .instructor("Dr. Alan Turing")
                .build();

        Course course2 = Course.builder()
                .courseCode("CS202")
                .title("Database Management Systems")
                .description("Relational database design, SQL querying, transaction management, and indexing.")
                .credits(3)
                .instructor("Dr. Edgar Codd")
                .build();

        Course course3 = Course.builder()
                .courseCode("CS303")
                .title("Web Development Fullstack")
                .description("Modern frontend technologies (React, HTML/CSS) and backend API designs.")
                .credits(4)
                .instructor("Prof. Tim Berners-Lee")
                .build();

        Course course4 = Course.builder()
                .courseCode("MATH201")
                .title("Linear Algebra & Calculus")
                .description("Vector spaces, matrices, eigenvalues, integration, and differentiation applications.")
                .credits(3)
                .instructor("Dr. Katherine Johnson")
                .build();

        courseRepository.saveAll(List.of(course1, course2, course3, course4));

        // 2. Create Students
        Student student1 = Student.builder()
                .firstName("Alice")
                .lastName("Smith")
                .email("alice.smith@university.edu")
                .phone("+1-555-0101")
                .dateOfBirth(LocalDate.of(2003, 5, 14))
                .department("Computer Science")
                .build();

        Student student2 = Student.builder()
                .firstName("Bob")
                .lastName("Johnson")
                .email("bob.johnson@university.edu")
                .phone("+1-555-0102")
                .dateOfBirth(LocalDate.of(2002, 11, 23))
                .department("Information Technology")
                .build();

        Student student3 = Student.builder()
                .firstName("Charlie")
                .lastName("Brown")
                .email("charlie.brown@university.edu")
                .phone("+1-555-0103")
                .dateOfBirth(LocalDate.of(2004, 2, 8))
                .department("Mathematics")
                .build();

        Student student4 = Student.builder()
                .firstName("Diana")
                .lastName("Prince")
                .email("diana.prince@university.edu")
                .phone("+1-555-0104")
                .dateOfBirth(LocalDate.of(2001, 8, 30))
                .department("Computer Science")
                .build();

        studentRepository.saveAll(List.of(student1, student2, student3, student4));

        // 3. Create Enrollments
        enrollmentRepository.save(Enrollment.builder()
                .student(student1)
                .course(course1)
                .enrollmentDate(LocalDate.now().minusMonths(3))
                .grade("A")
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .student(student1)
                .course(course2)
                .enrollmentDate(LocalDate.now().minusMonths(3))
                .grade("B+")
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .student(student2)
                .course(course2)
                .enrollmentDate(LocalDate.now().minusMonths(2))
                .grade("A-")
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .student(student2)
                .course(course3)
                .enrollmentDate(LocalDate.now().minusMonths(1))
                .grade("Pending")
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .student(student3)
                .course(course4)
                .enrollmentDate(LocalDate.now().minusMonths(3))
                .grade("A+")
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .student(student4)
                .course(course1)
                .enrollmentDate(LocalDate.now().minusMonths(2))
                .grade("A")
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .student(student4)
                .course(course3)
                .enrollmentDate(LocalDate.now().minusWeeks(2))
                .grade("Pending")
                .build());

        System.out.println("Sample database initialization completed successfully.");
    }
}
