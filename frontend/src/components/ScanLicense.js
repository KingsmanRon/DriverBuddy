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

          await barkoder.setDecoderConfig({
            pdf417: { enabled: true },
            qr: { enabled: true },
            code128: { enabled: true },
            code39: { enabled: true },
          });

          barkoder.startScanning((result) => {
            handleScanResult(result);
          });

          toast.info('Camera ready - Point at license barcode');
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
    
    const barcodeData = result.textualData || result;
    
    const license = {
      id: Date.now().toString(),
      licenseNumber: extractLicenseNumber(barcodeData),
      fullName: extractFullName(barcodeData),
      dateOfBirth: extractDateOfBirth(barcodeData),
      address: extractAddress(barcodeData),
      licenseClass: extractLicenseClass(barcodeData),
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: extractExpiryDate(barcodeData),
      scannedData: barcodeData,
      createdAt: new Date().toISOString(),
    };

    const licenses = JSON.parse(localStorage.getItem('driverLicenses') || '[]');
    licenses.push(license);
    localStorage.setItem('driverLicenses', JSON.stringify(licenses));

    setScanSuccess(true);
    stopScanning();
    toast.success('License scanned successfully!');
    
    setTimeout(() => {
      onLicenseAdded?.();
    }, 1500);
  };

  const extractLicenseNumber = (data) => {
    const match = data.match(/DL(\d+)|([A-Z0-9]{8,})/);
    return match ? (match[1] || match[2]) : 'SCANNED-' + Date.now();
  };

  const extractFullName = (data) => {
    const match = data.match(/DAC([A-Z]+).*?DAD([A-Z]+)/);
    return match ? `${match[2]} ${match[1]}` : 'Scanned User';
  };

  const extractDateOfBirth = (data) => {
    const match = data.match(/DBB(\d{8})/);
    if (match) {
      const dob = match[1];
      return `${dob.substr(0,4)}-${dob.substr(4,2)}-${dob.substr(6,2)}`;
    }
    return '1990-01-01';
  };

  const extractAddress = (data) => {
    const match = data.match(/DAG([^\n]+)/);
    return match ? match[1].trim() : 'Scanned Address';
  };

  const extractLicenseClass = (data) => {
    const match = data.match(/DCA([A-Z0-9]+)/);
    return match ? match[1] : 'B';
  };

  const extractExpiryDate = (data) => {
    const match = data.match(/DBA(\d{8})/);
    if (match) {
      const exp = match[1];
      return `${exp.substr(0,4)}-${exp.substr(4,2)}-${exp.substr(6,2)}`;
    }
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);
    return futureDate.toISOString().split('T')[0];
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
            <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-secondary shadow-glow" style={{ aspectRatio: '16/9' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning overlay with wider frame for PDF417 */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {/* Dark overlay outside scan area */}
                <div className="absolute inset-0 bg-black/50"></div>
                
                {/* Wider scanning frame for PDF417 barcodes */}
                <div className="relative w-[90%] sm:w-[85%] aspect-[3/1] border-4 border-secondary rounded-lg z-10 bg-transparent">
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  
                  {/* Scanning line - vertical sweep */}
                  <div className="absolute inset-x-0 h-1 bg-secondary shadow-glow scan-line" style={{ top: 0 }}></div>
                  
                  {/* Helper text */}
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <p className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg">
                      Align PDF417 barcode horizontally within frame
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Scanning indicator */}
              <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-base font-semibold shadow-lg z-20">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                Scanning...
              </div>
            </div>

            <Alert className="bg-secondary/5 border-secondary/20">
              <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong>Tip:</strong> Hold your device steady and ensure the entire PDF417 barcode fits within the wide frame. The barcode is on the back of SA driver's licenses.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={stopScanning}
              variant="outline"
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-2"
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
