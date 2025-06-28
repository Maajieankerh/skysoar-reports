async function loadStudents() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const students = await fetchData(`students?class=${user.classAssigned}`);
        const classes = await fetchData('classes');
        const tableBody = document.querySelector('#students-table tbody');
        tableBody.innerHTML = students.map(student => `
            <tr>
                <td><img src="${student.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                <td>${student.firstname} ${student.lastname}</td>
                <td>${student.class}</td>
                <td>${student.regNo}</td>
                <td>${student.gender}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-student" data-id="${student.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-student" data-id="${student.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        const classSelect = document.getElementById('student-class');
        classSelect.innerHTML = '<option value="">Select Class</option>' + classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        document.getElementById('student-search').addEventListener('input', (e) => {
            const search = e.target.value.toLowerCase();
            tableBody.innerHTML = students
                .filter(student => `${student.firstname} ${student.lastname}`.toLowerCase().includes(search))
                .map(student => `
                    <tr>
                        <td><img src="${student.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                        <td>${student.firstname} ${student.lastname}</td>
                        <td>${student.class}</td>
                        <td>${student.regNo}</td>
                        <td>${student.gender}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-student" data-id="${student.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-student" data-id="${student.id}">Delete</button>
                        </td>
                    </tr>
                `).join('');
        });

        document.getElementById('save-student-btn').addEventListener('click', async () => {
            const studentData = {
                firstname: document.getElementById('student-firstname').value,
                lastname: document.getElementById('student-lastname').value,
                class: document.getElementById('student-class').value,
                gender: document.getElementById('student-gender').value,
                dob: document.getElementById('student-dob').value,
                address: document.getElementById('student-address').value,
                parent: document.getElementById('student-parent').value,
                phone: document.getElementById('student-phone').value,
                photo: document.getElementById('student-photo').files[0] ? URL.createObjectURL(document.getElementById('student-photo').files[0]) : ''
            };
            try {
                await postData('students', studentData);
                alert('Student added successfully');
                new bootstrap.Modal(document.getElementById('addStudentModal')).hide();
                loadStudents();
            } catch (error) {
                alert('Error adding student');
            }
        });
    } catch (error) {
        alert('Error loading students');
    }
}

async function loadResults() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const [results, subjects] = await Promise.all([
            fetchData(`results?class=${user.classAssigned}`),
            fetchData('subjects')
        ]);
        const tableBody = document.querySelector('#results-table tbody');
        tableBody.innerHTML = results.map(result => `
            <tr>
                <td>${result.studentName}</td>
                <td>${result.class}</td>
                <td>${result.subject}</td>
                <td>${result.ca}</td>
                <td>${result.exam}</td>
                <td>${result.total}</td>
                <td><span class="badge grade-${result.grade}">${result.grade}</span></td>
                <td>${result.term}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-result" data-id="${result.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-result" data-id="${result.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        const subjectSelect = document.getElementById('results-subject-filter');
        subjectSelect.innerHTML = '<option value="">All Subjects</option>' + subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        document.getElementById('results-term-filter').addEventListener('change', filterResults);
        document.getElementById('results-subject-filter').addEventListener('change', filterResults);

        async function filterResults() {
            const termFilter = document.getElementById('results-term-filter').value;
            const subjectFilter = document.getElementById('results-subject-filter').value;
            let filteredResults = results;
            if (termFilter) filteredResults = filteredResults.filter(r => r.term === termFilter);
            if (subjectFilter) filteredResults = filteredResults.filter(r => r.subject === subjectFilter);
            tableBody.innerHTML = filteredResults.map(result => `
                <tr>
                    <td>${result.studentName}</td>
                    <td>${result.class}</td>
                    <td>${result.subject}</td>
                    <td>${result.ca}</td>
                    <td>${result.exam}</td>
                    <td>${result.total}</td>
                    <td><span class="badge grade-${result.grade}">${result.grade}</span></td>
                    <td>${result.term}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-result" data-id="${result.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-result" data-id="${result.id}">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        const resultSubjectSelect = document.getElementById('result-subject');
        resultSubjectSelect.innerHTML = '<option value="">Select Subject</option>' + subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        const students = await fetchData(`students?class=${user.classAssigned}`);
        const resultsEntryTable = document.querySelector('#results-entry-table tbody');
        resultsEntryTable.innerHTML = students.map(student => `
            <tr>
                <td>${student.firstname} ${student.lastname}</td>
                <td><input type="number" class="form-control ca-score" data-id="${student.id}" max="30"></td>
                <td><input type="number" class="form-control exam-score" data-id="${student.id}" max="70"></td>
            </tr>
        `).join('');

        document.getElementById('save-results-btn').addEventListener('click', async () => {
            const subject = document.getElementById('result-subject').value;
            const term = document.getElementById('result-term').value;
            const session = document.getElementById('result-session').value;
            const results = Array.from(document.querySelectorAll('#results-entry-table tbody tr')).map(row => {
                const studentId = row.querySelector('.ca-score').dataset.id;
                return {
                    studentId,
                    subject,
                    term,
                    session,
                    ca: parseInt(row.querySelector('.ca-score').value) || 0,
                    exam: parseInt(row.querySelector('.exam-score').value) || 0
                };
            });
            try {
                await postData('results', results);
                alert('Results saved successfully');
                new bootstrap.Modal(document.getElementById('uploadResultsModal')).hide();
                loadResults();
            } catch (error) {
                alert('Error saving results');
            }
        });
    } catch (error) {
        alert('Error loading results');
    }
}

async function loadReports() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const reports = await fetchData(`reports?class=${user.classAssigned}`);
        const tableBody = document.querySelector('#reports-table tbody');
        tableBody.innerHTML = reports.map(report => `
            <tr>
                <td>${report.studentName}</td>
                <td>${report.class}</td>
                <td>${report.term}</td>
                <td>${report.average}</td>
                <td>${report.position}</td>
                <td>${report.status}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-report" data-id="${report.id}">View</button>
                    <button class="btn btn-sm btn-success download-report" data-id="${report.id}">Download</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('filter-reports-btn').addEventListener('click', async () => {
            const termFilter = document.getElementById('report-term-filter').value;
            let filteredReports = reports;
            if (termFilter) filteredReports = filteredReports.filter(r => r.term === termFilter);
            tableBody.innerHTML = filteredReports.map(report => `
                <tr>
                    <td>${report.studentName}</td>
                    <td>${report.class}</td>
                    <td>${report.term}</td>
                    <td>${report.average}</td>
                    <td>${report.position}</td>
                    <td>${report.status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-report" data-id="${report.id}">View</button>
                        <button class="btn btn-sm btn-success download-report" data-id="${report.id}">Download</button>
                    </td>
                </tr>
            `).join('');
        });
    } catch (error) {
        alert('Error loading reports');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showPage('students-page');
    loadStudents();
    loadResults();
    loadReports();

    document.getElementById('add-new-student-btn').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('addStudentModal')).show();
    });

    document.getElementById('upload-results-btn-page').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('uploadResultsModal')).show();
    });

    document.getElementById('generate-reports-btn-page').addEventListener('click', async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await postData('reports/generate', { class: user.classAssigned });
            alert('Reports generated successfully');
            loadReports();
        } catch (error) {
            alert('Error generating reports');
        }
    });
});