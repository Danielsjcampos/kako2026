
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Proposals from './components/Proposals';
import Ombudsman from './components/Ombudsman';
import VideoSection from './components/VideoSection';
import AdminPortal from './components/AdminPortal';
import ChapaSection from './components/ChapaSection';
import TransparencySection from './components/TransparencySection';
import FAQSection from './components/FAQSection';
import SupporterSignupSection from './components/SupporterSignupSection';
import { KAKO_BIO, API_URL } from './constants';
import { supabase, T } from './lib/supabaseClient';
import { Lock, Code2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [supporterCount, setSupporterCount] = useState(0);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: suppData },
          { data: settingsRows }
        ] = await Promise.all([
          supabase.from(T.supporters).select('*'),
          supabase.from(T.settings).select('*')
        ]);

        if (suppData) setSupporterCount(suppData.length);
        
        if (settingsRows) {
          const settingsMap: Record<string, string> = {};
          settingsRows.forEach(row => {
            settingsMap[row.key] = row.value;
          });
          setSettings(settingsMap);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  // Update Favicon and SEO Image
  useEffect(() => {
    if (settings.site_logo) {
      const link: HTMLLinkElement | null = document.querySelector("link[id='favicon-link']");
      if (link) link.href = `${API_URL}${settings.site_logo}`;
    }
    
    if (settings.share_image) {
      const meta: HTMLMetaElement | null = document.querySelector("meta[id='og-image']");
      if (meta) meta.content = `${API_URL}${settings.share_image}`;
    }
  }, [settings]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header settings={settings} />
      
      <main>
        <Hero videoUrl={settings.youtube_url} heroImage={settings.hero_image} />
        
        {/* Modernization Stats */}
        <section className="bg-blue-950 py-16 text-white overflow-hidden relative border-y border-blue-900 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <p className="text-4xl lg:text-6xl font-black mb-2 text-blue-400">12</p>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">Propostas Reais</p>
            </div>
            <div>
              <p className="text-4xl lg:text-6xl font-black mb-2 text-blue-400">{supporterCount > 0 ? supporterCount : '100+'}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">Apoiadores Reais</p>
            </div>
            <div>
              <p className="text-4xl lg:text-6xl font-black mb-2 text-blue-400">2026</p>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">O Ano da Retomada</p>
            </div>
            <div>
              <p className="text-4xl lg:text-6xl font-black mb-2 text-blue-400">100%</p>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">Transparência</p>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
             <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          </div>
        </section>

        <section id="biografia" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-[4rem] p-8 lg:p-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1">
                <img 
                  src={settings.bio_image ? (settings.bio_image.startsWith('http') ? settings.bio_image : `${API_URL}${settings.bio_image}`) : "https://www.aesj.com.br/wp-content/uploads/2021/04/espaco-eventos002.jpg"} 
                  alt="Clube AESJ" 
                  className="rounded-[3rem] shadow-2xl"
                />
              </div>
              <div className="flex-1">
                <span className="text-blue-600 font-black tracking-widest uppercase mb-4 block">Nossa Nova Atitude</span>
                <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-6">O clube volta a ser seu.</h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    A experiência do Kako Blanch (2014-2020) é o alicerce, mas o futuro exige mais. Em 2026, trazemos <strong>tudo novo</strong>: novos processos, novas formas de ouvir e o compromisso inabalável de acabar com gestões fechadas.
                  </p>
                  <p>
                    Hoje, Kako volta para quebrar a "panela". O Clube de Campo Santa Rita não pertence a um grupo, pertence a cada sócio que paga sua mensalidade e quer ver a <strong>AESJ brilhando novamente</strong>...
                  </p>
                  <blockquote className="border-l-4 border-blue-600 pl-6 italic font-medium text-blue-900 py-2">
                    "Minha missão em 2026 é abrir as portas e as planilhas para o sócio. Decidiremos juntos."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ChapaSection />
        <VideoSection videoUrl={settings.youtube_url} />
        <Proposals />
        <TransparencySection />
        <SupporterSignupSection />
        <Ombudsman />
        <FAQSection settings={settings} />
      </main>

      <footer className="bg-white border-t border-gray-100 py-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-center md:text-left">
              <span className="text-2xl font-black text-blue-900 tracking-tighter">
                AESJ <span className="text-blue-500">PARA OS SÓCIOS</span>
              </span>
              <p className="text-gray-500 mt-2">© 2026 - Campanha Kako Blanch para Presidente.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#biografia" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">Quem Somos</a>
              <a href="#chapa" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">A Chapa</a>
              <a href="#propostas" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">Propostas</a>
              <a href="#transparencia" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">Transparência</a>
              <a href="#ouvidoria" className="text-gray-600 hover:text-blue-600 font-bold transition-colors">Ouvidoria</a>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              <Lock size={12} />
              Painel Restrito (Chapa)
            </button>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
              <Code2 size={12} className="text-blue-500" />
              Desenvolvido por <a href="https://2timeweb.com.br" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600">2timeweb - Daniel Marques</a>
            </div>
          </div>
        </div>
      </footer>

      {isAdminOpen && <AdminPortal onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
};

export default App;
