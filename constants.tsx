
import React from 'react';
import { Proposal } from './types';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  Wrench, 
  Users, 
  Hammer, 
  Car, 
  Lock, 
  Waves, 
  TrendingUp,
  DollarSign,
  ShieldAlert
} from 'lucide-react';

export const API_URL = import.meta.env.PROD ? '' : '${API_URL}';

export const CAMPAIGN_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: "Eventos para o Sócio",
    description: "Priorizar eventos do clube voltados para o sócio (como, por exemplo, o carnaval).",
    category: "Eventos",
    goal: "Retomada da vida social e festiva tradicional do clube.",
    how_to: "Calendário fixo de eventos e parcerias com sócios entusiastas.",
    eta: "Imediato",
    status: "Planejado",
    icon: <Calendar className="w-8 h-8 text-blue-600" />
  },
  {
    id: 2,
    title: "Transparência e Credibilidade",
    description: "Publicação no site das reuniões da direção/comissões. Resumo contábil mensal e prestação de contas semestral.",
    category: "Gestão",
    goal: "Sócio informado e gestão auditável.",
    how_to: "Criação de área logada para atas e balancetes financeiros.",
    eta: "Primeiros 100 dias",
    status: "Planejado",
    icon: <FileText className="w-8 h-8 text-blue-600" />
  },
  {
    id: 3,
    title: "Ouvidoria e Diálogo",
    description: "Diálogo permanente com os sócios e comissões, instalando a Ouvidoria oficial da chapa.",
    category: "Pessoas",
    goal: "Escuta ativa e resolução ágil de demandas.",
    how_to: "Sistema digital de tickets integrado ao portal da chapa.",
    eta: "Mês 1",
    status: "Executando",
    icon: <MessageSquare className="w-8 h-8 text-blue-600" />
  },
  {
    id: 4,
    title: "Manutenção Preventiva",
    description: "Implementação de plano de manutenção preventiva e corretiva permanente.",
    category: "Estrutura",
    goal: "Conservação impecável de todo o patrimônio do clube.",
    how_to: "Cronograma de vistorias técnicas mensais em todas as áreas.",
    eta: "Mês 2",
    status: "Planejado",
    icon: <Wrench className="w-8 h-8 text-blue-600" />
  },
  {
    id: 5,
    title: "Valorização do Colaborador",
    description: "Reconhecimento e plano de carreira para quem faz o clube funcionar todos os dias.",
    category: "Pessoas",
    goal: "Equipe motivada para melhor atendimento ao sócio.",
    how_to: "Treinamentos periódicos e revisão de metas e benefícios.",
    eta: "Semestre 1",
    status: "Planejado",
    icon: <Users className="w-8 h-8 text-blue-600" />
  },
  {
    id: 6,
    title: "Plano Diretor e Obras",
    description: "Visão estratégica para os próximos anos e conclusão imediata da reforma de todos os banheiros.",
    category: "Estrutura",
    goal: "Clube moderno, planejado e sem obras intermináveis.",
    how_to: "Contratação de estudo urbanístico e aporte para banheiros.",
    eta: "12 meses",
    status: "Planejado",
    icon: <Hammer className="w-8 h-8 text-blue-600" />
  },
  {
    id: 7,
    title: "Organização do Estacionamento",
    description: "Regulamentação e adequação do estacionamento para maior conforto e segurança.",
    category: "Segurança",
    goal: "Fluxo inteligente de veículos e vagas garantidas.",
    how_to: "Pintura, sinalização e monitoramento eletrônico das vagas.",
    eta: "Mês 4",
    status: "Planejado",
    icon: <Car className="w-8 h-8 text-blue-600" />
  },
  {
    id: 8,
    title: "Controle de Acesso",
    description: "Melhoria no controle de acesso ao clube, priorizando a segurança do associado.",
    category: "Segurança",
    goal: "Apenas sócios e convidados autorizados no clube.",
    how_to: "Modernização das catracas e cadastro digital por face.",
    eta: "Mês 3",
    status: "Planejado",
    icon: <Lock className="w-8 h-8 text-blue-600" />
  },
  {
    id: 9,
    title: "Parque Aquático",
    description: "Adequação e melhorias estruturais do parque aquático para uso pleno das famílias.",
    category: "Estrutura",
    goal: "Lazer aquático seguro, limpo e modernizado.",
    how_to: "Nova casa de máquinas e revitalização dos decks.",
    eta: "Mês 5",
    status: "Planejado",
    icon: <Waves className="w-8 h-8 text-blue-600" />
  },
  {
    id: 10,
    title: "Comissões Valorizadas",
    description: "Manutenção e valorização das comissões, ouvindo quem vive cada modalidade.",
    category: "Esportes",
    goal: "Decisões esportivas compartilhadas com o sócio.",
    how_to: "Fundo rotativo para pequenas demandas das comissões.",
    eta: "Contínuo",
    status: "Planejado",
    icon: <TrendingUp className="w-8 h-8 text-blue-600" />
  },
  {
    id: 11,
    title: "Compliance e Ética",
    description: "Plano de conformidade para assegurar que contratos não apresentem conflitos de interesse.",
    category: "Gestão",
    goal: "Gestão livre de favorecimentos e 100% ética.",
    how_to: "Regulamento interno de compras e licitações transparentes.",
    eta: "Mês 2",
    status: "Planejado",
    icon: <ShieldAlert className="w-8 h-8 text-blue-600" />
  },
  {
    id: 12,
    title: "Clube Sustentável",
    description: "Implementar plano de meio ambiente e crescimento planejado das áreas verdes.",
    category: "Pessoas",
    goal: "AESJ como referência em sustentabilidade em SJC.",
    how_to: "Reuso de água nas piscinas e plantio de mudas nativas.",
    eta: "Semestre 2",
    status: "Planejado",
    icon: <TrendingUp className="w-8 h-8 text-blue-600" />
  }
];


export const THE_CHAPA = [
  {
    id: '1',
    name: "Kako Blanch",
    role: "Presidente",
    bio: "Ex-presidente (2014-2020) com histórico de grandes obras e saneamento financeiro.",
    photo: "https://autobox33.com.br/fotokako.jpg",
    phone: ""
  },
  {
    id: '2',
    name: "Vice-Presidente",
    role: "Vice-Presidente",
    bio: "Liderança experiente focada na gestão operacional e diálogo com o conselho.",
    photo: "https://picsum.photos/seed/vice/400/400",
    phone: ""
  },
  {
    id: '3',
    name: "Diretor Financeiro",
    role: "Tesouraria",
    bio: "Especialista em auditoria para garantir que cada centavo do sócio seja bem aplicado.",
    photo: "https://picsum.photos/seed/finance/400/400",
    phone: ""
  }
];

export const KAKO_BIO = {
  name: "Sebastião Claudio Blanch (Kako)",
  experience: "Presidente da AESJ de 2014 a 2020",
  vision: "Resgatar a excelência da AESJ com modernidade, transparência e o fim das 'panelas': em 2026, o sócio volta a mandar no clube.",
  photo: "https://autobox33.com.br/fotokako.jpg",
  instagram: "https://www.instagram.com/kakoblanch"
};

export const FAQ_ITEMS = [
  {
    question: "O que muda com essa chapa?",
    answer: "Mudamos a forma de governar: de um grupo fechado para uma gestão participativa, onde o sócio é ouvido via Ouvidoria e as contas são 100% abertas no portal."
  },
  {
    question: "Como minhas sugestões serão lidas?",
    answer: "Toda sugestão enviada pelo site cai diretamente no painel administrativo da chapa, é classificada por área e respondida publicamente ou via contato direto."
  },
  {
    question: "Como será a transparência financeira?",
    answer: "Publicaremos balancetes mensais simplificados e atas de reuniões da diretoria para que não haja dúvidas sobre os rumos do clube."
  }
];
