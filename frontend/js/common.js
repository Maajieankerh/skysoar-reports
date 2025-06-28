const API_URL = 'http://localhost:3000/api';

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = page.id === pageId ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId.replace('-page', ''));
    });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('user-name').textContent = `${user.firstname} ${user.lastname}`;
    document.getElementById('user-role').textContent = user.role.replace('-', ' ').toUpperCase();
    document.getElementById('user-avatar').src = user.photo || 'https://via.placeholder.com/40x40';
}

document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.nav-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(`${link.dataset.page}-page`);
        });
    });

    document.getElementById('logout-btn').addEventListener('click', logout);
    loadUserInfo();
});

async function fetchData(endpoint) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).id}` }
    });
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
}

async function postData(endpoint, data) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).id}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to post data');
    return response.json();
}