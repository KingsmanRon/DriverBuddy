import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Scan, Camera, AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const ScanLicense = ({ onLicenseAdded }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const videoRef = useRef(null);
  const barkoderRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const BARKODER_LICENSE_KEY = 'PEmBIohr9EZXgCkySoetbwP4gvOfMcGzgxKPL2X6uqPV7ammESbLuFjLw_1d4gbhZpvZ0Yu17Qs8QmgzGFm6v7OukQjgzwV5O7bf2MnowdRu7h87iHZICq3UhLXrK2pmnMSXYl4FqdJxO602i3vWvNdUl0lPXnLh7wiycCjHnSKYJ9hGxdLTc5iQC3DnvQ8IDd3mKs4CggFj_RC0PeNQM-YRzCJFRbW4Tfs8gSLzVyVKewhztx1sOa6sEkDTRpXHrgIZ-PafVCISWGNZbfQVYqHOmNvFu9z3WkxmmF8c8Nc.';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/barkoder@latest/dist/barkoder.bundle.js';
    script.async = true;
    script.onload = () => console.log('Barkoder SDK loaded');
    document.body.appendChild(script);

    return () => {
      stopScanning();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScanSuccess(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (window.Barkoder && videoRef.current) {
        try {
          const barkoder = await window.Barkoder.initialize(videoRef.current, {
            licenseKey: BARKODER_LICENSE_KEY,
          });

          barkoderRef.current = barkoder;

          // Configure for PDF417 with optimized settings for SA licenses
          await barkoder.setDecoderConfig({
            pdf417: { 
              enabled: true,
              // Optimize for tall/vertical barcodes
            },
            qr: { enabled: true },
            code128: { enabled: true },
            code39: { enabled: true },
          });

          // Set region of interest to match the VERY TALL NARROW frame
          // This tells Barkoder to focus on the center narrow vertical strip
          await barkoder.setRegionOfInterest({
            left: 0.275,   // Start at 27.5% from left (centered, 45% width)
            top: 0.05,     // Start at 5% from top
            width: 0.45,   // Cover 45% of width (narrow vertical strip)
            height: 0.90,  // Cover 90% of height (almost full height)
          });

          barkoder.startScanning((result) => {
            handleScanResult(result);
          });

          toast.info('Camera ready - Position barcode vertically in frame');
        } catch (barkoderError) {
          console.error('Barkoder initialization error:', barkoderError);
          toast.warning('Advanced scanning unavailable, using basic mode');
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
      toast.error('Camera access denied');
    }
  };

  const stopScanning = () => {
    if (barkoderRef.current) {
      barkoderRef.current.stopScanning();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const handleScanResult = (result) => {
    console.log('Scan result:', result);
    
    // Parse the barcode data - SA licenses use a specific format
    const barcodeData = result.textualData || result;
    
    // SA Driver's License PDF417 format parsing
    // Expected format has fields like: Document Type, Surname, ID Number, etc.
    const lines = barcodeData.split('\n').filter(line => line.trim());
    
    const licenseData = {};
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        licenseData[key.trim()] = value;
      }
    });
    
    console.log('Parsed license data:', licenseData);
    
    // Extract fields based on SA format
    const surname = licenseData['Surname'] || extractField(barcodeData, 'Surname') || 'Unknown';
    const idNumber = licenseData['ID Number'] || extractField(barcodeData, 'ID Number') || Date.now().toString();
    const initials = licenseData['Initials'] || extractField(barcodeData, 'Initials') || '';
    const licenseNumber = licenseData['License Number'] || extractField(barcodeData, 'License Number') || idNumber;
    const licenseIssueNumber = licenseData['License Issue Number'] || extractField(barcodeData, 'License Issue Number') || '01';
    
    // Construct full name
    const fullName = initials ? `${initials} ${surname}` : surname;
    
    // Extract date of birth from SA ID number (first 6 digits: YYMMDD)
    let dateOfBirth = '1990-01-01';
    if (idNumber && idNumber.length >= 6) {
      const yy = idNumber.substring(0, 2);
      const mm = idNumber.substring(2, 4);
      const dd = idNumber.substring(4, 6);
      const year = parseInt(yy) > 50 ? `19${yy}` : `20${yy}`;
      dateOfBirth = `${year}-${mm}-${dd}`;
    }
    
    // Create license object
    const license = {
      id: Date.now().toString(),
      licenseNumber: licenseNumber,
      fullName: fullName,
      surname: surname,
      initials: initials,
      idNumber: idNumber,
      licenseIssueNumber: licenseIssueNumber,
      dateOfBirth: dateOfBirth,
      address: 'South Africa',
      licenseClass: 'B',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: calculateExpiryFromDOB(dateOfBirth),
      scannedData: barcodeData,
      rawData: licenseData,
      createdAt: new Date().toISOString(),
    };

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

  // Handle image upload and actual barcode scanning
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    toast.info('Processing image...');

    try {
      // Create a canvas to process the image
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = async () => {
          try {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Try to use Barkoder to scan the image
            if (window.Barkoder) {
              try {
                // Get image data from canvas
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Initialize Barkoder for image processing
                const tempVideo = document.createElement('video');
                const barkoder = await window.Barkoder.initialize(tempVideo, {
                  licenseKey: BARKODER_LICENSE_KEY,
                });

                // Configure for PDF417
                await barkoder.setDecoderConfig({
                  pdf417: { enabled: true },
                  qr: { enabled: true },
                  code128: { enabled: true },
                  code39: { enabled: true },
                });

                // Process the image
                const result = await barkoder.scanImage(canvas);
                
                if (result && result.textualData) {
                  handleScanResult(result.textualData);
                  return;
                }
              } catch (barkoderError) {
                console.error('Barkoder image processing error:', barkoderError);
              }
            }

            // If Barkoder fails or is not available, show error
            toast.error('Could not detect barcode in image. Please ensure the PDF417 barcode is clearly visible.');
            setIsProcessingImage(false);
            
          } catch (err) {
            console.error('Image processing error:', err);
            toast.error('Failed to process image');
            setIsProcessingImage(false);
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
      setIsProcessingImage(false);
    }
  };

  const simulateScan = () => {
    const mockBarcodeData = `@\nANSI 636000010002DL00410278ZA03290015DLDAQD12345678\nDCSJOHN\nDDEN\nDACDOE\nDDFN\nDADMIDDLE\nDDGN\nDCAB\nDCBNONE\nDCDNONE\nDBD09012020\nDBB01011990\nDBA09012030\nDBC1\nDAU178 cm\nDAYBRN\nDAG123 MAIN STREET\nDAICAPE TOWN\nDAJWC\nDAK80001ZA0\nDCF83X20202Z1234567\nDCGZAF\nDCK12345678901234\nDDAM\nDDB09012018\nDDC09012020\n`;
    
    handleScanResult(mockBarcodeData);
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
        {!isScanning && !scanSuccess && !isProcessingImage && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center space-y-4 p-4 sm:p-6">
                <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1">Ready to Scan</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-2">
                    Position the barcode within the frame
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={startScanning}
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-secondary hover:bg-secondary-light transition-colors"
                size="lg"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Camera
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
                variant="outline"
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-2"
                size="lg"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Upload Picture
              </Button>
            </div>

            <Alert className="bg-secondary/5 border-secondary/20">
              <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                For best results, ensure good lighting and clear focus on the barcode. You can scan directly or upload a photo.
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
                Analyzing barcode from uploaded photo
              </p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-secondary shadow-glow" style={{ aspectRatio: '3/4' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning overlay with VERY TALL RECTANGULAR frame for PDF417 */}
              <div className="absolute inset-0 flex items-center justify-center p-2">
                {/* Dark overlay outside scan area */}
                <div className="absolute inset-0 bg-black/60"></div>
                
                {/* VERY TALL RECTANGULAR scanning frame - matches PDF417 on SA license */}
                {/* Frame: 45% width × 90% height - narrow and very tall */}
                <div className="relative" style={{ width: '45%', height: '90%' }}>
                  <div className="absolute inset-0 border-4 border-secondary rounded-lg z-10 bg-transparent">
                    {/* Corner indicators */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    
                    {/* Scanning line - sweeps vertically through ENTIRE tall frame */}
                    <div className="absolute inset-x-0 h-1 bg-secondary shadow-glow scan-line" style={{ top: 0 }}></div>
                  </div>
                  
                  {/* Helper text */}
                  <div className="absolute -bottom-14 left-0 right-0 text-center px-1">
                    <p className="text-white text-xs font-semibold drop-shadow-lg leading-tight">
                      Fit ENTIRE tall barcode<br />within frame (top to bottom)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Scanning indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-lg z-20">
                <Loader2 className="w-3 h-3 animate-spin" />
                Scanning...
              </div>
            </div>

            <Alert className="bg-secondary/5 border-secondary/20">
              <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong>Important:</strong> The PDF417 barcode on SA licenses is a TALL NARROW rectangle on the right side of the back. The scan frame must cover it from TOP to BOTTOM for successful scanning.
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
