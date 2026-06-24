# PalAcademy | Full-Stack Student Management System

A premium, modern full-stack web application designed to manage student registrations, course catalogs, and grade enrollments. Built with **Spring Boot** (Java REST APIs) on the backend and **React** (Vite + Modern Vanilla CSS) on the frontend. 

This project is fully structured for portfolio display, showcasing clean architecture, database-backed administrator authentication, relational database mapping (JPA), validation, and responsive dark-mode UX design.

---

## 🚀 Key Features

*   **Admin Authentication System**: Fully integrated Login and Account Registration pages for administrators. Passwords are encrypted on the backend using the SHA-256 cryptographic algorithm.
*   **Operational Session Persistence**: The frontend automatically retains sessions using `localStorage`, keeping the user logged in across page refreshes.
*   **Interactive Dashboard**: Real-time operational metrics including student count, class catalog sizes, dynamic department distribution bar charts, and recent enrollment activity.
*   **Student Directory**: Complete student registration management (CRUD) with fields for email, phone, DOB, and department. Includes client-side and server-side email validation.
*   **Course Catalog**: Interactive course cards showing instructor details and credit loads. Features an async overlay to view the **Class Roll / Roster** of enrolled students.
*   **Enrollment & Grading**: Student-course mapping dashboard featuring a transaction-safe registry and an **inline grade editor** (toggle from badge view to dropdown editor).
*   **Automatic Seeding**: The application automatically seeds realistic sample students, courses, grade histories, and a default **administrator account** on the first run, allowing immediate demonstration.

---

## 🛠️ Technology Stack

### Backend
*   **Java 17+**
*   **Spring Boot 3.3.0**
*   **Spring Data JPA** (Hibernate)
*   **SHA-256 Hashing** (For secure password storage)
*   **H2 Database** (In-memory, default for development)
*   **MySQL Connector** (Ready for production switch)
*   **Jakarta Validation** (API payload validation checks)
*   **Maven** (Dependency and build management)

### Frontend
*   **React 18**
*   **Vite** (Next-generation frontend tool)
*   **Lucide React** (Clean, modern vector icon set)
*   **Custom CSS Variables** (No-dependencies, highly optimized dark-theme UI)

---

## 📁 Project Structure

```text
student-management-system/
│
├── backend/                  # Spring Boot Maven Project
│   ├── pom.xml               # Maven Dependencies & Build Configuration
│   └── src/main/
│       ├── java/com/example/studentmanagement/
│       │   ├── StudentManagementApplication.java  # Main Class
│       │   ├── config/       # DataInitializer.java (Seeds Default Admin + Sample Data)
│       │   ├── controller/   # Student/Course/Enrollment/Auth REST Controllers
│       │   ├── exception/    # Custom exceptions & Global JSON error handler
│       │   ├── model/        # JPA Entities (Student, Course, Enrollment, User)
│       │   ├── repository/   # Repositories (Student, Course, Enrollment, User)
│       │   ├── service/      # Services (Student, Course, Enrollment, User)
│       │   └── util/         # SecurityUtils.java (SHA-256 Password Hashing)
│       └── resources/
│           └── application.properties # Server port, database properties
│
└── frontend/                 # React Vite Project
    ├── package.json          # Frontend packages (React 18, Lucide)
    ├── vite.config.js        # React plugin and Local API Proxy rules
    ├── index.html            # Imports Google Fonts (Inter)
    └── src/
        ├── main.jsx          # React DOM mounting
        ├── App.jsx           # Routing & Layout (Coordinates Auth & Navigation tabs)
        ├── index.css         # Modern glassmorphic Dark-theme stylesheet
        └── components/       # Login, Register, Dashboard, StudentList, CourseList, EnrollmentManager
```

---

## 🔧 Getting Started & How to Run

Follow these steps to run the complete system locally.

### Prerequisites
*   **Java Development Kit (JDK 17 or higher)**
*   **Apache Maven**
*   **Node.js & npm** (To run the React development server)

---

### Step 1: Run the Backend (Spring Boot)

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and start the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The server will start successfully on port **`8080`**.
4. **H2 Console**: You can view the in-memory database tables by visiting:
   *   URL: `http://localhost:8080/h2-console`
   *   JDBC URL: `jdbc:h2:mem:studentdb`
   *   Username: `sa`
   *   Password: `password`

---

### Step 2: Run the Frontend (React + Vite)

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the node package dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will start on port **`5173`**. Open your browser and navigate to:
   *   `http://localhost:5173`
   *   *Note: Vite config is set to proxy API calls from `/api/*` on port `5173` to `http://localhost:8080/api/*` automatically.*

---

## 🔑 Administrator Credentials

On the first boot, the system pre-seeds a default admin account for easy testing:
*   **Username**: `admin`
*   **Password**: `admin123`

You can also use the **Create account** link on the login screen to register new administrator credentials directly into the database.

---

## 🔄 Switching to MySQL Database (Production Ready)

If you wish to display this project using MySQL for your resume:

1. Create a MySQL database named `studentdb`.
2. Open `backend/src/main/resources/application.properties`.
3. Comment out the H2 Database section.
4. Uncomment and configure the MySQL section below:
   ```properties
   # Spring Data JPA Configuration (MySQL)
   spring.datasource.url=jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=UTC
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
   spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
   
   # Hibernates Properties
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```
5. Restart your backend application. Spring Boot will connect to MySQL and automatically create all tables (`students`, `courses`, `enrollments`, `users`).
