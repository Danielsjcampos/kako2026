
import React from 'react';
import { ShieldCheck, FileText, CheckCircle, Search } from 'lucide-react';

const TransparencySection: React.FC = () => {
  return (
    <section id="transparencia" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-red-600 font-black tracking-widest uppercase mb-4 block">Compromisso Real</span>
            <h2 className="text-4xl lg:text-5xl font-black text-red-950 mb-8">Transparência não é promessa, é dever.</h2>
            
            <p className="text-xl text-gray-600 leading-relaxed font-medium"> Publicação das atas das reuniões da diretoria e comissões, do resumo dos contratos firmados. </p>
          </div>

          <div className="flex-1 relative">
            <div className="bg-red-950 rounded-[4rem] p-12 lg:p-16 text-white relative z-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <h3 className="text-3xl font-black mb-6 border-b border-white/10 pb-6 uppercase tracking-tight">Carta de Compromisso</h3>
              
              <div className="space-y-6 text-red-100 leading-relaxed mb-10">
                <p>"Se eleitos, nossa gestão será pautada pela honestidade intelectual e financeira. O clube voltará a ser gerido por critérios técnicos e pelo desejo da maioria, não de poucos."</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-red-400" size={32} />
                </div>
                <div>
                  <p className="font-black text-xl">Kako Blanch</p>
                  <p className="text-sm font-bold text-red-400 uppercase tracking-widest">Candidato a Presidente</p>
                </div>
              </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-red-100 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
