// sounds.js - Shared sound functionality for games

// Sound variables
let moveSound, winSound, loseSound, drawSound;
let soundEnabled = true;

// Initialize sounds
function initSounds() {
    // Get sound elements
    moveSound = document.getElementById('move-sound');
    winSound = document.getElementById('win-sound');
    loseSound = document.getElementById('lose-sound');
    drawSound = document.getElementById('draw-sound');
    
    // Set volumes
    if (moveSound) moveSound.volume = 0.3;
    if (winSound) winSound.volume = 0.4;
    if (loseSound) loseSound.volume = 0.4;
    if (drawSound) drawSound.volume = 0.4;
    
    // Load saved sound preference
    const savedSound = localStorage.getItem('gameHubSound');
    if (savedSound === 'off') {
        soundEnabled = false;
        document.getElementById('sound-off').classList.add('active');
        document.getElementById('sound-on').classList.remove('active');
    }
    
    // Add sound toggle event listeners
    const soundOnBtn = document.getElementById('sound-on');
    const soundOffBtn = document.getElementById('sound-off');
    
    if (soundOnBtn) {
        soundOnBtn.addEventListener('click', () => {
            soundEnabled = true;
            soundOnBtn.classList.add('active');
            soundOffBtn.classList.remove('active');
            localStorage.setItem('gameHubSound', 'on');
        });
    }
    
    if (soundOffBtn) {
        soundOffBtn.addEventListener('click', () => {
            soundEnabled = false;
            soundOffBtn.classList.add('active');
            soundOnBtn.classList.remove('active');
            localStorage.setItem('gameHubSound', 'off');
        });
    }
    
    // Unlock audio on first interaction
    document.addEventListener('click', unlockAudio, { once: true });
}

// Function to play a sound
function playSound(soundElement) {
    if (!soundEnabled || !soundElement) return;
    
    try {
        soundElement.currentTime = 0;
        soundElement.play()
            .catch(error => {
                console.log("Error playing sound:", error);
            });
    } catch (e) {
        console.log("Error playing sound:", e);
    }
}

// Play specific sounds
function playMoveSound() {
    playSound(moveSound);
}

function playWinSound() {
    playSound(winSound);
}

function playLoseSound() {
    playSound(loseSound);
}

function playDrawSound() {
    playSound(drawSound);
}

// Helper function to unlock audio on mobile
function unlockAudio() {
    // Create and play a silent sound
    const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
    silentSound.play().catch(e => {});
    
    // Try to play all sounds at very low volume to unlock them
    const sounds = [moveSound, winSound, loseSound, drawSound];
    for (const sound of sounds) {
        if (sound) {
            const originalVolume = sound.volume;
            sound.volume = 0.01;
            sound.play().catch(e => {});
            sound.pause();
            sound.currentTime = 0;
            sound.volume = originalVolume;
        }
    }
}

// Initialize sounds on page load
document.addEventListener('DOMContentLoaded', initSounds);