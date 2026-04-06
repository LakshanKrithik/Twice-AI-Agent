import { RetellWebClient } from 'retell-client-js-sdk';

const retellWebClient = new RetellWebClient();
const orb = document.getElementById('orb');
const visualizer = document.getElementById('visualizer');
const statusText = document.getElementById('status-text');
const wrapper = document.getElementById('sphereWrapper');

const SERVER_URL = 'http://localhost:3000/api/create-web-call';

let isCallActive = false;
let isHovering = false;
let idleTimer;

// --- Retell Event Listeners ---

retellWebClient.on('call_started', () => {
    console.log('Call started');
    updateUIState('active');
    statusText.innerHTML = '<span class="highlight-success">Agent</span> is listening...';
});

retellWebClient.on('call_ended', () => {
    console.log('Call ended');
    updateUIState('idle');
    statusText.innerHTML = '<span class="highlight-success">Call</span> ended';
    setTimeout(() => {
        if (!isCallActive) {
            statusText.innerHTML = '<span class="highlight-success">Click</span> to start conversation';
        }
    }, 2000);
});

retellWebClient.on('error', (error) => {
    console.error('An error occurred:', error);
    updateUIState('idle');
    statusText.textContent = 'Error occurred';
    retellWebClient.stopCall();
});

retellWebClient.on('update', (update) => {
    // Optional: visualize audio volume or transcript here
});

// --- UI Interaction Logic ---

orb.addEventListener('click', toggleCall);

// Animation Logic (merged from user's script)
function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (!isHovering && !isCallActive) {
        idleTimer = setTimeout(() => {
            orb.style.animationDuration = "8s";
        }, 3000);
    }
}

orb.addEventListener('mouseenter', () => {
    isHovering = true;
    if (!isCallActive) orb.classList.add('active'); // Only add hover effect if not already active call
    clearTimeout(idleTimer);
});

orb.addEventListener('mouseleave', () => {
    isHovering = false;
    if (!isCallActive) orb.classList.remove('active');
    resetIdleTimer();
});

resetIdleTimer();
document.addEventListener('mousemove', resetIdleTimer);


// --- Core Functions ---

async function toggleCall() {
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    wrapper.appendChild(ripple);
    requestAnimationFrame(() => ripple.classList.add('animate'));
    setTimeout(() => ripple.remove(), 1000);

    if (isCallActive) {
        stopCall();
    } else {
        startCall();
    }
}

async function startCall() {
    statusText.textContent = 'Connecting...';
    // Disable interactions to prevent double clicks
    orb.style.pointerEvents = 'none';

    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error(`Server fetch failed: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data.access_token) {
            throw new Error('No access token received from backend');
        }

        await retellWebClient.startCall({
            accessToken: data.access_token,
        });
        isCallActive = true;

    } catch (error) {
        console.error('Failed to start call:', error);
        statusText.textContent = 'Connection failed';
        isCallActive = false;
    } finally {
        orb.style.pointerEvents = 'auto';
    }
}

function stopCall() {
    statusText.textContent = 'Disconnecting...';
    retellWebClient.stopCall();
    isCallActive = false;
}

function updateUIState(state) {
    if (state === 'active') {
        orb.classList.add('active');
        visualizer.classList.add('active');
    } else {
        orb.classList.remove('active');
        visualizer.classList.remove('active');
    }
}
