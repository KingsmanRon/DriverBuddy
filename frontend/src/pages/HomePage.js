import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ManualUpload from '../components/ManualUpload';
import ScanLicense from '../components/ScanLicense';
import Header from '../components/Header';
import { Shield, Scan, Upload } from 'lucide-react';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const navigate = useNavigate();

  const handleLicenseAdded = () => {
    navigate('/licenses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-primary pt-20 pb-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 animate-slide-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              SA Driver's License
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium">
              Secure, verified digital identification for modern drivers
            </p>
            
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-sm font-medium">Secure Storage</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-sm font-medium">Instant Scan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-card shadow-lg border border-border rounded-xl p-1.5">
              <TabsTrigger 
                value="scan" 
                className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-lg transition-all duration-300"
              >
                <Scan className="w-5 h-5" />
                Scan License
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-lg transition-all duration-300"
              >
                <Upload className="w-5 h-5" />
                Manual Upload
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="scan" className="m-0 animate-slide-in">
                <ScanLicense onLicenseAdded={handleLicenseAdded} />
              </TabsContent>

              <TabsContent value="manual" className="m-0 animate-slide-in">
                <ManualUpload onLicenseAdded={handleLicenseAdded} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
