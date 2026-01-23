
import React, { useState } from 'react';
import { Heart, CheckCircle, ShieldCheck } from 'lucide-react';
import { API_URL } from '../constants';
import { supabase, T } from '../lib/supabaseClient';

const SupporterSignupSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', titleNumber: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [supporterCount, setSupporterCount] = useState(0);
  const [recentSupporters, setRecentSupporters] = useState<string[]>([]);

  React.useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    try {
      const { data, count, error } = await supabase
        .from(T.supporters)
        .select('name', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      if (count !== null) setSupporterCount(count);
      if (data) setRecentSupporters(data.map(s => s.name));
    } catch (err) {
      console.error('Error fetching supporters:', err);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
    return numbers.substring(0, 11);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send titled number as title_number to match backend expectations
      const { error } = await supabase
        .from(T.supporters)
        .insert([{
          name: formData.name,
          title_number: formData.titleNumber,
          phone: formData.phone.replace(/\D/g, '') // Save only numbers
        }]);

      if (error) throw error;

      setIsSuccess(true);
      fetchSupporters(); // Refresh count
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(err.message || 'Erro ao registrar seu apoio. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-24 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Heart className="text-red-500" size={48} fill="currentColor" />
          </div>
          <h2 className="text-4xl font-black text-red-950 mb-4">Obrigado pelo seu apoio!</h2>
          <p className="text-xl text-gray-600 font-medium">Sua participação é fundamental para construirmos uma AESJ mais forte e transparente.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="apoiar" className="py-24 bg-gray-50 overflow-hidden relative">
      {/* Social Proof Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-red-600/5 py-4 border-b border-red-100 overflow-hidden whitespace-nowrap z-0">
        <div className="flex animate-marquee gap-8 items-center">
          {[...recentSupporters, ...recentSupporters].map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-red-900/40 font-black uppercase text-[10px] tracking-widest">
              <Heart size={12} fill="currentColor" /> {name} APOIA A RETOMADA 
            </div>
          ))}
          {recentSupporters.length === 0 && (
            <div className="text-red-900/40 font-black uppercase text-[10px] tracking-widest">
              SEJA O PRIMEIRO A APOIAR • AESJ UNIDA • TRANSFORMANDO O CLUBE •
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-[#050b2b] rounded-[4rem] p-8 lg:p-20 relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(127,29,29,0.5)]">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-red-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-[20rem] h-[20rem] bg-red-600/10 rounded-full blur-[80px]" />
          
          <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-400/10 text-red-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-400/20">
                <ShieldCheck size={14} /> Movimento Somos Todos AESJ
              </div>
              
              <div className="mb-8">
                <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                  Junte-se à <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Mudança Agora.</span>
                </h2>
                <p className="text-red-100/70 text-xl font-medium leading-relaxed max-w-xl">
                  Mostre a força do sócio consciente. Seu apoio é a prova de que queremos uma AESJ transparente e ativa.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md">
                  <p className="text-4xl font-black text-white mb-1">+{supporterCount}</p>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Sócios Apoiadores</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md">
                  <p className="text-4xl font-black text-white mb-1">100%</p>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Transparência</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start opacity-50">
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="text-red-400" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Seguro</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="text-red-400" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Exclusivo Chapa</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md bg-white rounded-[3.5rem] p-8 lg:p-14 shadow-2xl relative">
              <div className="absolute -top-6 -left-6 bg-red-500 text-white p-4 rounded-3xl shadow-lg animate-bounce hidden sm:block">
                <Heart size={24} fill="white" />
              </div>
              
              <div className="mb-10 text-center sm:text-left">
                <h3 className="text-3xl font-black text-red-950 tracking-tight">Oficialize seu Apoio</h3>
                <p className="text-gray-400 font-bold text-sm mt-1">Preencha os dados abaixo</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-red-900/50 uppercase tracking-widest mb-2 ml-4 block">Nome Completo</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-red-950 placeholder:text-gray-300"
                      placeholder="Como no título"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-red-900/50 uppercase tracking-widest mb-2 ml-4 block">Nº de Título (Opcional)</label>
                    <input 
                      type="text"
                      className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-red-950 placeholder:text-gray-300"
                      placeholder="Ex: 0000"
                      value={formData.titleNumber}
                      onChange={(e) => setFormData({...formData, titleNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-red-900/50 uppercase tracking-widest mb-2 ml-4 block">WhatsApp / Telefone</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-red-950 placeholder:text-gray-300"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full group bg-red-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isLoading ? 'Conectando...' : (
                    <>
                      <Heart size={20} fill="currentColor" className="group-hover:animate-ping" /> 
                      Confirmar Apoio
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-gray-400 text-center font-bold leading-relaxed px-4">
                  Seu nome será exibido na lista oficial de apoiadores da retomada.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default SupporterSignupSection;
