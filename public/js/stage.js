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

let baseMuggleCanvas = null;

const refImage = new Image();
refImage.src = '/images/muggle-01.jpg';
refImage.onload = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = refImage.width;
    tempCanvas.height = refImage.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(refImage, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;
    
    // Assume top-left pixel is background color
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    const threshold = 60; // Tolerance for background color
    
    let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
    
    for (let y = 0; y < tempCanvas.height; y++) {
        for (let x = 0; x < tempCanvas.width; x++) {
            const i = (y * tempCanvas.width + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            
            const dist = Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2));
            if (dist < threshold) {
                data[i+3] = 0; // Make transparent
            } else {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    // Crop it closely to remove empty space
    baseMuggleCanvas = document.createElement('canvas');
    baseMuggleCanvas.width = maxX - minX + 1;
    baseMuggleCanvas.height = maxY - minY + 1;
    const bCtx = baseMuggleCanvas.getContext('2d');
    bCtx.drawImage(tempCanvas, minX, minY, baseMuggleCanvas.width, baseMuggleCanvas.height, 0, 0, baseMuggleCanvas.width, baseMuggleCanvas.height);
};

function generateMuggleCanvas() {
    if (!baseMuggleCanvas) return null;
    
    const off = document.createElement('canvas');
    off.width = baseMuggleCanvas.width;
    off.height = baseMuggleCanvas.height;
    const ctx = off.getContext('2d');
    ctx.drawImage(baseMuggleCanvas, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, off.width, off.height);
    const data = imgData.data;
    
    // Random hue shift amount
    const hueShift = Math.random() * 360;
    
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if(max == min){ h = s = 0; } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s, l];
    }
    
    function hslToRgb(h, s, l) {
        let r, g, b;
        h /= 360;
        if(s == 0){ r = g = b = l; } else {
            let hue2rgb = function(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    for (let i = 0; i < data.length; i += 4) {
        if (data[i+3] > 0) { // If not transparent
            const r = data[i], g = data[i+1], b = data[i+2];
            let [h, s, l] = rgbToHsl(r, g, b);
            
            // Shift colors that are not skin tone (skin is usually hue 10-40, low saturation)
            // The original shirt is teal (hue ~180), pants are purple/blue (hue ~260)
            if (s > 0.1 && (h > 45 || h < 5)) {
                h = (h + hueShift) % 360;
                const [nr, ng, nb] = hslToRgb(h, s, l);
                data[i] = nr;
                data[i+1] = ng;
                data[i+2] = nb;
            }
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
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
        if(!this.image) {
            this.image = generateMuggleCanvas();
            if(!this.image) return; // Wait until loaded
        }

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
