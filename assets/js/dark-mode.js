
export const setupDarkModeToggle = () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const localStorageKey = 'mindxfarmAdminDarkMode';

    const savedMode = localStorage.getItem(localStorageKey);
    if (savedMode === 'dark') {
        body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; 
        }
    } else {
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; 
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem(localStorageKey, 'dark');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem(localStorageKey, 'light');
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }
};