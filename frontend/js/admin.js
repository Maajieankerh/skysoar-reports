document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No authentication token found. Please log in again.');
        window.location.href = '/login.html';
        return;
    }

    // Fetch utility with token
    async function fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            if (!response.ok) throw new Error(await response.json().message || `Error loading ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Fetch error for ${endpoint}:`, error);
            alert(`Error loading ${endpoint}: ${error.message}`);
            return null;
        }
    }

    // Post utility with token
    async function postData(endpoint, data, options = {}) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(await response.json().message || `Error posting to ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Post error for ${endpoint}:`, error);
            alert(`Error posting to ${endpoint}: ${error.message}`);
            return null;
        }
    }

    // Page navigation function (assumed from context)
    function showPage(pageId) {
        document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
        document.getElementById(pageId).style.display = 'block';
    }

    // Load Dashboard
    async function loadDashboard() {
        try {
            const [students, teachers, classes, results] = await Promise.all([
                fetchData('students'),
                fetchData('teachers'),
                fetchData('classes'),
                fetchData('results')
            ]);
            document.getElementById('total-students').textContent = students ? students.length : 0;
            document.getElementById('total-teachers').textContent = teachers ? teachers.length : 0;
            document.getElementById('total-classes').textContent = classes ? classes.length : 0;
            document.getElementById('total-results').textContent = results ? results.length : 0;

            const recentStudentsTable = document.querySelector('#recent-students-table tbody');
            recentStudentsTable.innerHTML = (students || []).slice(0, 5).map(student => `
                <tr>
                    <td><img src="${student.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                    <td>${student.firstname || ''} ${student.lastname || ''}</td>
                    <td>${student.class || ''}</td>
                    <td>${student.regNo || ''}</td>
                    <td><button class="btn btn-sm btn-primary view-student" data-id="${student.id || ''}">View</button></td>
                </tr>
            `).join('');
        } catch (error) {
            alert('Error loading dashboard');
        }
    }

    // Load Students
    async function loadStudents() {
        try {
            const [students, classes] = await Promise.all([
                fetchData('students'),
                fetchData('classes')
            ]);
            const tableBody = document.querySelector('#students-table tbody');
            tableBody.innerHTML = (students || []).map(student => `
                <tr>
                    <td><img src="${student.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                    <td>${student.firstname || ''} ${student.lastname || ''}</td>
                    <td>${student.class || ''}</td>
                    <td>${student.regNo || ''}</td>
                    <td>${student.gender || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-student" data-id="${student.id || ''}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-student" data-id="${student.id || ''}">Delete</button>
                    </td>
                </tr>
            `).join('');

            const classSelect = document.getElementById('student-class');
            classSelect.innerHTML = '<option value="">Select Class</option>' + (classes || []).map(c => `<option value="${c.id || ''}">${c.name || ''}</option>`).join('');

            document.getElementById('student-search').addEventListener('input', (e) => {
                const search = e.target.value.toLowerCase();
                tableBody.innerHTML = (students || [])
                    .filter(student => `${student.firstname} ${student.lastname}`.toLowerCase().includes(search))
                    .map(student => `
                        <tr>
                            <td><img src="${student.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                            <td>${student.firstname || ''} ${student.lastname || ''}</td>
                            <td>${student.class || ''}</td>
                            <td>${student.regNo || ''}</td>
                            <td>${student.gender || ''}</td>
                            <td>
                                <button class="btn btn-sm btn-primary edit-student" data-id="${student.id || ''}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-student" data-id="${student.id || ''}">Delete</button>
                            </td>
                        </tr>
                    `).join('');
            });
        } catch (error) {
            alert('Error loading students');
        }
    }

    // Load Teachers
    async function loadTeachers() {
        try {
            const [teachers, classes] = await Promise.all([
                fetchData('teachers'),
                fetchData('classes')
            ]);
            const tableBody = document.querySelector('#teachers-table tbody');
            tableBody.innerHTML = (teachers || []).map(teacher => `
                <tr>
                    <td><img src="${teacher.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                    <td>${teacher.firstname || ''} ${teacher.lastname || ''}</td>
                    <td>${teacher.email || ''}</td>
                    <td>${teacher.classAssigned || ''}</td>
                    <td><span class="badge badge-role">${teacher.role || ''}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-teacher" data-id="${teacher.id || ''}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-teacher" data-id="${teacher.id || ''}">Delete</button>
                    </td>
                </tr>
            `).join('');

            const classSelect = document.getElementById('teacher-class');
            classSelect.innerHTML = '<option value="">Select Class</option>' + (classes || []).map(c => `<option value="${c.id || ''}">${c.name || ''}</option>`).join('');

            document.getElementById('teacher-search').addEventListener('input', (e) => {
                const search = e.target.value.toLowerCase();
                tableBody.innerHTML = (teachers || [])
                    .filter(teacher => `${teacher.firstname} ${teacher.lastname}`.toLowerCase().includes(search))
                    .map(teacher => `
                        <tr>
                            <td><img src="${teacher.photo || 'https://via.placeholder.com/40x40'}" class="avatar"></td>
                            <td>${teacher.firstname || ''} ${teacher.lastname || ''}</td>
                            <td>${teacher.email || ''}</td>
                            <td>${teacher.classAssigned || ''}</td>
                            <td><span class="badge badge-role">${teacher.role || ''}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary edit-teacher" data-id="${teacher.id || ''}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-teacher" data-id="${teacher.id || ''}">Delete</button>
                            </td>
                        </tr>
                    `).join('');
            });
        } catch (error) {
            alert('Error loading teachers');
        }
    }

    // Load Results
    async function loadResults() {
        try {
            const [results, classes, subjects] = await Promise.all([
                fetchData('results'),
                fetchData('classes'),
                fetchData('subjects')
            ]);
            const tableBody = document.querySelector('#results-table tbody');
            tableBody.innerHTML = (results || []).map(result => `
                <tr>
                    <td>${result.studentName || ''}</td>
                    <td>${result.class || ''}</td>
                    <td>${result.subject || ''}</td>
                    <td>${result.ca || ''}</td>
                    <td>${result.exam || ''}</td>
                    <td>${(result.ca || 0) + (result.exam || 0)}</td>
                    <td><span class="badge grade-${result.grade || ''}">${result.grade || ''}</span></td>
                    <td>${result.term || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-result" data-id="${result.id || ''}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-result" data-id="${result.id || ''}">Delete</button>
                    </td>
                </tr>
            `).join('');

            const classSelect = document.getElementById('results-class-filter');
            classSelect.innerHTML = '<option value="">All Classes</option>' + (classes || []).map(c => `<option value="${c.id || ''}">${c.name || ''}</option>`).join('');
            const subjectSelect = document.getElementById('results-subject-filter');
            subjectSelect.innerHTML = '<option value="">All Subjects</option>' + (subjects || []).map(s => `<option value="${s.id || ''}">${s.name || ''}</option>`).join('');

            document.getElementById('results-class-filter').addEventListener('change', filterResults);
            document.getElementById('results-term-filter').addEventListener('change', filterResults);
            document.getElementById('results-subject-filter').addEventListener('change', filterResults);

            async function filterResults() {
                const classFilter = document.getElementById('results-class-filter').value;
                const termFilter = document.getElementById('results-term-filter').value;
                const subjectFilter = document.getElementById('results-subject-filter').value;
                let filteredResults = results || [];
                if (classFilter) filteredResults = filteredResults.filter(r => r.class === classFilter);
                if (termFilter) filteredResults = filteredResults.filter(r => r.term === termFilter);
                if (subjectFilter) filteredResults = filteredResults.filter(r => r.subject === subjectFilter);
                tableBody.innerHTML = filteredResults.map(result => `
                    <tr>
                        <td>${result.studentName || ''}</td>
                        <td>${result.class || ''}</td>
                        <td>${result.subject || ''}</td>
                        <td>${result.ca || ''}</td>
                        <td>${result.exam || ''}</td>
                        <td>${(result.ca || 0) + (result.exam || 0)}</td>
                        <td><span class="badge grade-${result.grade || ''}">${result.grade || ''}</span></td>
                        <td>${result.term || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-result" data-id="${result.id || ''}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-result" data-id="${result.id || ''}">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            alert('Error loading results');
        }
    }

    // Load Reports
    async function loadReports() {
        try {
            const [reports, classes] = await Promise.all([
                fetchData('reports'),
                fetchData('classes')
            ]);
            const tableBody = document.querySelector('#reports-table tbody');
            tableBody.innerHTML = (reports || []).map(report => `
                <tr>
                    <td>${report.studentName || ''}</td>
                    <td>${report.class || ''}</td>
                    <td>${report.term || ''}</td>
                    <td>${report.average || ''}</td>
                    <td>${report.position || ''}</td>
                    <td>${report.status || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-report" data-id="${report.id || ''}">View</button>
                        <button class="btn btn-sm btn-success download-report" data-id="${report.id || ''}">Download</button>
                    </td>
                </tr>
            `).join('');

            const classSelect = document.getElementById('report-class-filter');
            classSelect.innerHTML = '<option value="">Select Class</option>' + (classes || []).map(c => `<option value="${c.id || ''}">${c.name || ''}</option>`).join('');

            document.getElementById('filter-reports-btn').addEventListener('click', () => {
                const classFilter = document.getElementById('report-class-filter').value;
                const termFilter = document.getElementById('report-term-filter').value;
                let filteredReports = reports || [];
                if (classFilter) filteredReports = filteredReports.filter(r => r.class === classFilter);
                if (termFilter) filteredReports = filteredReports.filter(r => r.term === termFilter);
                tableBody.innerHTML = filteredReports.map(report => `
                    <tr>
                        <td>${report.studentName || ''}</td>
                        <td>${report.class || ''}</td>
                        <td>${report.term || ''}</td>
                        <td>${report.average || ''}</td>
                        <td>${report.position || ''}</td>
                        <td>${report.status || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-primary view-report" data-id="${report.id || ''}">View</button>
                            <button class="btn btn-sm btn-success download-report" data-id="${report.id || ''}">Download</button>
                        </td>
                    </tr>
                `).join('');
            });
        } catch (error) {
            alert('Error loading reports');
        }
    }

    // Event Listeners
    document.getElementById('add-new-student-btn').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('addStudentModal')).show();
    });

    document.getElementById('add-new-teacher-btn').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('addTeacherModal')).show();
    });

    document.getElementById('upload-results-btn-page').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('uploadResultsModal')).show();
    });

    document.getElementById('generate-reports-btn-page').addEventListener('click', async () => {
        try {
            await postData('reports/generate', {});
            alert('Reports generated successfully');
            loadReports();
        } catch (error) {
            alert('Error generating reports');
        }
    });

    // Initial load
    showPage('dashboard-page');
    loadDashboard();
    loadStudents();
    loadTeachers();
    loadResults();
    loadReports();
});