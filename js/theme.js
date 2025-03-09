// theme.js - Fixed theme switching that works immediately on page load

// Immediate theme application - runs before DOM is fully loaded
(function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('gameHubTheme');
    
    // Apply saved theme immediately if it exists
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        // We'll update the button text later when DOM is loaded
    }
})();

// Setup event handlers after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get theme button
    const themeButton = document.getElementById('theme-button');
    
    // Check if there's a saved theme preference again
    const savedTheme = localStorage.getItem('gameHubTheme');
    
    // Update button text based on current theme
    if (savedTheme === 'light' || document.documentElement.classList.contains('light-theme')) {
        themeButton.textContent = 'Dark Mode';
    } else {
        themeButton.textContent = 'Light Mode';
    }
    
    // Add click event listener to toggle theme
    themeButton.addEventListener('click', () => {
        // Toggle light theme class
        document.documentElement.classList.toggle('light-theme');
        
        // Update button text
        const isLightTheme = document.documentElement.classList.contains('light-theme');
        themeButton.textContent = isLightTheme ? 'Dark Mode' : 'Light Mode';
        
        // Save preference to localStorage
        localStorage.setItem('gameHubTheme', isLightTheme ? 'light' : 'dark');
    });
});