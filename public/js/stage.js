const socket = io();
const canvas = document.getElementById('stageCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bgMusic');
let circuitCanvas = document.createElement('canvas');

function renderCircuitBackground() {
    circuitCanvas.width = canvas.width;
    circuitCanvas.height = canvas.height;
    const cCtx = circuitCanvas.getContext('2d');
    
    cCtx.fillStyle = '#0b1120';
    cCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    cCtx.lineWidth = 2;
    for(let i=0; i<60; i++) {
        cCtx.strokeStyle = Math.random() > 0.2 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(74, 222, 128, 0.15)'; 
        cCtx.beginPath();
        let x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
        let y = Math.floor(Math.random() * (canvas.height / 20)) * 20;
        cCtx.moveTo(x, y);
        for(let j=0; j<3; j++) {
            if(Math.random() > 0.5) {
                x += (Math.random() > 0.5 ? 1 : -1) * (40 + Math.floor(Math.random()*4)*20);
            } else {
                y += (Math.random() > 0.5 ? 1 : -1) * (40 + Math.floor(Math.random()*4)*20);
            }
            cCtx.lineTo(x, y);
        }
        cCtx.stroke();
        cCtx.fillStyle = cCtx.strokeStyle.replace('0.15', '0.5'); 
        cCtx.beginPath();
        cCtx.arc(x, y, 3, 0, Math.PI*2);
        cCtx.fill();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderCircuitBackground();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const mobileUrl = `${window.location.protocol}//${window.location.host}/mobile.html`;
QRCode.toCanvas(document.getElementById('qrCode'), mobileUrl, {
    width: 180,
    margin: 2,
    color: { dark: '#0b1120', light: '#ffffff' }
}, (error) => { if (error) console.error('QR Error:', error); });

const splashScreen = document.getElementById('splashScreen');
if(splashScreen) {
    splashScreen.addEventListener('click', () => {
        if(bgMusic.paused) bgMusic.play();
        splashScreen.classList.add('fade-out');
        setTimeout(() => splashScreen.remove(), 1000);
    });
}

const door = {
    x: canvas.width / 2,
    y: canvas.height * 0.4,
    time: 0,
    update: function() {
        this.time += 0.01;
        this.x = canvas.width / 2 + Math.sin(this.time * 0.7) * (canvas.width * 0.35);
        this.y = canvas.height * 0.35 + Math.sin(this.time * 1.3) * (canvas.height * 0.15);
    },
    draw: function(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-35, 50);
        ctx.lineTo(-35, -15);
        ctx.arc(0, -15, 35, Math.PI, 0);
        ctx.lineTo(35, 50);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgba(56, 189, 248, ${0.15 + Math.sin(this.time*8)*0.1})`;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#4ade80'; 
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText("I/O event", 0, -35);
        ctx.restore();
    }
};

const muggles = [];

// Modular Procedural Muggle Generator inspired by muggle-01.jpg
function createMuggleImage() {
    const off = document.createElement('canvas');
    off.width = 16;
    off.height = 16;
    const oCtx = off.getContext('2d');
    
    // Random Visual Traits
    const skinColor = '#fca5a5';
    const shirtHue = Math.floor(Math.random() * 360);
    const shirtColor = `hsl(${shirtHue}, 60%, 50%)`;
    const pantsColor = `hsl(${(shirtHue + 160) % 360}, 40%, 30%)`;
    const hairColor = ['#451a03', '#78350f', '#000', '#facc15', '#ef4444'][Math.floor(Math.random()*5)];
    const hairStyle = Math.floor(Math.random() * 4);
    const accessoryType = Math.floor(Math.random() * 5); // 0:None, 1:Cape, 2:Items, 3:Laptop, 4:Glasses

    // 1. Draw Accessory Back (like Cape)
    if(accessoryType === 1) {
        oCtx.fillStyle = '#dc2626';
        oCtx.fillRect(2, 8, 2, 7); oCtx.fillRect(12, 8, 2, 7); oCtx.fillRect(3, 7, 10, 2);
    }

    // 2. Draw Outline Helper (Simple 1px expansion)
    const drawPixel = (x, y, w, h, color) => {
        oCtx.fillStyle = '#000'; // Black outline
        oCtx.fillRect(x-1, y-1, w+2, h+2);
        oCtx.fillStyle = color;
        oCtx.fillRect(x, y, w, h);
    };

    // 3. Draw Body Parts
    // Legs
    oCtx.fillStyle = '#000'; oCtx.fillRect(3, 12, 4, 4); oCtx.fillRect(9, 12, 4, 4); // Outlines
    oCtx.fillStyle = pantsColor; oCtx.fillRect(4, 13, 3, 3); oCtx.fillRect(10, 13, 3, 3);

    // Torso/Shirt
    oCtx.fillStyle = '#000'; oCtx.fillRect(2, 7, 12, 6);
    oCtx.fillStyle = shirtColor; oCtx.fillRect(3, 8, 10, 5);

    // Head
    oCtx.fillStyle = '#000'; oCtx.fillRect(3, 2, 10, 7);
    oCtx.fillStyle = skinColor; oCtx.fillRect(4, 3, 8, 5);

    // 4. Face Features (The Big Smile from muggle-01.jpg)
    oCtx.fillStyle = '#000';
    oCtx.fillRect(5, 5, 1, 1); oCtx.fillRect(10, 5, 1, 1); // Eyes
    oCtx.fillRect(6, 7, 4, 1); // Mouth line
    oCtx.fillStyle = '#fff';
    oCtx.fillRect(6, 7, 4, 1); // Teeth

    // 5. Hair Styles
    oCtx.fillStyle = hairColor;
    if(hairStyle === 0) { // Spiky (like reference)
        oCtx.fillRect(4, 1, 8, 3); oCtx.fillRect(5, 0, 2, 1); oCtx.fillRect(9, 0, 2, 1);
    } else if(hairStyle === 1) { // Flat/Bowl
        oCtx.fillRect(3, 2, 10, 2);
    } else if(hairStyle === 2) { // Long/Side
        oCtx.fillRect(4, 2, 8, 2); oCtx.fillRect(3, 3, 2, 5); oCtx.fillRect(11, 3, 2, 5);
    } else { // Mohawk/Center
        oCtx.fillRect(7, 0, 2, 5);
    }

    // 6. Accessory Front
    if(accessoryType === 2) { // Juggler (Controller + Coffee)
        oCtx.fillStyle = '#94a3b8'; oCtx.fillRect(1, 4, 3, 2); // Controller
        oCtx.fillStyle = '#fff'; oCtx.fillRect(12, 4, 3, 2); // Coffee
    } else if(accessoryType === 3) { // Laptop
        oCtx.fillStyle = '#cbd5e1'; oCtx.fillRect(3, 9, 6, 3);
        oCtx.fillStyle = '#38bdf8'; oCtx.fillRect(4, 10, 4, 1);
    } else if(accessoryType === 4) { // Sunglasses
        oCtx.fillStyle = '#000'; oCtx.fillRect(4, 5, 8, 1);
    }

    return off;
}

class Muggle {
    constructor(id, message) {
        this.id = id;
        this.message = message;
        this.startX = (Math.random() * 1.2 - 0.1) * canvas.width;
        this.startY = canvas.height + 200; 
        this.progress = 0; 
        this.speed = 0.0008 + Math.random() * 0.0012;
        this.image = createMuggleImage();
    }

    update(doorX, doorY) {
        this.progress += this.speed;
        if(this.progress > 1) this.progress = 1;
        this.scale = 1 - Math.pow(this.progress, 3.5);
        this.currentX = this.startX + (doorX - this.startX) * this.progress;
        this.currentY = this.startY + ((doorY + 40) - this.startY) * this.progress; 
    }

    draw() {
        if(this.progress >= 1) return;
        const width = 200 * this.scale;
        const height = 200 * this.scale;
        ctx.save();
        ctx.translate(this.currentX, this.currentY);
        const walkBounce = Math.sin(Date.now() * 0.008 * 10) * (20 * this.scale);
        ctx.drawImage(this.image, -width/2, -height + walkBounce, width, height);
        if(this.scale > 0.1) { 
            ctx.fillStyle = `rgba(255, 255, 255, ${this.scale})`;
            ctx.font = `${14 * this.scale}px "Press Start 2P", monospace`;
            ctx.textAlign = 'center';
            const padding = 10 * this.scale;
            const textWidth = ctx.measureText(this.message).width;
            ctx.fillStyle = `rgba(15, 23, 42, ${this.scale * 0.9})`;
            ctx.beginPath();
            ctx.roundRect(-textWidth/2 - padding, -height - (45 * this.scale) + walkBounce - padding, textWidth + padding*2, (24 * this.scale) + padding*2, 8 * this.scale);
            ctx.fill();
            ctx.fillStyle = `rgba(248, 250, 252, ${this.scale})`;
            ctx.fillText(this.message, 0, -height - (25 * this.scale) + walkBounce);
        }
        ctx.restore();
    }
}

socket.on('muggle_spawned', (data) => { muggles.push(new Muggle(data.id, data.message)); });

function animate() {
    ctx.drawImage(circuitCanvas, 0, 0);
    door.update(); door.draw(ctx);
    ctx.imageSmoothingEnabled = false; 
    muggles.sort((a, b) => a.currentY - b.currentY);
    for (let i = muggles.length - 1; i >= 0; i--) {
        muggles[i].update(door.x, door.y); muggles[i].draw();
        if(muggles[i].progress >= 1) muggles.splice(i, 1);
    }
    requestAnimationFrame(animate);
}

for(let i=0; i<15; i++) {
    muggles.push(new Muggle('npc', ['Welcome!', '99%', 'Ready?', 'I/O', 'Fun!'][Math.floor(Math.random()*5)]));
    muggles[i].progress = Math.random() * 0.8; 
}
animate();
