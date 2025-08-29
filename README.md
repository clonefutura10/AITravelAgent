# WanderAI - Your Personal Travel Companion

WanderAI is an AI-powered travel planning platform that transforms how people plan and book their trips. Instead of endless research and juggling multiple websites, users simply upload a photo, tell us their preferences once, and get personalized recommendations with instant booking capabilities.

## 🚀 Key Features

### **One-Time Profile Setup**
- Upload a photo of yourself or a destination you love
- Tell us your travel preferences once (age group, travel type, budget, interests)
- We remember everything for all future trips
- No more repetitive form filling

### **AI-Powered Intelligence**
- Advanced AI analyzes your photo and preferences
- Generates personalized destination recommendations
- Learns from your choices to get smarter over time
- Context-aware suggestions based on your travel style

### **Seamless Booking Experience**
- Book flights, hotels, activities, and more in one place
- Integrated with leading travel providers
- Real-time pricing and availability
- Secure payment processing

### **Smart Memory System**
- Your travel profile is saved and remembered
- Quick access to recent recommendations
- Save favorite destinations for future trips
- View trip history and rebook easily

## 🎯 User Journey

### Step 1: Photo Upload & Profile Setup
1. Upload a photo (selfie or destination photo)
2. Fill out travel preferences once:
   - Name and age group
   - Travel type (Solo, Couple, Family, Friends, Business)
   - Budget range
   - Travel interests (Beach, Adventure, Luxury, Heritage, Food, etc.)
   - Trip duration and dates (optional)

### Step 2: AI Analysis
- AI analyzes your photo and preferences
- Generates personalized destination recommendations
- Creates custom itineraries based on your interests
- Provides budget breakdown and travel tips

### Step 3: Instant Booking
- Browse personalized recommendations
- Book flights, hotels, and activities instantly
- Everything in one place, no more juggling multiple sites
- Secure booking with real-time confirmation

### Step 4: Trip Management
- View all your trips in one dashboard
- Access saved destinations and preferences
- Get new recommendations based on your profile
- Rebook previous trips with one click

## 🛠️ Technical Architecture

### Frontend
- **HTML5/CSS3/JavaScript**: Modern, responsive web application
- **Progressive Web App**: Works offline and on mobile devices
- **Local Storage**: Saves user preferences and trip data locally
- **Real-time Updates**: Live booking status and recommendations

### Backend
- **FastAPI**: High-performance Python web framework
- **OpenAI Integration**: GPT-3.5 for intelligent recommendations
- **Image Processing**: AI-powered photo analysis
- **Amadeus API**: Real flight and hotel data
- **Supabase**: Database and authentication

### AI Features
- **Photo Analysis**: Understands travel style from photos
- **Preference Learning**: Gets smarter with each trip
- **Contextual Recommendations**: Tailored to user's specific needs
- **Natural Language Processing**: Conversational booking experience

## 🎨 Design Philosophy

### User-Centric Approach
- **One-time setup**: Tell us once, we remember forever
- **Contextual intelligence**: AI understands your travel style
- **Seamless experience**: No friction between planning and booking
- **Personal touch**: Every recommendation is tailored to you

### Modern UI/UX
- **Clean, intuitive interface**: Easy to use for all ages
- **Mobile-first design**: Works perfectly on all devices
- **Visual storytelling**: Beautiful imagery and smooth animations
- **Accessibility**: Inclusive design for all users

## 📱 Key Pages

### Landing Page (`index.html`)
- Compelling hero section with clear value proposition
- How it works explanation
- Feature highlights and testimonials
- Clear call-to-action buttons

### Planning Page (`upload.html`)
- Photo upload with drag-and-drop
- Comprehensive profile setup form
- Real-time form validation
- Progress tracking through the planning journey

### My Trips (`visualizations.html`)
- User profile dashboard
- Trip history and saved destinations
- Quick actions for new trips
- Recent recommendations

### Booking Page (`booking.html`)
- Integrated flight and hotel search
- Real-time pricing and availability
- Secure payment processing
- Booking confirmation and management

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Supabase account
- OpenAI API key
- Amadeus API credentials

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
# Open index.html in a web browser
# Or serve with a local server
python -m http.server 8000
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
```

## 🚀 Deployment

### Render Deployment
The application is configured for deployment on Render:
- Backend: FastAPI application with automatic scaling
- Frontend: Static site hosting
- Database: Supabase for data persistence

### Environment Configuration
- Set all required environment variables in Render dashboard
- Configure CORS settings for production domains
- Set up SSL certificates for secure connections

## 📊 Business Model

### Revenue Streams
1. **Commission on Bookings**: Earn from flight, hotel, and activity bookings
2. **Premium Features**: Advanced AI recommendations and priority support
3. **Travel Insurance**: Integrated insurance products
4. **Affiliate Partnerships**: Commission from travel partners

### Target Market
- **Primary**: Tech-savvy travelers aged 25-45
- **Secondary**: Families and business travelers
- **Geographic**: Global market with focus on English-speaking countries

### Competitive Advantages
- **AI-Powered Personalization**: Unique recommendation engine
- **One-Time Setup**: Eliminates repetitive form filling
- **Integrated Booking**: End-to-end travel planning experience
- **Smart Memory**: Learns and improves with each trip

## 🔮 Future Roadmap

### Phase 1: Core Platform (Current)
- ✅ User profile setup and management
- ✅ AI-powered recommendations
- ✅ Basic booking integration
- ✅ Trip history and management

### Phase 2: Enhanced AI (Q2 2024)
- 🔄 Advanced photo analysis
- 🔄 Conversational AI assistant
- 🔄 Predictive travel suggestions
- 🔄 Social travel features

### Phase 3: Advanced Features (Q3 2024)
- 📋 Group travel planning
- 📋 Real-time travel alerts
- 📋 Virtual travel experiences
- 📋 Advanced analytics dashboard

### Phase 4: Global Expansion (Q4 2024)
- 🌍 Multi-language support
- 🌍 Local travel partnerships
- 🌍 Mobile app development
- 🌍 Enterprise solutions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@wanderai.com
- **Documentation**: [docs.wanderai.com](https://docs.wanderai.com)
- **Community**: [community.wanderai.com](https://community.wanderai.com)

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Amadeus for travel data
- Supabase for backend services
- All our beta users and contributors

---

**WanderAI** - Making travel planning effortless, one trip at a time. ✈️
