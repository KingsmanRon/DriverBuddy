import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CreditCard, Calendar, User, MapPin, Eye, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const LicensesPage = () => {
  const [licenses, setLicenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = () => {
    const stored = JSON.parse(localStorage.getItem('driverLicenses') || '[]');
    setLicenses(stored);
  };

  const handleDelete = (id) => {
    const updated = licenses.filter(l => l.id !== id);
    localStorage.setItem('driverLicenses', JSON.stringify(updated));
    setLicenses(updated);
    toast.success('License removed');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-slide-in">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
                My Licenses
              </h1>
              <p className="text-muted-foreground">
                Manage your digital driver's licenses
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="bg-secondary hover:bg-secondary-light font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add License
            </Button>
          </div>

          {licenses.length === 0 ? (
            <Card className="shadow-lg animate-slide-in">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  No Licenses Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add your first driver's license to get started
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-secondary hover:bg-secondary-light font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First License
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {licenses.map((license, index) => (
                <Card 
                  key={license.id} 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in border-2 border-border/50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                          <CreditCard className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-bold text-foreground">
                            {license.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {license.licenseNumber}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className="w-fit bg-secondary/10 text-secondary border-secondary/20 font-semibold px-4 py-1.5"
                      >
                        Class {license.licenseClass}
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">
                            Date of Birth
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatDate(license.dateOfBirth)}
                          </p>
                        </div>
                      </div>

                      {license.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">
                              Address
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {license.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        onClick={() => navigate(`/license/${license.id}`)}
                        className="flex-1 bg-secondary hover:bg-secondary-light font-semibold"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleDelete(license.id)}
                        variant="outline"
                        className="border-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicensesPage;
