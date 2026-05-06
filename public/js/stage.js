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

const jugglerTemplate = [
    "0000000000111110000000000000",
    "0000000011444441110000000000",
    "0000000144444444441000000000",
    "0000000144444444444100000000",
    "0000000155555555555100000000",
    "0000000111111111111100000000", 
    "0000000122222222222100000000",
    "0000000121122222112100000000", 
    "0000000112212221221100000000", 
    "0000000122222222222100000000",
    "0000000121111111112100000000", 
    "0000000121BBBBBBB12100000000", 
    "0000000121111111112100000000", 
    "0000000122222222222100000000", 
    "0000000113333333331100000000", 
    "0001110011111111111001110000", 
    "0112211166666667771112211000", 
    "1222222166666667771222222100", 
    "1111111166666667771111111100", 
    "0000000166666667771000000000", 
    "0000000166666667771000000000",
    "0000000166666667771000000000",
    "0000000166666667771000000000",
    "0000000166666667771000000000",
    "0000000111111111111000000000", 
    "0000000188888999991000000000", 
    "0000000188888199991000000000", 
    "0000000188881019991000000000",
    "0000000188881019991000000000",
    "0000000188881019991000000000",
    "0000001AAAAA101AAAAA10000000", 
    "0000001111111011111110000000"
];

const laptopTemplate = [
    "0000000000111110000000000000",
    "0000000011444441110000000000",
    "0000000144444444441000000000",
    "0000000144444444444100000000",
    "0000000155555555555100000000",
    "0000000111111111111100000000", 
    "0000000122222222222100000000",
    "0000000121122222112100000000", 
    "0000000112212221221100000000", 
    "0000000122222222222100000000",
    "0000000121111111112100000000", 
    "0000000121BBBBBBB12100000000", 
    "0000000121111111112100000000", 
    "0000000122222222222100000000", 
    "0000000113333333331100000000", 
    "0000000111111111111100000000", 
    "0000001221666666771221000000", 
    "0000012221666666771222100000", 
    "0000012221666666771222100000", 
    "0000001111111111111111000000", 
    "0000001888888888888881000000",
    "0000001888888888888881000000",
    "000011CCCCCCCCCCCCCCCC110000",
    "00001CCDDDDDDDDDDDDDDCC10000",
    "00001CCDDDDDDDDDDDDDDCC10000",
    "00001CCDDDDDDDDDDDDDDCC10000",
    "00001CCCCCCCCCCCCCCCCCC10000",
    "0000111111111111111111110000",
    "0000001888881018888810000000",
    "0000001888881018888810000000",
    "000001AAAAA10001AAAAA1000000", 
    "0000011111110001111111000000"
];

const supermanTemplate = [
    "0000000000111110000000000000",
    "0000000011444441110000000000",
    "0000000144444444441000000000",
    "0000000144444444444100000000",
    "0000000155555555555100000000",
    "0000000111111111111100000000", 
    "0000000122222222222100000000",
    "0000000121122222112100000000", 
    "0000000112212221221100000000", 
    "0000000122222222222100000000",
    "0000000121111111112100000000", 
    "0000000121BBBBBBB12100000000", 
    "0000000121111111112100000000", 
    "0000000122222222222100000000", 
    "0000000113333333331100000000", 
    "0000000111111111111100000000", 
    "0000011166666667771110000000", 
    "00011EE1666G6667771EE1100000", 
    "001EEEE166GGG667771EEEE10000", 
    "01EEEEE16GGGGG67771EEEEE1000", 
    "1EEEEEE166GGG667771EEEEEE100",
    "1EEEEEE1666G6667771EEEEEE100",
    "1EEEEEF166666667771FEEEEE100",
    "1EEEEEF166666667771FEEEEE100",
    "1EEEEEF111111111111FEEEEE100", 
    "1EEEEEF188888999991FEEEEE100", 
    "1EEEEEF188888199991FEEEEE100", 
    "01EEEEF188881019991FEEEE1000",
    "01EEEEF188881019991FEEEE1000",
    "001EEEF188881019991FEEE10000",
    "00011111AAAAA101AAAAA1110000", 
    "0000000111111101111111000000"
];

function generatePalette(isSuperman) {
    const shade = (c, p) => {
        let R = parseInt(c.substring(1,3),16), G = parseInt(c.substring(3,5),16), B = parseInt(c.substring(5,7),16);
        R = parseInt(R * (100 + p) / 100); G = parseInt(G * (100 + p) / 100); B = parseInt(B * (100 + p) / 100);
        R = R<255?R:255; G = G<255?G:255; B = B<255?B:255;
        let RR = (R.toString(16).length==1?"0"+R.toString(16):R.toString(16));
        let GG = (G.toString(16).length==1?"0"+G.toString(16):G.toString(16));
        let BB = (B.toString(16).length==1?"0"+B.toString(16):B.toString(16));
        return "#"+RR+GG+BB;
    };
    const hslToHex = (h, s, l) => {
        l /= 100; const a = s * Math.min(l, 1 - l) / 100;
        const f = n => { const k = (n + h / 30) % 12; const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * color).toString(16).padStart(2, '0'); };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    const skins = ['#fde0c4', '#f5c6a5', '#e1a980', '#c88661', '#975638', '#5c3624'];
    const skinBase = skins[Math.floor(Math.random() * skins.length)];
    const hairs = ['#fef08a', '#d97706', '#78350f', '#1c1917', '#dc2626', '#10b981', '#3b82f6'];
    const hairBase = isSuperman ? '#1c1917' : hairs[Math.floor(Math.random() * hairs.length)];
    const shirtBase = isSuperman ? '#2563eb' : hslToHex(Math.random()*360, 70+Math.random()*30, 50+Math.random()*20);
    const pantsBase = isSuperman ? '#2563eb' : hslToHex(Math.random()*360, 40+Math.random()*40, 30+Math.random()*20);
    const shoes = ['#ffffff', '#475569', '#1e293b', '#b91c1c'];
    const shoeBase = isSuperman ? '#dc2626' : shoes[Math.floor(Math.random() * shoes.length)];

    return {
        '0': null,
        '1': '#020617', '2': skinBase, '3': shade(skinBase, -20),
        '4': hairBase, '5': shade(hairBase, -30),
        '6': shirtBase, '7': shade(shirtBase, -30),
        '8': pantsBase, '9': shade(pantsBase, -40),
        'A': shoeBase, 'B': '#ffffff', 'C': '#94a3b8', 'D': '#38bdf8', 'E': '#dc2626', 'F': '#991b1b', 'G': '#facc15'
    };
}

function generateMuggleCanvas() {
    const templates = [jugglerTemplate, laptopTemplate, supermanTemplate];
    const tIndex = Math.floor(Math.random() * templates.length);
    const template = templates[tIndex];
    const palette = generatePalette(tIndex === 2);
    
    const cols = template[0].length;
    const rows = template.length;
    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const ctx = off.getContext('2d');
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const char = template[y][x];
            if (palette[char]) {
                ctx.fillStyle = palette[char];
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    if(tIndex === 0) { // Add juggling items
        ctx.fillStyle = palette['1']; ctx.fillRect(1, 2, 7, 5); // outline controller
        ctx.fillStyle = palette['C']; ctx.fillRect(2, 3, 5, 3); // body controller
        ctx.fillStyle = palette['D']; ctx.fillRect(3, 4, 1, 1); // dpad
        
        ctx.fillStyle = palette['1']; ctx.fillRect(20, 3, 6, 6); // outline git block
        ctx.fillStyle = '#dc2626'; ctx.fillRect(21, 4, 4, 4); // red block
        ctx.fillStyle = palette['B']; ctx.fillRect(22, 5, 2, 2); // white detail
    }
    return off;
}

class Muggle {
    constructor(id, message) {
        this.id = id;
        this.message = message;
        this.startX = (Math.random() * 1.2 - 0.1) * canvas.width;
        this.startY = canvas.height + 150; 
        
        this.progress = 0; 
        this.speed = 0.001 + Math.random() * 0.0015;
        this.image = generateMuggleCanvas();
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
