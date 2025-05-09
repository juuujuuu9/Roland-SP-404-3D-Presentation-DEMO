// Function to initialize the user interface
export function initUserInterface() {
    const lines = [
    "Bigger, better, faster, stronger.",
    "Guerilla beatmaking.",
    "A sampler with soul.",
    "Performance-tuned sequencing.",
    "Serato power.",
    "Customize it.",
    "Break beats. Not banks."
    ];
    
    const textElement = document.querySelector('.animated-text');
    let currentIndex = 0;
    const displayDuration = 3000; // How long each text stays visible
    const transitionDuration = 800; // Fade transition time
    
    function updateText() {
    // Fade out current text
    textElement.classList.remove('fade-in');
    textElement.classList.add('fade-out');
    
    setTimeout(() => {
        // Update text content
        textElement.textContent = lines[currentIndex];
        
        // Fade in new text
        textElement.classList.remove('fade-out');
        textElement.classList.add('fade-in');
        
        // Increment index and loop back to start if needed
        currentIndex = (currentIndex + 1) % lines.length;
        
        // Schedule the next update
        setTimeout(updateText, displayDuration);
    }, transitionDuration);
    }
    
    // Start the animation
    textElement.textContent = lines[0];
    textElement.classList.add('fade-in');
    setTimeout(() => {
    currentIndex = 1; // Start with second line next
    updateText();
    }, displayDuration);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initUserInterface); 