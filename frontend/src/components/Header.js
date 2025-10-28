import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, CreditCard, Menu } from 'lucide-react';
import SAFlagShield from './SAFlagShield';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 p-1">
            <SAFlagShield className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground leading-none">DriverBuddy</h1>
            <p className="text-xs text-muted-foreground">Digital License</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant={isHome ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate('/')}
            className="font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button
            variant={!isHome ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate('/licenses')}
            className="font-medium"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            My Licenses
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/licenses')}>
                <CreditCard className="w-4 h-4 mr-2" />
                My Licenses
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
