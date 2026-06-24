package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.User;
import com.example.studentmanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Helper GET mapping for testing in browser (prevents static resource 404 errors)
    @GetMapping("/login")
    public ResponseEntity<String> getLoginPlaceholder() {
        return ResponseEntity.ok("PalAcademy Authentication login endpoint is active. Please send a POST request containing 'username' and 'password' to sign in.");
    }

    // Helper GET mapping for testing in browser (prevents static resource 404 errors)
    @GetMapping("/register")
    public ResponseEntity<String> getRegisterPlaceholder() {
        return ResponseEntity.ok("PalAcademy Authentication register endpoint is active. Please send a POST request with registration details to create an account.");
    }

    // Register Endpoint (POST)
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User registered = userService.registerUser(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("username", registered.getUsername());
            response.put("role", registered.getRole());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // Login Endpoint (POST)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Username and password are required.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        try {
            User authenticated = userService.authenticate(username, password);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("id", authenticated.getId());
            response.put("username", authenticated.getUsername());
            response.put("email", authenticated.getEmail());
            response.put("role", authenticated.getRole());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }
}
