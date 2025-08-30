// My Trips Page JavaScript
class TripsPage {
  constructor() {
    this.userProfile = null;
    this.tripHistory = [];
    this.savedDestinations = [];
    this.recentRecommendations = [];
    
    this.initializeElements();
    this.bindEvents();
    this.loadUserData();
  }

  initializeElements() {
    // Profile elements
    this.profileName = document.getElementById('profile-name');
    this.travelType = document.getElementById('travel-type');
    this.budgetRange = document.getElementById('budget-range');
    this.interests = document.getElementById('interests');
    this.lastUpdated = document.getElementById('last-updated');
    
    // Modal elements
    this.editProfileBtn = document.getElementById('edit-profile-btn');
    this.editProfileModal = document.getElementById('edit-profile-modal');
    this.closeModal = document.getElementById('close-modal');
    this.cancelEdit = document.getElementById('cancel-edit');
    this.profileEditForm = document.getElementById('profile-edit-form');
    
    // Quick action elements
    this.quickRecommendationsBtn = document.getElementById('quick-recommendations-btn');
    this.updatePhotoBtn = document.getElementById('update-photo-btn');
    
    // Content grids
    this.tripHistoryGrid = document.getElementById('trip-history-grid');
    this.savedDestinationsGrid = document.getElementById('saved-destinations-grid');
    this.recentRecommendationsGrid = document.getElementById('recent-recommendations-grid');
    
    // Edit form elements
    this.editName = document.getElementById('edit-name');
    this.editAgeGroup = document.getElementById('edit-age-group');
    this.editTravelType = document.getElementById('edit-travel-type');
    this.editBudgetRange = document.getElementById('edit-budget-range');
    this.editInterests = document.querySelectorAll('#edit-profile-modal input[name="interests"]');
  }

  bindEvents() {
    // Profile editing
    this.editProfileBtn.addEventListener('click', () => this.openEditModal());
    this.closeModal.addEventListener('click', () => this.closeEditModal());
    this.cancelEdit.addEventListener('click', () => this.closeEditModal());
    this.profileEditForm.addEventListener('submit', (e) => this.saveProfile(e));
    
    // Quick actions
    this.quickRecommendationsBtn.addEventListener('click', () => this.getQuickRecommendations());
    this.updatePhotoBtn.addEventListener('click', () => this.updatePhoto());
    
    // Modal backdrop click
    this.editProfileModal.addEventListener('click', (e) => {
      if (e.target === this.editProfileModal) {
        this.closeEditModal();
      }
    });
  }

  loadUserData() {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('wanderai_user_profile');
    if (savedProfile) {
      try {
        this.userProfile = JSON.parse(savedProfile);
        this.displayProfile();
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }

    // Load trip history
    this.loadTripHistory();
    
    // Load saved destinations
    this.loadSavedDestinations();
    
    // Load recent recommendations
    this.loadRecentRecommendations();
  }

  displayProfile() {
    if (!this.userProfile) {
      this.showNoProfileState();
      return;
    }

    // Update profile display
    this.profileName.textContent = this.userProfile.name || 'Traveler';
    this.travelType.textContent = this.formatTravelType(this.userProfile.travelType);
    this.budgetRange.textContent = this.formatBudgetRange(this.userProfile.budgetRange);
    this.interests.textContent = this.formatInterests(this.userProfile.interests);
    this.lastUpdated.textContent = this.formatDate(this.userProfile.lastUpdated);

    // Populate edit form
    this.populateEditForm();
  }

  showNoProfileState() {
    this.profileName.textContent = 'Traveler';
    this.travelType.textContent = 'Not set';
    this.budgetRange.textContent = 'Not set';
    this.interests.textContent = 'Not set';
    this.lastUpdated.textContent = 'Never';
  }

  formatTravelType(type) {
    const typeMap = {
      'solo': 'Solo Travel',
      'couple': 'Couple',
      'family': 'Family',
      'friends': 'Friends',
      'business': 'Business',
      'group': 'Group Tour'
    };
    return typeMap[type] || 'Not set';
  }

  formatBudgetRange(budget) {
    const budgetMap = {
      '500-1000': '$500 - $1,000',
      '1000-2500': '$1,000 - $2,500',
      '2500-5000': '$2,500 - $5,000',
      '5000-10000': '$5,000 - $10,000',
      '10000+': '$10,000+'
    };
    return budgetMap[budget] || 'Not set';
  }

  formatInterests(interests) {
    if (!interests || interests.length === 0) {
      return 'Not set';
    }
    return interests.slice(0, 3).join(', ') + (interests.length > 3 ? '...' : '');
  }

  formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  populateEditForm() {
    if (!this.userProfile) return;

    this.editName.value = this.userProfile.name || '';
    this.editAgeGroup.value = this.userProfile.ageGroup || '26-35';
    this.editTravelType.value = this.userProfile.travelType || 'solo';
    this.editBudgetRange.value = this.userProfile.budgetRange || '1000-2500';

    // Set interests checkboxes
    this.editInterests.forEach(checkbox => {
      checkbox.checked = this.userProfile.interests && 
                        this.userProfile.interests.includes(checkbox.value);
    });
  }

  openEditModal() {
    this.populateEditForm();
    this.editProfileModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  closeEditModal() {
    this.editProfileModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  async saveProfile(event) {
    event.preventDefault();

    const formData = new FormData(this.profileEditForm);
    const interests = Array.from(this.editInterests)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    const updatedProfile = {
      name: formData.get('name'),
      ageGroup: formData.get('ageGroup'),
      travelType: formData.get('travelType'),
      budgetRange: formData.get('budgetRange'),
      interests: interests,
      lastUpdated: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('wanderai_user_profile', JSON.stringify(updatedProfile));
    
    // Update current profile
    this.userProfile = updatedProfile;
    this.displayProfile();
    
    // Close modal
    this.closeEditModal();
    
    // Show success message
    this.showToast('Profile updated successfully!', 'success');
  }

  loadTripHistory() {
    const savedTrips = localStorage.getItem('wanderai_trip_history');
    if (savedTrips) {
      try {
        this.tripHistory = JSON.parse(savedTrips);
        this.displayTripHistory();
      } catch (error) {
        console.error('Error loading trip history:', error);
      }
    }
  }

  displayTripHistory() {
    if (!this.tripHistory || this.tripHistory.length === 0) {
      this.tripHistoryGrid.innerHTML = `
        <div class="no-trips-message">
          <i class="fas fa-suitcase"></i>
          <h3>No trips yet</h3>
          <p>Start planning your first adventure!</p>
          <a href="upload.html" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Plan Your First Trip
          </a>
        </div>
      `;
      return;
    }

    const tripsHTML = this.tripHistory.map(trip => `
      <div class="trip-card">
        <div class="trip-image">
          <img src="${trip.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'}" alt="${trip.destination}" />
        </div>
        <div class="trip-content">
          <h3 class="trip-title">${trip.destination}</h3>
          <p class="trip-dates">${this.formatDate(trip.startDate)} - ${this.formatDate(trip.endDate)}</p>
          <p class="trip-description">${trip.description || 'Amazing trip!'}</p>
          <div class="trip-meta">
            <span class="trip-status ${trip.status}">${trip.status}</span>
            <span class="trip-price">${trip.price || 'N/A'}</span>
          </div>
          <div class="trip-actions">
            <button class="btn btn-secondary btn-small" onclick="tripsPage.viewTrip('${trip.id}')">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button class="btn btn-primary btn-small" onclick="tripsPage.rebookTrip('${trip.id}')">
              <i class="fas fa-redo"></i>
              Rebook
            </button>
          </div>
        </div>
      </div>
    `).join('');

    this.tripHistoryGrid.innerHTML = tripsHTML;
  }

  loadSavedDestinations() {
    const savedDestinations = localStorage.getItem('wanderai_saved_destinations');
    if (savedDestinations) {
      try {
        this.savedDestinations = JSON.parse(savedDestinations);
        this.displaySavedDestinations();
      } catch (error) {
        console.error('Error loading saved destinations:', error);
      }
    }
  }

  displaySavedDestinations() {
    if (!this.savedDestinations || this.savedDestinations.length === 0) {
      this.savedDestinationsGrid.innerHTML = `
        <div class="no-destinations-message">
          <i class="fas fa-heart"></i>
          <h3>No saved destinations</h3>
          <p>Save destinations you love for future trips</p>
        </div>
      `;
      return;
    }

    const destinationsHTML = this.savedDestinations.map(destination => `
      <div class="destination-card">
        <img src="${destination.image_url}" alt="${destination.name}" class="destination-image" />
        <div class="destination-content">
          <h3 class="destination-title">${destination.name}</h3>
          <p class="destination-location">${destination.country}</p>
          <p class="destination-description">${destination.description}</p>
          <div class="destination-meta">
            <div class="destination-rating">
              <i class="fas fa-star"></i>
              <span>${destination.rating}</span>
            </div>
            <div class="destination-price">${destination.price}</div>
          </div>
          <div class="destination-actions">
            <button class="btn btn-primary btn-small" onclick="tripsPage.viewDestination('${destination.id}')">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button class="btn btn-secondary btn-small" onclick="tripsPage.removeSavedDestination('${destination.id}')">
              <i class="fas fa-heart-broken"></i>
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    this.savedDestinationsGrid.innerHTML = destinationsHTML;
  }

  loadRecentRecommendations() {
    const recentRecommendations = localStorage.getItem('wanderai_recent_recommendations');
    if (recentRecommendations) {
      try {
        this.recentRecommendations = JSON.parse(recentRecommendations);
        this.displayRecentRecommendations();
      } catch (error) {
        console.error('Error loading recent recommendations:', error);
      }
    }
  }

  displayRecentRecommendations() {
    if (!this.recentRecommendations || this.recentRecommendations.length === 0) {
      this.recentRecommendationsGrid.innerHTML = `
        <div class="no-recommendations-message">
          <i class="fas fa-star"></i>
          <h3>No recent recommendations</h3>
          <p>Get personalized recommendations based on your preferences</p>
          <button class="btn btn-primary" onclick="tripsPage.getQuickRecommendations()">
            <i class="fas fa-magic"></i>
            Get Recommendations
          </button>
        </div>
      `;
      return;
    }

    const recommendationsHTML = this.recentRecommendations.map(destination => `
      <div class="recommendation-card">
        <img src="${destination.image_url}" alt="${destination.name}" class="recommendation-image" />
        <div class="recommendation-content">
          <h3 class="recommendation-title">${destination.name}</h3>
          <p class="recommendation-location">${destination.country}</p>
          <p class="recommendation-description">${destination.description}</p>
          <div class="recommendation-meta">
            <div class="recommendation-rating">
              <i class="fas fa-star"></i>
              <span>${destination.rating}</span>
            </div>
            <div class="recommendation-price">${destination.price}</div>
          </div>
          <div class="recommendation-actions">
            <button class="btn btn-primary btn-small" onclick="tripsPage.viewDestination('${destination.id}')">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button class="btn btn-secondary btn-small" onclick="tripsPage.saveDestination('${destination.id}')">
              <i class="fas fa-heart"></i>
              Save
            </button>
          </div>
        </div>
      </div>
    `).join('');

    this.recentRecommendationsGrid.innerHTML = recommendationsHTML;
  }

  async getQuickRecommendations() {
    if (!this.userProfile) {
      this.showToast('Please set up your travel profile first', 'warning');
      return;
    }

    this.quickRecommendationsBtn.disabled = true;
    this.quickRecommendationsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
      const requestData = {
        ageGroup: this.userProfile.ageGroup,
        groupSize: this.userProfile.travelType,
        budgetRange: this.parseBudgetRange(this.userProfile.budgetRange),
        tripDuration: 'week',
        interests: this.userProfile.interests,
        additionalNotes: null
      };

      const response = await fetch(`http://localhost:8001/api/generate-personalized-recommendations`, {
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
        this.recentRecommendations = result.data.destinations || [];
        this.displayRecentRecommendations();
        
        // Save to localStorage
        localStorage.setItem('wanderai_recent_recommendations', JSON.stringify(this.recentRecommendations));
        
        this.showToast('New recommendations generated!', 'success');
      } else {
        throw new Error(result.error || 'No recommendations generated');
      }
    } catch (error) {
      console.error('Quick recommendations error:', error);
      this.showToast('Failed to generate recommendations', 'error');
    } finally {
      this.quickRecommendationsBtn.disabled = false;
      this.quickRecommendationsBtn.innerHTML = 'Get Recommendations';
    }
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

  updatePhoto() {
    // Navigate to upload page to update photo
    window.location.href = 'upload.html?update_photo=true';
  }

  viewTrip(tripId) {
    // Navigate to trip details page
    window.location.href = `booking.html?trip=${tripId}`;
  }

  rebookTrip(tripId) {
    // Navigate to booking page with trip data
    window.location.href = `booking.html?rebook=${tripId}`;
  }

  viewDestination(destinationId) {
    // Navigate to destination details
    window.location.href = `booking.html?destination=${destinationId}`;
  }

  saveDestination(destinationId) {
    const destination = this.recentRecommendations.find(d => d.id === destinationId);
    if (destination) {
      this.savedDestinations.push(destination);
      localStorage.setItem('wanderai_saved_destinations', JSON.stringify(this.savedDestinations));
      this.displaySavedDestinations();
      this.showToast('Destination saved!', 'success');
    }
  }

  removeSavedDestination(destinationId) {
    this.savedDestinations = this.savedDestinations.filter(d => d.id !== destinationId);
    localStorage.setItem('wanderai_saved_destinations', JSON.stringify(this.savedDestinations));
    this.displaySavedDestinations();
    this.showToast('Destination removed', 'info');
  }

  showToast(message, type = 'info') {
    // Use existing toast functionality from components.js
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize trips page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.tripsPage = new TripsPage();
});

// Export for global access
window.TripsPage = TripsPage;
