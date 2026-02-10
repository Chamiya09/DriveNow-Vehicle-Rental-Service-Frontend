# DriveEase - Premium Car Rental Platform

A fully responsive, modern, and production-grade car rental web application built with React, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

### User Features
- **Browse Vehicles**: Explore a diverse fleet with advanced filtering (category, price, rating)
- **Vehicle Details**: Detailed vehicle pages with specifications, features, and reviews
- **Booking System**: Multi-step booking flow with date selection, location entry, and payment UI
- **User Dashboard**: Manage bookings, view history, update profile, and leave reviews
- **Authentication**: Complete sign-in/sign-up system with password reset functionality

### Driver Features
- **Driver Portal**: Dedicated dashboard for drivers
- **Availability Management**: Control working hours and availability status
- **Trip Management**: View assigned bookings and track completed trips
- **Rating System**: Display driver ratings and reviews

### Admin Features
- **Analytics Dashboard**: Real-time statistics for users, drivers, vehicles, and bookings
- **User Management**: Full CRUD operations for user accounts
- **Driver Management**: Approve/manage driver registrations and licenses
- **Vehicle Management**: Add, edit, and remove vehicles from the fleet
- **Booking Oversight**: Monitor and manage all platform bookings
- **Review Moderation**: Approve and moderate user reviews

## 🎨 Design System

### Color Palette
- **Primary**: Deep Blue (`hsl(210, 100%, 45%)`) - Trust & Professionalism
- **Secondary**: Vibrant Teal (`hsl(195, 100%, 50%)`) - Modern & Fresh
- **Accent**: Energy Orange (`hsl(25, 95%, 55%)`) - Call-to-Action
- **Success**: Green (`hsl(142, 76%, 36%)`)
- **Warning**: Amber (`hsl(38, 92%, 50%)`)

### Design Features
- **Glassmorphism Effects**: Translucent cards with backdrop blur
- **Gradient Backgrounds**: Blue-to-teal hero gradients
- **Smooth Animations**: Framer Motion page transitions and interactions
- **Hover Effects**: Lift animations on cards and buttons
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode Ready**: Full theme support (not implemented in first version)

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── Navbar.tsx       # Global navigation with mobile menu
│   ├── Footer.tsx       # Site-wide footer
│   └── VehicleCard.tsx  # Reusable vehicle display card
├── pages/
│   ├── Index.tsx        # Landing page with hero & features
│   ├── Vehicles.tsx     # Vehicle listing with filters
│   ├── VehicleDetail.tsx # Individual vehicle page
│   ├── Auth.tsx         # Login/Signup page
│   ├── BookingFlow.tsx  # Multi-step booking process
│   ├── UserDashboard.tsx # User account management
│   └── AdminDashboard.tsx # Admin control panel
├── lib/
│   ├── data.ts          # Dummy data (vehicles, users, bookings)
│   └── utils.ts         # Utility functions
├── assets/
│   └── hero-car.jpg     # Generated hero image
└── index.css            # Global styles & design tokens
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Shadcn/UI** - Component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## 📄 Pages Overview

### Public Pages
1. **Landing Page** (`/`)
   - Hero section with premium car image
   - Featured vehicles showcase
   - Benefits & statistics
   - Call-to-action sections

2. **Vehicles** (`/vehicles`)
   - Grid view of all vehicles
   - Category filters (SUV, Sedan, Hatchback, Van, Luxury)
   - Price range filters
   - Search functionality
   - Sort options (price, rating, featured)

3. **Vehicle Detail** (`/vehicles/:id`)
   - High-resolution vehicle images
   - Specifications (seats, transmission, fuel type)
   - Feature list with icons
   - Customer reviews with ratings
   - Sticky booking sidebar
   - Related vehicles

4. **Authentication** (`/auth`)
   - Tabbed login/signup interface
   - Form validation
   - Password reset link
   - Driver login redirect

### User Pages
5. **User Dashboard** (`/dashboard/user`)
   - Booking statistics cards
   - Active bookings list with status badges
   - Booking history with filters
   - Profile management
   - Review submission

### Booking Flow
6. **Booking** (`/booking/:id`)
   - Step 1: Date selection with calendar
   - Step 2: Pickup/dropoff location
   - Step 3: Payment details (mock)
   - Booking summary sidebar
   - Price calculation
   - Progress indicator

### Admin Portal
7. **Admin Dashboard** (`/dashboard/admin`)
   - Overview with key metrics
   - Revenue analytics
   - User management table
   - Driver approval system
   - Vehicle inventory management
   - Booking oversight
   - Tabbed interface for different sections

## 🎭 Component Variants

### Button Variants
- `default` - Primary blue button
- `hero` - Gradient button with hover effect
- `secondary` - Light secondary button
- `outline` - Bordered transparent button
- `ghost` - Minimal button for text actions
- `destructive` - Red for delete actions
- `link` - Underlined text link

### Card Styles
- `glass-card` - Glassmorphism effect with blur
- `hover-lift` - Elevates on hover
- Standard cards with borders

## 📊 Dummy Data Structure

### Vehicles
- 8 sample vehicles across all categories
- Properties: name, category, price, rating, features, availability

### Users
- 2 sample users with booking history
- Properties: name, email, phone, profile image, join date

### Drivers
- 2 sample drivers with ratings
- Properties: name, license, rating, total trips, availability

### Bookings
- 3 sample bookings with different statuses
- Statuses: pending, confirmed, completed

### Reviews
- Vehicle and driver reviews with star ratings

## 🚦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open http://localhost:8080
   - Navigate through different pages
   - Test booking flow
   - Check admin dashboard at `/dashboard/admin`

## 🔐 Authentication Flow

The current implementation uses mock authentication:
- Login redirects to `/dashboard/user`
- Signup creates account and redirects
- Forms include validation
- Driver login redirect to driver portal (to be implemented)

**For production:** Integrate with backend authentication service (Firebase, Supabase, Auth0, etc.)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are fully responsive with mobile-first design.

## 🎨 Customization

### Colors
Update design tokens in `src/index.css`:
```css
:root {
  --primary: 210 100% 45%;
  --secondary: 195 100% 50%;
  --accent: 25 95% 55%;
}
```

### Animations
Configure in `tailwind.config.ts`:
```ts
animation: {
  "fade-in": "fade-in 0.4s ease-out",
  "scale-in": "scale-in 0.3s ease-out",
}
```

## 🚀 Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Deploy to Lovable:**
   - Click "Publish" button in Lovable interface
   - Or deploy to Vercel, Netlify, or other platforms

## 📝 Next Steps

### High Priority
- [ ] Connect to real backend API
- [ ] Implement actual authentication with Lovable Cloud
- [ ] Add database integration for bookings
- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] SMS notifications for booking confirmations

### Medium Priority
- [ ] Driver dashboard implementation
- [ ] Real-time availability tracking
- [ ] Advanced search with map integration
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] User profile image upload

### Future Enhancements
- [ ] Mobile app version
- [ ] AI-powered vehicle recommendations
- [ ] Loyalty program
- [ ] Referral system
- [ ] Insurance add-ons
- [ ] GPS tracking integration

## 🎯 SEO Optimization

The application includes:
- Semantic HTML structure
- Optimized meta tags
- Descriptive page titles
- Alt attributes on images
- Proper heading hierarchy (H1, H2, H3)
- Clean URL structure
- Mobile-responsive design
- Fast load times with Vite

## 📄 License

This project is built for demonstration purposes. Customize as needed for your use case.

## 🤝 Support

For questions or support:
- Check the Lovable documentation
- Join the Lovable Discord community
- Review the inline code comments

---

