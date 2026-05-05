async function getUsers() {
    let textData = '';
    
    // Check if opened via file:// (CORS blocks fetch)
    if (window.location.protocol === 'file:') {
        console.warn("Running from local file system. Using fallback data instead of fetch.");
        textData = "admin,password123,0\nplayer,123,0";
    } else {
        try {
            // Fetch dummy data from TXT file
            const response = await fetch('users.txt');
            if (response.ok) {
                textData = await response.text();
            }
        } catch (error) {
            console.error("Error fetching users.txt:", error);
        }
    }

    // Parse TXT data
    let users = textData.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const parts = line.split(',');
            return { username: parts[0], password: parts[1], level: parseInt(parts[2] || 0) };
        });

    // Add local storage users (Frontend Murni Simulation)
    const customUsersData = localStorage.getItem('questlog_custom_users');
    if (customUsersData) {
        try {
            const customUsers = JSON.parse(customUsersData);
            users = users.concat(customUsers);
        } catch (e) {
            console.error("Error parsing local custom users:", e);
        }
    }

    return { users };
}

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('questlog_user');
    const isLoginOrRegister = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');

    // Jika belum login dan bukan di halaman login/register -> redirect ke register
    if (!isLoggedIn && !isLoginOrRegister) {
        window.location.href = 'register.html';
    }

    // Jika sudah login tapi buka login/register -> redirect ke index
    if (isLoggedIn && isLoginOrRegister) {
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
                const { users } = await getUsers();
                const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

                if (user) {
                    sessionStorage.setItem('questlog_user', user.username);
                    window.location.href = 'index.html';
                } else {
                    loginAlert.classList.remove('d-none');
                    loginAlert.classList.remove('alert-success');
                    loginAlert.classList.add('alert-danger');
                    loginAlert.textContent = "Invalid username or password!";
                }
            } catch (error) {
                console.error("Error during login:", error);
                loginAlert.classList.remove('d-none');
                loginAlert.textContent = "An error occurred during login.";
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    const registerAlert = document.getElementById('registerAlert');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('regUsername').value;
            const passwordInput = document.getElementById('regPassword').value;

            try {
                const { users } = await getUsers();
                
                // Check if username already exists
                const userExists = users.some(u => u.username === usernameInput);
                if (userExists) {
                    registerAlert.classList.remove('d-none');
                    registerAlert.classList.remove('alert-success');
                    registerAlert.classList.add('alert-danger');
                    registerAlert.textContent = "Username already exists! Choose another one.";
                    return;
                }

                // Append to custom users in localStorage
                let customUsers = [];
                const customUsersData = localStorage.getItem('questlog_custom_users');
                if (customUsersData) {
                    customUsers = JSON.parse(customUsersData);
                }
                customUsers.push({ username: usernameInput, password: passwordInput, level: 1 });
                localStorage.setItem('questlog_custom_users', JSON.stringify(customUsers));

                // Initialize their level 1 game state in localStorage
                let initialGameState = {
                    level: 1,
                    xp: 0,
                    hp: 100,
                    gold: 0,
                    bossHp: 500,
                    bossMaxHp: 500,
                    bossLevel: 1,
                    inventory: []
                };
                localStorage.setItem(`questlog_gamestate_${usernameInput}`, JSON.stringify(initialGameState));

                // Show success and redirect
                registerAlert.classList.remove('d-none');
                registerAlert.classList.remove('alert-danger');
                registerAlert.classList.add('alert-success');
                registerAlert.innerHTML = "Hero created successfully! Redirecting to login...";
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);

            } catch (error) {
                console.error("Error during registration:", error);
                registerAlert.classList.remove('d-none');
                registerAlert.classList.remove('alert-success');
                registerAlert.classList.add('alert-danger');
                registerAlert.textContent = "An error occurred during registration.";
            }
        });
    }
});

// Logout function
function logout() {
    sessionStorage.removeItem('questlog_user');
    window.location.href = 'login.html';
}
