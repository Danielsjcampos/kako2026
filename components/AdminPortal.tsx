
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
  FileDown,
  Smartphone,
  RefreshCw,
  Send,

  Globe,
  Megaphone,
  StopCircle,
  PlayCircle
} from 'lucide-react';
import { FeedbackMessage, Participant, Supporter, Proposal } from '../types';
import { API_URL } from '../constants';
import { supabase, T } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autotable
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suggestions' | 'participants' | 'supporters' | 'proposals' | 'config' | 'users' | 'marketing'>('dashboard');
  
  const [suggestions, setSuggestions] = useState<FeedbackMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Editing states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp States
  const [evoStatus, setEvoStatus] = useState<'offline' | 'open' | 'connecting' | 'qrcode' | 'unknown'>('unknown');
  const [qrCode, setQrCode] = useState<string>('');
  const [testMessage, setTestMessage] = useState({ number: '', text: '', media: '' });
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);

  // Marketing States
  const [marketingForm, setMarketingForm] = useState({
    message: 'Olá {nome}, tudo bem?',
    imageUrl: '',
    footer: '', 
    interval: 60
  });
  const [sendingProgress, setSendingProgress] = useState({ active: false, current: 0, total: 0, logs: [] as string[] });
  const stopRef = useRef(false);

  // Local settings state
  // Local settings state
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLocalSetting = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(localSettings).map(([key, value]) => 
        supabase.from(T.settings).upsert({ key, value }, { onConflict: 'key' })
      );
      await Promise.all(updates);
      setSettings(localSettings);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const createInstance = async () => {
    if (!localSettings.evo_api_url || !localSettings.evo_instance_name || !localSettings.evo_api_key) {
      alert('Preencha URL, Nome da Instância e API Key antes de criar.');
      return;
    }

    setIsCreatingInstance(true);
    try {
      const url = `${localSettings.evo_api_url}/instance/create`;
      const body = {
        instanceName: localSettings.evo_instance_name,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      };
      
      const headers: any = {
        'Content-Type': 'application/json',
        'apikey': localSettings.evo_api_key
      };

      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await response.json();

      if (response.ok) {
        alert(`Instância cadastrada! Status: ${data.instance?.status || 'Criada'}`);
        // Tentar conectar para pegar QR Code se necessário
        if (data.qrcode && data.qrcode.base64) {
             setQrCode(data.qrcode.base64);
             setEvoStatus('qrcode');
        } else {
             checkEvolutionStatus();
        }
      } else {
        // Se já existe, tenta conectar
        if (data?.error?.includes('already exists')) {
             alert('Instância já existe. Tentando conectar...');
             connectInstance();
        } else {
             throw new Error(data?.message || JSON.stringify(data));
        }
      }
    } catch (err: any) {
      console.error('Create Error:', err);
      alert(`Erro ao criar instância: ${err.message}`);
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const deleteInstance = async () => {
    if (!confirm('Tem certeza? Isso irá desconectar o WhatsApp.')) return;
    
    setIsCreatingInstance(true); // Re-use loading state
    try {
      const url = `${localSettings.evo_api_url}/instance/delete/${localSettings.evo_instance_name}`;
      const headers: any = { 'apikey': localSettings.evo_api_key };
      
      const response = await fetch(url, { method: 'DELETE', headers });
      
      if (response.ok) {
        alert('Instância deletada com sucesso!');
        setEvoStatus('offline');
        setQrCode('');
      } else {
        const data = await response.json();
        throw new Error(data?.message || 'Erro ao deletar');
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const connectInstance = async () => {
    setIsCheckLoading(true);
    try {
         const url = `${localSettings.evo_api_url}/instance/connect/${localSettings.evo_instance_name}`;
         const headers: any = { 'apikey': localSettings.evo_api_key };
         const response = await fetch(url, { headers });
         const data = await response.json();
         
         if (data?.base64) {
             setQrCode(data.base64);
             setEvoStatus('qrcode');
         } else if (data?.instance?.state === 'open') {
             setEvoStatus('open');
             setQrCode('');
             alert('Instância já conectada!');
         } else {
             // In v2 sometimes it just returns the instance object
             if (data?.instance) {
                 alert(`Comando enviado. Status atual: ${data.instance.state}`);
                 checkEvolutionStatus();
             } else {
                 alert('Verifique o status em alguns instantes.');
             }
         }
    } catch (err) {
         console.error('Connect Error:', err);
         alert('Erro ao solicitar conexão.');
    } finally {
         setIsCheckLoading(false);
    }
  };

  const checkEvolutionStatus = async () => {
    if (!localSettings.evo_api_url || !localSettings.evo_instance_name) {
      alert('Configure a URL e o Nome da Instância primeiro.');
      return;
    }
    
    setIsCheckLoading(true);
    try {
      const url = `${localSettings.evo_api_url}/instance/connectionState/${localSettings.evo_instance_name}`;
      const headers: any = {};
      if (localSettings.evo_api_key) headers['apikey'] = localSettings.evo_api_key;

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data?.instance?.state) {
        setEvoStatus(data.instance.state);
        if (data.instance.state === 'open') setQrCode('');
      } else {
        setEvoStatus('offline');
      }
    } catch (err) {
      console.error('Evo Check Error:', err);
      setEvoStatus('offline');
    } finally {
      setIsCheckLoading(false);
    }
  };

  const sendEvolutionMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.evo_api_url || !settings.evo_instance_name) return;
    
    setIsTestLoading(true);
    try {
      const baseUrl = settings.evo_api_url;
      const instance = settings.evo_instance_name;
      const endpoint = testMessage.media 
        ? `${baseUrl}/message/sendMedia/${instance}`
        : `${baseUrl}/message/sendText/${instance}`;
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (localSettings.evo_api_key) headers['apikey'] = localSettings.evo_api_key;

      // Sanitization and Formatting
      let formattedNumber = testMessage.number.replace(/\D/g, '');
      // If it looks like a BR number (10 or 11 digits) without country code, add 55
      if (formattedNumber.length >= 10 && formattedNumber.length <= 11) {
        formattedNumber = '55' + formattedNumber;
      }

      const body: any = {
        number: formattedNumber
      };

      if (testMessage.media) {
          // Flat structure for compatibility with most Evolution V2 versions requiring root mediatype
          Object.assign(body, {
            mediatype: "image",
            media: testMessage.media,
            caption: testMessage.text,
            fileName: "image.png"
          });
      } else {
        body.text = testMessage.text;
      }

      console.log('Sending Body:', body);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Mensagem enviada com sucesso!');
        setTestMessage({ ...testMessage, text: '' });
      } else {
        console.error('Send Error Response:', data);
        // Better error message for the user
        const errorMsg = data?.response?.message || data?.message || JSON.stringify(data);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('Send Error:', err);
      alert(`Erro ao enviar: ${err.message}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const cleanNumber = (phone: string) => {
    // Remove non-digits
    let num = phone.replace(/\D/g, '');
    
    // Check if it starts with 55 (DDI Brazil)
    // Common cases:
    // 12981145599 (11 digits, missing 55) -> add 55
    // 11981145599 (11 digits, missing 55) -> add 55
    // 5512981145599 (13 digits, ok) -> keep
    
    if (num.length >= 10 && num.length <= 11) {
      num = '55' + num;
    }
    
    return num;
  };

  const stopCampaign = () => {
    stopRef.current = true;
    setSendingProgress(prev => ({ ...prev, logs: ['🛑 Parando envio...', ...prev.logs] }));
  };

  const handleMassSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.evo_api_url || !settings.evo_instance_name) {
      alert('Configure a API do Evolution nos Ajustes primeiro.');
      return;
    }

    if (!confirm(`Você está prestes a enviar mensagens para ${supporters.length} pessoas. O intervalo é de ${marketingForm.interval} segundos. Isso levará aproximadamente ${Math.round((supporters.length * marketingForm.interval) / 60)} minutos. Deseja continuar?`)) {
      return;
    }

    stopRef.current = false;
    setSendingProgress({ active: true, current: 0, total: supporters.length, logs: ['🚀 Iniciando campanha...'] });

    const baseUrl = settings.evo_api_url;
    const instance = settings.evo_instance_name;
    const headers: any = { 'Content-Type': 'application/json' };
    if (localSettings.evo_api_key) headers['apikey'] = localSettings.evo_api_key;

    for (let i = 0; i < supporters.length; i++) {
       if (stopRef.current) {
         setSendingProgress(prev => ({ ...prev, active: false, logs: ['🛑 Envio interrompido pelo usuário.', ...prev.logs] }));
         break;
       }

       const supporter = supporters[i];
       const phone = cleanNumber(supporter.phone || '');

       if (phone.length < 10) {
          setSendingProgress(prev => ({ 
            ...prev, 
            current: i + 1, 
            logs: [`⚠️ ${supporter.name}: Número inválido (${supporter.phone})`, ...prev.logs] 
          }));
          continue;
       }

       try {
          // Prepare message with name replacement
          const firstName = supporter.name.split(' ')[0];
          const content = marketingForm.message.replace(/{nome}/gi, firstName);
          
          let success = false;

          // Step A: Main Message (Text or Image+Caption)
          const body: any = { number: phone, options: { delay: 1200 } };
          
          if (marketingForm.imageUrl) {
            const endpoint = `${baseUrl}/message/sendMedia/${instance}`;
            // Flat structure
            Object.assign(body, {
                mediatype: "image",
                media: marketingForm.imageUrl,
                caption: content,
                fileName: "promo.png"
            });
            const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
            if (res.ok) success = true;
          } else {
            const endpoint = `${baseUrl}/message/sendText/${instance}`;
            body.text = content;
            const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
            if (res.ok) success = true;
          }

          // Step B: Footer / Final Text (if exists)
          if (marketingForm.footer && success) {
             // Small natural delay between bubbles
             await new Promise(r => setTimeout(r, 2000));
             
             const endpoint = `${baseUrl}/message/sendText/${instance}`;
             const footerBody = {
               number: phone,
               options: { delay: 1000 },
               text: marketingForm.footer.replace(/{nome}/gi, firstName)
             };
             await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(footerBody) });
          }

          if (success) {
            setSendingProgress(prev => ({ 
                ...prev, 
                current: i + 1, 
                logs: [`✅ ${supporter.name}: Enviado`, ...prev.logs] 
            }));
          } else {
             throw new Error('API Error');
          }

       } catch (err) {
          setSendingProgress(prev => ({ 
            ...prev, 
            current: i + 1, 
            logs: [`❌ ${supporter.name}: Falha no envio`, ...prev.logs] 
          }));
       }

       // Wait Interval (but check stop flag periodically)
       if (i < supporters.length - 1) {
          const intervalMs = marketingForm.interval * 1000;
          const step = 1000; // Check every second
          for (let w = 0; w < intervalMs; w += step) {
             if (stopRef.current) break;
             await new Promise(r => setTimeout(r, step));
          }
       }
    }

    if (!stopRef.current) {
       setSendingProgress(prev => ({ ...prev, active: false, logs: ['🎉 Envio em massa finalizado!', ...prev.logs] }));
       alert('Envio em massa finalizado!');
    }
  };

  // Auth persistence check
  useEffect(() => {
    const admin = localStorage.getItem('aesj_admin_session');
    if (admin) setIsLoggedIn(true);
  }, []);

  // Auto-check status with polling when on config tab
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTab === 'config' && settings.evo_api_url && settings.evo_instance_name) {
      checkEvolutionStatus(); // Initial check
      interval = setInterval(checkEvolutionStatus, 10000); // Poll every 10s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, settings.evo_api_url, settings.evo_instance_name]);

  // Load data from API
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      try {
        const [
          { data: sugData },
          { data: partData },
          { data: suppData },
          { data: propData },
          { data: settingsRows },
          { data: usersData }
        ] = await Promise.all([
          supabase.from(T.suggestions).select('*').order('created_at', { ascending: false }),
          supabase.from(T.participants).select('*').order('display_order', { ascending: true }),
          supabase.from(T.supporters).select('*').order('created_at', { ascending: false }),
          supabase.from(T.proposals).select('*').order('id', { ascending: true }),
          supabase.from(T.settings).select('*'),
          supabase.from(T.admin_users).select('id, email').order('id', { ascending: true })
        ]);
        
        setSuggestions(sugData || []);
        const sortedParticipants = (partData || []).sort((a, b) => {
          const roleA = (a.role || '').toLowerCase();
          const roleB = (b.role || '').toLowerCase();
          const isPresA = roleA.includes('presidente') && !roleA.includes('vice');
          const isPresB = roleB.includes('presidente') && !roleB.includes('vice');
          if (isPresA && !isPresB) return -1;
          if (!isPresA && isPresB) return 1;
          return 0;
        });
        setParticipants(sortedParticipants);
        setSupporters(suppData || []);
        setProposals(propData || []);
        setAdminUsers(usersData || []);
        
        const settingsMap: Record<string, string> = {};
        settingsRows?.forEach(row => {
          settingsMap[row.key] = row.value;
        });
        setSettings(settingsMap);
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
      const { data, error } = await supabase
        .from(T.admin_users)
        .select('*')
        .eq('email', loginForm.email)
        .eq('password', loginForm.password)
        .single();

      if (data) {
        setIsLoggedIn(true);
        localStorage.setItem('aesj_admin_session', JSON.stringify({ email: data.email }));
      } else {
        alert('E-mail ou senha incorretos.');
      }
    } catch (err) {
      alert('Erro ao conectar ao banco de dados.');
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
    
    try {
      const tableName = T[type as keyof typeof T] || T.admin_users; // Fallback to users map if complex
      let finalTable = tableName;
      if (type === 'users') finalTable = T.admin_users;

      const { error } = await supabase.from(finalTable).delete().eq('id', id);
      if (error) throw error;
      
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
    
    try {
      const tableName = T[type as keyof typeof T] || T.admin_users;
      let finalTable = tableName;
      if (type === 'users') finalTable = T.admin_users;

      let result;
      if (isEditing) {
        result = await supabase.from(finalTable).update(editingItem).eq('id', editingItem.id).select().single();
      } else {
        const { id, ...newItem } = editingItem;
        result = await supabase.from(finalTable).insert([newItem]).select().single();
      }
      
      if (result.error) throw result.error;
      const savedItem = result.data;
      
      if (type === 'proposals') {
        if (isEditing) setProposals(proposals.map(p => p.id === savedItem.id ? savedItem : p));
        else setProposals([...proposals, savedItem]);
      } else if (type === 'participants') {
        if (isEditing) setParticipants(participants.map(p => p.id === savedItem.id ? savedItem : p));
        else setParticipants([...participants, savedItem]);
      } else if (type === 'users') {
        if (isEditing) setAdminUsers(adminUsers.map(u => u.id === savedItem.id ? savedItem : u));
        else setAdminUsers([...adminUsers, savedItem]);
      } else if (type === 'supporters') {
        if (isEditing) setSupporters(supporters.map(s => s.id === savedItem.id ? savedItem : s));
        else setSupporters([...supporters, savedItem]);
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

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName; // Upload direct to root of bucket for simplicity

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setEditingItem({ ...editingItem, photo: publicUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Erro: ${err.message || 'Erro ao subir imagem'}. Certifique-se que o bucket "uploads" existe e tem permissão de INSERT para usuários anônimos.`);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from(T.settings)
        .upsert({ key, value }, { onConflict: 'key' });
      
      if (error) throw error;
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
    
    // Add Logo if exists (Safe implementation)
    const addLogo = async () => {
      if (settings.site_logo) {
        try {
          // If it's a local blob/file URL (uploaded recently) or a public URL
          const logoUrl = settings.site_logo.startsWith('http') ? settings.site_logo : `${API_URL}${settings.site_logo}`;
          
          // Fetch image to convert to base64 to avoid CORS/Security issues
          const response = await fetch(logoUrl, { mode: 'cors' });
          if (!response.ok) throw new Error('Fetch failed');
          
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          doc.addImage(base64, 'PNG', 14, 10, 20, 20);
        } catch (e) {
          console.warn('Could not add logo to PDF (CORS or Invalid URL):', e);
        }
      }
    };

    // Use a promise to ensure logo is added (or failed) before saving

    addLogo().finally(() => {
      try {
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(127, 29, 29); // Red 900
        doc.text('Lista Oficial de Apoiadores', 40, 20);
        doc.setFontSize(12);
        doc.text('Chapa Kako Blanch 2026', 40, 28);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Total: ${supporters.length} apoiadores`, 14, 40);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 150, 40);

        const tableColumn = ["Nome", "Nº Título", "Telefone", "Data"];
        const tableRows = supporters.map(s => [
          s.name,
          s.title_number || '-',
          s.phone || '-',
          s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '-'
        ]);

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 45,
          theme: 'grid',
          headStyles: { fillColor: [127, 29, 29], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { top: 45 },
        });

        doc.save(`apoiadores_kako_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err) {
        console.error('PDF Generation Error:', err);
        alert('Erro ao gerar PDF. Verifique o console.');
      }
    });
  };

  if (!isLoggedIn) {
     return (
      <div className="fixed inset-0 z-[100] bg-red-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2rem] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600" />
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Lock className="text-red-600" size={40} />
            </div>
            <h2 className="text-3xl font-black text-red-950">Acesso Restrito</h2>
            <p className="text-gray-500 font-medium mt-2">Identifique-se para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">E-mail</label>
              <input 
                type="email"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
                placeholder="admin@aesj.com.br"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Senha</label>
              <input 
                type="password"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              {isLoginLoading ? 'Verificando...' : 'Entrar no Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header Overlay */}
      <div className="md:hidden bg-red-950 text-white p-4 flex justify-between items-center z-[110]">
        <div>
          <h2 className="text-xl font-black tracking-tighter">PORTAL <span className="text-red-400">KAKO</span></h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-red-600 rounded-xl">
          {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative top-0 left-0 bottom-0 z-[105] md:z-auto w-72 bg-red-950 text-white p-8 flex flex-col transition-transform duration-300 ease-in-out
      `}>
        <div className="mb-12 hidden md:block">
          <h2 className="text-2xl font-black tracking-tighter">PORTAL <span className="text-red-400">KAKO</span></h2>
          <p className="text-xs text-red-300 font-bold uppercase tracking-widest mt-1">Gestão Interna 2026</p>
        </div>
        
        <nav className="flex-1 space-y-2 pt-16 md:pt-0">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'proposals', label: 'Propostas', icon: Package },
              { id: 'participants', label: 'Chapa', icon: Users },
              { id: 'suggestions', label: 'Sugestões', icon: MessageSquare, badge: suggestions.length },
              { id: 'supporters', label: 'Apoiadores', icon: Heart, badge: supporters.length },
              { id: 'marketing', label: 'Disparos', icon: Megaphone },
              { id: 'users', label: 'Usuários Admin', icon: Shield },
              { id: 'config', label: 'Ajustes', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold ${
                  activeTab === tab.id ? 'bg-red-600 shadow-lg shadow-red-900/50' : 'hover:bg-white/5'
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
            <button onClick={onClose} className="w-full flex items-center gap-2 text-red-300 hover:text-white transition-colors font-bold text-sm">
              <X size={18} /> Fechar Painel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-12 pb-24 md:pb-12">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black text-red-950">Visão Geral</h3>
                <p className="text-gray-500 mt-2">Acompanhe em tempo real as métricas da campanha.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
                  <Package className="text-red-600 mb-4 relative z-10" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Propostas</p>
                  <p className="text-4xl font-black text-red-950 mt-1 relative z-10">{proposals.length}</p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
                  <Heart className="text-red-500 mb-4 relative z-10" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Apoiadores</p>
                  <p className="text-4xl font-black text-red-950 mt-1 relative z-10">{supporters.length}</p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
                  <MessageSquare className="text-orange-500 mb-4 relative z-10" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Sugestões</p>
                  <p className="text-4xl font-black text-red-950 mt-1 relative z-10">{suggestions.length}</p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
                  <Users className="text-purple-600 mb-4 relative z-10" size={32} />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Membros</p>
                  <p className="text-4xl font-black text-red-950 mt-1 relative z-10">{participants.length}</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Growth Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                   <h4 className="text-xl font-black text-red-950 mb-6">Crescimento da Base</h4>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={supporters.reduce((acc: any[], curr) => {
                          const date = new Date(curr.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                          const existing = acc.find(item => item.name === date);
                          if (existing) {
                             existing.value += 1;
                          } else {
                             acc.push({ name: date, value: 1 });
                          }
                          return acc;
                        }, []).sort((a,b) => a.name.localeCompare(b.name))}> // Simple sort, ideal would be true date sort
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#9ca3af'}} 
                            dy={10}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#ef4444" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                        </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* Categories Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                   <h4 className="text-xl font-black text-red-950 mb-6">Sugestões por Categoria</h4>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(suggestions.reduce((acc: any, curr) => {
                            acc[curr.category] = (acc[curr.category] || 0) + 1;
                            return acc;
                        }, {})).map(([name, value]) => ({ name, value }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#9ca3af'}} 
                            dy={10}
                          />
                          <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-red-950">Gerenciar Propostas</h3>
                <button 
                  onClick={() => { setEditingItem({ title: '', description: '', goal: '', status: 'Planejado', category: 'Gestão' }); setIsModalOpen(true); }}
                  className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-900/20"
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
                        p.status === 'Executando' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        <CheckCircle size={24} />
                      </div>
                      <div className="cursor-pointer" onClick={() => { setEditingItem(p); setIsModalOpen(true); }}>
                        <h4 className="font-bold text-red-950 text-lg group-hover:text-red-600 transition-colors">{p.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{p.category}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-xs font-bold text-red-500">{p.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => { setEditingItem(p); setIsModalOpen(true); }} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
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
                <h3 className="text-3xl font-black text-red-950">Membros da Chapa</h3>
                <button 
                  onClick={() => { setEditingItem({ name: '', role: '', bio: '', photo: '' }); setIsModalOpen(true); }}
                  className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-900/20"
                >
                  <Plus size={20} /> Novo Membro
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {participants.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setEditingItem(p); setIsModalOpen(true); }}>
                      <div className="w-16 h-16 bg-red-100 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                        {p.photo ? (
                          <img src={p.photo?.startsWith('http') ? p.photo : `${API_URL}${p.photo}`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-red-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-red-950 text-lg">{p.name}</h4>
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest">{p.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingItem(p); setIsModalOpen(true); }} className="text-gray-300 hover:text-red-500 p-2">
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
              <h3 className="text-3xl font-black text-red-950 mb-8">Sugestões do Sócio</h3>
              <div className="space-y-4">
                {suggestions.map((s) => (
                  <div key={s.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">{s.category}</span>
                        {s.is_anonymous && <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">Anônimo</span>}
                      </div>
                      <button onClick={() => deleteItem(s.id, 'suggestions')} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <h4 className="font-black text-red-950 text-xl">{s.name}</h4>
                    {s.title_number && <p className="text-xs font-bold text-red-500 mt-1 uppercase tracking-widest">Título: {s.title_number}</p>}
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
                <h3 className="text-3xl font-black text-red-950">Base de Apoiadores</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={exportSupportersCSV}
                    className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-900/20 transition-all"
                  >
                    <Download size={20} /> Exportar CSV
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-black text-red-900 uppercase tracking-widest">Nome</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-red-900 uppercase tracking-widest">Título</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-red-900 uppercase tracking-widest">Telefone</th>
                      <th className="px-8 py-5 text-right text-xs font-black text-red-900 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {supporters.map((s) => (
                      <tr key={s.id} className="hover:bg-red-50/50 transition-colors group">
                        <td className="px-8 py-4 font-bold text-red-950">{s.name}</td>
                        <td className="px-8 py-4 font-medium text-gray-500">{s.title_number || '-'}</td>
                        <td className="px-8 py-4 font-medium text-gray-500">{s.phone || '-'}</td>
                        <td className="px-8 py-4 flex justify-end gap-2">
                           <button 
                            onClick={() => { setEditingItem(s); setIsModalOpen(true); }}
                            className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem(s.id!, 'supporters')} 
                            className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {supporters.length === 0 && (
                  <div className="text-center py-20 text-gray-400 font-medium">
                    Nenhum apoiador cadastrado ainda.
                  </div>
                )}
              </div>
            </div>
          )}



          {activeTab === 'marketing' && (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
               <div className="mb-8">
                 <h3 className="text-3xl font-black text-red-950">Disparos de Marketing</h3>
                 <p className="text-gray-500 font-medium mt-2">Envie mensagens em massa para seus {supporters.length} apoiadores.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                 {/* Configuration Form */}
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col h-fit">
                    <form onSubmit={handleMassSend} className="space-y-6">
                      
                      <div>
                        <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">
                           Mensagem Principal
                        </label>
                        <textarea 
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium h-32 text-sm"
                          placeholder="Olá {nome}, novidades da campanha..."
                          value={marketingForm.message}
                          onChange={(e) => setMarketingForm({...marketingForm, message: e.target.value})}
                          required
                        />
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">Use {'{nome}'} para substituir pelo nome do apoiador.</p>
                      </div>

                      <div>
                        <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">
                           URL da Imagem (Opcional)
                        </label>
                        <input 
                           className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
                           placeholder="https://..."
                           value={marketingForm.imageUrl}
                           onChange={(e) => setMarketingForm({...marketingForm, imageUrl: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">
                           Mensagem Final / Rodapé (Opcional)
                        </label>
                        <textarea 
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium h-20 text-sm"
                          placeholder="Acesse: www.kakoblanch.com.br"
                          value={marketingForm.footer}
                          onChange={(e) => setMarketingForm({...marketingForm, footer: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">
                           Intervalo (Segundos)
                        </label>
                        <input 
                           type="number"
                           min="10"
                           className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm font-mono"
                           value={marketingForm.interval}
                           onChange={(e) => setMarketingForm({...marketingForm, interval: parseInt(e.target.value)})}
                        />
                         <p className="text-[10px] text-orange-400 mt-1 font-bold">Recomendado: min. 30s para evitar bloqueios.</p>
                      </div>

                      {!sendingProgress.active ? (
                        <button 
                          type="submit"
                          className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/20 flex items-center justify-center gap-2"
                        >
                          <PlayCircle size={20} /> Iniciar Disparos
                        </button>
                      ) : (
                         <button 
                          type="button"
                          onClick={stopCampaign}
                          className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-900/20 flex items-center justify-center gap-2 animate-pulse"
                        >
                          <StopCircle size={20} /> Parar Disparos
                        </button>
                      )}
                    </form>
                 </div>

                 {/* Status & Logs */}
                 <div className="bg-gray-950 text-white p-8 rounded-[2.5rem] shadow-lg flex flex-col overflow-hidden h-fit max-h-[600px]">
                    <h4 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${sendingProgress.active ? 'bg-green-500 animate-ping' : 'bg-gray-700'}`} />
                       Status do Envio
                    </h4>

                    {sendingProgress.active || sendingProgress.current > 0 ? (
                       <div className="mb-6">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
                             <span>Progresso</span>
                             <span>{Math.round((sendingProgress.current / sendingProgress.total) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                             <div 
                               className="bg-red-500 h-full transition-all duration-300"
                               style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                             />
                          </div>
                          <p className="text-center mt-3 font-mono text-sm">
                            {sendingProgress.current} / {sendingProgress.total} enviados
                          </p>
                       </div>
                    ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-gray-700 mb-6">
                          <Megaphone size={48} className="mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Aguardando Início</p>
                       </div>
                    )}

                    <div className="flex-1 bg-gray-900/50 rounded-2xl p-4 overflow-y-auto font-mono text-xs space-y-2 border border-white/5 scrollbar-thin scrollbar-thumb-gray-700">
                       {sendingProgress.logs.length === 0 ? (
                         <div className="text-gray-600 italic text-center py-4">Logs de envio aparecerão aqui...</div>
                       ) : (
                         sendingProgress.logs.map((log, i) => (
                           <div key={i} className="border-b border-white/5 last:border-0 pb-1 last:pb-0">
                              {log}
                           </div>
                         ))
                       )}
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-red-950">Administradores do Sistema</h3>
                <button 
                  onClick={() => { setEditingItem({ email: '', password: '' }); setIsModalOpen(true); }}
                  className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-900/20"
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
                        <h4 className="font-bold text-red-950 text-lg">{u.email}</h4>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Acesso Administrativo</p>
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
              <h3 className="text-3xl font-black text-red-950">Ajustes do Sistema</h3>
              
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Logo do Site (Topo e FAQ)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.site_logo ? (
                           <img src={settings.site_logo?.startsWith('http') ? settings.site_logo : `${API_URL}${settings.site_logo}`} className="w-full h-full object-contain p-2" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="logo_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `settings/${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
                            if (error) throw error;
                            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                            updateSetting('site_logo', publicUrl);
                          } catch (err) {
                            alert('Erro ao subir logotipo');
                          }
                        }}
                      />
                      <label htmlFor="logo_upload" className="bg-white border border-gray-100 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 cursor-pointer">
                        Trocar Logo
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Imagem de Compartilhamento (SEO)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.share_image ? (
                           <img src={settings.share_image?.startsWith('http') ? settings.share_image : `${API_URL}${settings.share_image}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="share_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `settings/${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
                            if (error) throw error;
                            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                            updateSetting('share_image', publicUrl);
                          } catch (err) {
                            alert('Erro ao subir capa');
                          }
                        }}
                      />
                      <label htmlFor="share_upload" className="bg-white border border-gray-100 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 cursor-pointer">
                        Trocar Capa
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                      <Youtube size={16} /> Link do Vídeo (YouTube)
                    </label>
                    <div className="flex gap-4">
                      <input 
                        className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={localSettings.youtube_url || ''}
                        onChange={(e) => updateLocalSetting('youtube_url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Foto Principal (Hero)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.hero_image ? (
                           <img src={settings.hero_image?.startsWith('http') ? settings.hero_image : `${API_URL}${settings.hero_image}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="hero_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `hero/${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
                            if (error) throw error;
                            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                            updateSetting('hero_image', publicUrl);
                          } catch (err) {
                            alert('Erro ao subir imagem hero');
                          }
                        }}
                      />
                      <label htmlFor="hero_upload" className="bg-white border border-gray-100 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 cursor-pointer">
                        Trocar Imagem
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Foto da Seção Biografia
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.bio_image ? (
                           <img src={settings.bio_image?.startsWith('http') ? settings.bio_image : `${API_URL}${settings.bio_image}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="bio_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `bio/${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
                            if (error) throw error;
                            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                            updateSetting('bio_image', publicUrl);
                          } catch (err) {
                            alert('Erro ao subir imagem bio');
                          }
                        }}
                      />
                      <label htmlFor="bio_upload" className="bg-white border border-gray-100 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 cursor-pointer">
                        Trocar Imagem
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 block flex items-center gap-2">
                       <ImageIcon size={16} /> Logo da Chapa (Ouvidoria)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {settings.chapa_logo ? (
                           <img src={settings.chapa_logo?.startsWith('http') ? settings.chapa_logo : `${API_URL}${settings.chapa_logo}`} className="w-full h-full object-cover" />
                        ) : <Upload size={24} className="text-gray-300" />}
                      </div>
                      <input 
                        type="file" 
                        id="chapa_logo_upload" 
                        hidden 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `chapa/${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
                            if (error) throw error;
                            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                            updateSetting('chapa_logo', publicUrl);
                          } catch (err) {
                            alert('Erro ao subir logo da chapa');
                          }
                        }}
                      />
                      <label htmlFor="chapa_logo_upload" className="bg-white border border-gray-100 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 cursor-pointer">
                        Trocar Imagem
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Integration Section */}
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Smartphone className="text-green-600" size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-red-950">Integração WhatsApp</h4>
                    <p className="text-gray-400 font-medium">Evolution API v2.3</p>
                  </div>
                  <div className={`ml-auto px-4 py-2 rounded-full font-bold uppercase text-xs tracking-widest ${
                    evoStatus === 'open' ? 'bg-green-100 text-green-700' : 
                    evoStatus === 'offline' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {evoStatus === 'unknown' ? 'Desconhecido' : evoStatus}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block flex items-center gap-2">
                        <Globe size={14} /> URL da API
                      </label>
                      <input 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        placeholder="https://api.com.br"
                        value={localSettings.evo_api_url || ''}
                        onChange={(e) => updateLocalSetting('evo_api_url', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">
                        API Key (Global)
                      </label>
                      <input 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        placeholder="sk_..."
                        type="password"
                        value={localSettings.evo_api_key || ''}
                        onChange={(e) => updateLocalSetting('evo_api_key', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">
                        Nome da Instância
                      </label>
                      <div className="flex flex-col gap-3">
                        <input 
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                          placeholder="minha_instancia"
                          value={localSettings.evo_instance_name || ''}
                          onChange={(e) => updateLocalSetting('evo_instance_name', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={createInstance}
                            disabled={isCreatingInstance}
                            className="bg-red-600 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-700"
                          >
                            {isCreatingInstance ? '...' : 'Criar'}
                          </button>
                          <button 
                            onClick={connectInstance}
                            disabled={isCheckLoading}
                            className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-700"
                          >
                             <RefreshCw size={14} /> Conectar
                          </button>
                          <button 
                            onClick={deleteInstance}
                            className="bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-200"
                          >
                             <Trash2 size={14} /> Deletar
                          </button>
                          <button 
                            onClick={checkEvolutionStatus}
                            disabled={isCheckLoading}
                            className="bg-gray-200 text-gray-600 px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-300"
                          >
                             Status
                          </button>
                        </div>
                      </div>
                    </div>

                    {qrCode && (
                       <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center">
                          <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-4">Escaneie o QR Code</p>
                          <img src={qrCode} alt="QR Code WhatsApp" className="w-48 h-48 object-contain" />
                       </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <h5 className="font-black text-red-950 mb-6 flex items-center gap-2">
                      <Send size={18} /> Teste de Envio
                    </h5>
                    <form onSubmit={sendEvolutionMessage} className="space-y-4">
                      <input 
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm"
                        placeholder="5511999999999"
                        value={testMessage.number}
                        onChange={(e) => setTestMessage({...testMessage, number: e.target.value})}
                      />
                      <textarea 
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm h-24"
                        placeholder="Olá! Teste de mensagem..."
                        value={testMessage.text}
                        onChange={(e) => setTestMessage({...testMessage, text: e.target.value})}
                      />
                      <input 
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm"
                        placeholder="URL da Imagem (Opcional)"
                        value={testMessage.media}
                        onChange={(e) => setTestMessage({...testMessage, media: e.target.value})}
                      />
                      <button 
                        type="submit"
                        disabled={isTestLoading}
                        className="w-full bg-red-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-900 disabled:opacity-50"
                      >
                        {isTestLoading ? 'Enviando...' : 'Enviar Teste'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-white border-t border-gray-200 p-8 rounded-b-[3rem] -mx-10 -mb-10 mt-10 flex justify-end">
                  <button 
                    onClick={saveAllSettings}
                    disabled={isSaving}
                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 shadow-xl shadow-red-900/20 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
                    Salvar Alterações
                  </button>
              </div>
            </div>
          )}

        </div>


      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="absolute top-6 right-6 sm:top-8 sm:right-8 text-gray-400 hover:text-gray-600">
              <X size={28} />
            </button>
            <h3 className="text-2xl sm:text-3xl font-black text-red-950 mb-6 sm:mb-10">
              {editingItem?.id ? 'Editar' : 'Novo'} {
                activeTab === 'proposals' ? 'Proposta' : 
                activeTab === 'users' ? 'Usuário Admin' : 
                activeTab === 'supporters' ? 'Apoiador' : 'Membro'
              }
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-6">
              {activeTab === 'proposals' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Título</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Categoria</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
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
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Descrição Curta</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium h-24"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">🎯 Objetivo</label>
                      <input 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        value={editingItem.goal}
                        onChange={(e) => setEditingItem({...editingItem, goal: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Status</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
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
              ) : activeTab === 'supporters' ? (
                 <>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Nome</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Nº Título</label>
                      <input 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        value={editingItem.title_number || ''}
                        onChange={(e) => setEditingItem({...editingItem, title_number: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Telefone / WhatsApp</label>
                    <input 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      placeholder="(00) 00000-0000"
                      value={editingItem.phone || ''}
                      onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                    />
                  </div>
                 </> 
              ) : activeTab === 'users' ? (
                <>
                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">E-mail de Acesso</label>
                    <input 
                      type="email"
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      value={editingItem.email}
                      placeholder="novo-admin@aesj.com.br"
                      onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Senha Provisória</label>
                    <input 
                      type="password"
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
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
                      <div className="w-32 h-32 bg-red-50 rounded-[2rem] overflow-hidden border-2 border-dashed border-blue-200 flex items-center justify-center">
                        {editingItem.photo ? (
                          <img src={editingItem.photo?.startsWith('http') ? editingItem.photo : `${API_URL}${editingItem.photo}`} className="w-full h-full object-cover" />
                        ) : <Camera size={40} className="text-blue-200" />}
                      </div>
                      <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Nome</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Cargo</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        value={editingItem.role}
                        onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 block">Biografia</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium h-32"
                      value={editingItem.bio}
                      onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="submit"
                  className="w-full sm:flex-1 bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20"
                >
                  Confirmar e Salvar
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:px-8 py-5 border border-gray-100 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50"
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
