// AI Generation Page JavaScript
class UploadPage {
  constructor() {
    console.log("APIService available:", typeof APIService);
    console.log("APIService constructor:", APIService);
    
    if (typeof APIService === 'undefined') {
      console.error("APIService is not defined! Check if api.js is loaded properly.");
      this.api = null;
    } else {
      this.api = new APIService();
      console.log("API instance created:", this.api);
      console.log("API methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(this.api)));
      
      // Test if generateVisualization method exists
      console.log("generateVisualization method exists:", typeof this.api.generateVisualization);
      console.log("generateVisualization is function:", typeof this.api.generateVisualization === 'function');
      
      if (typeof this.api.generateVisualization === 'function') {
        console.log("✅ generateVisualization method is available!");
      } else {
        console.error("❌ generateVisualization method is missing!");
      }
    }
    
    this.currentFile = null;
    this.selectedDestination = null;
    this.init();
    
    // Make instance globally accessible for download function calls
    window.uploadPage = this;
  }

  init() {
    console.log("Initializing UploadPage...");
    this.setupFileUpload();
    this.setupDestinationSelection();
    this.setupCustomDestination();
    this.setupGenerateButton();
    this.checkBackendStatus();
    console.log("UploadPage initialized successfully");
  }

  async checkBackendStatus() {
    try {
      const backendAvailable = await this.api.checkBackendHealth();
      if (!backendAvailable) {
        this.showToast("Backend server is not available. Using demo mode.", "warning");
      } else {
        console.log("Backend is available");
      }
    } catch (error) {
      console.error("Backend check failed:", error);
      this.showToast("Backend server is not available. Using demo mode.", "warning");
    }
  }

  setupFileUpload() {
    console.log("Setting up file upload...");
    const dropZone = document.querySelector("#photo-upload");
    const fileInput = document.querySelector("#file-input");
    const browseLink = document.querySelector("#browse-link");

    if (!dropZone || !fileInput || !browseLink) {
      console.error("Required elements not found:", { dropZone: !!dropZone, fileInput: !!fileInput, browseLink: !!browseLink });
      return;
    }

    // Click to browse
    browseLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Browse link clicked");
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener("change", (e) => {
      console.log("File input changed");
      if (e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    // Drag and drop
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        console.log("File dropped:", files[0].name);
        this.handleFileSelect(files[0]);
      }
    });

    console.log("File upload setup complete");
  }

  handleFileSelect(file) {
    console.log("Handling file selection:", file.name, file.type, file.size);
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      this.showToast("Please select an image file.", "error");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast("File size must be less than 10MB.", "error");
      return;
    }

    this.currentFile = file;
    this.displayFilePreview(file);
    this.updateGenerateButton();
    this.showToast("Photo uploaded successfully!", "success");
  }

  displayFilePreview(file) {
    const dropZone = document.querySelector("#photo-upload");
    if (!dropZone) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      dropZone.innerHTML = `
        <div class="upload-preview">
          <img src="${e.target.result}" alt="Uploaded photo" class="preview-image">
          <div class="preview-overlay">
            <button class="btn btn-secondary btn-small" id="change-photo">
              <i class="fas fa-edit"></i>
              Change Photo
            </button>
          </div>
        </div>
      `;

      // Add change photo functionality
      const changeBtn = document.querySelector("#change-photo");
      if (changeBtn) {
        changeBtn.addEventListener("click", () => {
          this.resetUploadArea();
        });
      }
    };
    reader.readAsDataURL(file);
  }

  resetUploadArea() {
    const dropZone = document.querySelector("#photo-upload");
    if (!dropZone) return;

    dropZone.innerHTML = `
      <div class="upload-icon">
        <i class="fas fa-cloud-upload-alt"></i>
      </div>
      <h3 class="upload-heading">Drop your photo here</h3>
      <p class="upload-subtext">
        <a href="javascript:void(0)" id="browse-link">or click to browse</a>
      </p>
      <p class="upload-note">Supports JPG, PNG, WEBP (max 10MB)</p>
    `;

    // Re-setup file upload
    this.setupFileUpload();
    this.currentFile = null;
    this.updateGenerateButton();
  }

  setupDestinationSelection() {
    console.log("Setting up destination selection...");
    const destinationOptions = document.querySelectorAll(".destination-option");
    
    destinationOptions.forEach(option => {
      option.addEventListener("click", () => {
        // Remove previous selection
        destinationOptions.forEach(opt => opt.classList.remove("selected"));
        
        // Select current option
        option.classList.add("selected");
        
        // Get destination info
        const destinationText = option.dataset.destination || option.querySelector("span").textContent;
        this.selectedDestination = destinationText;
        
        this.updateGenerateButton();
        this.showToast(`Selected: ${destinationText}`, "success");
      });
    });

    console.log("Destination selection setup complete");
  }

  setupCustomDestination() {
    console.log("Setting up custom destination...");
    const customInput = document.querySelector("#custom-destination");
    const generateCustomBtn = document.querySelector("#generate-custom");
    
    if (!customInput || !generateCustomBtn) {
      console.error("Custom destination elements not found");
      return;
    }

    generateCustomBtn.addEventListener("click", () => {
      const customText = customInput.value.trim();
      if (customText) {
        // Remove previous selection
        document.querySelectorAll(".destination-option").forEach(opt => opt.classList.remove("selected"));
        
        this.selectedDestination = customText;
        this.updateGenerateButton();
        this.showToast(`Custom destination: ${customText}`, "success");
      } else {
        this.showToast("Please enter a destination description.", "error");
      }
    });

    console.log("Custom destination setup complete");
  }

  setupGenerateButton() {
    console.log("Setting up generate button...");
    const generateBtn = document.querySelector("#generate-ai-visual");
    if (!generateBtn) {
      console.error("Generate button not found");
      return;
    }

    generateBtn.addEventListener("click", async () => {
      if (!this.currentFile) {
        this.showToast("Please upload a photo first.", "error");
        return;
      }

      if (!this.selectedDestination) {
        this.showToast("Please select a destination.", "error");
        return;
      }

      await this.generateVisualization();
    });

    console.log("Generate button setup complete");
  }

  updateGenerateButton() {
    const generateBtn = document.querySelector("#generate-ai-visual");
    if (!generateBtn) return;

    if (this.currentFile && this.selectedDestination) {
      generateBtn.disabled = false;
      generateBtn.classList.remove("btn-disabled");
    } else {
      generateBtn.disabled = true;
      generateBtn.classList.add("btn-disabled");
    }
  }

  async generateVisualization() {
    if (!this.currentFile || !this.selectedDestination) return;

    const generateBtn = document.querySelector("#generate-ai-visual");
    const originalText = generateBtn.innerHTML;
    
    try {
      // Show loading state
      generateBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        Generating...
      `;
      generateBtn.disabled = true;

      console.log("Starting AI generation for:", this.selectedDestination);

      // Check if API is available
      if (!this.api || typeof this.api.generateVisualization !== 'function') {
        console.error("API not available or generateVisualization method missing");
        console.log("API object:", this.api);
        if (this.api) {
          console.log("Available API methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(this.api)));
        }
        throw new Error("API service not available. Please refresh the page.");
      }

      // Convert file to base64 for API
      const imageUrl = await this.fileToBase64(this.currentFile);
      
      if (!imageUrl) {
        throw new Error("Failed to process image");
      }

      console.log("Calling API with:", { imageUrl: imageUrl.substring(0, 100) + "...", destination: this.selectedDestination });

      // Generate visualization
      const response = await this.api.generateVisualization(
        imageUrl,
        null,
        `Generate an image of a person at ${this.selectedDestination}`
      );

      if (response.success) {
        this.showToast("Visualization generated successfully!", "success");
        
        // Show results
        this.showGenerationResults(response.data);
      } else {
        throw new Error(response.error || "Failed to generate visualization");
      }

    } catch (error) {
      console.error("Generation failed:", error);
      this.showToast(
        `Generation failed: ${error.message}`,
        "error"
      );
    } finally {
      // Reset button
      generateBtn.innerHTML = originalText;
      generateBtn.disabled = false;
      this.updateGenerateButton();
    }
  }

  fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  showGenerationResults(data) {
    console.log("Showing generation results:", data);
    console.log("Raw image_urls:", data.image_urls);
    
    // Create results modal or section
    const resultsSection = document.createElement("div");
    resultsSection.className = "generation-results";
    resultsSection.innerHTML = `
      <div class="results-header">
        <h3>Your AI-Generated Visual</h3>
        <p>Generated for: ${this.selectedDestination}</p>
      </div>
      <div class="results-grid">
        ${this.renderGeneratedImages(data)}
      </div>
      <div class="results-actions">
        <button class="btn btn-primary" onclick="window.location.href='visualizations.html'">
          <i class="fas fa-images"></i>
          View All My Trips
        </button>
        <button class="btn btn-secondary" onclick="this.closest('.generation-results').remove()">
          <i class="fas fa-times"></i>
          Close
        </button>
      </div>
    `;

    // Insert after upload section
    const uploadSection = document.querySelector(".upload-section");
    if (uploadSection) {
      uploadSection.parentNode.insertBefore(resultsSection, uploadSection.nextSibling);
      
      // Scroll to results
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  renderGeneratedImages(data) {
    console.log("Rendering images with data:", data);
    
    // Check if we have image_urls from the API response
    if (data && data.image_urls && data.image_urls.length > 0) {
      console.log("Found", data.image_urls.length, "generated images");
      console.log("Image URLs:", data.image_urls);
      
      return data.image_urls.map((imageUrl, index) => {
        // Fix relative URLs to use the full backend domain
        let fixedUrl = imageUrl;
        if (imageUrl.startsWith('/static/')) {
          fixedUrl = `https://travel-agent-backend-74fv.onrender.com${imageUrl}`;
        } else if (imageUrl.includes('localhost:3000')) {
          fixedUrl = imageUrl.replace('localhost:3000', 'https://travel-agent-backend-74fv.onrender.com');
        }
        console.log(`Image ${index + 1}: Original: ${imageUrl}, Fixed: ${fixedUrl}`);
        
        return `
          <div class="generated-image-card">
            <img src="${fixedUrl}" alt="Generated image ${index + 1}" class="generated-image" onerror="this.style.display='none'; this.nextElementSibling.innerHTML='<p style=&quot;color: red; padding: 1rem;&quot;>Image failed to load</p>'">
            <div class="image-actions">
              <button class="btn btn-small" onclick="window.uploadPage.downloadImage('${fixedUrl}', 'wanderai-${index + 1}.jpg')">
                <i class="fas fa-download"></i>
                Download
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
    
    // Fallback for demo or when no images are returned
    console.log("No images found, showing demo placeholder");
    return `
      <div class="generated-image-card">
        <div class="demo-image-placeholder">
          <i class="fas fa-image"></i>
          <p>AI-generated image would appear here</p>
        </div>
        <div class="image-actions">
          <button class="btn btn-small" onclick="alert('Demo image - no download available')">
            <i class="fas fa-download"></i>
            Demo Only
          </button>
        </div>
      </div>
    `;
  }

  downloadImage(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showToast(message, type = "info") {
    // Simple toast implementation
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    const container = document.getElementById("toast-container");
    if (container) {
      container.appendChild(toast);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 5000);
    }
  }


}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing UploadPage...");
  
  // Check global availability
  console.log("Global APIService:", typeof window.APIService);
  console.log("Global APIService class:", window.APIService);
  
  if (typeof APIService === 'undefined') {
    console.error("APIService is not available globally. Trying to wait for it...");
    
    // Wait a bit for scripts to load
    setTimeout(() => {
      console.log("After delay - APIService:", typeof APIService);
      if (typeof APIService !== 'undefined') {
        window.uploadPage = new UploadPage();
      } else {
        console.error("APIService still not available. Check script loading order.");
        // Create a basic version without API
        window.uploadPage = new UploadPage();
      }
    }, 1000);
  } else {
    window.uploadPage = new UploadPage();
  }
});
