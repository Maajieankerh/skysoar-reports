const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data');

async function readData(file) {
    const data = await fs.readFile(path.join(DATA_PATH, `${file}.json`), 'utf8');
    return JSON.parse(data);
}

async function writeData(file, data) {
    await fs.writeFile(path.join(DATA_PATH, `${file}.json`), JSON.stringify(data, null, 2));
}

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await readData('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ user });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

app.get('/api/students', async (req, res) => {
    const students = await readData('students');
    if (req.query.class) {
        res.json(students.filter(s => s.class === req.query.class));
    } else {
        res.json(students);
    }
});

app.post('/api/students', async (req, res) => {
    const students = await readData('students');
    const newStudent = { ...req.body, id: uuidv4(), regNo: `SIS${Math.floor(1000 + Math.random() * 9000)}` };
    students.push(newStudent);
    await writeData('students', students);
    res.json(newStudent);
});

app.get('/api/teachers', async (req, res) => {
    const teachers = await readData('teachers');
    res.json(teachers);
});

app.post('/api/teachers', async (req, res) => {
    const teachers = await readData('teachers');
    const newTeacher = { ...req.body, id: uuidv4() };
    teachers.push(newTeacher);
    await writeData('teachers', teachers);
    res.json(newTeacher);
});

app.get('/api/classes', async (req, res) => {
    const classes = await readData('classes');
    res.json(classes);
});

app.get('/api/subjects', async (req, res) => {
    const subjects = await readData('subjects');
    res.json(subjects);
});

app.get('/api/results', async (req, res) => {
    const results = await readData('results');
    if (req.query.class) {
        res.json(results.filter(r => r.class === req.query.class));
    } else {
        res.json(results);
    }
});

app.post('/api/results', async (req, res) => {
    const results = await readData('results');
    const gradingSystem = await readData('gradingSystem');
    const newResults = req.body.map(result => {
        const total = result.ca + result.exam;
        const grade = gradingSystem.find(g => total >= g.min && total <= g.max)?.grade || 'F';
        return { ...result, id: uuidv4(), total, grade };
    });
    results.push(...newResults);
    await writeData('results', results);
    res.json(newResults);
});

app.get('/api/reports', async (req, res) => {
    const reports = await readData('reports');
    if (req.query.class) {
        res.json(reports.filter(r => r.class === req.query.class));
    } else {
        res.json(reports);
    }
});

app.post('/api/reports/generate', async (req, res) => {
    const students = await readData('students');
    const results = await readData('results');
    const reports = [];
    
    for (const student of students.filter(s => !req.body.class || s.class === req.body.class)) {
        const studentResults = results.filter(r => r.studentId === student.id);
        const totalMarks = studentResults.reduce((sum, r) => sum + r.total, 0);
        const average = studentResults.length ? (totalMarks / studentResults.length).toFixed(2) : 0;
        const position = 1; // Simplified position calculation
        reports.push({
            id: uuidv4(),
            studentName: `${student.firstname} ${student.lastname}`,
            class: student.class,
            term: studentResults[0]?.term || '1',
            average,
            position,
            status: average >= 50 ? 'Pass' : 'Fail'
        });
    }
    
    await writeData('reports', reports);
    res.json(reports);
});

app.listen(3000, () => console.log('Server running on port 3000'));