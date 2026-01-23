
import React from 'react';
import { ShieldCheck, FileText, CheckCircle, Search } from 'lucide-react';

const TransparencySection: React.FC = () => {
  return (
    <section id="transparencia" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-blue-600 font-black tracking-widest uppercase mb-4 block">Compromisso Real</span>
            <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-8">Transparência não é promessa, é dever.</h2>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-blue-950 mb-2">Portal da Transparência</h4>
                  <p className="text-gray-600">Acesso via login para cada sócio visualizar balancetes, notas fiscais e contratos em tempo real.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-blue-950 mb-2">Auditoria Semestral</h4>
                  <p className="text-gray-600">Contratação de empresa externa para validar cada centavo investido no clube.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <Search size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-blue-950 mb-2">Atas Públicas</h4>
                  <p className="text-gray-600">Decisões de diretoria publicadas em até 48h após as reuniões no site oficial.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="bg-blue-950 rounded-[4rem] p-12 lg:p-16 text-white relative z-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <h3 className="text-3xl font-black mb-6 border-b border-white/10 pb-6 uppercase tracking-tight">Carta de Compromisso</h3>
              
              <div className="space-y-6 text-blue-100 leading-relaxed mb-10">
                <p>"Se eleitos, nossa gestão será pautada pela honestidade intelectual e financeira. O clube voltará a ser gerido por critérios técnicos e pelo desejo da maioria, não de poucos."</p>
                <p>Nós nos comprometemos a manter este portal vivo durante todo o mandato, servindo como a principal ferramenta de prestação de contas da AESJ.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-blue-400" size={32} />
                </div>
                <div>
                  <p className="font-black text-xl">Kako Blanch</p>
                  <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Candidato a Presidente</p>
                </div>
              </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-100 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
