class GaugeMeter {
    constructor(elementId, options = {}) {
        this.container = document.getElementById(elementId);
        
        this.options = {
            startRange: 0,
            stopRange: 100,
            height: 200,
            width: 200,
            maxLevel: 100,
            smoothRate: 0.5,
            frameRate: 30,
            textRange: [
                { value: 0, label: '-20' },
                { value: 50, label: '0' },
                { value: 100, label: '+3' }
            ],
            colorSegments: [
                { value: 0, color: '#00ff00' },
                { value: 50, color: '#ffff00' },
                { value: 100, color: '#ff0000' }
            ],
            ...options
        };

        this.currentLevel = 0;
        this.targetLevel = 0;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.ctx = this.canvas.getContext('2d');
        
        this.container.appendChild(this.canvas);
        this.animate();
    }

    setLevel(level) {
        this.targetLevel = Math.max(0, Math.min(level, this.options.maxLevel));
    }

    getColorForLevel(level) {
        const segments = this.options.colorSegments;
        
        if (level <= segments[0].value) return segments[0].color;
        if (level >= segments[segments.length - 1].value) return segments[segments.length - 1].color;
        
        for (let i = 0; i < segments.length - 1; i++) {
            if (level >= segments[i].value && level <= segments[i + 1].value) {
                const ratio = (level - segments[i].value) / (segments[i + 1].value - segments[i].value);
                return this.interpolateColor(segments[i].color, segments[i + 1].color, ratio);
            }
        }
        return segments[0].color;
    }

    interpolateColor(color1, color2, ratio) {
        const r1 = parseInt(color1.substring(1,3), 16);
        const g1 = parseInt(color1.substring(3,5), 16);
        const b1 = parseInt(color1.substring(5,7), 16);
        
        const r2 = parseInt(color2.substring(1,3), 16);
        const g2 = parseInt(color2.substring(3,5), 16);
        const b2 = parseInt(color2.substring(5,7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.4;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw gauge background
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalAngle = endAngle - startAngle;
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = radius * 0.2;
        ctx.strokeStyle = '#333';
        ctx.stroke();
        
        // Draw level arc
        const levelAngle = startAngle + (this.currentLevel / this.options.maxLevel) * totalAngle;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, levelAngle);
        ctx.lineWidth = radius * 0.2;
        ctx.strokeStyle = this.getColorForLevel(this.currentLevel);
        ctx.stroke();
        
        // Draw labels
        ctx.font = `${radius * 0.15}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        this.options.textRange.forEach(range => {
            const angle = startAngle + (range.value / this.options.maxLevel) * totalAngle;
            const x = centerX + Math.cos(angle) * (radius * 1.3);
            const y = centerY + Math.sin(angle) * (radius * 1.3);
            ctx.fillStyle = '#000';
            ctx.fillText(range.label, x, y);
        });
        
        // Draw current value
        ctx.font = `${radius * 0.3}px Arial`;
        ctx.fillStyle = '#000';
        ctx.fillText(Math.round(this.currentLevel), centerX, centerY);
    }

    animate() {
        const delta = this.targetLevel - this.currentLevel;
        this.currentLevel += delta * this.options.smoothRate;
        
        this.draw();
        
        setTimeout(() => requestAnimationFrame(() => this.animate()), 1000 / this.options.frameRate);
    }
}

export default GaugeMeter;