class PeakMeterGauge {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        this.options = {
            startRange: options.startRange || 0,
            stopRange: options.stopRange || 100,
            height: options.height || 200,
            width: options.width || 400,
            maxLevel: options.maxLevel || 100,
            smoothRate: options.smoothRate || 0.5,
            frameRate: options.frameRate || 30,
            textRange: options.textRange || [
                { value: 0, label: '-20' },
                { value: 50, label: '0' },
                { value: 100, label: '+3' }
            ],
            colorSegments: options.colorSegments || [
                { value: 0, color: '#00ff00' },
                { value: 50, color: '#ffff00' },
                { value: 100, color: '#ff0000' }
            ]
        };

        this.currentValue = 0;
        this.targetValue = 0;
        
        this.init();
    }

    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.element.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Start animation loop
        this.animate();
    }

    setValue(value) {
        this.targetValue = Math.max(this.options.startRange, 
            Math.min(this.options.stopRange, value));
    }

    drawArc(centerX, centerY, radius, startAngle, endAngle, color) {
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = radius * 0.2;
        this.ctx.stroke();
    }

    mapValue(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height * 0.7;
        const radius = Math.min(width, height) * 0.4;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw background arc
        const startAngle = Math.PI * 0.8;
        const endAngle = Math.PI * 0.2;

        // Draw color segments
        this.options.colorSegments.forEach((segment, index) => {
            const nextSegment = this.options.colorSegments[index + 1] || 
                { value: this.options.stopRange };
            const segStartAngle = startAngle + 
                this.mapValue(segment.value, this.options.startRange, 
                    this.options.stopRange, 0, Math.PI * 1.6);
            const segEndAngle = startAngle + 
                this.mapValue(nextSegment.value, this.options.startRange, 
                    this.options.stopRange, 0, Math.PI * 1.6);
            
            this.drawArc(centerX, centerY, radius, segStartAngle, 
                segEndAngle, segment.color);
        });

        // Draw needle
        const needleAngle = startAngle + 
            this.mapValue(this.currentValue, this.options.startRange, 
                this.options.stopRange, 0, Math.PI * 1.6);
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(
            centerX + Math.cos(needleAngle) * radius * 0.8,
            centerY + Math.sin(needleAngle) * radius * 0.8
        );
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw text labels
        this.ctx.font = `${radius * 0.15}px Arial`;
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        
        this.options.textRange.forEach(text => {
            const textAngle = startAngle + 
                this.mapValue(text.value, this.options.startRange, 
                    this.options.stopRange, 0, Math.PI * 1.6);
            const textRadius = radius * 1.2;
            const x = centerX + Math.cos(textAngle) * textRadius;
            const y = centerY + Math.sin(textAngle) * textRadius;
            
            this.ctx.fillText(text.label, x, y);
        });
    }

    animate() {
        // Smooth value transition
        this.currentValue += (this.targetValue - this.currentValue) * 
            this.options.smoothRate;

        this.draw();
        setTimeout(() => requestAnimationFrame(() => this.animate()), 
            1000 / this.options.frameRate);
    }
}

export default PeakMeterGauge;