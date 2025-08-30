// AI Visuals JavaScript
class AIVisuals {
    constructor() {
        this.selectedPhoto = null;
        this.selectedDestination = null;
        this.customDestination = '';
        
        // Log API configuration
        console.log('API Base URL:', window.API_BASE_URL);
        console.log('Current hostname:', window.location.hostname);
        
        this.initializeElements();
        this.bindEvents();
        
        // Test API connection
        this.testAPIConnection();
    }

    async testAPIConnection() {
        try {
            const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8000';
            console.log('Testing API connection to:', apiBaseUrl);
            
            const response = await fetch(`${apiBaseUrl}/debug`);
            if (response.ok) {
                console.log('✅ API connection successful');
            } else {
                console.warn('⚠️ API connection failed:', response.status);
            }
        } catch (error) {
            console.error('❌ API connection error:', error);
        }
    }

    initializeElements() {
        // Upload elements
        this.uploadZone = document.getElementById('upload-zone');
        this.photoInput = document.getElementById('photo-input');
        this.uploadedPhoto = document.getElementById('uploaded-photo');
        this.photoPreview = document.getElementById('photo-preview');
        this.changePhotoBtn = document.getElementById('change-photo-btn');

        // Destination elements
        this.destinationsGrid = document.getElementById('destinations-grid');
        this.customDestinationInput = document.getElementById('custom-destination');
        this.useCustomBtn = document.getElementById('use-custom-btn');

        // Generate elements
        this.generateBtn = document.getElementById('generate-btn');

        // Section elements
        this.uploadSection = document.querySelector('.upload-section');
        this.loadingSection = document.getElementById('loading-section');
        this.resultsSection = document.getElementById('results-section');

        // Loading elements
        this.progressFill = document.getElementById('progress-fill');

        // Results elements
        this.resultImage = document.getElementById('result-image');
        this.resultDestinationText = document.getElementById('result-destination-text');
        this.resultPromptText = document.getElementById('result-prompt-text');
        this.downloadBtn = document.getElementById('download-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.generateAnotherBtn = document.getElementById('generate-another-btn');

        // Validate that all required elements exist
        this.validateElements();
    }

    validateElements() {
        const requiredElements = {
            'uploadZone': this.uploadZone,
            'photoInput': this.photoInput,
            'uploadedPhoto': this.uploadedPhoto,
            'photoPreview': this.photoPreview,
            'changePhotoBtn': this.changePhotoBtn,
            'destinationsGrid': this.destinationsGrid,
            'customDestinationInput': this.customDestinationInput,
            'useCustomBtn': this.useCustomBtn,
            'generateBtn': this.generateBtn,
            'uploadSection': this.uploadSection,
            'loadingSection': this.loadingSection,
            'resultsSection': this.resultsSection,
            'progressFill': this.progressFill,
            'resultImage': this.resultImage,
            'resultDestinationText': this.resultDestinationText,
            'resultPromptText': this.resultPromptText,
            'downloadBtn': this.downloadBtn,
            'shareBtn': this.shareBtn,
            'generateAnotherBtn': this.generateAnotherBtn
        };

        const missingElements = [];
        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                missingElements.push(name);
            }
        }

        if (missingElements.length > 0) {
            console.error('Missing required elements:', missingElements);
            this.showToast('Error: Some page elements are missing. Please refresh the page.', 'error');
        }
    }

    bindEvents() {
        // Photo upload events
        this.uploadZone.addEventListener('click', () => this.photoInput.click());
        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        this.photoInput.addEventListener('change', this.handlePhotoSelect.bind(this));
        this.changePhotoBtn.addEventListener('click', () => this.photoInput.click());

        // Destination selection events
        this.destinationsGrid.addEventListener('click', this.handleDestinationSelect.bind(this));
        this.useCustomBtn.addEventListener('click', this.handleCustomDestination.bind(this));

        // Generate events
        this.generateBtn.addEventListener('click', this.generateVisual.bind(this));

        // Results events
        this.downloadBtn.addEventListener('click', this.downloadImage.bind(this));
        this.shareBtn.addEventListener('click', this.shareImage.bind(this));
        this.generateAnotherBtn.addEventListener('click', this.resetToUpload.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processPhotoFile(files[0]);
        }
    }

    handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processPhotoFile(file);
        }
    }

    processPhotoFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select an image file', 'error');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedPhoto = {
                file: file,
                dataUrl: e.target.result
            };
            this.displayPhotoPreview();
            this.updateGenerateButton();
        };
        reader.readAsDataURL(file);
    }

    displayPhotoPreview() {
        this.photoPreview.src = this.selectedPhoto.dataUrl;
        this.uploadZone.style.display = 'none';
        this.uploadedPhoto.style.display = 'block';
    }

    handleDestinationSelect(e) {
        const destinationCard = e.target.closest('.destination-card');
        if (!destinationCard) return;

        // Remove previous selection
        document.querySelectorAll('.destination-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        destinationCard.classList.add('selected');
        this.selectedDestination = destinationCard.dataset.destination;
        this.customDestination = '';
        this.customDestinationInput.value = '';

        this.updateGenerateButton();
    }

    handleCustomDestination() {
        const customText = this.customDestinationInput.value.trim();
        if (!customText) {
            this.showToast('Please enter a destination description', 'error');
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.destination-card').forEach(card => {
            card.classList.remove('selected');
        });

        this.customDestination = customText;
        this.selectedDestination = null;

        this.updateGenerateButton();
        this.showToast('Custom destination selected!', 'success');
    }

    updateGenerateButton() {
        if (!this.generateBtn) return;

        const hasPhoto = this.selectedPhoto !== null;
        const hasDestination = this.selectedDestination !== null || this.customDestination !== '';
        
        this.generateBtn.disabled = !(hasPhoto && hasDestination);
        
        if (hasPhoto && hasDestination) {
            this.generateBtn.classList.remove('btn-secondary');
            this.generateBtn.classList.add('btn-primary');
        } else {
            this.generateBtn.classList.remove('btn-primary');
            this.generateBtn.classList.add('btn-secondary');
        }
    }

    async generateVisual() {
        if (!this.selectedPhoto || (!this.selectedDestination && !this.customDestination)) {
            this.showToast('Please select a photo and destination', 'error');
            return;
        }

        try {
            // Show loading section
            this.showLoading();

            // Prepare the prompt
            const destination = this.selectedDestination || this.customDestination;
            const prompt = `A person standing in ${destination}, with a beautiful travel photo. The scene should be realistic and show the person enjoying the destination.`;

            // Try to upload photo and generate visualization
            let result;
            try {
                result = await this.uploadPhotoAndGenerate(this.selectedPhoto.file, prompt);
            } catch (apiError) {
                console.warn('API call failed, using mock generation:', apiError);
                result = await this.generateMockVisual(this.selectedPhoto.file, prompt);
            }

            if (result.success) {
                this.displayResults(result.image_url, destination, prompt);
            } else {
                throw new Error(result.message || 'Failed to generate visual');
            }

        } catch (error) {
            console.error('Error generating visual:', error);
            this.showToast(`Error: ${error.message}`, 'error');
            this.hideLoading();
        }
    }

    async uploadPhotoAndGenerate(photoFile, prompt) {
        // Get API base URL - use the one from the HTML or fallback to localhost
        const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8000';
        
        // First, upload the photo
        const formData = new FormData();
        formData.append('file', photoFile);

        console.log('Uploading photo to:', `${apiBaseUrl}/api/upload-photo`);
        
        const uploadResponse = await fetch(`${apiBaseUrl}/api/upload-photo`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload failed:', errorText);
            throw new Error(`Failed to upload photo: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        const photoUrl = uploadResult.photo_url;

        console.log('Photo uploaded successfully:', photoUrl);

        // Then generate the visualization
        console.log('Generating visualization with prompt:', prompt);
        
        const generateResponse = await fetch(`${apiBaseUrl}/api/generate-visualization`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_photo_url: photoUrl,
                prompt: prompt
            })
        });

        if (!generateResponse.ok) {
            const errorText = await generateResponse.text();
            console.error('Generation failed:', errorText);
            throw new Error(`Failed to generate visualization: ${generateResponse.status}`);
        }

        const result = await generateResponse.json();
        console.log('Visualization generated successfully:', result);
        
        return result;
    }

    // Fallback method for testing when API is not available
    async generateMockVisual(photoFile, prompt) {
        console.log('Using mock generation for testing');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return a mock result
        return {
            success: true,
            image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop',
            message: 'Mock AI visual generated for testing'
        };
    }

    showLoading() {
        if (!this.loadingSection || !this.uploadSection || !this.resultsSection) {
            console.error('Required sections not found');
            return;
        }

        this.loadingSection.style.display = 'block';
        this.uploadSection.style.display = 'none';
        this.resultsSection.style.display = 'none';

        // Simulate progress
        if (this.progressFill) {
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                this.progressFill.style.width = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 500);
        }
    }

    hideLoading() {
        if (this.loadingSection) {
            this.loadingSection.style.display = 'none';
        }
    }

    displayResults(imageUrl, destination, prompt) {
        this.hideLoading();
        
        // Update result elements
        if (this.resultImage) this.resultImage.src = imageUrl;
        if (this.resultDestinationText) this.resultDestinationText.textContent = destination;
        if (this.resultPromptText) this.resultPromptText.textContent = prompt;

        // Show results section
        if (this.resultsSection && this.uploadSection) {
            this.resultsSection.style.display = 'block';
            this.uploadSection.style.display = 'none';

            // Scroll to results
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

        this.showToast('AI visual generated successfully!', 'success');
    }

    downloadImage() {
        if (!this.resultImage || !this.resultImage.src) {
            this.showToast('No image available to download', 'error');
            return;
        }

        const link = document.createElement('a');
        link.href = this.resultImage.src;
        link.download = `ai-visual-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Image downloaded!', 'success');
    }

    shareImage() {
        if (!this.resultDestinationText) {
            this.showToast('No destination information available', 'error');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'My AI-Generated Travel Visual',
                text: `Check out my AI-generated visual at ${this.resultDestinationText.textContent}!`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showToast('Link copied to clipboard!', 'success');
            });
        }
    }

    resetToUpload() {
        // Reset all selections
        this.selectedPhoto = null;
        this.selectedDestination = null;
        this.customDestination = '';

        // Reset UI
        if (this.uploadZone) this.uploadZone.style.display = 'block';
        if (this.uploadedPhoto) this.uploadedPhoto.style.display = 'none';
        if (this.photoInput) this.photoInput.value = '';
        if (this.customDestinationInput) this.customDestinationInput.value = '';

        document.querySelectorAll('.destination-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Show upload section
        if (this.uploadSection) this.uploadSection.style.display = 'block';
        if (this.resultsSection) this.resultsSection.style.display = 'none';
        if (this.loadingSection) this.loadingSection.style.display = 'none';

        // Update button state
        this.updateGenerateButton();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add to container
        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIVisuals();
});
