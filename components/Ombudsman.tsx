
import React from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { FeedbackMessage } from '../types';
import { API_URL } from '../constants';

const Ombudsman: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    titleNumber: '',
    category: 'Sugestão de Melhoria',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          titleNumber: formData.titleNumber,
          category: formData.category,
          message: formData.message,
          isAnonymous: formData.name === 'Anônimo'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar sugestão');
      }

      setIsSubmitted(true);
      setFormData({ name: '', titleNumber: '', category: 'Sugestão de Melhoria', message: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('Houve um erro ao enviar sua sugestão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="ouvidoria" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white p-16 rounded-[3rem] shadow-xl border border-blue-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold text-blue-950 mb-4">Sua Voz foi Ouvida!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Obrigado por ajudar a quebrar o ciclo de decisões fechadas. Na nossa gestão, cada ideia conta para uma AESJ democrática.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-blue-600 font-bold hover:underline"
            >
              Enviar outra sugestão
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="ouvidoria" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-6">O Fim da "Panela"</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Chega de decisões tomadas por um pequeno grupo. Em 2026, a <strong>AESJ será governada pelas sugestões dos sócios</strong>. Este canal é a sua linha direta para participar ativamente da nova gestão.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold">1</span>
                </div>
                <p className="text-gray-700 font-medium">Acabamos com o secretismo nas decisões.</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold">2</span>
                </div>
                <p className="text-gray-700 font-medium">Sua sugestão vira meta administrativa.</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold">3</span>
                </div>
                <p className="text-gray-700 font-medium">Transparência absoluta: você sabe o que acontece.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl shadow-blue-100 border border-blue-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seu Nome</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome do Sócio"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nº do Título</label>
                  <input 
                    type="text" 
                    value={formData.titleNumber}
                    onChange={(e) => setFormData({...formData, titleNumber: e.target.value})}
                    placeholder="Número do seu título"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      onChange={(e) => setFormData({...formData, name: e.target.checked ? 'Anônimo' : ''})}
                    />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-blue-900 transition-colors">Desejo enviar minha sugestão de forma anônima</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Área do Clube</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none"
                >
                  <option>Sugestão de Melhoria</option>
                  <option>Elogio ao Clube</option>
                  <option>Crítica Construtiva</option>
                  <option>Mensalidade/Taxas</option>
                  <option>Parque Aquático</option>
                  <option>Quiosques</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Qual sua sugestão para 2026?</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Diga o que você mudaria hoje na AESJ..."
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-950 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-900 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar Sugestão Real
                    <Send size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ombudsman;
