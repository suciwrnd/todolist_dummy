document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = sessionStorage.getItem('questlog_user');
    if (!user && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    if (user) {
        document.getElementById('playerUsername').innerText = user;
    }

    // Initialize Modules
    if (typeof initGame === 'function') initGame();
    if (typeof initQuests === 'function') initQuests();

    // Render Calendar Widget
    renderSimpleCalendar();
});

function renderSimpleCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('calendarMonth');
    if (!grid || !monthLabel) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    monthLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    // Get first day of month (0-6)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Get total days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    grid.innerHTML = '';

    // Empty slots for start day offset
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        grid.appendChild(emptyDiv);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = i;
        
        if (i === currentDate) {
            dayDiv.classList.add('today');
        } else {
            dayDiv.classList.add('text-secondary');
        }
        
        grid.appendChild(dayDiv);
    }
}
