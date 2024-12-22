class RotaryEncoder {
    constructor(container, options = {}) {
        // Default options
        this.options = {
            size: 100,           // Base size in pixels
            knobScale: 0.9,      // Knob size relative to encoder
            markerWidth: 4,      // Marker width in pixels
            markerLength: 0.4,   // Marker length relative to knob radius
            ...options
        };

        this.value = 0;
        this.isPressed = false;
        this.isDragging = false;
        this.lastAngle = 0;
        this.onRotate = null;
        this.onClick = null;

        // Create encoder elements
        this.encoder = document.createElement('div');
        this.knob = document.createElement('div');
        this.marker = document.createElement('div');
        
        // Calculate dimensions
        const size = this.options.size;
        const knobSize = size * this.options.knobScale;
        const margin = (size - knobSize) / 2;
        const markerHeight = knobSize * this.options.markerLength;
        
        // Style encoder container
        this.encoder.style.width = `${size}px`;
        this.encoder.style.height = `${size}px`;
        this.encoder.style.borderRadius = '50%';
        this.encoder.style.backgroundColor = '#333';
        this.encoder.style.position = 'relative';
        this.encoder.style.cursor = 'pointer';
        this.encoder.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        
        // Style knob
        this.knob.style.width = `${knobSize}px`;
        this.knob.style.height = `${knobSize}px`;
        this.knob.style.borderRadius = '50%';
        this.knob.style.backgroundColor = '#666';
        this.knob.style.position = 'absolute';
        this.knob.style.top = `${margin}px`;
        this.knob.style.left = `${margin}px`;
        this.knob.style.transition = 'transform 0.1s';
        
        // Style marker
        this.marker.style.width = `${this.options.markerWidth}px`;
        this.marker.style.height = `${markerHeight}px`;
        this.marker.style.backgroundColor = '#fff';
        this.marker.style.position = 'absolute';
        this.marker.style.top = `${margin}px`;
        this.marker.style.left = `${(knobSize - this.options.markerWidth) / 2}px`;
        this.marker.style.transformOrigin = `50% ${knobSize/2}px`;
        
        // Assemble elements
        this.knob.appendChild(this.marker);
        this.encoder.appendChild(this.knob);
        container.appendChild(this.encoder);
        
        // Add event listeners
        this.encoder.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.encoder.addEventListener('click', this.handleClick.bind(this));
    }
    
    handleMouseDown(e) {
        this.isDragging = true;
        this.lastAngle = this.getAngle(e);
        this.knob.style.transform = 'scale(0.95)';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const currentAngle = this.getAngle(e);
        let delta = currentAngle - this.lastAngle;
        
        // Handle angle wrap-around
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        
        this.value += Math.round(delta / 10); // Adjust sensitivity
        this.lastAngle = currentAngle;
        
        // Update marker rotation
        this.marker.style.transform = `rotate(${this.value * 10}deg)`;
        
        // Trigger rotation event
        if (this.onRotate) {
            this.onRotate({
                value: this.value,
                delta: delta > 0 ? 1 : -1
            });
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.knob.style.transform = 'scale(1)';
    }
    
    handleClick() {
        if (this.onClick) {
            this.onClick();
        }
    }
    
    getAngle(e) {
        const rect = this.encoder.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    // Method to update options after initialization
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        // Recreate the encoder with new options
        const parent = this.encoder.parentNode;
        parent.removeChild(this.encoder);
        this.constructor(parent, this.options);
    }
}

export default RotaryEncoder;