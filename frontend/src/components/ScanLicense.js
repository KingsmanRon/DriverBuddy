import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Scan, Camera, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ScanLicense = ({ onLicenseAdded }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef(null);
  const barkoderRef = useRef(null);
  const streamRef = useRef(null);

  const BARKODER_LICENSE_KEY = 'PEmBIohr9EZXgCkySoetbwP4gvOfMcGzgxKPL2X6uqNa5dug9oEmBFS54Ouy1T_9dqteqokJM0X8m_juthJ6SZbQ3GpPkJqJ4-kGFgSxCaw48QSVTc-lvtLOvG6NLmTrb-H3ZWQFts9xyLYbw0kb1sszQW_gmQuUfSqpbpLXztUzMg61cql-zF1RWsNMrEHDukOCsJjROrKyXIetfkK0ijwQfvUPJT3mJTocl_2QRBwCNo9uD1zSd7Eue7bzyPCpxUYnYfMq7RduRezfyrTPLQ..';

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

  const simulateScan = () => {
    const mockBarcodeData = `@\nANSI 636000010002DL00410278ZA03290015DLDAQD12345678\nDCSJOHN\nDDEN\nDACDOE\nDDFN\nDADMIDDLE\nDDGN\nDCAB\nDCBNONE\nDCDNONE\nDBD09012020\nDBB01011990\nDBA09012030\nDBC1\nDAU178 cm\nDAYBRN\nDAG123 MAIN STREET\nDAICAPE TOWN\nDAJWC\nDAK80001ZA0\nDCF83X20202Z1234567\nDCGZAF\nDCK12345678901234\nDDAM\nDDB09012018\nDDC09012020\n`;
    
    handleScanResult(mockBarcodeData);
  };

  return (
    <Card className="shadow-xl border-2 border-border/50 animate-slide-in">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Scan className="w-5 h-5 text-secondary" />
          </div>
          Scan License Barcode
        </CardTitle>
        <CardDescription className="text-base">
          Use your camera to scan the PDF417 barcode on the back of your driver's license
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isScanning && !scanSuccess && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">Ready to Scan</h3>
                  <p className="text-sm text-muted-foreground">
                    Position the barcode within the frame
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={startScanning}
                className="flex-1 h-12 text-base font-semibold bg-secondary hover:bg-secondary-light transition-colors"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </Button>
              
              <Button 
                onClick={simulateScan}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-2"
                size="lg"
              >
                <Scan className="w-5 h-5 mr-2" />
                Demo Scan
              </Button>
            </div>

            <Alert className="bg-secondary/5 border-secondary/20">
              <AlertCircle className="h-4 w-4 text-secondary" />
              <AlertDescription className="text-sm">
                For best results, ensure good lighting and hold the camera steady over the barcode.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-secondary shadow-glow">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-3/4 h-3/4 border-4 border-secondary rounded-lg">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  
                  <div className="absolute inset-x-0 h-1 bg-secondary shadow-glow scan-line"></div>
                </div>
              </div>
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </div>
            </div>

            <Button 
              onClick={stopScanning}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2"
              size="lg"
            >
              Cancel Scan
            </Button>
          </div>
        )}

        {scanSuccess && (
          <div className="text-center space-y-4 py-8 animate-slide-in">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Scan Successful!
              </h3>
              <p className="text-muted-foreground">
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
