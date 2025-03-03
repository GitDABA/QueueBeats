import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MusicIcon, SearchIcon, UsersIcon, LogOut, LogIn, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
        ? 'bg-purple-900/40 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = (isOpen: boolean) => {
    setIsMenuOpen(isOpen);
    
    // Dispatch custom event for layout adjustments
    window.dispatchEvent(
      new CustomEvent('sidebar-toggle', {
        detail: { isOpen }
      })
    );
  };

  const closeMenu = () => {
    toggleMenu(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => toggleMenu(!isMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-800"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/80 backdrop-blur-md border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4">
            <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <MusicIcon size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                QueueBeats
              </h1>
            </Link>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 py-4 px-2 space-y-1" onClick={closeMenu}>
            <NavItem
              to="/"
              icon={<MusicIcon size={20} />}
              label="Queue"
              isActive={location.pathname === '/'}
            />
            <NavItem
              to="/join"
              icon={<SearchIcon size={20} />}
              label="Join Queue"
              isActive={location.pathname === '/join'}
            />
            <NavItem
              to="/dashboard"
              icon={<UsersIcon size={20} />}
              label="Dashboard"
              isActive={location.pathname === '/dashboard'}
            />
            <NavItem
              to="/setup"
              icon={<Settings size={20} />}
              label="Setup"
              isActive={location.pathname === '/setup'}
            />
          </nav>

          {/* User profile or login button */}
          <div className="p-4 border-t border-gray-800">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8 border border-gray-700">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-purple-900/50 text-white">
                        {user.email?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[200px] bg-gray-900 border-gray-800 text-white" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-gray-800"
                    onClick={() => navigate('/setup')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Setup</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-gray-800"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors"
                  onClick={closeMenu}
                >
                  <LogIn size={20} />
                  <span>Log in</span>
                </Link>
                <Link
                  to="/setup"
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors"
                  onClick={closeMenu}
                >
                  <Settings size={20} />
                  <span>Setup</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
