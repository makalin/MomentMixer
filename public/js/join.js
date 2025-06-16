const socket = io();
const localVideo = document.getElementById('local-video');
const startCameraBtn = document.getElementById('start-camera');
const joinSessionBtn = document.getElementById('join-session');
const setupSection = document.getElementById('setup-section');
const statusSection = document.getElementById('status-section');
const sessionIdSpan = document.getElementById('session-id');
const connectionStatus = document.getElementById('connection-status');
const themeToggle = document.getElementById('theme-toggle');
const muteBtn = document.getElementById('mute-btn');
const switchCameraBtn = document.getElementById('switch-camera-btn');
const leaveBtn = document.getElementById('leave-btn');
const filterButtons = document.querySelectorAll('.filter-button');

let localStream = null;
let peerConnection = null;
let currentFilter = 'none';
let isMuted = false;
let currentCameraIndex = 0;
let availableCameras = [];

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// Get session ID from URL
const sessionId = window.location.pathname.split('/').pop();

// Get available cameras
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        switchCameraBtn.disabled = availableCameras.length <= 1;
    } catch (error) {
        console.error('Error getting cameras:', error);
    }
}

// Start camera
startCameraBtn.addEventListener('click', async () => {
    try {
        const constraints = {
            video: {
                deviceId: availableCameras[currentCameraIndex]?.deviceId
            },
            audio: true
        };
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideo.srcObject = localStream;
        startCameraBtn.disabled = true;
        joinSessionBtn.disabled = false;
        
        // Apply current filter
        applyFilter(localVideo, currentFilter);
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please ensure you have granted camera permissions.');
    }
});

// Apply filter to video
function applyFilter(video, filter) {
    video.style.filter = filter === 'none' ? '' : filter;
}

// Handle filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        applyFilter(localVideo, currentFilter);
    });
});

// Switch camera
switchCameraBtn.addEventListener('click', async () => {
    if (availableCameras.length <= 1) return;
    
    currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
    const constraints = {
        video: {
            deviceId: availableCameras[currentCameraIndex].deviceId
        },
        audio: true
    };
    
    try {
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideo.srcObject = newStream;
        
        // Update peer connection with new stream
        if (peerConnection) {
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(sender => sender.track.kind === 'video');
            if (videoSender) {
                videoSender.replaceTrack(newStream.getVideoTracks()[0]);
            }
        }
        
        localStream = newStream;
        applyFilter(localVideo, currentFilter);
    } catch (error) {
        console.error('Error switching camera:', error);
    }
});

// Mute/unmute
muteBtn.addEventListener('click', () => {
    if (localStream) {
        isMuted = !isMuted;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
        });
        muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    }
});

// Leave session
leaveBtn.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    window.location.href = '/';
});

// Join session
joinSessionBtn.addEventListener('click', () => {
    if (!localStream) return;
    
    socket.emit('join-session', sessionId);
    setupSection.classList.add('hidden');
    statusSection.classList.remove('hidden');
    sessionIdSpan.textContent = sessionId;
    
    // Initialize WebRTC peer connection
    initializePeerConnection();
});

// Initialize WebRTC peer connection
function initializePeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                sessionId,
                candidate: event.candidate
            });
        }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        connectionStatus.textContent = peerConnection.connectionState;
    };

    // Create and send offer
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            socket.emit('offer', {
                sessionId,
                offer: peerConnection.localDescription
            });
        })
        .catch(error => {
            console.error('Error creating offer:', error);
            connectionStatus.textContent = 'Error creating connection';
        });
}

// Handle incoming answer
socket.on('answer', ({ answer }) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .catch(error => {
            console.error('Error setting remote description:', error);
            connectionStatus.textContent = 'Error establishing connection';
        });
});

// Handle incoming ICE candidates
socket.on('ice-candidate', ({ candidate }) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => {
            console.error('Error adding ICE candidate:', error);
        });
});

// Handle session end
socket.on('session-ended', () => {
    connectionStatus.textContent = 'Session ended';
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
});

// Handle disconnection
socket.on('disconnect', () => {
    connectionStatus.textContent = 'Disconnected';
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
});

// Initialize
initTheme();
getCameras(); 