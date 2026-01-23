
import React from 'react';
import { Instagram, Menu, X } from 'lucide-react';
import { KAKO_BIO, API_URL } from '../constants';

interface HeaderProps {
  settings: Record<string, string>;
}

const Header: React.FC<HeaderProps> = ({ settings }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            {settings.site_logo ? (
              <img 
                src={settings.site_logo?.startsWith('http') ? settings.site_logo : `${API_URL}${settings.site_logo}`} 
                alt="Logo AESJ" 
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-2xl font-black text-blue-900 tracking-tighter">
                AESJ <span className="text-blue-500">PARA OS SÓCIOS</span>
              </span>
            )}
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#propostas" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Propostas</a>
            <a href="#biografia" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Quem é Kako</a>
            <a href="#ouvidoria" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Ouvidoria</a>
            <a 
              href={KAKO_BIO.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-all shadow-md"
            >
              <Instagram size={18} />
              @kakoblanch
            </a>
          </nav>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col space-y-4 px-4">
            <a href="#propostas" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800">Propostas</a>
            <a href="#biografia" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800">Quem é Kako</a>
            <a href="#ouvidoria" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-800">Ouvidoria</a>
            <a 
              href={KAKO_BIO.instagram} 
              target="_blank" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-bold"
            >
              <Instagram size={20} />
              Instagram @kakoblanch
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
