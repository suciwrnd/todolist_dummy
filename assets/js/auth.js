document.addEventListener('DOMContentLoaded', () => {
    // Redirect to index if already logged in
    if (sessionStorage.getItem('questlog_user') && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }

    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;

            try {
                let textData = '';
                
                // Cek apakah dibuka via file:// (CORS akan memblokir fetch)
                if (window.location.protocol === 'file:') {
                    console.warn("Running from local file system. Using fallback data instead of fetch.");
                    textData = "admin,password123\nplayer,123";
                } else {
                    // Fetch dummy data from TXT file
                    const response = await fetch('users.txt');
                    if (!response.ok) throw new Error("File not found");
                    textData = await response.text();
                }

                // Parse TXT data (format: username,password)
                const users = textData.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => {
                        const parts = line.split(',');
                        return { username: parts[0], password: parts[1] };
                    });

                // Validate
                const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

                if (user) {
                    sessionStorage.setItem('questlog_user', user.username);
                    window.location.href = 'index.html';
                } else {
                    loginAlert.classList.remove('d-none');
                    loginAlert.textContent = "Invalid username or password!";
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                loginAlert.textContent = "Error connecting to the realm database (users.txt). Make sure to use Live Server.";
                loginAlert.classList.remove('d-none');
            }
        });
    }
});

// Logout function
function logout() {
    sessionStorage.removeItem('questlog_user');
    window.location.href = 'login.html';
}
