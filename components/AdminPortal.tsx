
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Settings, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle,
  FileText,
  LayoutDashboard,
  Lock,
  User,
  Package,
  Calendar,
  Waves,
  Hammer,
  Upload,
  Image as ImageIcon,
  Youtube,
  Save,
  Edit2,
  Camera,
  UserPlus,
  Shield,
  Download,
  FileDown
} from 'lucide-react';
import { FeedbackMessage, Participant, Supporter, Proposal } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autotable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface AdminPortalProps {
  onClose: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suggestions' | 'participants' | 'supporters' | 'proposals' | 'config' | 'users'>('dashboard');
  
  const [suggestions, setSuggestions] = useState<FeedbackMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Editing states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth persistence check
  useEffect(() => {
    const admin = localStorage.getItem('aesj_admin_session');
    if (admin) setIsLoggedIn(true);
  }, []);

  // Load data from API
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      try {
        const [sugRes, partRes, suppRes, propRes, setRes, usersRes] = await Promise.all([
          fetch('http://localhost:3001/api/suggestions'),
          fetch('http://localhost:3001/api/participants'),
          fetch('http://localhost:3001/api/supporters'),
          fetch('http://localhost:3001/api/proposals'),
          fetch('http://localhost:3001/api/settings'),
          fetch('http://localhost:3001/api/admin-users')
        ]);
        
        const [sData, pData, sSupData, prData, settingsData, uData] = await Promise.all([
          sugRes.json(),
          partRes.json(),
          suppRes.json(),
          propRes.json(),
          setRes.json(),
          usersRes.json()
        ]);
        
        setSuggestions(Array.isArray(sData) ? sData : []);
        setParticipants(Array.isArray(pData) ? pData : []);
        setSupporters(Array.isArray(sSupData) ? sSupData : []);
        setProposals(Array.isArray(prData) ? prData : []);
        setAdminUsers(Array.isArray(uData) ? uData : []);
        setSettings(settingsData && !settingsData.error ? settingsData : {});
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('aesj_admin_session', JSON.stringify(data.user));
      } else {
        alert('E-mail ou senha incorretos.');
      }
    } catch (err) {
      alert('Erro ao conectar ao servidor.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aesj_admin_session');
    setIsLoggedIn(false);
  };

  const deleteItem = async (id: number | string, type: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    
    const endpointMap: Record<string, string> = {
      'suggestions': 'suggestions',
      'participants': 'participants',
      'supporters': 'supporters',
      'proposals': 'proposals',
      'users': 'admin-users'
    };

    const typeKey = endpointMap[type] || type;

    try {
      const response = await fetch(`http://localhost:3001/api/${typeKey}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao excluir');
      
      if (type === 'suggestions') {
        setSuggestions(suggestions.filter(s => s.id != id));
      } else if (type === 'participants') {
        setParticipants(participants.filter(p => p.id != id));
      } else if (type === 'supporters') {
        setSupporters(supporters.filter(s => s.id != id));
      } else if (type === 'proposals') {
        setProposals(proposals.filter(p => p.id != id));
      } else if (type === 'users') {
        setAdminUsers(adminUsers.filter(u => u.id != id));
      }
    } catch (err) {
      alert('Erro ao excluir item');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = activeTab;
    const isEditing = !!editingItem.id;
    const method = isEditing ? 'PUT' : 'POST';
    
    const endpointMap: Record<string, string> = {
      'proposals': 'proposals',
      'participants': 'participants',
      'users': 'admin-users'
    };
    
    const typeKey = endpointMap[type] || type;
    const url = `http://localhost:3001/api/${typeKey}${isEditing ? `/${editingItem.id}` : ''}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar');
      
      const savedItem = await response.json();
      
      if (type === 'proposals') {
        if (isEditing) setProposals(proposals.map(p => p.id === savedItem.id ? savedItem : p));
        else setProposals([...proposals, savedItem]);
      } else if (type === 'participants') {
        if (isEditing) setParticipants(participants.map(p => p.id === savedItem.id ? savedItem : p));
        else setParticipants([...participants, savedItem]);
      } else if (type === 'users') {
        if (isEditing) setAdminUsers(adminUsers.map(u => u.id === savedItem.id ? savedItem : u));
        else setAdminUsers([...adminUsers, savedItem]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert('Erro ao salvar item');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setEditingItem({ ...editingItem, photo: data.url });
    } catch (err) {
      alert('Erro ao fazer upload da imagem');
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      alert('Erro ao salvar configuração');
    }
  };

  const exportSupportersCSV = () => {
    if (supporters.length === 0) {
      alert('Não há apoiadores para exportar.');
      return;
    }

    const headers = ['Nome', 'Número do Título', 'Data de Cadastro'];
    const csvRows = supporters.map(s => [
      s.name,
      s.title_number || 'N/A',
      s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(';'),
      ...csvRows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `apoiadores_chapa_kako_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSupportersPDF = () => {
    if (supporters.length === 0) {
      alert('Não há apoiadores para exportar.');
      return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(26, 35, 126); // Blue 900
    doc.text('Lista de Apoiadores - Chapa Kako Blanch 2026', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total de apoiadores: ${supporters.length}`, 14, 30);
    doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 35);

    const tableColumn = ["Nome", "Número do Título", "Data de Cadastro"];
    const tableRows = supporters.map(s => [
      s.name,
      s.title_number || 'N/A',
      s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : 'N/A'
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 45 },
    });

    doc.save(`apoiadores_chapa_kako_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!isLoggedIn) {
     return (
      <div className="fixed inset-0 z-[100] bg-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Lock className="text-blue-600" size={40} />
            </div>
            <h2 className="text-3xl font-black text-blue-950">Acesso Restrito</h2>
            <p className="text-gray-500 font-medium mt-2">Identifique-se para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">E-mail</label>
              <input 
                type="email"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                placeholder="admin@aesj.com.br"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Senha</label>
              <input 
                type="password"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
            >
              {isLoginLoading ? 'Verificando...' : 'Entrar no Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl flex overflow-hidden border border-white/20">
        
        {/* Sidebar */}
        <div className="w-64 bg-blue-950 text-white p-8 flex flex-col">
          <div className="mb-12">
            <h2 className="text-2xl font-black tracking-tighter">PORTAL <span className="text-blue-400">KAKO</span></h2>
            <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mt-1">Gestão Interna 2026</p>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'proposals', label: 'Propostas', icon: Package },
              { id: 'participants', label: 'Chapa', icon: Users },
              { id: 'suggestions', label: 'Sugestões', icon: MessageSquare, badge: suggestions.length },
              { id: 'supporters', label: 'Apoiadores', icon: Heart, badge: supporters.length },
              { id: 'users', label: 'Usuários Admin', icon: Shield },
              { id: 'config', label: 'Ajustes', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold ${
                  activeTab === tab.id ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <tab.icon size={18} />
                  {tab.label}
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="mt-auto space-y-4">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-300 hover:text-red-400 transition-colors font-bold text-sm">
              <Lock size={18} /> Encerrar Sessão
            </button>
            <button onClick={onClose} className="w-full flex items-center gap-2 text-blue-300 hover:text-white transition-colors font-bold text-sm">
              <X size={18} /> Fechar Painel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-12">
          
          {activeTab === 'dashboard' && (
            <div>
              <h3 className="text-3xl font-black text-blue-950 mb-8">Visão Geral</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <Package className="text-blue-600 mb-4" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Propostas</p>
                  <p className="text-4xl font-black text-blue-950 mt-1">{proposals.length}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <Heart className="text-red-500 mb-4" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Apoiadores</p>
                  <p className="text-4xl font-black text-blue-950 mt-1">{supporters.length}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <MessageSquare className="text-orange-500 mb-4" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sugestões</p>
                  <p className="text-4xl font-black text-blue-950 mt-1">{suggestions.length}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <Users className="text-purple-600 mb-4" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Membros</p>
                  <p className="text-4xl font-black text-blue-950 mt-1">{participants.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-blue-950">Gerenciar Propostas</h3>
                <button 
                  onClick={() => { setEditingItem({ title: '', description: '', goal: '', status: 'Planejado', category: 'Gestão' }); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                >
                  <Plus size={20} /> Nova Proposta
                </button>
              </div>
              <div className="space-y-4">
                {proposals.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${
                        p.status === 'Concluído' ? 'bg-green-50 text-green-600' : 
                        p.status === 'Executando' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        <CheckCircle size={24} />
                      </div>
                      <div className="cursor-pointer" onClick={() => { setEditingItem(p); setIsModalOpen(true); }}>
                        <h4 className="font-bold text-blue-950 text-lg group-hover:text-blue-600 transition-colors">{p.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{p.category}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-xs font-bold text-blue-500">{p.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => { setEditingItem(p); setIsModalOpen(true); }} className="text-gray-300 hover:text-blue-500 p-2 transition-colors">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => deleteItem(p.id!, 'proposals')} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-blue-950">Membros da Chapa</h3>
                <button 
                  onClick={() => { setEditingItem({ name: '', role: '', bio: '', photo: '' }); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                >
                  <Plus size={20} /> Novo Membro
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {participants.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setEditingItem(p); setIsModalOpen(true); }}>
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl overflow-hidden flex items-center justify-center">
                        {p.photo ? (
                          <img src={`http://localhost:3001${p.photo}`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-950 text-lg">{p.name}</h4>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{p.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingItem(p); setIsModalOpen(true); }} className="text-gray-300 hover:text-blue-500 p-2">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => deleteItem(p.id!, 'participants')} className="text-gray-300 hover:text-red-500 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div>
              <h3 className="text-3xl font-black text-blue-950 mb-8">Sugestões do Sócio</h3>
              <div className="space-y-4">
                {suggestions.map((s) => (
                  <div key={s.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">{s.category}</span>
                        {s.is_anonymous && <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">Anônimo</span>}
                      </div>
                      <button onClick={() => deleteItem(s.id, 'suggestions')} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <h4 className="font-black text-blue-950 text-xl">{s.name}</h4>
                    {s.title_number && <p className="text-xs font-bold text-blue-500 mt-1 uppercase tracking-widest">Título: {s.title_number}</p>}
                    <p className="text-gray-600 mt-4 leading-relaxed text-lg font-medium">{s.message}</p>
                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'supporters' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-blue-950">Base de Apoiadores</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={exportSupportersPDF}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all"
                  >
                    <FileDown size={20} /> Exportar PDF
                  </button>
                  <button 
                    onClick={exportSupportersCSV}
                    className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-900/20 transition-all"
                  >
                    <Download size={20} /> Exportar CSV
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supporters.map((s) => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                    <div>
                      <h4 className="font-bold text-blue-950">{s.name}</h4>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Título: {s.title_number || 'N/A'}</p>
                    </div>
                    <button onClick={() => deleteItem(s.id!, 'supporters')} className="text-red-300 hover:text-red-500 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-blue-950">Administradores do Sistema</h3>
                <button 
                  onClick={() => { setEditingItem({ email: '', password: '' }); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                >
                  <UserPlus size={20} /> Novo Admin
                </button>
              </div>
              <div className="space-y-4">
                {adminUsers.filter(u => u.email !== 'admin@aesj.com.br').map((u) => (
                  <div key={u.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl">
                        <Shield size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-950 text-lg">{u.email}</h4>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Acesso Administrativo</p>
                      </div>
                    </div>
                    <button onClick={() => deleteItem(u.id, 'users')} className="text-red-300 hover:text-red-500 p-2">
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
                {adminUsers.length <= 1 && (
                  <div className="text-center py-20 text-gray-400">
                     <p className="font-bold">Nenhum administrador adicional cadastrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-12">
              <h3 className="text-3xl font-black text-blue-950">Ajustes do Sistema</h3>
              
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Logo do Site (Topo e FAQ)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.site_logo ? (
                           <img src={`http://localhost:3001${settings.site_logo}`} className="w-full h-full object-contain p-2" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="logo_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('http://localhost:3001/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          updateSetting('site_logo', data.url);
                        }}
                      />
                      <label htmlFor="logo_upload" className="bg-white border border-gray-100 text-blue-600 px-6 py-4 rounded-2xl font-bold hover:bg-blue-50 cursor-pointer">
                        Trocar Logo
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Imagem de Compartilhamento (SEO)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.share_image ? (
                           <img src={`http://localhost:3001${settings.share_image}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="share_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('http://localhost:3001/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          updateSetting('share_image', data.url);
                        }}
                      />
                      <label htmlFor="share_upload" className="bg-white border border-gray-100 text-blue-600 px-6 py-4 rounded-2xl font-bold hover:bg-blue-50 cursor-pointer">
                        Trocar Capa
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                      <Youtube size={16} /> Link do Vídeo (YouTube)
                    </label>
                    <div className="flex gap-4">
                      <input 
                        className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={settings.youtube_url || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, youtube_url: e.target.value }))}
                      />
                      <button 
                        onClick={() => updateSetting('youtube_url', settings.youtube_url)}
                        className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700"
                      >
                        <Save size={24} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Foto Principal (Hero)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.hero_image ? (
                           <img src={`http://localhost:3001${settings.hero_image}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="hero_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('http://localhost:3001/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          updateSetting('hero_image', data.url);
                        }}
                      />
                      <label htmlFor="hero_upload" className="bg-white border border-gray-100 text-blue-600 px-6 py-4 rounded-2xl font-bold hover:bg-blue-50 cursor-pointer">
                        Trocar Imagem
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Foto da Seção Biografia
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.bio_image ? (
                           <img src={`http://localhost:3001${settings.bio_image}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="bio_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('http://localhost:3001/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          updateSetting('bio_image', data.url);
                        }}
                      />
                      <label htmlFor="bio_upload" className="bg-white border border-gray-100 text-blue-600 px-6 py-4 rounded-2xl font-bold hover:bg-blue-50 cursor-pointer">
                        Trocar Imagem
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-blue-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative">
            <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
              <X size={28} />
            </button>
            <h3 className="text-3xl font-black text-blue-950 mb-10">
              {editingItem?.id ? 'Editar' : 'Novo'} {
                activeTab === 'proposals' ? 'Proposta' : 
                activeTab === 'users' ? 'Usuário Admin' : 'Membro'
              }
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-6">
              {activeTab === 'proposals' ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Título</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Categoria</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                      >
                        <option>Gestão</option>
                        <option>Estrutura</option>
                        <option>Esportes</option>
                        <option>Segurança</option>
                        <option>Pessoas</option>
                        <option>Eventos</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Descrição Curta</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium h-24"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">🎯 Objetivo</label>
                      <input 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={editingItem.goal}
                        onChange={(e) => setEditingItem({...editingItem, goal: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Status</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                      >
                        <option>Planejado</option>
                        <option>Executando</option>
                        <option>Concluído</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : activeTab === 'users' ? (
                <>
                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">E-mail de Acesso</label>
                    <input 
                      type="email"
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={editingItem.email}
                      placeholder="novo-admin@aesj.com.br"
                      onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Senha Provisória</label>
                    <input 
                      type="password"
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={editingItem.password}
                      placeholder="••••••••"
                      onChange={(e) => setEditingItem({...editingItem, password: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-8">
                    <div className="relative group">
                      <div className="w-32 h-32 bg-blue-50 rounded-[2rem] overflow-hidden border-2 border-dashed border-blue-200 flex items-center justify-center">
                        {editingItem.photo ? (
                          <img src={`http://localhost:3001${editingItem.photo}`} className="w-full h-full object-cover" />
                        ) : <Camera size={40} className="text-blue-200" />}
                      </div>
                      <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Nome</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Cargo</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={editingItem.role}
                        onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 block">Biografia</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium h-32"
                      value={editingItem.bio}
                      onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-6">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                >
                  Confirmar e Salvar
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-5 border border-gray-100 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
