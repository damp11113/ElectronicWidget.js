class DPad {
    constructor(element, options = {}) {
        this.element = element;
        this.size = options.size || 200;
        this.color = options.color || '#333';
        this.withEnter = options.withEnter || false;
        this.onClick = options.onClick || (() => {});
        
        // Calculate button dimensions
        this.buttonSize = this.size / 3;
        
        this.init();
    }
    
    init() {
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .d-pad {
                position: relative;
                width: ${this.size}px;
                height: ${this.size}px;
            }
            
            .d-pad button {
                position: absolute;
                background: ${this.color};
                border: none;
                cursor: pointer;
                transition: opacity 0.2s;
                color: white;
                font-size: ${this.buttonSize / 3}px;
            }
            
            .d-pad button:hover {
                opacity: 0.8;
            }
            
            .d-pad .up {
                width: ${this.buttonSize}px;
                height: ${this.buttonSize}px;
                left: 50%;
                top: 0;
                transform: translateX(-50%);
                border-radius: ${this.buttonSize / 4}px ${this.buttonSize / 4}px 0 0;
            }
            
            .d-pad .down {
                width: ${this.buttonSize}px;
                height: ${this.buttonSize}px;
                left: 50%;
                bottom: 0;
                transform: translateX(-50%);
                border-radius: 0 0 ${this.buttonSize / 4}px ${this.buttonSize / 4}px;
            }
            
            .d-pad .left {
                width: ${this.buttonSize}px;
                height: ${this.buttonSize}px;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                border-radius: ${this.buttonSize / 4}px 0 0 ${this.buttonSize / 4}px;
            }
            
            .d-pad .right {
                width: ${this.buttonSize}px;
                height: ${this.buttonSize}px;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                border-radius: 0 ${this.buttonSize / 4}px ${this.buttonSize / 4}px 0;
            }
            
            .d-pad .enter {
                width: ${this.buttonSize}px;
                height: ${this.buttonSize}px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
            }
        `;
        document.head.appendChild(styles);
        
        // Create D-PAD HTML structure
        this.element.className = 'd-pad';
        
        const buttons = {
            up: '▲',
            right: '▶',
            down: '▼',
            left: '◀',
            enter: '●'
        };
        
        Object.entries(buttons).forEach(([direction, symbol]) => {
            if (direction === 'enter' && !this.withEnter) return;
            
            const button = document.createElement('button');
            button.className = direction;
            button.innerHTML = symbol;
            button.addEventListener('click', () => this.handleClick(direction));
            this.element.appendChild(button);
        });
    }
    
    handleClick(direction) {
        this.onClick(direction);
    }
}

export default DPad;