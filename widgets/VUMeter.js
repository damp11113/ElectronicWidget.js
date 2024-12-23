class VUMeter {
    constructor(canvasId, options = {}) {
        // Default options
        this.options = Object.assign({
            StartRange: 0,
            StopRange: 100,
            VUHeight: 20,
            VUWidth: 250,
            maxLevel: 100,
            ShowPeak: true,
            IsVertical: false,
            IsInvert: false,
            NeedleSpeed: 0.1,  // Speed of the needle transition
            PeakHoldDuration: 2000, // Peak hold duration in ms
            frameRate: 60, // Default frame rate
            smoothRate: 0.05, // Smooth transition rate (lower is slower)
            TextRange: [
                //{ value: 0, label: '-20' },
                //{ value: 50, label: '0' },
                //{ value: 100, label: '+3' }
            ], // Default text range labels
            ColorSegments: [ 
                { value: 0, color: '#00ff00' },
                { value: 50, color: '#ffff00' },
                { value: 100, color: '#ff0000' }
            ]
        }, options);

        // Setup canvas
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Adjust canvas size based on orientation
        if (this.options.IsVertical) {
            this.canvas.width = this.options.VUHeight + 30; // Extra for labels
            this.canvas.height = this.options.VUWidth;
        } else {
            this.canvas.width = this.options.VUWidth;
            this.canvas.height = this.options.VUHeight + 30; // Extra for labels
        }

        // Initialize variables
        this.currentLevel = 0;
        this.targetLevel = 0;
        this.peakLevel = 0;
        this.lastPeakTime = 0;
        this.peakHoldLevel = 0;

        // Calculate the interval based on the frame rate
        this.frameInterval = 1000 / this.options.frameRate;

        // Start rendering using requestAnimationFrame
        this.lastUpdateTime = 0;
        this.updateVUMeter();
    }

    // Method to set the current level directly
    setLevel(level) {
        // Clamp the level to the defined range
        this.targetLevel = Math.min(Math.max(level, this.options.StartRange), this.options.StopRange);
    }

    drawVUMeter(level) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Normalize level to a percentage based on the StartRange and StopRange
        const normalizedLevel = (level - this.options.StartRange) / (this.options.StopRange - this.options.StartRange);
        const clampedNormalizedLevel = Math.min(Math.max(normalizedLevel, 0), 1); // Clamp to 0-1 range
    
        // Adjust dimensions based on orientation
        const meterWidth = this.options.IsVertical ? this.options.VUHeight : this.options.VUWidth;
        const meterHeight = this.options.IsVertical ? this.options.VUWidth : this.options.VUHeight;
    
        // Draw background (dark gray)
        ctx.fillStyle = '#333';
        if (this.options.IsVertical) {
            ctx.fillRect(15, 10, 20, meterHeight); // Vertical background
        } else {
            ctx.fillRect(10, 40, meterWidth, 20); // Horizontal background
        }
    
        // Create color gradient
        let gradient;
        // Multiple color segments for linear gradient
        gradient = this.options.IsVertical
            ? ctx.createLinearGradient(0, 0, 0, meterHeight)
            : ctx.createLinearGradient(0, 0, meterWidth, 0);

        this.options.ColorSegments.forEach((segment, index) => {
            const stop = segment.value / this.options.maxLevel;
            gradient.addColorStop(stop, segment.color);
        });
    
        ctx.fillStyle = gradient;
    
        // Calculate bar length
        let barLength = clampedNormalizedLevel * (this.options.IsVertical ? meterHeight : meterWidth);
    
        // Handle inversion and drawing
        if (this.options.IsVertical) {
            if (this.options.IsInvert) {
                // Vertical inverted (top to bottom)
                ctx.fillRect(15, 10, 20, meterHeight - barLength);
            } else {
                // Vertical normal (bottom to top)
                ctx.fillRect(15, 10 + meterHeight - barLength, 20, barLength);
            }
        } else {
            if (this.options.IsInvert) {
                // Horizontal inverted (right to left)
                ctx.fillRect(meterWidth - barLength + 10, 40, barLength, 20);
            } else {
                // Horizontal normal (left to right)
                ctx.fillRect(10, 40, barLength, 20);
            }
        }
    
        // Draw peak level if ShowPeak is enabled
        if (this.options.ShowPeak) {
            let peakBarLength = (this.peakHoldLevel / this.options.maxLevel) * (this.options.IsVertical ? meterHeight : meterWidth);
            ctx.fillStyle = '#ff9900'; // Peak level color (orange)
    
            if (this.options.IsVertical) {
                if (!this.options.IsInvert) {
                    // Vertical inverted peak (inverts both position and length)
                    ctx.fillRect(15, meterHeight - peakBarLength + 10, 20, 3); // Peak is at the top (inverted)
                } else {
                    // Vertical normal peak
                    ctx.fillRect(15, peakBarLength + 10, 20, 3); // Peak is at the bottom
                }
            } else {
                if (this.options.IsInvert) {
                    // Horizontal inverted peak (inverts the direction of the peak)
                    ctx.fillRect(meterWidth - peakBarLength + 10, 40, 3, 20); // Peak starts from the right
                } else {
                    // Horizontal normal peak
                    ctx.fillRect(peakBarLength + 10, 40, 3, 20); // Peak starts from the left
                }
            }
        }
    
        // Draw scale lines and text
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
    
        // Draw text labels for text range
        this.options.TextRange.forEach(range => {
            // Calculate position as a percentage of the total meter length
            const textPosition = (range.value - this.options.StartRange) / (this.options.StopRange - this.options.StartRange) * (this.options.IsVertical ? meterHeight : meterWidth);
    
            // Adjust label positioning based on orientation
            if (this.options.IsVertical) {
                if (this.options.IsInvert) {
                    // For vertical inverted meters, calculate position from the bottom
                    ctx.fillText(range.label, 0, meterHeight - textPosition + 10); // Add margin to prevent clipping
                } else {
                    // For vertical meters, position from the top
                    ctx.fillText(range.label, 0, textPosition + 10); // Add margin to prevent clipping
                }
            } else {
                if (this.options.IsInvert) {
                    // For horizontal inverted meters, calculate position from the right
                    ctx.fillText(range.label, meterWidth - textPosition + 10, 30); // Add margin to prevent clipping
                } else {
                    // For horizontal meters, position from the left
                    ctx.fillText(range.label, textPosition + 10, 30); // Add margin to prevent clipping
                }
            }
        });
    }
    

    updateVUMeter(timestamp = 0) {
        const deltaTime = timestamp - this.lastUpdateTime;

        // Only update if enough time has passed based on the frame rate
        if (deltaTime >= this.frameInterval) {
            // Smooth transition for current level (approaching target level)
            const difference = this.targetLevel - this.currentLevel;
            const smoothSpeed = Math.pow(Math.abs(difference), this.options.smoothRate);
            this.currentLevel += Math.sign(difference) * smoothSpeed;

            // Update peak level with hold functionality
            if (this.currentLevel > this.peakLevel) {
                this.peakLevel = this.currentLevel;
                this.lastPeakTime = Date.now();
                this.peakHoldLevel = this.peakLevel; // Immediately update peak hold
            }

            // Hold peak level for specified duration
            if (Date.now() - this.lastPeakTime > this.options.PeakHoldDuration) {
                // Gradually decrease peak hold level
                this.peakHoldLevel = Math.max(this.currentLevel, this.peakHoldLevel * 0.95);
            }

            // Draw the VU meter
            this.drawVUMeter(this.currentLevel);

            // Save last update time
            this.lastUpdateTime = timestamp;
        }

        // Request the next frame
        requestAnimationFrame(this.updateVUMeter.bind(this));
    }
}

export default VUMeter;