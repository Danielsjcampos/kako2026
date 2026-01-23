
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { KAKO_BIO } from '../constants';

interface HeroProps {
  videoUrl?: string;
  heroImage?: string;
}

const Hero: React.FC<HeroProps> = ({ videoUrl, heroImage }) => {
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl || 'https://www.youtube.com/watch?v=OSuJnN5N7SI');

  return (
    <section className="pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden relative min-h-screen flex items-center bg-blue-950">
      
      {/* Background Video Layer */}
      {videoId && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Multi-layer Overlays for depth and readability */}
          <div className="absolute inset-0 bg-blue-950/60 z-10" /> 
          <div className="absolute inset-0 z-20 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-blue-950 via-transparent to-blue-950/40" />
          <div className="absolute inset-0 z-20 bg-gradient-to-b from-blue-950/30 via-transparent to-transparent" />

          {/* Wrapper to maintain aspect ratio and cover correctly across all devices */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full">
            <iframe
              className="w-full h-full object-cover scale-[1.5] lg:scale-[1.2]"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
            ></iframe>
          </div>
        </div>
      )}

      {/* Content Layer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-400/20 text-blue-300 backdrop-blur-md px-4 py-2 rounded-full font-black text-[10px] sm:text-xs mb-8 uppercase tracking-widest border border-white/10">
              <CheckCircle size={14} />
              AESJ 2026: A Retomada é Agora
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tighter drop-shadow-2xl">
              O Clube volta a <br />
              <span className="text-blue-400">ser do Sócio.</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/90 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium drop-shadow-md">
              Transparência total, esportes valorizados e manutenção constante. <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">Kako Blanch</span> retorna com a experiência de quem já fez e a inovação de quem quer fazer muito mais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-w-sm mx-auto lg:max-w-none">
              <a 
                href="#propostas" 
                className="bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-black text-base sm:text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                Ver Propostas
                <ArrowRight size={20} />
              </a>
              <a 
                href="#apoiar" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-black text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center uppercase tracking-widest"
              >
                Quero Apoiar
              </a>
            </div>
          </div>
          
          <div className="flex-1 relative hidden lg:block w-full">
            <div className="relative z-10 w-full max-w-md ml-auto aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/20 group">
              <img 
                src={heroImage ? `http://localhost:3001${heroImage}` : KAKO_BIO.photo} 
                alt="Kako Blanch" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-transparent" />
            </div>
            {/* Float badge */}
            <div className="absolute -bottom-10 -left-10 z-20 bg-blue-600 p-8 rounded-[3rem] shadow-2xl border-4 border-white text-white">
              <p className="text-5xl font-black leading-none italic">2026</p>
              <p className="text-xs font-black uppercase tracking-widest mt-2 whitespace-nowrap">Chapa AESJ Para os Sócios</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
