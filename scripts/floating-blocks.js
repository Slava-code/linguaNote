class FloatingBlocksInteraction {
    constructor() {
        this.container = null;
        this.blocks = [];
        this.originalPositions = new Map(); // Store original positions
        this.isDragging = false;
        this.draggedBlock = null;
        this.dragOffset = { x: 0, y: 0 };
        this.zIndexCounter = 1000; // Start z-index counter at 1000
        this.maxBlockZIndex = 5000; // Maximum z-index for blocks (button will be higher)
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.container = document.querySelector('.floating-blocks-container');
            if (!this.container) return;
            
            this.blocks = Array.from(document.querySelectorAll('.floating-block'));
            this.storeOriginalPositions();
            this.createResetButton();
            this.setupEventListeners();
        });
    }
    
    storeOriginalPositions() {
        this.blocks.forEach(block => {
            const computedStyle = window.getComputedStyle(block);
            this.originalPositions.set(block, {
                top: computedStyle.top,
                left: computedStyle.left,
                right: computedStyle.right,
                zIndex: computedStyle.zIndex
            });
        });
    }
    
    createResetButton() {
        const resetButton = document.createElement('button');
        resetButton.innerHTML = '↻';
        resetButton.className = 'reset-blocks-btn';
        resetButton.title = 'Reset blocks to original positions';
        resetButton.addEventListener('click', () => this.resetBlocks());
        
        // Insert button inside the container
        this.container.appendChild(resetButton);
    }
    
    setupEventListeners() {
        this.blocks.forEach(block => {
            block.addEventListener('mousedown', (e) => this.startDrag(e, block));
            block.style.cursor = 'grab';
        });
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // Touch events for mobile
        this.blocks.forEach(block => {
            block.addEventListener('touchstart', (e) => this.startDrag(e, block));
        });
        
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.stopDrag());
    }
    
    startDrag(e, block) {
        e.preventDefault();
        this.isDragging = true;
        this.draggedBlock = block;
        
        const rect = block.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.dragOffset.x = clientX - rect.left;
        this.dragOffset.y = clientY - rect.top;
        
        // Bring block to foreground (but below button)
        this.zIndexCounter++;
        if (this.zIndexCounter > this.maxBlockZIndex) {
            this.zIndexCounter = this.maxBlockZIndex;
        }
        block.style.zIndex = this.zIndexCounter;
        block.style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (!this.isDragging || !this.draggedBlock) return;
        
        e.preventDefault();
        
        const containerRect = this.container.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        let newX = clientX - containerRect.left - this.dragOffset.x;
        let newY = clientY - containerRect.top - this.dragOffset.y;
        
        // Keep block within container bounds
        const blockRect = this.draggedBlock.getBoundingClientRect();
        const maxX = this.container.offsetWidth - blockRect.width;
        const maxY = this.container.offsetHeight - blockRect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        this.draggedBlock.style.left = newX + 'px';
        this.draggedBlock.style.top = newY + 'px';
        this.draggedBlock.style.right = 'auto';
    }
    
    stopDrag() {
        if (this.draggedBlock) {
            this.draggedBlock.style.cursor = 'grab';
            // Keep the z-index to maintain stacking order
        }
        
        this.isDragging = false;
        this.draggedBlock = null;
    }
    
    resetBlocks() {
        this.blocks.forEach(block => {
            const originalPos = this.originalPositions.get(block);
            if (originalPos) {
                block.style.top = originalPos.top;
                block.style.left = originalPos.left;
                block.style.right = originalPos.right;
                block.style.zIndex = originalPos.zIndex;
            }
        });
        
        // Reset z-index counter
        this.zIndexCounter = 1000;
    }
    
    destroy() {
        // Clean up event listeners if needed
    }
}

// Initialize the floating blocks interaction
new FloatingBlocksInteraction();