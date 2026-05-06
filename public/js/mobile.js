const socket = io();

const setupSection = document.getElementById('setupSection');
const launchSection = document.getElementById('launchSection');
const muggleMessage = document.getElementById('muggleMessage');
const charCount = document.getElementById('charCount');
const readyBtn = document.getElementById('readyBtn');
const manualLaunchBtn = document.getElementById('manualLaunchBtn');

if(manualLaunchBtn) {
    manualLaunchBtn.addEventListener('click', () => {
        const message = muggleMessage.value.trim();
        if(message) launchMuggle(message);
    });
}

// Character counter and limit
muggleMessage.addEventListener('input', (e) => {
    let text = e.target.value;
    if(text.length > 25) {
        text = text.substring(0, 25);
        e.target.value = text;
    }
    charCount.textContent = text.length;
});

// CRITICAL: Request DeviceMotion permission via user click
readyBtn.addEventListener('click', async () => {
    const message = muggleMessage.value.trim();
    if(!message) {
        alert("Please enter a message for your Muggle!");
        return;
    }

    // iOS 13+ requires explicit permission to access sensors
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceMotionEvent.requestPermission();
            if (permissionState === 'granted') {
                setupShakeListener(message);
                showLaunchScreen();
            } else {
                alert("Permission to access device motion was denied. We need this to detect your shake!");
            }
        } catch (error) {
            console.error("Error requesting motion permission:", error);
            // Fallback for when served via HTTP (DeviceMotion API usually requires HTTPS)
            alert("Error requesting motion permission. (If you are developing locally via HTTP, you may need to use ngrok or HTTPS to test this feature on iOS). But we will enable a manual tap to launch for now!");
            setupManualLaunch(message);
        }
    } else {
        // Non-iOS 13+ devices (Android, older iOS) usually don't need explicit permission via API
        setupShakeListener(message);
        showLaunchScreen();
    }
});

function showLaunchScreen() {
    setupSection.classList.add('hidden');
    launchSection.classList.remove('hidden');
}

// Fallback for non-https local dev
function setupManualLaunch(message) {
    showLaunchScreen();
    launchSection.innerHTML = `
        <h2 class="pulse-text">Tap to Launch!</h2>
        <p>Your motion sensors are unavailable. Tap the screen to send your Muggle.</p>
    `;
    launchSection.addEventListener('click', () => {
        launchMuggle(message);
    }, { once: true });
}

function setupShakeListener(message) {
    let lastX = null, lastY = null, lastZ = null;
    const SHAKE_THRESHOLD = 15; // Tuning may be required

    const handleMotion = (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        if (lastX !== null) {
            const deltaX = Math.abs(lastX - acc.x);
            const deltaY = Math.abs(lastY - acc.y);
            const deltaZ = Math.abs(lastZ - acc.z);

            if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
                // Shake detected!
                launchMuggle(message);
                window.removeEventListener('devicemotion', handleMotion);
            }
        }

        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
    };

    window.addEventListener('devicemotion', handleMotion);
}

function launchMuggle(message) {
    // Send to backend via WebSocket
    socket.emit('launch_muggle', { message });
    
    // UI Feedback
    launchSection.innerHTML = `
        <h2 style="color: #4ade80;">🚀 Launched!</h2>
        <p>Look at the Stage View to see your Muggle marching.</p>
        <button class="btn-primary" style="margin-top: 24px;" onclick="location.reload()">Send Another</button>
    `;
    
    // Vibrate if supported
    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
