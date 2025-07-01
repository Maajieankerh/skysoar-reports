async function loadData(endpoint) {
    const token = localStorage.getItem('token'); // Keep for auth if needed
    const response = await fetch(`/data/${endpoint}.json`);
    if (!response.ok) throw new Error(`Error loading ${endpoint}`);
    return await response.json();
}

async function loadDashboard() {
    try {
        const dashboardData = { message: 'Dashboard data', data: { status: 'active' } };
        const students = await loadData('students');
        const results = await loadData('results');
        const teachers = await loadData('teachers');
        const classes = await loadData('classes');

        document.getElementById('dashboard-content').innerHTML = JSON.stringify(dashboardData);
        document.getElementById('students-content').innerHTML = JSON.stringify(students);
        document.getElementById('results-content').innerHTML = JSON.stringify(results);
        document.getElementById('teachers-content').innerHTML = JSON.stringify(teachers);
        document.getElementById('classes-content').innerHTML = JSON.stringify(classes);
    } catch (error) {
        alert(error.message);
    }
}
loadDashboard();