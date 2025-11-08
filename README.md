# Food Scanner App 📱

A comprehensive mobile application for scanning barcodes and analyzing food products. Built with React Native, Expo, and TypeScript, this app helps users make informed decisions about their food choices by providing detailed nutrition information, health scores, and calorie tracking.

## 🌟 Features

### 📷 Barcode Scanning
- **Camera-based scanning**: Scan product barcodes using your device's camera
- **Manual lookup**: Enter barcode numbers manually for quick product search
- **Real-time product lookup**: Instantly fetch product information from OpenFoodFacts database

### 📊 Product Information
- **Detailed nutrition facts**: View comprehensive nutritional information including calories, macros, vitamins, and minerals
- **Health score calculation**: Get an intelligent health score (A-E) based on nutritional content
- **Product images**: High-quality product images for easy identification
- **Ingredient analysis**: View complete ingredient lists and allergen information
- **Nutri-Score & Eco-Score**: Display official Nutri-Score and Eco-Score ratings
- **NOVA classification**: See ultra-processed food classification

### 📈 Calorie Tracking
- **Daily calorie goals**: Set personalized calorie goals based on your profile (maintenance, cutting, or bulking)
- **Real-time tracking**: Track calories consumed throughout the day
- **Visual progress indicators**: Circular progress charts showing daily calorie intake
- **Nutrition tracking**: Monitor macros (protein, carbs, fats) and other nutrients
- **Food history**: View all tracked foods with timestamps

### ⭐ Favorites
- **Save products**: Save your favorite products for quick access
- **Easy management**: Add or remove favorites with a single tap

### 📜 History
- **Scan history**: View all previously scanned products
- **Quick access**: Easily revisit products you've scanned before
- **Auto-saved**: All scans are automatically saved to history

### 🔍 Compare Products
- **Side-by-side comparison**: Compare up to 3 products simultaneously
- **Nutritional comparison**: Compare calories, macros, vitamins, and minerals
- **Easy selection**: Add products to comparison from product details or history

### 👤 User Profile
- **Personal information**: Set age, height, weight, and gender
- **Activity level**: Configure activity level (sedentary, light, moderate, active, very active)
- **Calorie goals**: Automatic calculation of maintenance, cutting, and bulking calories
- **BMI calculation**: View your Body Mass Index
- **Daily tracking dashboard**: Monitor your daily nutrition intake and progress

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Install Node.js with nvm](https://github.com/nvm-sh/nvm)
- **Bun** - [Install Bun](https://bun.sh/docs/installation)
- **Expo Go** app on your mobile device (iOS/Android) - [Download from App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ayushkoli/Food-Scanner-App.git
   cd Food-Scanner-App
   ```

2. **Install dependencies**:
   ```bash
   npm i
   ```

3. **Start the development server**:
   ```bash
   npm run start
   ```

4. **Run on your device**:
   - **iOS**: Press `i` in the terminal to open iOS Simulator, or scan the QR code with Expo Go app
   - **Android**: Press `a` in the terminal to open Android Emulator, or scan the QR code with Expo Go app
   - **Web**: Run `bun run start-web` to test in your browser

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile development framework
- **Expo** - React Native framework and platform
- **Expo Router** - File-based routing system for React Native
- **TypeScript** - Type-safe JavaScript
- **Expo Camera** - Camera functionality for barcode scanning
- **AsyncStorage** - Local data persistence
- **React Query** - Server state management
- **Lucide React Native** - Beautiful icon library
- **React Native Chart Kit** - Data visualization
- **OpenFoodFacts API** - Product database and nutrition information

## 📱 Platform Support

- ✅ **iOS** - Full support with native camera integration
- ✅ **Android** - Full support with native camera integration
- ✅ **Web** - Browser support (limited camera functionality)

## 📁 Project Structure

```
├── app/                      # App screens (Expo Router)
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── scan.tsx         # Barcode scanning screen
│   │   ├── history.tsx      # Scan history screen
│   │   ├── favorites.tsx    # Favorite products screen
│   │   ├── compare.tsx      # Product comparison screen
│   │   ├── profile.tsx      # User profile and tracking screen
│   │   └── _layout.tsx      # Tab layout configuration
│   ├── product/             # Product detail screens
│   │   └── [code].tsx       # Dynamic product detail page
│   ├── _layout.tsx          # Root layout
│   └── +not-found.tsx       # 404 screen
├── assets/                  # Static assets
│   └── images/             # App icons and images
├── constants/              # App constants and configuration
│   └── colors.ts           # Color palette
├── contexts/               # React contexts
│   └── FoodScannerContext.tsx  # Main app context (state management)
├── types/                  # TypeScript type definitions
│   ├── product.ts          # Product-related types
│   └── profile.ts          # User profile types
├── utils/                  # Utility functions
│   ├── healthScore.ts      # Health score calculation
│   └── calorieCalculation.ts  # Calorie goal calculations
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🎯 Key Features Explained

### Health Score Algorithm
The app calculates a health score (0-100) based on:
- Sugar content (penalizes high sugar, rewards low sugar)
- Salt content (penalizes high salt, rewards low salt)
- Calorie density
- Fat content (saturated vs unsaturated)
- Protein content (rewards high protein)
- Fiber content (rewards high fiber)
- Processing level (NOVA classification)
- Nutri-Score grade

### Calorie Goal Calculation
Calorie goals are calculated using the Mifflin-St Jeor equation:
- **Maintenance**: Calories needed to maintain current weight
- **Cutting**: 500 calories below maintenance (for weight loss)
- **Bulking**: 500 calories above maintenance (for weight gain)

Factors considered:
- Age, height, weight, gender
- Activity level (sedentary to very active)
- Basal Metabolic Rate (BMR)
- Total Daily Energy Expenditure (TDEE)

## 📦 Available Scripts

- `bun run start` - Start Expo development server
- `bun run start-web` - Start web development server
- `bun run start-tunnel` - Start with tunnel mode (for testing on devices outside local network)
- `bun run lint` - Run ESLint to check code quality

## 🔐 Permissions

The app requires the following permissions:
- **Camera**: For barcode scanning
- **Photo Library** (iOS): For accessing saved images
- **Storage** (Android): For accessing saved images

## 🌐 API Integration

The app uses the [OpenFoodFacts API](https://world.openfoodfacts.org/) to fetch product information:
- Free and open-source database
- Comprehensive product information
- Updated regularly by the community
- No API key required

## 🚢 Deployment

### iOS (App Store)

1. **Install EAS CLI**:
   ```bash
   bun i -g @expo/eas-cli
   ```

2. **Configure your project**:
   ```bash
   eas build:configure
   ```

3. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

4. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

### Android (Google Play)

1. **Build for Android**:
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play**:
   ```bash
   eas submit --platform android
   ```

### Web Deployment

1. **Build for web**:
   ```bash
   eas build --platform web
   ```

2. **Deploy with EAS Hosting**:
   ```bash
   eas hosting:configure
   eas hosting:deploy
   ```

Or deploy to:
- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Connect GitHub repo for automatic deployments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- [OpenFoodFacts](https://world.openfoodfacts.org/) - For providing the product database
- [Expo](https://expo.dev/) - For the amazing development platform
- [React Native](https://reactnative.dev/) - For the cross-platform framework

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Made with ❤️ using React Native and Expo**
