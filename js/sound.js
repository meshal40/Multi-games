// sound.js - Sound functionality for the chess game

document.addEventListener('DOMContentLoaded', function() {
    // Sound variables
    let moveSound = document.getElementById('move-sound');
    let captureSound = document.getElementById('capture-sound');
    let soundEnabled = true;
    
    // Set volumes
    if (moveSound) moveSound.volume = 0.3;
    if (captureSound) captureSound.volume = 0.4;
    
    // Load saved sound preference
    const savedSound = localStorage.getItem('gameHubSound');
    if (savedSound === 'off') {
        soundEnabled = false;
        const soundOff = document.getElementById('sound-off');
        const soundOn = document.getElementById('sound-on');
        if (soundOff) soundOff.classList.add('active');
        if (soundOn) soundOn.classList.remove('active');
    }
    
    // Add sound toggle event listeners
    const soundOnBtn = document.getElementById('sound-on');
    const soundOffBtn = document.getElementById('sound-off');
    
    if (soundOnBtn) {
        soundOnBtn.addEventListener('click', () => {
            soundEnabled = true;
            soundOnBtn.classList.add('active');
            if (soundOffBtn) soundOffBtn.classList.remove('active');
            localStorage.setItem('gameHubSound', 'on');
        });
    }
    
    if (soundOffBtn) {
        soundOffBtn.addEventListener('click', () => {
            soundEnabled = false;
            soundOffBtn.classList.add('active');
            if (soundOnBtn) soundOnBtn.classList.remove('active');
            localStorage.setItem('gameHubSound', 'off');
        });
    }
    
    // Function to play a sound
    window.playSound = function(soundId) {
        if (!soundEnabled) return;
        
        const soundElement = document.getElementById(soundId);
        if (soundElement) {
            try {
                soundElement.currentTime = 0;
                soundElement.play().catch(e => console.log("Sound error:", e));
            } catch (e) {
                console.log("Error playing sound:", e);
            }
        }
    };
    
    // Helper function to unlock audio on mobile
    function unlockAudio() {
        // Create and play a silent sound
        const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
        silentSound.play().catch(e => {});
        
        // Try to play all sounds at very low volume to unlock them
        const sounds = [moveSound, captureSound];
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
    
    // Unlock audio on first interaction
    document.addEventListener('click', unlockAudio, { once: true });
});