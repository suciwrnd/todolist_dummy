document.addEventListener('DOMContentLoaded', () => {
    // Cek Autentikasi
    const user = sessionStorage.getItem('questlog_user');

    if (user) {
        document.getElementById('playerUsername').innerText = user;
    }

    // Inisialisasi Modul
    if (typeof initGame === 'function') initGame();
    if (typeof initQuests === 'function') initQuests();

    // Render Widget Kalender
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

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    monthLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    // Dapatkan hari pertama bulan (0-6)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Dapatkan total hari dalam bulan
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    grid.innerHTML = '';

    // Slot kosong untuk offset hari pertama
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        grid.appendChild(emptyDiv);
    }

    // Hari-hari
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
