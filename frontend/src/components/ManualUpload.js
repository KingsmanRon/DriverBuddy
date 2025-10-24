import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Upload, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const ManualUpload = ({ onLicenseAdded }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    fullName: '',
    dateOfBirth: '',
    licenseClass: '',
    address: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (value) => {
    setFormData(prev => ({ ...prev, licenseClass: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.licenseNumber || !formData.fullName || !formData.dateOfBirth || !formData.licenseClass) {
      toast.error('Please fill in all required fields');
      return;
    }

    const license = {
      id: Date.now().toString(),
      ...formData,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: calculateExpiryDate(formData.dateOfBirth),
      createdAt: new Date().toISOString(),
      type: 'manual',
    };

    const licenses = JSON.parse(localStorage.getItem('driverLicenses') || '[]');
    licenses.push(license);
    localStorage.setItem('driverLicenses', JSON.stringify(licenses));

    toast.success('License added successfully!');
    setShowDialog(false);
    setFormData({
      licenseNumber: '',
      fullName: '',
      dateOfBirth: '',
      licenseClass: '',
      address: '',
    });
    
    setTimeout(() => {
      onLicenseAdded?.();
    }, 500);
  };

  const calculateExpiryDate = (dob) => {
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

  return (
    <>
      <Card className="shadow-xl border-2 border-border/50 animate-slide-in">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-secondary" />
            </div>
            Manual License Upload
          </CardTitle>
          <CardDescription className="text-base">
            Manually enter your driver's license information
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/10 flex items-center justify-center mx-auto">
              <Plus className="w-10 h-10 text-secondary" />
            </div>
            
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Add Your License
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click the button below to manually enter your driver's license details
              </p>
            </div>

            <Button 
              onClick={() => setShowDialog(true)}
              className="h-12 px-8 text-base font-semibold bg-secondary hover:bg-secondary-light transition-colors"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New License
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Add Driver License</DialogTitle>
            <DialogDescription>
              Enter your driver's license information below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-sm font-semibold">
                License Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                placeholder="Enter license number"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseClass" className="text-sm font-semibold">
                  License Class <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.licenseClass} onValueChange={handleClassChange} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Class A - Motorcycles</SelectItem>
                    <SelectItem value="A1">Class A1 - Light Motorcycles</SelectItem>
                    <SelectItem value="B">Class B - Light Vehicles</SelectItem>
                    <SelectItem value="C">Class C - Heavy Vehicles</SelectItem>
                    <SelectItem value="C1">Class C1 - Medium Vehicles</SelectItem>
                    <SelectItem value="EB">Class EB - Light Vehicle + Trailer</SelectItem>
                    <SelectItem value="EC">Class EC - Heavy Vehicle + Trailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleInputChange}
                className="h-11"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 h-11 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 font-semibold bg-secondary hover:bg-secondary-light"
              >
                Add License
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManualUpload;
