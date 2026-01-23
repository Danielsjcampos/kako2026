
import React from 'react';
import { Play } from 'lucide-react';

interface VideoSectionProps {
  videoUrl?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl }) => {
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl || 'https://www.youtube.com/watch?v=OSuJnN5N7SI');

  return (
    <section className="py-24 bg-red-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-red-400 font-black tracking-widest uppercase mb-4 block">Experiência AESJ</span>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">Nosso clube é um patrimônio.</h2>
          <p className="text-xl text-red-100/70 max-w-3xl mx-auto font-medium">
            O Clube de Campo Santa Rita merece uma gestão que valorize sua beleza e respeite o associado. Assista ao nosso vídeo institucional.
          </p>
        </div>
        
        <div className="relative aspect-video rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] border-8 border-white/5 group">
          {videoId ? (
            <iframe 
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`} 
              title="Conheça a beleza da AESJ"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-white font-bold opacity-50 uppercase tracking-widest">Vídeo Indisponível</p>
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-red-950/45 to-transparent flex items-end p-8 lg:p-16">
            <div className="text-white">
              <div className="flex items-center gap-6 group-hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="fill-white ml-1" size={32} />
                </div>
                <p className="text-2xl lg:text-3xl font-black tracking-tight">
                  A Retomada do Brilho da nossa AESJ.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 group hover:bg-white/10 transition-all duration-500">
            <h3 className="text-2xl font-black text-red-400 mb-4 uppercase tracking-tighter">Patrimônio Histórico</h3>
            <p className="text-red-100/70 text-lg leading-relaxed font-medium">Preservamos cada detalhe do nosso Clube de Campo, para que sua família sempre tenha o melhor cenário em São José dos Campos.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 group hover:bg-white/10 transition-all duration-500">
            <h3 className="text-2xl font-black text-red-400 mb-4 uppercase tracking-tighter">Gestão para Você</h3>
            <p className="text-red-100/70 text-lg leading-relaxed font-medium">Não basta ser bonito, precisa ser bem gerido. Vamos focar na manutenção impecável e no lazer de qualidade para todas as idades.</p>
          </div>
        </div>
      </div>
      
      {/* Decorative spheres */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-400/10 rounded-full blur-[100px] -ml-64 -mb-64" />
    </section>
  );
};

export default VideoSection;
