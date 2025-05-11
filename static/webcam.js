const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');
const ctx = canvas.getContext('2d');
const switchBtn = document.getElementById('switchCamera');

let currentFacingMode = 'environment'; // Start with back camera
let currentStream = null;

// Function to start the camera with the desired facing mode
async function startCamera(facingMode) {
    // Stop any existing stream
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: facingMode } }
        });
        video.srcObject = stream;
        currentStream = stream;
    } catch (err) {
        // Fallback: try without "exact" if error occurs (some browsers)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            video.srcObject = stream;
            currentStream = stream;
        } catch (e) {
            alert('Unable to access camera');
        }
    }
}

// Initial camera start
startCamera(currentFacingMode);

// Handle camera switching
switchBtn.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    startCamera(currentFacingMode);
});

// The rest of your code for capturing and sending frames
setInterval(() => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    fetch('/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
    })
        .then(res => res.json())
        .then(data => {
            output.src = data.image;
        });
}, 1000 / 5);

