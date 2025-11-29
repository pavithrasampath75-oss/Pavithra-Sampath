// Canvas setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    const maxWidth = container.clientWidth - 40;
    canvas.width = Math.min(1200, maxWidth);
    canvas.height = 600;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let currentColor = '#ffffff';
let brushSize = 5;
let brushType = 'round';
let isEraser = false;
let history = [];
let historyStep = -1;

// Save state for undo
function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    history.push(canvas.toDataURL());
    if (history.length > 50) {
        history.shift();
        historyStep--;
    }
}

// Initial state
saveState();

// Get elements
const colorPicker = document.getElementById('colorPicker');
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const brushTypeSelect = document.getElementById('brushType');
const clearBtn = document.getElementById('clearBtn');
const eraserBtn = document.getElementById('eraserBtn');
const fillBtn = document.getElementById('fillBtn');
const saveBtn = document.getElementById('saveBtn');
const undoBtn = document.getElementById('undoBtn');

// Event listeners
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    isEraser = false;
    eraserBtn.classList.remove('active');
});

brushSizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = brushSize;
});

brushTypeSelect.addEventListener('change', (e) => {
    brushType = e.target.value;
});

clearBtn.addEventListener('click', () => {
    if (confirm('Clear the entire canvas?')) {
        saveState();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.classList.toggle('active', isEraser);
});

fillBtn.addEventListener('click', () => {
    saveState();
    ctx.fillStyle = currentColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});

undoBtn.addEventListener('click', () => {
    if (historyStep > 0) {
        historyStep--;
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[historyStep];
    }
});

// Drawing functions
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function drawRound(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawSquare(x, y) {
    ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
}

function drawSpray(x, y) {
    const density = brushSize * 2;
    for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * brushSize;
        const offsetY = (Math.random() - 0.5) * brushSize;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (distance <= brushSize / 2) {
            ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
    }
}

function drawRainbow(x, y) {
    const hue = (Date.now() / 10) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    drawRound(x, y);
}

function draw(x, y) {
    if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = currentColor;
    }

    switch (brushType) {
        case 'round':
            drawRound(x, y);
            break;
        case 'square':
            drawSquare(x, y);
            break;
        case 'spray':
            drawSpray(x, y);
            break;
        case 'rainbow':
            drawRainbow(x, y);
            break;
    }
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    saveState();
    const pos = getMousePos(e);
    draw(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const pos = getMousePos(e);
        draw(pos.x, pos.y);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    saveState();
    const pos = getTouchPos(e);
    draw(pos.x, pos.y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        const pos = getTouchPos(e);
        draw(pos.x, pos.y);
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isDrawing = false;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                undoBtn.click();
                break;
            case 's':
                e.preventDefault();
                saveBtn.click();
                break;
        }
    }
    if (e.key === 'e') {
        eraserBtn.click();
    }
    if (e.key === 'c') {
        clearBtn.click();
    }
});

// Prevent context menu on canvas
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

