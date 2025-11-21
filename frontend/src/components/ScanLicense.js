import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Scan, Camera, AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import BarkoderSDK from 'barkoder-wasm';

const ScanLicense = ({ onLicenseAdded }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [barkoderInstance, setBarkoderInstance] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize Barkoder SDK
  useEffect(() => {
    const initializeBarkoder = async () => {
      try {
        console.log('Initializing Barkoder SDK...');

        // Get license key from environment
        const licenseKey = process.env.REACT_APP_BARKODER_LICENSE_KEY;

        if (!licenseKey) {
          throw new Error('Barkoder license key not found. Please set REACT_APP_BARKODER_LICENSE_KEY in .env file');
        }

        // Initialize Barkoder with license key
        // Note: Module.locateFile is configured globally in index.html to find WASM files
        const barkoder = await BarkoderSDK.initialize(licenseKey);

        console.log('Barkoder SDK initialized successfully');

        // Configure for PDF417 (primary format on SA driver's licenses)
        barkoder.setEnabledDecoders(
          barkoder.constants.Decoders.PDF417,
          barkoder.constants.Decoders.Code128,
          barkoder.constants.Decoders.Code39
        );

        // Set region of interest (focused scanning area)
        barkoder.setRegionOfInterest(10, 20, 80, 60);

        // Configure for better accuracy
        barkoder.setDecodingSpeed(barkoder.constants.DecodingSpeed.Slow); // Use slow for better accuracy
        barkoder.setCameraResolution(barkoder.constants.CameraResolution.FHD);
        barkoder.setRegionOfInterestVisible(true);

        // Enable maximum scanning sensitivity
        barkoder.setMaximumResultsCount(1);
        barkoder.setDuplicatesDelayMs(0);

        // Try to enable data formatting and parsing if available
        try {
          if (barkoder.constants.FormattingType && barkoder.setFormattingType) {
            barkoder.setFormattingType(barkoder.constants.FormattingType.Automatic);
            console.log('Formatting type set to Automatic');
          }
        } catch (e) {
          console.log('FormattingType not available:', e.message);
        }

        // Try to enable parsers if available (SADL for SA licenses, AAMVA for other licenses)
        try {
          if (barkoder.enableParser) {
            console.log('Attempting to enable Barkoder parsers...');
            // Enable SADL parser for South African Driver's License
            barkoder.enableParser(true);
            console.log('Barkoder parsers enabled');
          }
        } catch (e) {
          console.log('Parser configuration not available or failed:', e.message);
        }

        // Single scan mode (not continuous)
        barkoder.setContinuous(false);

        setBarkoderInstance(barkoder);
        setIsInitialized(true);

        console.log('Barkoder configured for PDF417 barcode scanning');
        toast.success('Scanner ready');
      } catch (err) {
        console.error('Barkoder initialization error:', err);
        setError(`Scanner initialization failed: ${err.message}`);
        toast.error('Failed to initialize barcode scanner');
      }
    };

    initializeBarkoder();

    // Cleanup on unmount
    return () => {
      if (barkoderInstance) {
        try {
          barkoderInstance.stopScanner();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  const startScanning = async () => {
    if (!barkoderInstance || !isInitialized) {
      toast.error('Scanner not ready. Please wait...');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setScanSuccess(false);

      toast.info('Starting camera...');

      // Start scanning with result callback
      barkoderInstance.startScanner((result) => {
        console.log('Barkoder scan result:', result);
        handleScanResult(result);
      });

      toast.success('Camera ready - Align barcode in frame');
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
      toast.error('Camera access failed');
    }
  };

  const stopScanning = () => {
    try {
      if (barkoderInstance && isScanning) {
        barkoderInstance.stopScanner();
        console.log('Scanner stopped');
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
    setIsScanning(false);
  };

  const handleScanResult = (result) => {
    console.log('Processing scan result:', result);
    console.log('Result object keys:', Object.keys(result));
    console.log('Full result object:', JSON.stringify(result, null, 2));

    // Get barcode data from result - check multiple possible properties
    const barcodeData = result.textualData || result.data || result.text || result.rawData || result;
    const barcodeType = result.barcodeTypeName || result.type || result.symbology || 'Unknown';

    console.log('Barcode type:', barcodeType);
    console.log('Barcode data (raw):', barcodeData);
    console.log('Barcode data type:', typeof barcodeData);
    console.log('Barcode data length:', barcodeData?.length || 0);

    // If result has extra data or parsed data, log that too
    if (result.extra) {
      console.log('Result extra data:', result.extra);
    }
    if (result.parsedData) {
      console.log('Result parsed data:', result.parsedData);
    }

    // Parse the barcode data - SA licenses use PDF417 format
    // The data structure follows AAMVA DL/ID Card Design Standard
    const lines = barcodeData.split('\n').filter(line => line.trim());

    const licenseData = {};
    lines.forEach(line => {
      // AAMVA uses 3-letter codes (e.g., DAA, DCS, etc.)
      if (line.length >= 3) {
        const code = line.substring(0, 3);
        const value = line.substring(3).trim();
        if (value) {
          licenseData[code] = value;
        }
      }

      // Also try key:value parsing for other formats
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        licenseData[key.trim()] = value;
      }
    });

    console.log('Parsed license data:', licenseData);

    // Extract fields using AAMVA standard codes
    // DCS = Last Name/Surname
    // DAC = First Name
    // DAD = Middle Name/Initials
    // DBB = Date of Birth (MMDDCCYY format)
    // DAQ = License Number
    // DBA = Expiration Date (MMDDCCYY)
    // DBD = Issue Date (MMDDCCYY)
    // DAG = Address Street
    // DAI = City
    // DAJ = State
    // DAK = Postal Code
    // DBC = Gender (1=M, 2=F)

    const surname = licenseData['DCS'] || licenseData['Surname'] || extractField(barcodeData, 'Surname') || 'Unknown';
    const firstName = licenseData['DAC'] || licenseData['First Name'] || extractField(barcodeData, 'First Name') || '';
    const initials = licenseData['DAD'] || licenseData['Initials'] || extractField(barcodeData, 'Initials') || '';
    const licenseNumber = licenseData['DAQ'] || licenseData['License Number'] || extractField(barcodeData, 'License Number') || Date.now().toString();
    const idNumber = licenseData['DCK'] || licenseData['ID Number'] || extractField(barcodeData, 'ID Number') || '';

    // Construct full name
    const fullName = firstName ? `${firstName} ${surname}` : (initials ? `${initials} ${surname}` : surname);

    // Parse dates (AAMVA format is MMDDCCYY)
    const parseDateAAMVA = (dateStr) => {
      if (!dateStr || dateStr.length < 8) return null;
      const mm = dateStr.substring(0, 2);
      const dd = dateStr.substring(2, 4);
      const ccyy = dateStr.substring(4, 8);
      return `${ccyy}-${mm}-${dd}`;
    };

    let dateOfBirth = parseDateAAMVA(licenseData['DBB']) || extractField(barcodeData, 'Date of Birth');

    // If DOB not found, try to extract from SA ID number (YYMMDD)
    if (!dateOfBirth && idNumber && idNumber.length >= 6) {
      const yy = idNumber.substring(0, 2);
      const mm = idNumber.substring(2, 4);
      const dd = idNumber.substring(4, 6);
      const year = parseInt(yy) > 50 ? `19${yy}` : `20${yy}`;
      dateOfBirth = `${year}-${mm}-${dd}`;
    }

    // Default if still not found
    if (!dateOfBirth) {
      dateOfBirth = '1990-01-01';
    }

    const issueDate = parseDateAAMVA(licenseData['DBD']) || new Date().toISOString().split('T')[0];
    const expiryDate = parseDateAAMVA(licenseData['DBA']) || calculateExpiryFromDOB(dateOfBirth);

    // Extract address
    const street = licenseData['DAG'] || '';
    const city = licenseData['DAI'] || '';
    const state = licenseData['DAJ'] || '';
    const postalCode = licenseData['DAK'] || '';
    const address = [street, city, state, postalCode].filter(Boolean).join(', ') || 'South Africa';

    // Extract license class
    const licenseClass = licenseData['DCA'] || 'B';

    // Create license object
    const license = {
      id: Date.now().toString(),
      licenseNumber: licenseNumber,
      fullName: fullName,
      surname: surname,
      firstName: firstName,
      initials: initials,
      idNumber: idNumber,
      dateOfBirth: dateOfBirth,
      address: address,
      licenseClass: licenseClass,
      issueDate: issueDate,
      expiryDate: expiryDate,
      barcodeType: barcodeType,
      scannedData: barcodeData,
      rawData: licenseData,
      createdAt: new Date().toISOString(),
    };

    console.log('Created license object:', license);

    // Store in localStorage
    const licenses = JSON.parse(localStorage.getItem('driverLicenses') || '[]');
    licenses.push(license);
    localStorage.setItem('driverLicenses', JSON.stringify(licenses));

    setScanSuccess(true);
    stopScanning();
    toast.success(`License scanned: ${fullName}`);

    setTimeout(() => {
      onLicenseAdded?.();
    }, 1500);
  };

  // Helper function to extract field from raw barcode data
  const extractField = (data, fieldName) => {
    const regex = new RegExp(`${fieldName}[:\\s]+([^\\n]+)`, 'i');
    const match = data.match(regex);
    return match ? match[1].trim() : null;
  };

  // Calculate expiry date from date of birth
  const calculateExpiryFromDOB = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    const expiryDate = new Date(today);
    if (age < 65) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    }

    return expiryDate.toISOString().split('T')[0];
  };

  // Handle image upload using Barkoder
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!barkoderInstance || !isInitialized) {
      toast.error('Scanner not ready. Please wait...');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setIsProcessingImage(true);
    setError(null);
    toast.info('Processing image...');

    try {
      console.log('Scanning image file for barcode...');

      // Temporarily disable ROI for full-image scanning
      const originalROI = { x: 10, y: 20, width: 80, height: 60 };
      barkoderInstance.setRegionOfInterest(0, 0, 100, 100);
      console.log('ROI set to full image for scanning');

      // Create image element to load the file
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          console.log(`Image loaded: ${img.width}x${img.height}px`);

          // Function to preprocess and scan image
          const preprocessAndScan = async (enhanceContrast = false, convertToGrayscale = false) => {
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            // Upscale small images for better detection (minimum 1000px width)
            const minWidth = 1000;
            let targetWidth = img.width;
            let targetHeight = img.height;

            if (img.width < minWidth) {
              const scale = minWidth / img.width;
              targetWidth = minWidth;
              targetHeight = Math.floor(img.height * scale);
              console.log(`Upscaling image from ${img.width}x${img.height} to ${targetWidth}x${targetHeight}`);
            }

            // Set canvas dimensions
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Draw image to canvas (with scaling if needed)
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Apply image enhancements if requested
            if (enhanceContrast || convertToGrayscale) {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;

              for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                if (convertToGrayscale) {
                  // Convert to grayscale
                  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                  r = g = b = gray;
                }

                if (enhanceContrast) {
                  // Increase contrast (factor 1.5)
                  const factor = 1.5;
                  r = Math.min(255, Math.max(0, ((r - 128) * factor) + 128));
                  g = Math.min(255, Math.max(0, ((g - 128) * factor) + 128));
                  b = Math.min(255, Math.max(0, ((b - 128) * factor) + 128));
                }

                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
              }

              ctx.putImageData(imageData, 0, 0);
              console.log(`Applied enhancements: contrast=${enhanceContrast}, grayscale=${convertToGrayscale}`);
            }

            // Get image data URL
            const imageDataURL = canvas.toDataURL('image/png');
            console.log('Image converted to data URL, scanning...');

            // Scan the image using Barkoder
            const result = await barkoderInstance.scanImage(imageDataURL);
            console.log('Barkoder image scan result:', result);

            return result;
          };

          // Try multiple scanning strategies
          let result = null;

          // Strategy 1: Original image
          console.log('Strategy 1: Scanning original/upscaled image...');
          result = await preprocessAndScan(false, false);

          // Strategy 2: Enhanced contrast if first attempt failed
          if (!result || result.resultsCount === 0) {
            console.log('Strategy 2: Scanning with enhanced contrast...');
            result = await preprocessAndScan(true, false);
          }

          // Strategy 3: Grayscale + enhanced contrast if still no result
          if (!result || result.resultsCount === 0) {
            console.log('Strategy 3: Scanning grayscale with enhanced contrast...');
            result = await preprocessAndScan(true, true);
          }

          // Clean up
          URL.revokeObjectURL(imageUrl);

          // Restore original ROI for camera scanning
          barkoderInstance.setRegionOfInterest(
            originalROI.x,
            originalROI.y,
            originalROI.width,
            originalROI.height
          );

          // Check if barcode was detected
          if (result && result.resultsCount > 0 && (result.textualData || result.data)) {
            console.log('Barcode detected successfully');
            handleScanResult(result);
            setIsProcessingImage(false);
          } else {
            console.warn('No barcode detected after trying all strategies');
            setError('No PDF417 barcode detected. Please ensure: (1) The barcode is clearly visible and in focus, (2) Good lighting without glare, (3) The image is not blurry.');
            toast.error('No barcode detected - Try taking a clearer photo');
            setIsProcessingImage(false);
          }
        } catch (err) {
          console.error('Image scanning error:', err);
          URL.revokeObjectURL(imageUrl);

          // Restore original ROI
          barkoderInstance.setRegionOfInterest(
            originalROI.x,
            originalROI.y,
            originalROI.width,
            originalROI.height
          );

          setError('Could not detect PDF417 barcode. Ensure the barcode is clearly visible and in focus.');
          toast.error('Barcode detection failed');
          setIsProcessingImage(false);
        }
      };

      img.onerror = () => {
        console.error('Failed to load image');
        URL.revokeObjectURL(imageUrl);
        toast.error('Failed to load image file');
        setIsProcessingImage(false);
      };

      img.src = imageUrl;

    } catch (err) {
      console.error('Image processing error:', err);
      setError('Could not process image. Please try again.');
      toast.error('Image processing failed');
      setIsProcessingImage(false);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-border/50 animate-slide-in">
      <CardHeader className="space-y-2 pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-display flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Scan className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
          </div>
          <span className="leading-tight">Scan License Barcode</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Use your camera to scan the PDF417 barcode or upload a clear photo of your driver's license
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barkoder scanner container */}
        <div
          id="barkoder-container"
          className={`${isScanning ? 'block' : 'hidden'} relative w-full rounded-xl overflow-hidden border-2 border-secondary shadow-glow`}
          style={{ minHeight: '400px' }}
        />

        {!isScanning && !scanSuccess && !isProcessingImage && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center space-y-4 p-4 sm:p-6">
                <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1">
                    {isInitialized ? 'Ready to Scan' : 'Initializing Scanner...'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-2">
                    {isInitialized
                      ? 'Position the PDF417 barcode within the frame'
                      : 'Please wait while the scanner loads...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={startScanning}
                disabled={!isInitialized}
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-secondary hover:bg-secondary-light transition-colors disabled:opacity-50"
                size="lg"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {isInitialized ? 'Start Camera' : 'Loading Scanner...'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isInitialized}
                variant="outline"
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-2 disabled:opacity-50"
                size="lg"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Upload Picture
              </Button>
            </div>

            <Alert className="bg-secondary/5 border-secondary/20">
              <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong>Barkoder SDK Active:</strong> Professional-grade PDF417 scanning for SA driver's licenses. Ensure good lighting and clear focus on the barcode.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isProcessingImage && (
          <div className="text-center space-y-4 py-8 animate-slide-in">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-secondary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-2">
                Processing Image...
              </h3>
              <p className="text-sm text-muted-foreground">
                Analyzing PDF417 barcode from uploaded photo
              </p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <Alert className="bg-secondary/5 border-secondary/20">
              <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong>Tip:</strong> The PDF417 barcode on SA licenses is a tall, narrow rectangle on the back of the card. Center it in the scanning frame for best results.
              </AlertDescription>
            </Alert>

            <Button
              onClick={stopScanning}
              variant="outline"
              className="w-full h-11 text-sm font-semibold border-2"
              size="lg"
            >
              Cancel Scan
            </Button>
          </div>
        )}

        {scanSuccess && (
          <div className="text-center space-y-4 py-8 animate-slide-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-2">
                Scan Successful!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your license has been added. Redirecting...
              </p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanLicense;
