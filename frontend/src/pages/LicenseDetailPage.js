import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SAFlagShield from '../components/SAFlagShield';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Calendar, User, MapPin, CreditCard, CheckCircle } from 'lucide-react';

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
                  <div className="w-10 h-10 flex items-center justify-center">
                    <SAFlagShield className="w-full h-full" />
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
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/10 flex items-center justify-center mx-auto mb-4 border-4 border-card shadow-lg">
                    <User className="w-12 h-12 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-foreground mb-1">
                    {license.fullName}
                  </h2>
                  <p className="text-muted-foreground font-medium">
                    License #{license.licenseNumber}
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-semibold">License Class</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      Class {license.licenseClass}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Date of Birth</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      {formatDate(license.dateOfBirth)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Issue Date</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">
                      {formatDate(license.issueDate)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Expiry Date</span>
                    </div>
                    <p className={`text-lg font-bold pl-6 ${isExpired() ? 'text-destructive' : 'text-foreground'}`}>
                      {formatDate(license.expiryDate)}
                    </p>
                  </div>

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
