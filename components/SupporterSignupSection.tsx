
import React, { useState } from 'react';
import { Heart, CheckCircle, ShieldCheck } from 'lucide-react';

const SupporterSignupSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', titleNumber: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send titled number as title_number to match backend expectations
      const payload = {
        name: formData.name,
        title_number: formData.titleNumber
      };

      console.log('Sending supporter data:', payload);

      const response = await fetch('http://localhost:3001/api/supporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar apoio');
      }

      setIsSuccess(true);
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
          <h2 className="text-4xl font-black text-blue-950 mb-4">Obrigado pelo seu apoio!</h2>
          <p className="text-xl text-gray-600 font-medium">Sua participação é fundamental para construirmos uma AESJ mais forte e transparente.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="apoiar" className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-950 rounded-[4rem] p-8 lg:p-20 relative overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-blue-400/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <ShieldCheck size={16} /> Movimento Somos Todos AESJ
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Seja um apoiador da <span className="text-blue-400">Retomada.</span>
              </h2>
              <p className="text-blue-100/70 text-lg font-medium leading-relaxed mb-8">
                Deixe seu nome e número de título para oficializar seu apoio à Chapa Kako Blanch. Juntos, mostraremos a força dos sócios que querem mudança.
              </p>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-3 text-white/60">
                  <CheckCircle className="text-blue-400" size={20} />
                  <span className="text-sm font-bold">100% Seguro</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <CheckCircle className="text-blue-400" size={20} />
                  <span className="text-sm font-bold">Uso Exclusivo Interno</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md bg-white rounded-[3rem] p-8 lg:p-12 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Nome Completo</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Número do Título (Opcional)</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    placeholder="Ex: 1234"
                    value={formData.titleNumber}
                    onChange={(e) => setFormData({...formData, titleNumber: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? 'Registrando...' : (
                    <>
                      <Heart size={20} fill="currentColor" /> Confirmar Meu Apoio
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-tighter">
                  Ao clicar, você autoriza o uso do seu nome na lista de apoiadores da chapa.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupporterSignupSection;
