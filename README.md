# iDriveZA - Digital Driver's License App

A modern, Progressive Web App (PWA) for storing and managing digital driver's licenses with professional-grade PDF417 barcode scanning powered by Barkoder.

## Project Structure

```
/app/
├── frontend/           # React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # HomePage, LicensesPage, LicenseDetailPage
│   │   ├── App.js
│   │   └── index.css    # Design system with SA colors
│   ├── public/
│   ├── .env            # Environment variables (license keys)
│   ├── .env.example    # Template for environment setup
│   └── package.json
│
├── backend/            # FastAPI (currently basic)
│   └── requirements.txt
```

## Setup Instructions

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Barkoder License Key:**
   - Copy `.env.example` to `.env`
   - Add your Barkoder license key to `.env`:
     ```
     REACT_APP_BARKODER_LICENSE_KEY=your_license_key_here
     ```

3. **Start the app:**
   ```bash
   npm start  # Runs on http://localhost:3000
   ```

### Backend Setup (Optional)

```bash
cd backend
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8001
```

## Features

✅ **Fully Functional:**
- Professional PDF417 barcode scanning with Barkoder SDK
- Full UI/UX design (navy/teal SA theme)
- Manual license upload form
- My Licenses page with all stored licenses
- Detailed license view with all information
- Camera scanning and image upload support
- Mobile responsive design
- PWA manifest for installable app
- SA flag components and theming
- LocalStorage persistence

✅ **Barcode Scanning:**
- Powered by Barkoder WASM SDK
- Supports PDF417 (primary format for SA driver's licenses)
- Also supports: Code128, Code39, QR Code, DataMatrix, Aztec
- AAMVA DL/ID Card Design Standard parsing
- Real-time camera scanning
- Image upload scanning
- Optimized for driver's license barcodes

## How It Works

1. **Scan or Upload:** Use your device camera to scan the PDF417 barcode on the back of your driver's license, or upload a photo
2. **Auto-Parse:** The app automatically extracts all license information including name, ID number, address, license class, dates, etc.
3. **Store Securely:** License data is stored locally on your device in browser LocalStorage
4. **View Anytime:** Access all your stored licenses from the "My Licenses" page

## Technology Stack

- **Frontend:** React 19, TailwindCSS, Radix UI components
- **Barcode Scanning:** Barkoder WASM SDK (professional-grade PDF417 support)
- **State Management:** React Hooks & LocalStorage
- **Styling:** Tailwind CSS with custom SA color scheme
- **Icons:** Lucide React
- **Notifications:** Sonner toast library

## Next Steps

- Test barcode scanning with real SA driver's licenses
- Add authentication and cloud sync (optional)
- Implement backend API for license verification (optional)
- Add support for multiple countries/license formats
- Create native mobile apps with React Native
