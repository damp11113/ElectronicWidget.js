class LED {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            size: options.size || 20,
            color: options.color || '#ff0000',
            pulseAnimation: options.pulseAnimation !== undefined ? options.pulseAnimation : true,
            pulseSpeed: options.pulseSpeed || 1000,
            borderWidth: options.borderWidth || 2,
            glowIntensity: options.glowIntensity || 0.5,
            state: options.state !== undefined ? options.state : true
        };
        
        this.init();
    }

    init() {
        // Set basic styles
        this.element.style.width = `${this.options.size}px`;
        this.element.style.height = `${this.options.size}px`;
        this.element.style.borderRadius = '50%';
        this.element.style.display = 'inline-block';
        this.element.style.position = 'relative';
        this.element.style.border = `${this.options.borderWidth}px solid ${this.darkenColor(this.options.color, 20)}`;
        
        // Create inner glow effect
        this.element.style.boxShadow = `
            inset 0 0 ${this.options.size/4}px rgba(0,0,0,0.2),
            inset 0 0 ${this.options.size/6}px ${this.options.color}
        `;
        
        // Set initial state
        this.setState(this.options.state);
        
        // Add pulse animation if enabled
        if (this.options.pulseAnimation && this.options.state) {
            this.startPulse();
        }
    }

    setState(state) {
        this.options.state = state;
        
        if (state) {
            this.element.style.backgroundColor = this.options.color;
            this.element.style.boxShadow = `
                0 0 ${this.options.size/2}px rgba(${this.getRGBValues(this.options.color)},${this.options.glowIntensity}),
                inset 0 0 ${this.options.size/4}px rgba(0,0,0,0.2),
                inset 0 0 ${this.options.size/6}px ${this.options.color}
            `;
            
            if (this.options.pulseAnimation) {
                this.startPulse();
            }
        } else {
            this.element.style.backgroundColor = this.darkenColor(this.options.color, 60);
            this.element.style.boxShadow = `
                inset 0 0 ${this.options.size/4}px rgba(0,0,0,0.2),
                inset 0 0 ${this.options.size/6}px ${this.darkenColor(this.options.color, 40)}
            `;
            this.stopPulse();
        }
    }

    setColor(color) {
        this.options.color = color;
        this.setState(this.options.state);
    }

    setSize(size) {
        this.options.size = size;
        this.init();
    }

    startPulse() {
        if (this.pulseAnimation) return;
    
        // Create the pulse animation keyframes
        const keyframes = `
            @keyframes led-pulse {
                0% {
                    box-shadow: 0 0 ${this.options.size / 2}px rgba(${this.getRGBValues(this.options.color)}, ${this.options.glowIntensity}),
                                inset 0 0 ${this.options.size / 4}px rgba(0, 0, 0, 0.2),
                                inset 0 0 ${this.options.size / 6}px ${this.options.color};
                }
                50% {
                    box-shadow: 0 0 ${this.options.size / 3}px rgba(${this.getRGBValues(this.options.color)}, ${this.options.glowIntensity * 0.5}),
                                inset 0 0 ${this.options.size / 4}px rgba(0, 0, 0, 0.2),
                                inset 0 0 ${this.options.size / 6}px ${this.options.color};
                }
                100% {
                    box-shadow: 0 0 ${this.options.size / 2}px rgba(${this.getRGBValues(this.options.color)}, ${this.options.glowIntensity}),
                                inset 0 0 ${this.options.size / 4}px rgba(0, 0, 0, 0.2),
                                inset 0 0 ${this.options.size / 6}px ${this.options.color};
                }
            }
        `;
    
        // Append the keyframes style if it's not already added
        if (!document.querySelector('#led-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'led-pulse-style';
            style.textContent = keyframes;
            document.head.appendChild(style);
        }
    
        // Apply the animation
        this.element.style.animation = `led-pulse ${this.options.pulseSpeed}ms infinite`;
        this.pulseAnimation = true;
    }
    

    stopPulse() {
        this.element.style.animation = 'none';
        this.pulseAnimation = false;
    }

   // Utility function to darken a color
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);

        // Return darkened color as hex string
        return `#${(1 << 24) + (R * 0x10000) + (G * 0x100) + B}.toString(16).slice(1)}`;
    }

    // Utility function to get RGB values from hex color
    getRGBValues(color) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `${r},${g},${b}`;
    }
}

export default LED;