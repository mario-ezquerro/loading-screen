const socket = io();
const canvas = document.getElementById('stageCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bgMusic');
let circuitCanvas = document.createElement('canvas');

function renderCircuitBackground() {
    circuitCanvas.width = canvas.width;
    circuitCanvas.height = canvas.height;
    const cCtx = circuitCanvas.getContext('2d');
    
    // Deep blue background inspired by screem-01.jpg
    cCtx.fillStyle = '#0b1120';
    cCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    cCtx.lineWidth = 2;
    
    // Draw procedural circuit board traces
    for(let i=0; i<60; i++) {
        cCtx.strokeStyle = Math.random() > 0.2 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(74, 222, 128, 0.2)'; // Cyan or Green
        cCtx.beginPath();
        let x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
        let y = Math.floor(Math.random() * (canvas.height / 20)) * 20;
        cCtx.moveTo(x, y);
        
        // Random walks with 90-degree turns
        for(let j=0; j<3; j++) {
            if(Math.random() > 0.5) {
                x += (Math.random() > 0.5 ? 1 : -1) * (40 + Math.floor(Math.random()*4)*20);
            } else {
                y += (Math.random() > 0.5 ? 1 : -1) * (40 + Math.floor(Math.random()*4)*20);
            }
            cCtx.lineTo(x, y);
        }
        cCtx.stroke();
        
        // Draw a terminal node/dot at the end
        cCtx.fillStyle = cCtx.strokeStyle.replace('0.2', '0.6'); // brighter for nodes
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
}, function (error) {
    if (error) console.error('QR Gen Error:', error);
});

const splashScreen = document.getElementById('splashScreen');
if(splashScreen) {
    splashScreen.addEventListener('click', () => {
        if(bgMusic.paused) bgMusic.play();
        splashScreen.classList.add('fade-out');
        setTimeout(() => splashScreen.remove(), 1000);
    });
}

// --- DOOR / EXIT PORTAL LOGIC ---
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
        ctx.shadowBlur = 20 + Math.sin(this.time * 5) * 10;
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        
        // Door shape (Smaller as requested)
        ctx.beginPath();
        ctx.moveTo(-35, 50);
        ctx.lineTo(-35, -15);
        ctx.arc(0, -15, 35, Math.PI, 0);
        ctx.lineTo(35, 50);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Inner glowing effect
        ctx.fillStyle = `rgba(56, 189, 248, ${0.15 + Math.sin(this.time*8)*0.1})`;
        ctx.fill();
        
        // "I/O event" neon sign
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4ade80'; // Matrix/Hacker green
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText("I/O event", 0, -35);
        
        ctx.restore();
    }
};

// --- MUGGLE LOGIC ---
const muggles = [];

function createMuggleImage(type) {
    const off = document.createElement('canvas');
    off.width = 16;
    off.height = 16;
    const oCtx = off.getContext('2d');
    
    const skinColor = '#fca5a5';
    oCtx.fillStyle = skinColor;
    
    if (type === 'superman') {
        oCtx.fillRect(4, 2, 8, 5); // Head
        oCtx.fillStyle = '#000'; oCtx.fillRect(4, 1, 8, 2); // Hair
        oCtx.fillRect(5, 4, 1, 1); oCtx.fillRect(10, 4, 1, 1); // Eyes
        oCtx.fillStyle = '#2563eb'; oCtx.fillRect(3, 7, 10, 5); // Blue suit
        oCtx.fillStyle = '#facc15'; oCtx.fillRect(6, 8, 4, 3); // Chest logo
        oCtx.fillStyle = '#dc2626'; oCtx.fillRect(1, 7, 3, 7); oCtx.fillRect(12, 7, 3, 7); // Cape
        oCtx.fillStyle = '#2563eb'; oCtx.fillRect(4, 12, 3, 2); oCtx.fillRect(9, 12, 3, 2); // Legs
        oCtx.fillStyle = '#dc2626'; oCtx.fillRect(4, 14, 3, 2); oCtx.fillRect(9, 14, 3, 2); // Boots
    } else if (type === 'laptop') {
        oCtx.fillRect(4, 2, 8, 5); // Head
        oCtx.fillStyle = '#451a03'; oCtx.fillRect(4, 1, 8, 3); // Brown hair
        oCtx.fillStyle = '#000'; oCtx.fillRect(5, 4, 1, 1); oCtx.fillRect(10, 4, 1, 1); // Eyes
        oCtx.fillStyle = '#0d9488'; oCtx.fillRect(4, 7, 8, 5); // Teal shirt
        oCtx.fillStyle = '#475569'; oCtx.fillRect(4, 12, 3, 4); oCtx.fillRect(9, 12, 3, 4); // Pants
        oCtx.fillStyle = '#cbd5e1'; oCtx.fillRect(2, 9, 7, 4); // Laptop body
        oCtx.fillStyle = '#38bdf8'; oCtx.fillRect(3, 10, 5, 2); // Screen glow
    } else {
        oCtx.fillRect(4, 3, 8, 5); // Head
        oCtx.fillStyle = '#78350f'; oCtx.fillRect(4, 2, 8, 2); // Hair
        oCtx.fillStyle = '#000'; oCtx.fillRect(5, 5, 1, 1); oCtx.fillRect(10, 5, 1, 1); // Eyes
        oCtx.fillStyle = '#16a34a'; oCtx.fillRect(4, 8, 8, 4); // Green shirt
        oCtx.fillStyle = skinColor; oCtx.fillRect(2, 6, 2, 4); oCtx.fillRect(12, 6, 2, 4); // Arms
        oCtx.fillStyle = '#1e3a8a'; oCtx.fillRect(4, 12, 3, 4); oCtx.fillRect(9, 12, 3, 4); // Pants
        oCtx.fillStyle = '#94a3b8'; oCtx.fillRect(0, 3, 3, 2); oCtx.fillRect(13, 2, 3, 2); // Floating controllers
    }
    return off;
}

const muggleTypes = ['superman', 'laptop', 'juggler'];
const preRenderedMuggles = {
    'superman': createMuggleImage('superman'),
    'laptop': createMuggleImage('laptop'),
    'juggler': createMuggleImage('juggler')
};

class Muggle {
    constructor(id, message) {
        this.id = id;
        this.message = message;
        this.startX = (Math.random() * 1.2 - 0.1) * canvas.width;
        this.startY = canvas.height + 150; 
        
        this.progress = 0; 
        this.speed = 0.001 + Math.random() * 0.0015;
        this.type = muggleTypes[Math.floor(Math.random() * muggleTypes.length)];
        this.image = preRenderedMuggles[this.type];
    }

    update(doorX, doorY) {
        this.progress += this.speed;
        if(this.progress > 1) this.progress = 1;
        
        // Curve changed to keep them large for longer (staying near 1 until the end)
        this.scale = 1 - Math.pow(this.progress, 3.5);
        this.currentX = this.startX + (doorX - this.startX) * this.progress;
        this.currentY = this.startY + ((doorY + 40) - this.startY) * this.progress; 
    }

    draw() {
        if(this.progress >= 1) return;

        // Base size increased to make them "appear larger"
        const width = 200 * this.scale;
        const height = 200 * this.scale;
        
        ctx.save();
        ctx.translate(this.currentX, this.currentY);
        
        const walkBounce = Math.sin(Date.now() * 0.01 * this.speed * 1000) * (20 * this.scale);
        
        ctx.drawImage(this.image, -width/2, -height + walkBounce, width, height);
        
        if(this.scale > 0.1) { 
            ctx.fillStyle = `rgba(255, 255, 255, ${this.scale})`;
            ctx.font = `${14 * this.scale}px "Press Start 2P", monospace`;
            ctx.textAlign = 'center';
            
            const padding = 8 * this.scale;
            const textWidth = ctx.measureText(this.message).width;
            ctx.fillStyle = `rgba(15, 23, 42, ${this.scale * 0.9})`;
            ctx.beginPath();
            ctx.roundRect(-textWidth/2 - padding, -height - (40 * this.scale) + walkBounce - padding, textWidth + padding*2, (22 * this.scale) + padding*2, 8 * this.scale);
            ctx.fill();
            
            ctx.fillStyle = `rgba(248, 250, 252, ${this.scale})`;
            ctx.fillText(this.message, 0, -height - (22 * this.scale) + walkBounce);
        }
        
        ctx.restore();
    }
}

socket.on('muggle_spawned', (data) => {
    muggles.push(new Muggle(data.id, data.message));
});

function animate() {
    // Draw the static circuit board background
    ctx.drawImage(circuitCanvas, 0, 0);
    
    door.update();
    door.draw(ctx);
    
    ctx.imageSmoothingEnabled = false; 
    
    muggles.sort((a, b) => a.currentY - b.currentY);
    
    for (let i = muggles.length - 1; i >= 0; i--) {
        muggles[i].update(door.x, door.y);
        muggles[i].draw();
        
        if(muggles[i].progress >= 1) {
            muggles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

for(let i=0; i<15; i++) {
    muggles.push(new Muggle('npc', ['Wow!', '404', 'Caching...', 'Git push', 'Epic.'][Math.floor(Math.random()*5)]));
    muggles[i].progress = Math.random() * 0.8; 
}

animate();
