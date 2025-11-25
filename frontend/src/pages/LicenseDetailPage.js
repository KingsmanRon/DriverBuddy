import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SAFlagShield from '../components/SAFlagShield';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Calendar, User, MapPin, CreditCard, CheckCircle, Hash, UserCircle } from 'lucide-react';

const LicenseDetailPage = () => {
  const [license, setLicense] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const licenses = JSON.parse(localStorage.getItem('driverLicenses') || '[]');
    const found = licenses.find(l => l.id === id);
    if (found) {
      setLicense(found);
    } else {
      navigate('/licenses');
    }
  }, [id, navigate]);

  if (!license) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = () => {
    return new Date(license.expiryDate) < new Date();
  };

  // Convert raw bitmap data to displayable image
  const convertRawBitmapToImage = (base64String, width, height) => {
    try {
      console.log('Converting raw bitmap to image:', width, 'x', height);

      // Decode base64 to binary
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('Decoded bytes length:', bytes.length);
      console.log('Expected pixels:', width * height);

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Create ImageData for grayscale bitmap
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Convert grayscale to RGBA
      for (let i = 0; i < bytes.length && i < width * height; i++) {
        const pixelValue = bytes[i];
        const offset = i * 4;
        data[offset] = pixelValue;     // R
        data[offset + 1] = pixelValue; // G
        data[offset + 2] = pixelValue; // B
        data[offset + 3] = 255;        // A (fully opaque)
      }

      // Put image data on canvas
      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to data URL (PNG format)
      const dataUrl = canvas.toDataURL('image/png');
      console.log('Successfully converted raw bitmap to PNG');
      console.log('Result data URL length:', dataUrl.length);

      return dataUrl;
    } catch (error) {
      console.error('Error converting raw bitmap:', error);
      return null;
    }
  };

  // Detect image format from base64 string and return appropriate data URL
  const getImageDataUrl = (base64String) => {
    if (!base64String) {
      console.log('getImageDataUrl: No base64 string provided');
      return null;
    }

    console.log('getImageDataUrl: Input length:', base64String.length);
    console.log('getImageDataUrl: First 50 chars:', base64String.substring(0, 50));

    // Remove any whitespace/newlines that might be in the base64 string
    const cleanBase64 = base64String.replace(/\s/g, '');
    console.log('getImageDataUrl: After cleaning, length:', cleanBase64.length);
    console.log('getImageDataUrl: After cleaning, first 50 chars:', cleanBase64.substring(0, 50));

    // Check if the base64 string already includes the data URL prefix
    if (cleanBase64.startsWith('data:image/')) {
      console.log('getImageDataUrl: Already has data URL prefix');
      return cleanBase64;
    }

    // Detect format from base64 magic bytes (first few characters)
    // JPEG: /9j/
    // PNG: iVBORw0KGgo
    // GIF: R0lGOD
    // BMP: Qk
    let detectedFormat = 'unknown';
    let dataUrl = null;

    if (cleanBase64.startsWith('/9j/')) {
      detectedFormat = 'JPEG';
      dataUrl = `data:image/jpeg;base64,${cleanBase64}`;
    } else if (cleanBase64.startsWith('iVBORw0KGgo') || cleanBase64.startsWith('iVBORw')) {
      detectedFormat = 'PNG';
      dataUrl = `data:image/png;base64,${cleanBase64}`;
    } else if (cleanBase64.startsWith('R0lGOD')) {
      detectedFormat = 'GIF';
      dataUrl = `data:image/gif;base64,${cleanBase64}`;
    } else if (cleanBase64.startsWith('Qk')) {
      detectedFormat = 'BMP';
      dataUrl = `data:image/bmp;base64,${cleanBase64}`;
    } else {
      // Unknown format - likely raw bitmap data from SADL
      console.log('getImageDataUrl: Unknown format detected - attempting raw bitmap conversion');

      // Try to get dimensions from license data (default to 200x250 for SA licenses)
      const width = license.imageWidth || 200;
      const height = license.imageHeight || 250;

      dataUrl = convertRawBitmapToImage(cleanBase64, width, height);

      if (dataUrl) {
        detectedFormat = 'Raw Bitmap (converted to PNG)';
      } else {
        console.error('Failed to convert raw bitmap');
        return null;
      }
    }

    console.log('getImageDataUrl: Detected format:', detectedFormat);
    console.log('getImageDataUrl: Final data URL length:', dataUrl?.length);

    return dataUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => navigate('/licenses')}
            variant="ghost"
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Licenses
          </Button>

          <div className="space-y-6">
            {/* License Card */}
            <Card className="shadow-2xl border-2 border-border/50 overflow-hidden animate-slide-in">
              <div className="h-32 bg-gradient-to-br from-primary via-primary-glow to-primary relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>
                <div className="absolute top-4 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border-2 border-white/30 overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <SAFlagShield className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">South Africa</p>
                    <p className="text-white text-lg font-display font-bold">Driver's License</p>
                  </div>
                </div>
                {!isExpired() && (
                  <div className="absolute top-4 right-6">
                    <Badge className="bg-success text-white border-0 shadow-md">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  </div>
                )}
                {isExpired() && (
                  <div className="absolute top-4 right-6">
                    <Badge className="bg-destructive text-white border-0 shadow-md">
                      Expired
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="pt-8 pb-6">
                <div className="text-center mb-8">
                  {license.photo ? (
                    <div className="w-32 h-40 rounded-lg overflow-hidden mx-auto mb-4 border-4 border-card shadow-xl">
                      <img
                        src={getImageDataUrl(license.photo)}
                        alt={license.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load photo:', e);
                          console.log('Photo data length:', license.photo?.length);
                          console.log('Photo data start:', license.photo?.substring(0, 100));
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/10 flex items-center justify-center mx-auto mb-4 border-4 border-card shadow-lg">
                      <User className="w-12 h-12 text-secondary" />
                    </div>
                  )}
                  <h2 className="text-3xl font-display font-bold text-foreground mb-1">
                    {license.fullName}
                  </h2>
                  <p className="text-muted-foreground font-medium">
                    License #{license.licenseNumber}
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* ID Number */}
                  {license.idNumber && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm font-semibold">ID Number</span>
                      </div>
                      <p className="text-lg font-bold text-foreground pl-6">
                        {license.idNumber}
                      </p>
                    </div>
                  )}

                  {/* License Number */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-semibold">License Number</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      {license.licenseNumber}
                    </p>
                  </div>

                  {/* Surname */}
                  {license.surname && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-semibold">Surname</span>
                      </div>
                      <p className="text-lg font-bold text-foreground pl-6">
                        {license.surname}
                      </p>
                    </div>
                  )}

                  {/* Initials */}
                  {license.initials && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <UserCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Initials</span>
                      </div>
                      <p className="text-lg font-bold text-foreground pl-6">
                        {license.initials}
                      </p>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Date of Birth</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      {formatDate(license.dateOfBirth)}
                    </p>
                  </div>

                  {/* Gender */}
                  {license.gender && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-semibold">Gender</span>
                      </div>
                      <p className="text-lg font-bold text-foreground pl-6 capitalize">
                        {license.gender}
                      </p>
                    </div>
                  )}

                  {/* License Class */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-semibold">License Class</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      Class {license.licenseClass}
                    </p>
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Issue Date</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      {formatDate(license.issueDate)}
                    </p>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Expiry Date</span>
                    </div>
                    <p className={`text-lg font-bold pl-6 ${isExpired() ? 'text-destructive' : 'text-foreground'}`}>
                      {formatDate(license.expiryDate)}
                    </p>
                  </div>

                  {/* Address */}
                  {license.address && (
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-semibold">Address</span>
                      </div>
                      <p className="text-lg font-bold text-foreground pl-6">
                        {license.address}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* License Type Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                {license.type === 'manual' ? 'Manually Added' : 'Scanned License'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseDetailPage;
