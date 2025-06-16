const socket = io();
const qrcode = new QRCode(document.getElementById('qrcode'));
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

let sessionId = null;
let peers = new Map();
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let currentFilter = 'none';
let isFullscreen = false;
let focusedPeer = null;

// DOM Elements
const setupSection = document.getElementById('setup-section');
const sessionSection = document.getElementById('session-section');
const canvasContainer = document.getElementById('canvas-container');
const createSessionBtn = document.getElementById('create-session');
const captureBtn = document.getElementById('capture-btn');
const recordBtn = document.getElementById('record-btn');
const layoutSelect = document.getElementById('layout-select');
const peerCount = document.getElementById('peer-count');
const sessionIdSpan = document.getElementById('session-id');
const themeToggle = document.getElementById('theme-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const muteAllBtn = document.getElementById('mute-all-btn');
const unmuteAllBtn = document.getElementById('unmute-all-btn');
const shareBtn = document.getElementById('share-btn');
const filterButtons = document.querySelectorAll('.filter-button');

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

// Initialize canvas size
function initCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvas.width * (9/16);
}

// Create new session
createSessionBtn.addEventListener('click', () => {
    socket.emit('create-session');
});

// Handle session creation
socket.on('session-created', ({ sessionId: newSessionId }) => {
    sessionId = newSessionId;
    sessionIdSpan.textContent = sessionId;
    
    // Generate QR code
    const joinUrl = `${window.location.origin}/join/${sessionId}`;
    qrcode.makeCode(joinUrl);
    
    // Show session UI
    setupSection.classList.add('hidden');
    sessionSection.classList.remove('hidden');
    canvasContainer.classList.remove('hidden');
    
    initCanvas();
});

// Handle peer connections
socket.on('peer-joined', ({ peerId }) => {
    console.log('Peer joined:', peerId);
    peers.set(peerId, null);
    updatePeerCount();
});

socket.on('peer-left', ({ peerId }) => {
    console.log('Peer left:', peerId);
    peers.delete(peerId);
    if (focusedPeer === peerId) {
        focusedPeer = null;
    }
    updatePeerCount();
});

// Update peer count display
function updatePeerCount() {
    peerCount.textContent = peers.size;
}

// Handle WebRTC peer connections
const peerConnections = new Map();

function createPeerConnection(peerId) {
    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                peerId,
                candidate: event.candidate
            });
        }
    };

    pc.ontrack = (event) => {
        peers.set(peerId, event.streams[0]);
    };

    peerConnections.set(peerId, pc);
    return pc;
}

// Handle layout changes
layoutSelect.addEventListener('change', () => {
    renderCanvas();
});

// Apply filter to canvas
function applyFilter(ctx, filter) {
    switch (filter) {
        case 'grayscale':
            ctx.filter = 'grayscale(100%)';
            break;
        case 'sepia':
            ctx.filter = 'sepia(100%)';
            break;
        case 'invert':
            ctx.filter = 'invert(100%)';
            break;
        case 'blur':
            ctx.filter = 'blur(5px)';
            break;
        case 'vintage':
            ctx.filter = 'sepia(50%) contrast(120%) brightness(90%)';
            break;
        default:
            ctx.filter = 'none';
    }
}

// Handle filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderCanvas();
    });
});

// Render canvas with all video streams
function renderCanvas() {
    const layout = layoutSelect.value;
    const peerCount = peers.size;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (peerCount === 0) return;
    
    const streams = Array.from(peers.values()).filter(Boolean);
    const videoElements = streams.map(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        return video;
    });
    
    // Apply current filter
    applyFilter(ctx, currentFilter);
    
    // Layout logic based on selected mode
    switch (layout) {
        case 'grid':
            renderGridLayout(videoElements);
            break;
        case 'mosaic':
            renderMosaicLayout(videoElements);
            break;
        case 'dynamic':
            renderDynamicLayout(videoElements);
            break;
        case 'focus':
            renderFocusLayout(videoElements);
            break;
    }
    
    requestAnimationFrame(renderCanvas);
}

// Layout rendering functions
function renderGridLayout(videos) {
    const cols = Math.ceil(Math.sqrt(videos.length));
    const rows = Math.ceil(videos.length / cols);
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    videos.forEach((video, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.drawImage(video, 
            col * cellWidth, row * cellHeight,
            cellWidth, cellHeight
        );
    });
}

function renderMosaicLayout(videos) {
    const totalVideos = videos.length;
    if (totalVideos === 0) return;
    
    // Main video takes up 2/3 of the space
    const mainVideo = videos[0];
    ctx.drawImage(mainVideo, 0, 0, canvas.width * 0.67, canvas.height);
    
    // Remaining videos are arranged in a column
    const remainingVideos = videos.slice(1);
    const smallWidth = canvas.width * 0.33;
    const smallHeight = canvas.height / remainingVideos.length;
    
    remainingVideos.forEach((video, i) => {
        ctx.drawImage(video,
            canvas.width * 0.67, i * smallHeight,
            smallWidth, smallHeight
        );
    });
}

function renderDynamicLayout(videos) {
    // Implement dynamic layout with automatic arrangement
    // based on video content and movement
    renderGridLayout(videos);
}

function renderFocusLayout(videos) {
    if (focusedPeer) {
        const focusedVideo = videos.find(v => v.srcObject.id === focusedPeer);
        if (focusedVideo) {
            ctx.drawImage(focusedVideo, 0, 0, canvas.width, canvas.height);
        }
    } else {
        renderGridLayout(videos);
    }
}

// Fullscreen handling
fullscreenBtn.addEventListener('click', () => {
    if (!isFullscreen) {
        if (canvasContainer.requestFullscreen) {
            canvasContainer.requestFullscreen();
        } else if (canvasContainer.webkitRequestFullscreen) {
            canvasContainer.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});

document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    initCanvas();
});

// Audio controls
muteAllBtn.addEventListener('click', () => {
    Array.from(peers.values()).forEach(stream => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = false;
            });
        }
    });
});

unmuteAllBtn.addEventListener('click', () => {
    Array.from(peers.values()).forEach(stream => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = true;
            });
        }
    });
});

// Share session
shareBtn.addEventListener('click', async () => {
    const shareUrl = `${window.location.origin}/join/${sessionId}`;
    try {
        await navigator.share({
            title: 'Join my MomentMixer session',
            text: 'Join my live camera session on MomentMixer!',
            url: shareUrl
        });
    } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert('Session link copied to clipboard!');
    }
});

// Capture functionality
captureBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `momentmixer-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Recording functionality
recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    recordedChunks = [];
    const stream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `momentmixer-${Date.now()}.webm`;
        link.click();
    };
    
    mediaRecorder.start();
    isRecording = true;
    recordBtn.textContent = 'Stop Recording';
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.textContent = 'Record';
}

// Initialize
initTheme();
initCanvas();

// Handle window resize
window.addEventListener('resize', () => {
    initCanvas();
    renderCanvas();
}); 