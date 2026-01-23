
import React, { useState, useEffect } from 'react';
import { Package, Calendar, FileText, MessageSquare, Wrench, Users, Hammer, Car, Lock, Waves, TrendingUp } from 'lucide-react';
import { Proposal } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  'Eventos': <Calendar className="w-8 h-8 text-blue-600" />,
  'Gestão': <FileText className="w-8 h-8 text-blue-600" />,
  'Pessoas': <MessageSquare className="w-8 h-8 text-blue-600" />,
  'Estrutura': <Wrench className="w-8 h-8 text-blue-600" />,
  'Segurança': <Lock className="w-8 h-8 text-blue-600" />,
  'Esportes': <TrendingUp className="w-8 h-8 text-blue-600" />,
  'default': <Package className="w-8 h-8 text-blue-600" />
};

const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/proposals');
        const data = await response.json();
        setProposals(data);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  return (
    <section id="propostas" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black text-blue-950 mb-4">Plano de Modernização AESJ</h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Pilares fundamentais para transformar o Clube de Campo Santa Rita em um ambiente de excelência.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-[3.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proposals.map((proposal, index) => (
              <div 
                key={proposal.id} 
                className="p-10 rounded-[3.5rem] bg-gray-50 border border-gray-100 hover:border-blue-300 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all group duration-500"
              >
                <div className="flex justify-between items-start mb-8 transition-transform group-hover:scale-[1.02]">
                  <div className="p-4 bg-white rounded-2xl w-fit shadow-sm">
                    {iconMap[proposal.category] || iconMap.default}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      proposal.status === 'Concluído' ? 'bg-green-100 text-green-700' :
                      proposal.status === 'Executando' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {proposal.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {proposal.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-blue-950 mb-4 flex items-center gap-4">
                  <span className="text-blue-200 text-5xl font-black leading-none opacity-40">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  {proposal.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-8 text-lg font-medium">
                  {proposal.description}
                </p>

                {(proposal.goal || proposal.eta) && (
                  <div className="space-y-6 pt-8 border-t border-gray-100">
                    {proposal.goal && (
                      <div>
                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2">🎯 Objetivo</h4>
                        <p className="text-sm text-gray-500">{proposal.goal}</p>
                      </div>
                    )}
                    {proposal.eta && (
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2">⏳ Prazo Estimado</h4>
                          <p className="text-sm text-gray-500 font-bold">{proposal.eta}</p>
                        </div>
                        <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                          Ver Detalhes +
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 p-12 bg-blue-900 rounded-[3rem] text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-700/30 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h3 className="text-3xl font-bold mb-6">Transparência e Diálogo</h3>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            "Não prometemos o impossível, mas garantimos que cada centavo do sócio será aplicado onde ele mais precisa: no conforto, no esporte e no lazer de sua família."
          </p>
          <p className="mt-8 font-bold text-xl">— Sebastião Claudio Blanch (Kako)</p>
        </div>
      </div>
    </section>
  );
};

export default Proposals;
