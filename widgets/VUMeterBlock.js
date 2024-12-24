class VUMeterBlock {
    constructor(container, options) {
        this.container = container;
        this.options = Object.assign({
            StartRange: 0,
            StopRange: 100,
            VUWidth: 50,
            VUHeight: 300,
            BlockWidth: 20,
            BlockHeight: 10,
            NumBlocks: null,
            maxLevel: 100,
            ShowPeak: true,
            Vertical: true,
            Invert: false,
            VUNum: 1,
            PeakHoldDuration: 1000,
            FrameRate: 30,
            smoothRate: 0.1,
            TextRange: [],
            ColorSegments: []
        }, options);

        this.peakLevels = new Array(this.options.VUNum).fill(0);
        this.currentLevels = new Array(this.options.VUNum).fill(0);
        this.lastPeakUpdate = new Array(this.options.VUNum).fill(0);

        this.init();
        this.render();
    }

    init() {
        // Add container styles
        this.container.style.position = 'relative';
        this.container.style.display = 'inline-block';
        this.container.style.width = `${this.options.Vertical ? this.options.VUNum * (this.options.VUWidth + 10) : this.options.VUWidth}px`;
        this.container.style.height = `${this.options.Vertical ? this.options.VUHeight : this.options.VUNum * (this.options.VUHeight + 10)}px`;
        this.container.style.overflow = 'hidden';

        // Create VU meters
        this.meters = [];
        for (let i = 0; i < this.options.VUNum; i++) {
            const meter = document.createElement('div');
            meter.style.position = 'absolute';
            meter.style.bottom = this.options.Vertical ? '0' : `${i * (this.options.VUHeight + 10)}px`;
            meter.style.left = this.options.Vertical ? `${i * (this.options.VUWidth + 10)}px` : '0';
            meter.style.width = `${this.options.Vertical ? this.options.VUWidth : this.options.VUHeight}px`;
            meter.style.height = `${this.options.Vertical ? this.options.VUHeight : this.options.VUWidth}px`;
            this.container.appendChild(meter);
            this.meters.push(meter);
        }

        // Create text labels if TextRange is provided
        if (this.options.TextRange.length > 0) {
            this.createLabels();
        }
    }

    createLabels() {
        const { TextRange, Vertical, VUHeight, VUWidth, VUNum } = this.options;
        TextRange.forEach(range => {
            const label = document.createElement('div');
            label.innerText = range.label;
            label.style.position = 'absolute';
            label.style.color = '#fff';
            label.style.fontSize = '12px';
            label.style.textAlign = 'center';
            if (Vertical) {
                label.style.left = '-20px';
                label.style.bottom = `${(range.value / 100) * VUHeight}px`;
            } else {
                label.style.top = `${VUWidth + 5}px`;
                label.style.left = `${(range.value / 100) * VUWidth}px`;
            }
            this.container.appendChild(label);
        });
    }

    render() {
        const { StartRange, StopRange, ColorSegments, Vertical, Invert, BlockWidth, BlockHeight } = this.options;
        const range = StopRange - StartRange;
        const numBlocks = this.options.NumBlocks || (Vertical ? Math.floor(this.options.VUHeight / BlockHeight) : Math.floor(this.options.VUWidth / BlockWidth));

        for (let i = 0; i < this.meters.length; i++) {
            const meter = this.meters[i];
            meter.innerHTML = '';

            for (let j = 0; j < numBlocks; j++) {
                const block = document.createElement('div');
                const value = StartRange + (j / numBlocks) * range;

                // Determine color
                const colorSegment = ColorSegments.find(segment => value >= segment.value);
                block.style.backgroundColor = colorSegment ? colorSegment.color : '#000';

                block.style.width = `${Vertical ? BlockWidth : BlockHeight}px`;
                block.style.height = `${Vertical ? BlockHeight : BlockWidth}px`;
                block.style.margin = '1px';
                block.style.opacity = '0.2';
                block.style.transition = `opacity ${this.options.smoothRate}s`;

                // Positioning
                block.style.position = 'absolute';
                if (Vertical) {
                    block.style.bottom = `${Invert ? j * (BlockHeight + 1) : (numBlocks - j - 1) * (BlockHeight + 1)}px`;
                } else {
                    block.style.left = `${Invert ? j * (BlockWidth + 1) : (numBlocks - j - 1) * (BlockWidth + 1)}px`;
                }

                meter.appendChild(block);
            }
        }
    }

    update(levels) {
        const now = Date.now();

        for (let i = 0; i < this.meters.length; i++) {
            const meter = this.meters[i];
            const level = levels[i];
            const blocks = meter.children;

            this.currentLevels[i] = level;
            if (this.options.ShowPeak) {
                if (level > this.peakLevels[i]) {
                    this.peakLevels[i] = level;
                    this.lastPeakUpdate[i] = now;
                } else if (now - this.lastPeakUpdate[i] > this.options.PeakHoldDuration) {
                    this.peakLevels[i] = level;
                }
            }

            const numBlocks = this.options.NumBlocks || (this.options.Vertical ? Math.floor(this.options.VUHeight / this.options.BlockHeight) : Math.floor(this.options.VUWidth / this.options.BlockWidth));
            const activeBlocks = Math.floor((level / this.options.maxLevel) * numBlocks);

            for (let j = 0; j < blocks.length; j++) {
                blocks[j].style.opacity = j < activeBlocks ? '1' : '0.2';
            }
        }
    }
}

export default VUMeterBlock;