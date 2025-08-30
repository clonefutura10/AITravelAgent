// Planning Interface JavaScript
class PlanningInterface {
  constructor() {
    this.currentStep = 1;
    this.uploadedPhoto = null;
    this.userProfile = {};
    this.recommendations = [];
    
    this.initializeElements();
    this.bindEvents();
    this.setupDateValidation();
  }

  initializeElements() {
    // Progress elements
    this.progressSteps = document.querySelectorAll('.progress-step');
    this.progressFill = document.getElementById('progress-fill');
    this.progressStepItems = document.querySelectorAll('.progress-step-item');
    
    // Content sections
    this.step1Content = document.getElementById('step-1-content');
    this.step2Content = document.getElementById('step-2-content');
    this.step3Content = document.getElementById('step-3-content');
    
    // Photo upload elements
    this.uploadZone = document.getElementById('upload-zone');
    this.photoInput = document.getElementById('photo-input');
    this.uploadedPhotoDiv = document.getElementById('uploaded-photo');
    this.photoPreview = document.getElementById('photo-preview');
    this.changePhotoBtn = document.getElementById('change-photo-btn');
    
    // Form elements
    this.profileForm = document.getElementById('profile-form');
    this.startPlanningBtn = document.getElementById('start-planning-btn');
    this.regenerateBtn = document.getElementById('regenerate-btn');
    

    
    // Recommendations
    this.recommendationsGrid = document.getElementById('recommendations-grid');
    
    // Form fields
    this.formFields = {
      name: document.getElementById('traveler-name'),
      ageGroup: document.getElementById('age-group'),
      travelType: document.getElementById('travel-type'),
      budgetRange: document.getElementById('budget-range'),
      tripDuration: document.getElementById('trip-duration'),
      travelDates: document.getElementById('travel-dates'),
      additionalNotes: document.getElementById('additional-notes'),
      interests: document.querySelectorAll('input[name="interests"]')
    };
  }

  bindEvents() {
    // Photo upload events
    this.uploadZone.addEventListener('click', () => this.photoInput.click());
    this.photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    this.changePhotoBtn.addEventListener('click', () => this.resetPhotoUpload());
    
    // Drag and drop events
    this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
    
    // Form events
    this.profileForm.addEventListener('input', () => this.validateForm());
    this.startPlanningBtn.addEventListener('click', () => this.startPlanning());
    this.regenerateBtn.addEventListener('click', () => this.regenerateRecommendations());
    

    
    // Interest checkboxes
    this.formFields.interests.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.validateForm());
    });
  }

  setupDateValidation() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    this.formFields.travelDates.min = today;
  }

  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.processPhotoFile(file);
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    this.uploadZone.classList.add('dragover');
  }

  handleDragLeave(event) {
    event.preventDefault();
    this.uploadZone.classList.remove('dragover');
  }

  handleDrop(event) {
    event.preventDefault();
    this.uploadZone.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.processPhotoFile(files[0]);
    }
  }

  processPhotoFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File size must be less than 10MB', 'error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedPhoto = file;
      this.photoPreview.src = e.target.result;
      this.uploadZone.style.display = 'none';
      this.uploadedPhotoDiv.style.display = 'block';
      

      
      this.validateForm();
    };
    reader.readAsDataURL(file);
  }

  resetPhotoUpload() {
    this.uploadedPhoto = null;
    this.photoInput.value = '';
    this.uploadZone.style.display = 'block';
    this.uploadedPhotoDiv.style.display = 'none';

    this.validateForm();
  }

  validateForm() {
    const requiredFields = [
      this.formFields.name,
      this.formFields.ageGroup,
      this.formFields.travelType,
      this.formFields.budgetRange
    ];

    const hasRequiredFields = requiredFields.every(field => field.value.trim() !== '');
    const hasInterests = Array.from(this.formFields.interests).some(checkbox => checkbox.checked);
    const hasPhoto = this.uploadedPhoto !== null;

    const isValid = hasRequiredFields && hasInterests && hasPhoto;
    
    this.startPlanningBtn.disabled = !isValid;
    
    if (isValid) {
      this.startPlanningBtn.classList.remove('btn-disabled');
    } else {
      this.startPlanningBtn.classList.add('btn-disabled');
    }

    return isValid;
  }

  collectFormData() {
    const interests = Array.from(this.formFields.interests)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    return {
      name: this.formFields.name.value.trim(),
      ageGroup: this.formFields.ageGroup.value,
      travelType: this.formFields.travelType.value,
      budgetRange: this.formFields.budgetRange.value,
      tripDuration: this.formFields.tripDuration.value || null,
      travelDates: this.formFields.travelDates.value || null,
      additionalNotes: this.formFields.additionalNotes.value.trim() || null,
      interests: interests
    };
  }

  async startPlanning() {
    if (!this.validateForm()) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    this.userProfile = this.collectFormData();
    
    // Save user profile to localStorage for future trips
    localStorage.setItem('wanderai_user_profile', JSON.stringify({
      ...this.userProfile,
      lastUpdated: new Date().toISOString()
    }));
    
    // Move to step 2
    this.goToStep(2);
    
    try {
      // Upload photo first
      const photoUrl = await this.uploadPhoto();
      
      // Generate recommendations
      await this.generateRecommendations(photoUrl);
      
      // Save recommendations to localStorage
      if (this.recommendations && this.recommendations.length > 0) {
        localStorage.setItem('wanderai_recent_recommendations', JSON.stringify(this.recommendations));
      }
      
      // Move to step 3 (AI Generation)
      this.goToStep(3);
      
    } catch (error) {
      console.error('Planning failed:', error);
      this.showToast('Failed to generate recommendations. Please try again.', 'error');
      this.goToStep(1);
    }
  }

  async uploadPhoto() {
    if (!this.uploadedPhoto) {
      throw new Error('No photo uploaded');
    }

    const formData = new FormData();
    formData.append('file', this.uploadedPhoto);

    try {
      const response = await fetch('http://localhost:8001/api/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Photo upload failed');
      }

      const result = await response.json();
      return result.photo_url;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  async generateRecommendations(photoUrl) {
    // Simulate AI analysis progress
    await this.simulateAnalysisProgress();

    // Prepare recommendation request
    const requestData = {
      ageGroup: this.userProfile.ageGroup,
      groupSize: this.userProfile.travelType,
      budgetRange: this.parseBudgetRange(this.userProfile.budgetRange),
      tripDuration: this.userProfile.tripDuration || 'week',
      interests: this.userProfile.interests,
      additionalNotes: this.userProfile.additionalNotes
    };

    try {
      const response = await fetch('http://localhost:8001/api/generate-personalized-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        this.recommendations = result.data.destinations || [];
        this.displayRecommendations();
      } else {
        throw new Error(result.error || 'No recommendations generated');
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      throw error;
    }
  }



  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;

    const container = document.getElementById('toast-container');
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  parseBudgetRange(budgetRange) {
    const budgetMap = {
      '500-1000': 750,
      '1000-2500': 1750,
      '2500-5000': 3750,
      '5000-10000': 7500,
      '10000+': 12000
    };
    return budgetMap[budgetRange] || 2000;
  }

  async simulateAnalysisProgress() {
    const steps = ['Analyzing photo', 'Processing preferences', 'Finding destinations', 'Creating recommendations'];
    const progressBar = this.progressFill;
    const stepItems = this.progressStepItems;

    for (let i = 0; i < steps.length; i++) {
      // Update progress bar
      const progress = ((i + 1) / steps.length) * 100;
      progressBar.style.width = `${progress}%`;

      // Update step indicators
      if (i > 0) {
        stepItems[i - 1].classList.remove('active');
        stepItems[i - 1].classList.add('completed');
      }
      stepItems[i].classList.add('active');

      // Wait before next step
      await this.delay(1000 + Math.random() * 1000);
    }

    // Complete all steps
    stepItems.forEach(item => {
      item.classList.remove('active');
      item.classList.add('completed');
    });
  }

  displayRecommendations() {
    if (!this.recommendations || this.recommendations.length === 0) {
      this.recommendationsGrid.innerHTML = `
        <div class="no-recommendations">
          <i class="fas fa-search"></i>
          <h3>No recommendations found</h3>
          <p>Try adjusting your preferences or try again later.</p>
        </div>
      `;
      return;
    }

    let recommendationsHTML = '';

    // Destinations Section
    if (this.recommendations.destinations && this.recommendations.destinations.length > 0) {
      recommendationsHTML += `
        <div class="recommendations-section">
          <h3 class="section-subtitle">
            <i class="fas fa-map-marker-alt"></i>
            Recommended Destinations
          </h3>
          <div class="recommendations-grid">
            ${this.recommendations.destinations.map(destination => `
              <div class="recommendation-card">
                <img src="${destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'}" alt="${destination.name}" class="recommendation-image" />
                <div class="recommendation-content">
                  <h3 class="recommendation-title">${destination.name}</h3>
                  <p class="recommendation-location">${destination.country || 'Travel Destination'}</p>
                  <p class="recommendation-description">${destination.description || 'A beautiful travel destination perfect for your preferences.'}</p>
                  
                  <div class="recommendation-meta">
                    <div class="recommendation-rating">
                      <i class="fas fa-star"></i>
                      <span>${destination.rating || '4.5'}</span>
                    </div>
                    <div class="recommendation-price">${destination.price || '$$'}</div>
                  </div>
                  
                  <div class="recommendation-highlights">
                    ${destination.highlights ? destination.highlights.slice(0, 3).map(highlight => 
                      `<span class="recommendation-highlight">${highlight}</span>`
                    ).join('') : '<span class="recommendation-highlight">Local Attractions</span><span class="recommendation-highlight">Cultural Sites</span><span class="recommendation-highlight">Natural Beauty</span>'}
                  </div>
                  
                  <button class="btn btn-primary btn-small" onclick="planningInterface.viewDestination('${destination.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Accommodations Section
    if (this.recommendations.accommodations && this.recommendations.accommodations.length > 0) {
      recommendationsHTML += `
        <div class="recommendations-section">
          <h3 class="section-subtitle">
            <i class="fas fa-bed"></i>
            Recommended Accommodations
          </h3>
          <div class="recommendations-grid">
            ${this.recommendations.accommodations.map(accommodation => `
              <div class="recommendation-card">
                <img src="${accommodation.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80'}" alt="${accommodation.name}" class="recommendation-image" />
                <div class="recommendation-content">
                  <h3 class="recommendation-title">${accommodation.name}</h3>
                  <p class="recommendation-location">${accommodation.location || 'Hotel Location'}</p>
                  <p class="recommendation-description">${accommodation.description || 'A comfortable accommodation option for your stay.'}</p>
                  
                  <div class="recommendation-meta">
                    <div class="recommendation-rating">
                      <i class="fas fa-star"></i>
                      <span>${accommodation.rating || '4.5'}</span>
                    </div>
                    <div class="recommendation-price">${accommodation.price || '$$'}</div>
                  </div>
                  
                  <div class="recommendation-highlights">
                    ${accommodation.amenities ? accommodation.amenities.slice(0, 3).map(amenity => 
                      `<span class="recommendation-highlight">${amenity}</span>`
                    ).join('') : '<span class="recommendation-highlight">Free WiFi</span><span class="recommendation-highlight">Breakfast</span><span class="recommendation-highlight">Pool</span>'}
                  </div>
                  
                  <button class="btn btn-primary btn-small" onclick="planningInterface.viewAccommodation('${accommodation.id}')">
                    <i class="fas fa-bed"></i>
                    Book Now
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Restaurants Section
    if (this.recommendations.restaurants && this.recommendations.restaurants.length > 0) {
      recommendationsHTML += `
        <div class="recommendations-section">
          <h3 class="section-subtitle">
            <i class="fas fa-utensils"></i>
            Recommended Restaurants
          </h3>
          <div class="recommendations-grid">
            ${this.recommendations.restaurants.map(restaurant => `
              <div class="recommendation-card">
                <img src="${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80'}" alt="${restaurant.name}" class="recommendation-image" />
                <div class="recommendation-content">
                  <h3 class="recommendation-title">${restaurant.name}</h3>
                  <p class="recommendation-location">${restaurant.location || 'Restaurant Location'}</p>
                  <p class="recommendation-description">${restaurant.description || 'A delicious dining option for your trip.'}</p>
                  
                  <div class="recommendation-meta">
                    <div class="recommendation-rating">
                      <i class="fas fa-star"></i>
                      <span>${restaurant.rating || '4.5'}</span>
                    </div>
                    <div class="recommendation-price">${restaurant.price || '$$'}</div>
                  </div>
                  
                  <div class="recommendation-highlights">
                    ${restaurant.cuisine ? restaurant.cuisine.slice(0, 3).map(cuisine => 
                      `<span class="recommendation-highlight">${cuisine}</span>`
                    ).join('') : '<span class="recommendation-highlight">Local Cuisine</span><span class="recommendation-highlight">Fine Dining</span><span class="recommendation-highlight">Fresh Ingredients</span>'}
                  </div>
                  
                  <button class="btn btn-primary btn-small" onclick="planningInterface.viewRestaurant('${restaurant.id}')">
                    <i class="fas fa-utensils"></i>
                    Reserve Table
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // If no structured data, fall back to simple destinations array
    if (!recommendationsHTML && Array.isArray(this.recommendations)) {
      recommendationsHTML = this.recommendations.map(destination => `
        <div class="recommendation-card">
          <img src="${destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'}" alt="${destination.name}" class="recommendation-image" />
          <div class="recommendation-content">
            <h3 class="recommendation-title">${destination.name}</h3>
            <p class="recommendation-location">${destination.country || 'Travel Destination'}</p>
            <p class="recommendation-description">${destination.description || 'A beautiful travel destination perfect for your preferences.'}</p>
            
            <div class="recommendation-meta">
              <div class="recommendation-rating">
                <i class="fas fa-star"></i>
                <span>${destination.rating || '4.5'}</span>
              </div>
              <div class="recommendation-price">${destination.price || '$$'}</div>
            </div>
            
            <div class="recommendation-highlights">
              ${destination.highlights ? destination.highlights.slice(0, 3).map(highlight => 
                `<span class="recommendation-highlight">${highlight}</span>`
              ).join('') : '<span class="recommendation-highlight">Local Attractions</span><span class="recommendation-highlight">Cultural Sites</span><span class="recommendation-highlight">Natural Beauty</span>'}
            </div>
            
            <button class="btn btn-primary btn-small" onclick="planningInterface.viewDestination('${destination.id}')">
              <i class="fas fa-eye"></i>
              View Details
            </button>
          </div>
        </div>
      `).join('');
    }

    this.recommendationsGrid.innerHTML = recommendationsHTML;
  }

  async regenerateRecommendations() {
    this.regenerateBtn.disabled = true;
    this.regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    try {
      await this.generateRecommendations();
      this.showToast('New recommendations generated!', 'success');
    } catch (error) {
      this.showToast('Failed to generate new recommendations', 'error');
    } finally {
      this.regenerateBtn.disabled = false;
      this.regenerateBtn.innerHTML = '<i class="fas fa-refresh"></i> Get More Recommendations';
    }
  }

  viewDestination(destinationId) {
    // Navigate to destination details or booking page
    window.location.href = `booking.html?destination=${destinationId}`;
  }

  viewAccommodation(accommodationId) {
    // Navigate to accommodation booking page
    window.location.href = `booking.html?accommodation=${accommodationId}`;
  }

  viewRestaurant(restaurantId) {
    // Navigate to restaurant reservation page
    window.location.href = `booking.html?restaurant=${restaurantId}`;
  }

  goToStep(step) {
    // Update progress indicators
    this.progressSteps.forEach((stepEl, index) => {
      if (index + 1 < step) {
        stepEl.classList.remove('active');
        stepEl.classList.add('completed');
      } else if (index + 1 === step) {
        stepEl.classList.add('active');
        stepEl.classList.remove('completed');
      } else {
        stepEl.classList.remove('active', 'completed');
      }
    });

    // Show/hide content sections
    this.step1Content.style.display = step === 1 ? 'block' : 'none';
    this.step2Content.style.display = step === 2 ? 'block' : 'none';
    this.step3Content.style.display = step === 3 ? 'block' : 'none';

    this.currentStep = step;
  }

  showToast(message, type = 'info') {
    // Use existing toast functionality from components.js
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize planning interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.planningInterface = new PlanningInterface();
});

// Export for global access
window.PlanningInterface = PlanningInterface;


