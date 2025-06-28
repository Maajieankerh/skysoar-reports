-- Creating the database
DROP DATABASE IF EXISTS skysoar_report_card;
CREATE DATABASE skysoar_report_card;
USE skysoar_report_card;

-- Creating users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'form-teacher') NOT NULL,
    classAssigned VARCHAR(10),
    photo VARCHAR(255)
) ENGINE=InnoDB;

-- Creating classes table
CREATE TABLE classes (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- Creating subjects table
CREATE TABLE subjects (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50)
) ENGINE=InnoDB;

-- Creating students table
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    class VARCHAR(10),
    regNo VARCHAR(10) UNIQUE NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    dob DATE,
    address TEXT,
    parent VARCHAR(100),
    phone VARCHAR(20),
    photo VARCHAR(255),
    FOREIGN KEY (class) REFERENCES classes(id)
) ENGINE=InnoDB;

-- Creating teachers table
CREATE TABLE teachers (
    id VARCHAR(36) PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    classAssigned VARCHAR(10),
    role ENUM('teacher', 'form-teacher') NOT NULL,
    photo VARCHAR(255),
    FOREIGN KEY (classAssigned) REFERENCES classes(id)
) ENGINE=InnoDB;

-- Creating results table
CREATE TABLE results (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL,
    studentName VARCHAR(100) NOT NULL,
    class VARCHAR(10) NOT NULL,
    subject VARCHAR(10) NOT NULL,
    ca INT NOT NULL,
    exam INT NOT NULL,
    total INT NOT NULL,
    grade VARCHAR(2) NOT NULL,
    term VARCHAR(10) NOT NULL,
    session VARCHAR(10) NOT NULL,
    FOREIGN KEY (studentId) REFERENCES students(id),
    FOREIGN KEY (class) REFERENCES classes(id),
    FOREIGN KEY (subject) REFERENCES subjects(id)
) ENGINE=InnoDB;

-- Creating reports table
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL,
    studentName VARCHAR(100) NOT NULL,
    class VARCHAR(10) NOT NULL,
    term VARCHAR(10) NOT NULL,
    average DECIMAL(5,2) NOT NULL,
    position INT NOT NULL,
    status ENUM('Pass', 'Fail') NOT NULL,
    FOREIGN KEY (studentId) REFERENCES students(id),
    FOREIGN KEY (class) REFERENCES classes(id)
) ENGINE=InnoDB;

-- Creating grading_system table
CREATE TABLE grading_system (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade VARCHAR(2) NOT NULL,
    min INT NOT NULL,
    max INT NOT NULL,
    remark VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- Inserting initial data
INSERT INTO users (id, firstname, lastname, email, password, role, classAssigned, photo) VALUES
('1', 'Admin', 'User', 'admin@skysoar.edu.ng', 'admin123', 'admin', NULL, 'https://via.placeholder.com/40x40'),
('2', 'Teacher', 'One', 'teacher1@skysoar.edu.ng', 'teacher123', 'teacher', 'JSS1', 'https://via.placeholder.com/40x40'),
('3', 'Form', 'Teacher', 'formteacher@skysoar.edu.ng', 'form123', 'form-teacher', 'JSS1', 'https://via.placeholder.com/40x40');

INSERT INTO classes (id, name) VALUES
('NUR1', 'Nursery 1'),
('NUR2', 'Nursery 2'),
('NUR3', 'Nursery 3'),
('PRI1', 'Primary 1'),
('PRI2', 'Primary 2'),
('PRI3', 'Primary 3'),
('JSS1', 'JSS1'),
('JSS2', 'JSS2'),
('JSS3', 'JSS3'),
('SS1', 'SS1'),
('SS2', 'SS2'),
('SS3', 'SS3');

INSERT INTO subjects (id, name, category) VALUES
('MATH', 'Mathematics', 'Core'),
('ENG', 'English Language', 'Core'),
('SCI', 'Basic Science', 'Core');

INSERT INTO teachers (id, firstname, lastname, email, classAssigned, role, photo) VALUES
('2', 'Teacher', 'One', 'teacher1@skysoar.edu.ng', 'JSS1', 'teacher', 'https://via.placeholder.com/40x40'),
('3', 'Form', 'Teacher', 'formteacher@skysoar.edu.ng', 'JSS1', 'form-teacher', 'https://via.placeholder.com/40x40');

INSERT INTO grading_system (grade, min, max, remark) VALUES
('A', 70, 100, 'Excellent'),
('B', 60, 69, 'Very Good'),
('C', 50, 59, 'Good'),
('D', 40, 49, 'Fair'),
('E', 30, 39, 'Poor'),
('F', 0, 29, 'Fail');