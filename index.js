// ─── Particle System ───
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = 1 + Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = 0.15 + Math.random() * 0.3;
        this.hue = 240 + Math.random() * 60;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > W) this.speedX *= -1;
        if (this.y < 0 || this.y > H) this.speedY *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
        ctx.fill();
    }
}

const particles = Array.from({ length: 60 }, () => new Particle());

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(108, 92, 231, ${0.04 * (1 - dist / 130)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── Task Manager ───
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalSpan = document.getElementById('totalTasks');
const completedSpan = document.getElementById('completedTasks');

let tasks = [];
let currentFilter = 'all';

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const task = { id: Date.now(), text, completed: false };
    tasks.push(task);
    taskInput.value = '';
    taskInput.focus();
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        render();
    }
}

function render() {
    const filtered = tasks.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    totalSpan.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    completedSpan.textContent = `${done} done`;

    if (filtered.length === 0) {
        taskList.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">${tasks.length === 0 ? '✨' : '📋'}</div>
                <p>${tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No ${currentFilter} tasks'}</p>
            </li>`;
        return;
    }

    taskList.innerHTML = filtered.map(t => `
        <li data-id="${t.id}">
            <span class="task-name ${t.completed ? 'completed' : ''}">${escapeHtml(t.text)}</span>
            <button class="complete-btn ${t.completed ? 'done' : ''}">${t.completed ? 'Undo' : 'Complete'}</button>
            <button class="delete-btn">Delete</button>
        </li>
    `).join('');

    taskList.querySelectorAll('li:not(.empty-state)').forEach(li => {
        const id = parseInt(li.dataset.id);
        li.querySelector('.complete-btn').addEventListener('click', () => toggleTask(id));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(id));
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ─── Events ───
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

render();
