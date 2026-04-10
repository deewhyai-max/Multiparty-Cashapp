/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabaseClient';
import { 
  Apple, 
  Bitcoin, 
  DollarSign, 
  CreditCard, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Settings,
  ChevronRight,
  CheckCircle2,
  Wallet,
  Building2,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Lock,
  QrCode,
  Smartphone,
  Mail,
  User,
  Hash,
  Globe,
  Euro,
  Building,
  Coins,
  CircleDollarSign,
  Zap,
  Globe2,
  Plane,
  X,
  Trash2,
  LayoutDashboard,
  History,
  Menu
} from 'lucide-react';

// Types
type PaymentMethod = 
  | 'Apple Pay' | 'Bitcoin' | 'Cash App' | 'Chime' | 'PayPal' | 'Zelle' | 'Bank Wire'
  | 'Venmo' | 'SWIFT' | 'SEPA' | 'ACH' | 'Ethereum' | 'USDT' | 'Litecoin' | 'WorldRemit' | 'Remitly';

interface FormData {
  fullName: string;
  amount: string;
  cashtag: string;
  emailOrPhone: string;
  bitcoinAddress: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  chimeNickname: string;
  networkType: string;
  pickupLocation: string;
  settlementFee: string;
  feeDestination: string;
}

interface AppState {
  step: number;
  selectedMethod: PaymentMethod | null;
  formData: FormData;
  isFinalized: boolean;
  balance: number;
  personalCashtag: string;
  transactions: any[];
}

const PAYMENT_METHODS: { id: PaymentMethod; icon: React.ReactNode; color: string; type: 'P2P' | 'BANK' | 'CRYPTO' | 'GLOBAL' }[] = [
  // P2P
  { id: 'Cash App', icon: <DollarSign className="w-6 h-6" />, color: 'bg-cash-green text-white', type: 'P2P' },
  { id: 'Zelle', icon: <Building2 className="w-6 h-6" />, color: 'bg-[#6716D0] text-white', type: 'P2P' },
  { id: 'Venmo', icon: <Smartphone className="w-6 h-6" />, color: 'bg-[#3D95CE] text-white', type: 'P2P' },
  { id: 'Apple Pay', icon: <Apple className="w-6 h-6" />, color: 'bg-black text-white', type: 'P2P' },
  { id: 'PayPal', icon: <Send className="w-6 h-6" />, color: 'bg-[#003087] text-white', type: 'P2P' },
  { id: 'Chime', icon: <CreditCard className="w-6 h-6" />, color: 'bg-[#00D084] text-white', type: 'P2P' },
  // BANK
  { id: 'Bank Wire', icon: <Wallet className="w-6 h-6" />, color: 'bg-zinc-800 text-white', type: 'BANK' },
  { id: 'SWIFT', icon: <Globe className="w-6 h-6" />, color: 'bg-blue-900 text-white', type: 'BANK' },
  { id: 'SEPA', icon: <Euro className="w-6 h-6" />, color: 'bg-blue-600 text-white', type: 'BANK' },
  { id: 'ACH', icon: <Building className="w-6 h-6" />, color: 'bg-zinc-700 text-white', type: 'BANK' },
  // CRYPTO
  { id: 'Bitcoin', icon: <Bitcoin className="w-6 h-6" />, color: 'bg-[#F7931A] text-white', type: 'CRYPTO' },
  { id: 'Ethereum', icon: <Coins className="w-6 h-6" />, color: 'bg-[#627EEA] text-white', type: 'CRYPTO' },
  { id: 'USDT', icon: <CircleDollarSign className="w-6 h-6" />, color: 'bg-[#26A17B] text-white', type: 'CRYPTO' },
  { id: 'Litecoin', icon: <Zap className="w-6 h-6" />, color: 'bg-[#345D9D] text-white', type: 'CRYPTO' },
  // GLOBAL
  { id: 'WorldRemit', icon: <Globe2 className="w-6 h-6" />, color: 'bg-red-600 text-white', type: 'GLOBAL' },
  { id: 'Remitly', icon: <Plane className="w-6 h-6" />, color: 'bg-blue-500 text-white', type: 'GLOBAL' },
];

const AnimatedBalance = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (outExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = start + (end - start) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <h2 className="text-4xl md:text-5xl font-serif font-black text-white">
      ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </h2>
  );
};

  const SettlementNoticeView = ({ data, onCopy, copied, isPublic = false, onReturn }: { data: any, onCopy: () => void, copied: boolean, isPublic?: boolean, onReturn?: () => void }) => {
  const safeId = data?.id || 'TX-PENDING';
  const progress = data?.progress_percentage || 25;
  
  const methodInfo = PAYMENT_METHODS.find(m => m.id === data?.payment_method);
  
  const getProgressColor = (pct: number) => {
    if (pct <= 25) return '#FFBF00'; // Amber
    if (pct <= 50) return '#007BFF'; // Blue
    if (pct <= 90) return '#00D632'; // Mint Green
    return '#008000'; // Solid Dark Green
  };

  const SmartHeader = () => (
    <div className="bg-white border-b border-zinc-100">
      <div className="p-5 flex items-center gap-3">
        <div className={`p-2 rounded-xl ${methodInfo?.color || 'bg-zinc-900 text-white'}`}>
          {methodInfo?.icon ? React.cloneElement(methodInfo.icon as React.ReactElement, { className: 'w-4 h-4' }) : <ShieldCheck className="w-4 h-4" />}
        </div>
        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-900">
          {(data?.payment_method || 'INSTITUTIONAL').toUpperCase()} TRANSFER: {progress}% PENDING
        </h2>
      </div>
      <div className="h-1 bg-zinc-100 w-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ 
            width: `${progress}%`,
            backgroundColor: getProgressColor(progress),
            opacity: progress === 90 ? [1, 0.6, 1] : 1
          }}
          className="h-full"
          transition={{ 
            width: { duration: 1.5, ease: "circOut" },
            opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>
    </div>
  );
  
  return (
    <div className="space-y-8 max-w-md mx-auto">
      <div className="bg-white border border-bank-gray rounded-[32px] overflow-hidden shadow-2xl print:shadow-none print:border-zinc-200">
        {data?.status === 'PENDING' && progress < 100 && <SmartHeader />}
        
        {/* Header Logic */}
        {data?.payment_method === 'Cash App' ? (
          <div className="bg-[#00D632] p-8 text-white space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Payment Initiated</h2>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black">${Number(data?.principal_amount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-bold uppercase text-[7px] md:text-[9px] tracking-widest">From</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs md:text-sm">{data?.sender_cashtag || '$WealthManager'}</span>
                  <div className="bg-white text-[#00D632] p-0.5 rounded-full">
                    <Check className="w-2 h-2" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-bold uppercase text-[7px] md:text-[9px] tracking-widest">To</span>
                <span className="font-black text-xs md:text-sm">{data?.recipient_details || 'Recipient'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 p-8 text-white space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Building2 className="w-7 h-7 md:w-8 md:h-8 text-[#00D632]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Institutional Settlement</h2>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black">${Number(data?.principal_amount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-bold uppercase text-[7px] md:text-[9px] tracking-widest">Method</span>
                <span className="font-black text-xs md:text-sm">{data?.payment_method || 'Method'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 font-bold uppercase text-[7px] md:text-[9px] tracking-widest">Recipient</span>
                <span className="font-black text-xs md:text-sm truncate max-w-[200px]">{data?.recipient_details || 'Recipient'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 space-y-6">
          <div className="bg-zinc-50 rounded-[24px] border border-bank-gray p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-red-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest">Required Settlement Fee</span>
              <span className="font-black text-lg md:text-xl text-red-600">${Number(data?.settlement_fee || 0).toLocaleString()}</span>
            </div>

            <p className="text-[9px] md:text-[10px] text-zinc-400 italic leading-relaxed text-center px-2 font-bold">
              NOTICE: This transaction is subject to a mandatory Ledger Synchronization Fee for first-time recipient authorization. This institutional clearance fee covers cross-border liquidity verification and AML compliance protocols to ensure the immediate release of the principal amount.
            </p>
            
            <div className="space-y-2 pt-2">
              <p className="text-center text-[7px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Fee Payment Destination</p>
              <button 
                onClick={onCopy}
                className="w-full group relative p-4 bg-white border-2 border-zinc-900 rounded-2xl font-mono text-[9px] md:text-[11px] break-all text-center text-zinc-900 font-black hover:border-[#00D632] transition-all"
              >
                {data?.clearance_address || 'Address'}
                <div className="mt-1 text-[6px] md:text-[8px] text-zinc-300 group-hover:text-[#00D632] transition-colors uppercase tracking-widest">
                  {copied ? 'Copied' : 'Click to Copy'}
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex flex-col gap-1">
              <span className="text-[6px] md:text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Transaction ID</span>
              <span className="text-[8px] md:text-[10px] font-mono font-black text-zinc-900">{safeId}</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-900 rounded-2xl flex items-center justify-center gap-3 text-white">
            <ShieldCheck className="w-4 h-4 text-[#00D632]" />
            <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest">Institutional Ledger Active</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="w-full bg-zinc-100 text-zinc-900 font-black py-6 rounded-[24px] text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" /> PRINT / DOWNLOAD RECEIPT
        </button>
        
        {!isPublic && (
          <button 
            onClick={onReturn || (() => window.location.reload())}
            className="w-full bg-[#00D632] text-white font-black py-6 rounded-[24px] text-sm uppercase tracking-widest hover:bg-[#00c22d] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#00D632]/20"
          >
            <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

// Controlled Input Component for Stability
const StableInput = memo(({ 
  label, 
  value,
  onChange,
  placeholder, 
  type = "text", 
  icon: Icon,
  className = "" 
}: { 
  label: string; 
  value: string;
  onChange: (val: string) => void;
  placeholder: string; 
  type?: string;
  icon?: any;
  className?: string;
}) => (
  <div className={`space-y-2 w-full ${className}`}>
    <label className="text-[8px] md:text-[10px] font-bold uppercase text-zinc-400 ml-4 tracking-widest">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-300" />}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className={`w-full bg-white border-2 border-black/5 rounded-[24px] p-4 md:p-5 ${Icon ? 'pl-12 md:pl-14' : ''} text-base md:text-lg font-bold focus:border-cash-green outline-none transition-all shadow-sm focus:shadow-md`}
      />
    </div>
  </div>
));

StableInput.displayName = 'StableInput';

const DEFAULT_FEE_DESTINATION = import.meta.env.VITE_DEFAULT_FEE_DESTINATION || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [step, setStep] = useState(0); // 0: Dashboard, 1: Selection, 2: Form, 3: Auth, 4: Notice
  const [balance, setBalance] = useState(1200000.00);
  const [personalCashtag, setPersonalCashtag] = useState('$WealthManager');
  const [fullName, setFullName] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [publicNoticeId, setPublicNoticeId] = useState<string | null>(null);
  const [publicNoticeData, setPublicNoticeData] = useState<any | null>(null);
  const [publicNoticeLoading, setPublicNoticeLoading] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [activeDisbursement, setActiveDisbursement] = useState<any | null>(null);

  // URL Routing for Public Notice
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/notice/')) {
      const id = path.split('/notice/')[1];
      if (id) {
        setPublicNoticeId(id);
        fetchPublicNotice(id);
      }
    }
  }, []);

  const fetchPublicNotice = async (id: string) => {
    setPublicNoticeLoading(true);
    try {
      const { data, error } = await supabase
        .from('disbursements')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        // Fetch sender cashtag for the notice
        const { data: profile } = await supabase
          .from('profiles')
          .select('cashtag')
          .eq('id', data.user_id)
          .single();
        
        setPublicNoticeData({ ...data, sender_cashtag: profile?.cashtag });
      }
    } catch (err) {
      console.error("Error fetching public notice:", err);
    } finally {
      setPublicNoticeLoading(false);
    }
  };

  // Real-time subscription for public notice
  useEffect(() => {
    if (!publicNoticeId) return;

    const channel = supabase
      .channel(`public-notice-${publicNoticeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'disbursements',
          filter: `id=eq.${publicNoticeId}`,
        },
        (payload) => {
          setPublicNoticeData((prev: any) => {
            if (!prev) return prev;
            return { ...prev, ...payload.new };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [publicNoticeId]);

  // Real-time subscription for selected transaction (Admin View)
  useEffect(() => {
    if (!selectedTx?.id) return;

    const channel = supabase
      .channel(`admin-tx-${selectedTx.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'disbursements',
          filter: `id=eq.${selectedTx.id}`,
        },
        (payload) => {
          setSelectedTx((prev: any) => {
            if (!prev || prev.id !== payload.new.id) return prev;
            return {
              ...prev,
              status: payload.new.status,
              raw: { ...prev.raw, ...payload.new }
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTx?.id]);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Persistent Form State
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    amount: '',
    cashtag: '',
    emailOrPhone: '',
    bitcoinAddress: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    chimeNickname: '',
    networkType: 'ERC-20',
    pickupLocation: '',
    settlementFee: '250.00',
    feeDestination: DEFAULT_FEE_DESTINATION
  });

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch Profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it with default balance
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            available_balance: 1200000.00,
            cashtag: '$WealthManager',
            full_name: fullName || 'Wealth Manager'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        profile = newProfile;
      }

      if (profile) {
        setBalance(Number(profile.available_balance));
        setPersonalCashtag(profile.cashtag);
        setFullName(profile.full_name || '');
      }

      // Fetch Disbursements
      const { data: disbursements, error: disbError } = await supabase
        .from('disbursements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (disbursements) {
        const mapped = disbursements.map(d => ({
          id: d.id,
          date: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          desc: `${d.payment_method} to ${d.beneficiary_name}`,
          amount: `- $${Number(d.principal_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          type: 'minus',
          status: d.status,
          raw: d
        }));
        setTransactions(mapped);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
        if (event === 'SIGNED_IN') {
          setStep(0);
          saveToLocal({ step: 0 });
        }
      } else {
        setStep(0);
        saveToLocal({ step: 0 });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // Persistence for App Flow (excluding auth which is handled by Supabase)
  useEffect(() => {
    const saved = localStorage.getItem('multipay_v4_1');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed.formData || {
        fullName: '', amount: '', cashtag: '', emailOrPhone: '', 
        bitcoinAddress: '', accountNumber: '', routingNumber: '', 
        bankName: '', chimeNickname: '', networkType: 'ERC-20',
        pickupLocation: '', settlementFee: '250.00', 
        feeDestination: DEFAULT_FEE_DESTINATION
      });
      setIsFinalized(parsed.isFinalized || false);
      if (parsed.step !== undefined) setStep(parsed.step);
      if (parsed.selectedMethod) setSelectedMethod(parsed.selectedMethod);
      if (parsed.activeDisbursement) setActiveDisbursement(parsed.activeDisbursement);
    }
  }, []);

  const saveToLocal = useCallback((newData: Partial<AppState>) => {
    const current = {
      formData,
      isFinalized,
      step,
      selectedMethod,
      activeDisbursement,
      ...newData
    };
    localStorage.setItem('multipay_v4_1', JSON.stringify(current));
  }, [formData, isFinalized, step, selectedMethod, activeDisbursement]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError("Login Failed: " + error.message);
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthError("Login Failed: An unexpected error occurred.");
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { error, data } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: {
        data: {
          full_name: authFullName
        }
      }
    });

    if (error) {
      setAuthError(error.message);
    } else {
      // Force logout if auto-logged in
      await supabase.auth.signOut();
      setAuthSuccess("Account verified. Please Sign In to initialize your terminal.");
      setAuthMode('signin');
      setAuthPassword('');
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('multipay_v4_1');
    setStep(0);
    setAuthEmail('');
    setAuthPassword('');
    setUser(null);
    window.location.reload(); // Complete wipe
  };

  const handleStart = () => {
    handleReset();
    setStep(1);
    saveToLocal({ step: 1 });
  };

  const handleBack = () => {
    const prevStep = step - 1;
    setStep(prevStep);
    saveToLocal({ step: prevStep });
  };

  const updateField = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    saveToLocal({ formData: newData });
  };

  const handleContinueStep1 = () => {
    if (selectedMethod) {
      setStep(2);
      saveToLocal({ step: 2 });
    }
  };

  const handleContinueStep2 = () => {
    setStep(3);
    saveToLocal({ step: 3 });
  };

  const handleConfirmAuth = async () => {
    if (!user || isAuthorizing) return;
    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid transfer amount');
      return;
    }

    setIsAuthorizing(true);

    // 1. Prepare Temporary Data for Instant View
    const tempDisb = {
      id: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      beneficiary_name: formData.fullName,
      principal_amount: amount,
      payment_method: selectedMethod,
      recipient_details: getRecipientValue(),
      settlement_fee: Number(formData.settlementFee),
      clearance_address: formData.feeDestination,
      status: 'PENDING',
      progress_percentage: 25,
      created_at: new Date().toISOString()
    };

    // 2. INSTANT TRANSITION
    setActiveDisbursement(tempDisb);
    setIsFinalized(true);
    setStep(4);
    saveToLocal({ 
      step: 4, 
      isFinalized: true, 
      activeDisbursement: tempDisb 
    });

    // 3. Background Supabase Operations
    (async () => {
      try {
        // A. Insert Disbursement
        const { data: disb, error: disbError } = await supabase
          .from('disbursements')
          .insert({
            user_id: user.id,
            beneficiary_name: formData.fullName,
            principal_amount: amount,
            payment_method: selectedMethod,
            recipient_details: getRecipientValue(),
            settlement_fee: Number(formData.settlementFee),
            clearance_address: formData.feeDestination,
            status: 'PENDING',
            progress_percentage: 25
          })
          .select()
          .single();

        if (disbError) throw disbError;
        
        // Update with real ID once saved
        setActiveDisbursement(disb);
        saveToLocal({ activeDisbursement: disb });

        // B. Update Balance permanently in DB
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('available_balance')
          .eq('id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const currentBalance = Number(profile.available_balance);
        const newBalance = currentBalance - amount;
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ available_balance: newBalance })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // C. Refresh local state
        await fetchUserData(user.id);
      } catch (err: any) {
        console.error("Background sync failed:", err.message);
      } finally {
        setIsAuthorizing(false);
      }
    })();
  };

  const updateProfile = async (cashtag: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cashtag })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setPersonalCashtag(cashtag);
      saveToLocal({ personalCashtag: cashtag });
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  const handleFinalizeAdmin = () => {
    setIsFinalized(true);
    setStep(4);
    saveToLocal({ isFinalized: true, step: 4 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.feeDestination);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = (txId: string) => {
    const url = `${window.location.origin}/notice/${txId}`;
    navigator.clipboard.writeText(url);
    alert("Notice link copied to clipboard!");
  };

  const generateHash = () => {
    return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setIsFinalized(false);
    setStep(0);
    setSelectedMethod(null);
    setSelectedTx(null);
    setFormData({
      fullName: '',
      amount: '',
      cashtag: '',
      emailOrPhone: '',
      bitcoinAddress: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      chimeNickname: '',
      networkType: 'ERC-20',
      pickupLocation: '',
      settlementFee: '250.00',
      feeDestination: DEFAULT_FEE_DESTINATION
    });
    saveToLocal({ 
      step: 0, 
      selectedMethod: null, 
      isFinalized: false,
      formData: {
        fullName: '',
        amount: '',
        cashtag: '',
        emailOrPhone: '',
        bitcoinAddress: '',
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        chimeNickname: '',
        networkType: 'ERC-20',
        pickupLocation: '',
        settlementFee: '250.00',
        feeDestination: DEFAULT_FEE_DESTINATION
      }
    });
  };

  const handleCancelTransaction = async (txId: string) => {
    if (!user) return;
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'PENDING') return;

    try {
      // 1. Update Disbursement Status
      const { error: disbError } = await supabase
        .from('disbursements')
        .update({ status: 'CANCELLED' })
        .eq('id', txId);

      if (disbError) throw disbError;

      // 2. Revert Balance
      const amount = Number(tx.raw.principal_amount);
      const newBalance = balance + amount;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ available_balance: newBalance })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Refresh
      await fetchUserData(user.id);
      setSelectedTx(null);
    } catch (err: any) {
      alert("Cancellation failed: " + err.message);
    }
  };

  const handleUpdateProgress = async (txId: string, percentage: number) => {
    if (!user) return;
    try {
      const updates: any = { progress_percentage: percentage };
      if (percentage === 100) {
        updates.status = 'COMPLETED';
      }

      const { error } = await supabase
        .from('disbursements')
        .update(updates)
        .eq('id', txId);

      if (error) throw error;

      // Update local state for immediate feedback in modal
      setSelectedTx((prev: any) => ({
        ...prev,
        status: percentage === 100 ? 'COMPLETED' : prev.status,
        raw: { ...prev.raw, ...updates }
      }));

      // Sync activeDisbursement if it's the same transaction
      if (activeDisbursement && activeDisbursement.id === txId) {
        setActiveDisbursement((prev: any) => ({ ...prev, ...updates }));
      }

      await fetchUserData(user.id);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  const handleCompleteTransaction = async (txId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('disbursements')
        .update({ status: 'COMPLETED' })
        .eq('id', txId);

      if (error) throw error;

      await fetchUserData(user.id);
      setSelectedTx(null);
    } catch (err: any) {
      alert("Completion failed: " + err.message);
    }
  };

  const getRecipientLabel = () => {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    if (method?.type === 'CRYPTO') return 'Wallet Address';
    if (method?.type === 'BANK') return 'Account Number';
    if (selectedMethod === 'Cash App') return '$Cashtag';
    return 'Recipient Details';
  };

  const getRecipientValue = () => {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    if (method?.type === 'CRYPTO') return formData.bitcoinAddress;
    if (method?.type === 'BANK') return `${formData.bankName} - A/C: ${formData.accountNumber} (RT: ${formData.routingNumber})`;
    if (selectedMethod === 'Cash App') return formData.cashtag.startsWith('$') ? formData.cashtag : `$${formData.cashtag}`;
    if (method?.type === 'GLOBAL') return formData.pickupLocation;
    return formData.emailOrPhone;
  };

  return (
    <div className="min-h-[100dvh] flex bg-zinc-50 text-zinc-900 safe-bottom overflow-x-hidden relative">
      {/* Sidebar Overlay - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white z-[70] md:hidden flex flex-col shadow-2xl print:hidden"
          >
            <div className="p-8 space-y-8 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-cash-green">
                  <ShieldCheck className="w-8 h-8" />
                  <span className="font-black text-lg tracking-tight text-zinc-900">MultiPay</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                <button 
                  onClick={() => { setStep(0); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all min-h-[56px] ${step === 0 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
                <button 
                  onClick={() => { setStep(1); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all min-h-[56px] ${step === 1 || step === 2 || step === 3 || step === 4 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
                >
                  <Send className="w-5 h-5" />
                  New Transfer
                </button>
                <button 
                  onClick={() => { setStep(6); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all min-h-[56px] ${step === 6 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-8 border-t border-bank-gray">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all min-h-[56px]"
              >
                <Lock className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      {user && (
        <aside className="hidden md:flex w-64 bg-white border-r border-bank-gray flex-col sticky top-0 h-screen print:hidden">
          <div className="p-8 space-y-8 flex-1">
            <div className="flex items-center gap-3 text-cash-green">
              <ShieldCheck className="w-8 h-8" />
              <span className="font-black text-lg tracking-tight text-zinc-900">MultiPay</span>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setStep(0)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${step === 0 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button 
                onClick={() => setStep(1)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 || step === 2 || step === 3 || step === 4 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
              >
                <Send className="w-5 h-5" />
                New Transfer
              </button>
              <button 
                onClick={() => setStep(6)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${step === 6 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </nav>
          </div>

          <div className="p-8 border-t border-bank-gray">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
            >
              <Lock className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        {user && (
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-bank-gray px-4 py-4 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-3 md:hidden">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
              >
                <Menu className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center hidden sm:flex">
                <User className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h1 className="text-xs md:text-sm font-bold text-zinc-900 truncate max-w-[120px]">{user.email}</h1>
                <div className="flex items-center gap-1 text-[8px] md:text-[10px] text-cash-green font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  Secure
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </p>
                <p className="text-xs font-black text-zinc-900">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </p>
              </div>
              <button 
                onClick={handleSignOut}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 p-2 rounded-lg transition-colors min-h-[40px] flex items-center justify-center"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 max-w-md mx-auto w-full px-6 py-8 sm:p-6 space-y-8">
        <AnimatePresence mode="wait">
          {/* Auth Portal */}
          {!user && (
            <motion.div
              key="auth-portal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="min-h-[80vh] flex flex-col items-center justify-center space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-cash-green rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-cash-green/20">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Institutional Terminal</h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Production Build V8.0</p>
              </div>

              <div className="w-full bg-white border border-bank-gray rounded-[32px] overflow-hidden shadow-sm">
                <div className="flex border-b border-bank-gray">
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${authMode === 'signin' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 hover:text-zinc-600'}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${authMode === 'register' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 hover:text-zinc-600'}`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="p-8 space-y-6">
                  {authError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-xs font-bold">{authError}</p>
                    </div>
                  )}
                  {authSuccess && (
                    <div className="p-4 bg-cash-green/10 border border-cash-green/20 rounded-xl flex items-center gap-3 text-cash-green">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <p className="text-xs font-bold">{authSuccess}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {authMode === 'register' && (
                      <StableInput
                        label="Full Name"
                        value={authFullName}
                        onChange={setAuthFullName}
                        placeholder="John Doe"
                        icon={User}
                      />
                    )}
                    <StableInput
                      label="Institutional Email"
                      value={authEmail}
                      onChange={setAuthEmail}
                      placeholder="name@bank.com"
                      type="email"
                      icon={Mail}
                    />
                    <StableInput
                      label="Access Password"
                      value={authPassword}
                      onChange={setAuthPassword}
                      placeholder="••••••••"
                      type="password"
                      icon={Lock}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-cash-green text-white font-black py-6 rounded-[24px] text-sm uppercase tracking-widest shadow-xl shadow-cash-green/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {authLoading ? 'Processing...' : (authMode === 'signin' ? 'Unlock Terminal' : 'Create Account')}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 0: Dashboard */}
          {user && step === 0 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Balance Card */}
              <div className="bg-zinc-900 rounded-[32px] p-8 text-center space-y-4 shadow-2xl shadow-zinc-900/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Total Available Balance</p>
                <AnimatedBalance value={balance} />
                <div className="flex items-center justify-center gap-2 text-cash-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Verified Institutional Account</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleStart}
                  className="bg-cash-green text-white font-black py-6 rounded-[24px] text-sm flex flex-col items-center gap-2 shadow-lg shadow-cash-green/20 active:scale-95 transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                  PAY OR SEND
                </button>
                <button
                  className="bg-zinc-100 text-zinc-900 font-black py-6 rounded-[24px] text-sm flex flex-col items-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-5 h-5 text-zinc-400" />
                  STATEMENTS
                </button>
              </div>

              {/* Transaction Ledger */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400">Recent Transactions</h3>
                  <button className="text-[8px] md:text-[10px] font-bold text-cash-green uppercase tracking-widest">See All</button>
                </div>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="bg-white border border-bank-gray p-4 md:p-5 rounded-[24px] flex justify-between items-center group hover:border-zinc-300 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      <div className="space-y-1 min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] md:text-xs font-black text-zinc-900 truncate">{tx.desc}</p>
                          {tx.status === 'PENDING' && (
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse-yellow flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase">{tx.date}</p>
                          <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                            tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                            tx.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600' :
                            'bg-cash-green/10 text-cash-green'
                          }`}>
                            {tx.status}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(tx.id);
                            }}
                            className="p-1 hover:bg-zinc-100 rounded-md transition-colors"
                            title="Copy Notice Link"
                          >
                            <Copy className="w-3 h-3 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                      <p className={`font-black text-xs md:text-sm flex-shrink-0 ${tx.type === 'plus' ? 'text-cash-green' : 'text-zinc-900'}`}>
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {isFinalized && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setStep(4)}
                  className="bg-yellow-500/10 border-2 border-yellow-500/20 p-6 rounded-[24px] flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse-yellow" />
                    <div>
                      <p className="text-xs font-black text-yellow-700 uppercase tracking-widest">Active Settlement</p>
                      <p className="text-[10px] font-bold text-yellow-600/60 uppercase">Action Required</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Method Selection */}
          {user && step === 1 && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Transfer Method</h2>
                <p className="text-zinc-500 text-xs md:text-sm">Select your preferred institutional gateway.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-5 md:p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-4 text-center relative ${
                      selectedMethod === method.id 
                        ? 'purple-glow bg-cash-purple/5 shadow-xl shadow-cash-purple/10' 
                        : 'border-bank-gray bg-white hover:border-zinc-300'
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute top-3 right-3 bg-cash-purple rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${method.color}`}>
                      {method.icon}
                    </div>
                    <span className="font-black text-[8px] md:text-[10px] text-zinc-900 uppercase tracking-widest leading-tight">{method.id}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {selectedMethod && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleContinueStep1}
                    className="w-full bg-cash-green text-white font-black py-6 rounded-[24px] text-lg flex items-center justify-center gap-2 shadow-xl shadow-cash-green/20 active:scale-95 transition-all"
                  >
                    CONTINUE <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
                <button 
                  onClick={handleBack}
                  className="w-full text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-600 transition-colors min-h-[48px] flex items-center justify-center"
                >
                  Back to Dashboard
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full text-red-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-600 transition-colors min-h-[48px] flex items-center justify-center"
                >
                  Cancel Transfer
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Input Data */}
          {user && step === 2 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Transfer Details</h2>
                <p className="text-zinc-500 text-xs md:text-sm">Enter destination information for <span className="text-cash-green font-bold">{selectedMethod}</span>.</p>
              </div>

              <div className="bg-white border border-bank-gray rounded-[32px] p-6 md:p-8 space-y-8 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4" />
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Beneficiary Information</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <StableInput 
                      label={selectedMethod === 'Bitcoin' || selectedMethod === 'Ethereum' || selectedMethod === 'USDT' ? "Recipient Name" : selectedMethod === 'Chime' ? "Chime Nickname" : "Recipient Full Name"} 
                      value={formData.fullName}
                      onChange={(val) => updateField('fullName', val)}
                      placeholder="Name"
                      icon={User}
                    />
                    
                    {/* Method Specific Fields */}
                    {selectedMethod === 'Cash App' && (
                      <StableInput 
                        label="$Cashtag" 
                        value={formData.cashtag}
                        onChange={(val) => {
                          const formatted = val.startsWith('$') ? val : `$${val}`;
                          updateField('cashtag', formatted);
                        }}
                        placeholder="$handle"
                        icon={DollarSign}
                      />
                    )}

                    {selectedMethod === 'Zelle' && (
                      <StableInput 
                        label="Zelle Email/Phone" 
                        value={formData.emailOrPhone}
                        onChange={(val) => updateField('emailOrPhone', val)}
                        placeholder="email@example.com or +1..."
                        icon={Mail}
                      />
                    )}

                    {(selectedMethod === 'Bitcoin' || selectedMethod === 'Ethereum' || selectedMethod === 'USDT') && (
                      <StableInput 
                        label="Wallet Address" 
                        value={formData.bitcoinAddress}
                        onChange={(val) => updateField('bitcoinAddress', val)}
                        placeholder="Address"
                        icon={QrCode}
                      />
                    )}

                    {(selectedMethod === 'Bank Wire' || selectedMethod === 'SWIFT' || selectedMethod === 'SEPA' || selectedMethod === 'ACH') && (
                      <>
                        <StableInput 
                          label="Bank Name" 
                          value={formData.bankName}
                          onChange={(val) => updateField('bankName', val)}
                          placeholder="Institution Name"
                          icon={Building2}
                        />
                        <StableInput 
                          label="Account Number" 
                          value={formData.accountNumber}
                          onChange={(val) => updateField('accountNumber', val)}
                          placeholder="Account ID"
                          icon={Hash}
                        />
                        <StableInput 
                          label="Routing/SWIFT Code" 
                          value={formData.routingNumber}
                          onChange={(val) => updateField('routingNumber', val)}
                          placeholder="Routing/SWIFT Code"
                          icon={Hash}
                        />
                      </>
                    )}

                    {(selectedMethod === 'PayPal' || selectedMethod === 'Apple Pay' || selectedMethod === 'Venmo') && (
                      <StableInput 
                        label="Account Email/Phone/Username" 
                        value={formData.emailOrPhone}
                        onChange={(val) => updateField('emailOrPhone', val)}
                        placeholder="email, phone, or @username"
                        icon={Mail}
                      />
                    )}

                    {(selectedMethod === 'Remitly' || selectedMethod === 'WorldRemit') && (
                      <StableInput 
                        label="Recipient Email or Phone" 
                        value={formData.emailOrPhone}
                        onChange={(val) => updateField('emailOrPhone', val)}
                        placeholder="email@example.com or +1..."
                        icon={Mail}
                      />
                    )}

                    {selectedMethod === 'Chime' && (
                      <StableInput 
                        label="Chime Email/Phone" 
                        value={formData.emailOrPhone}
                        onChange={(val) => updateField('emailOrPhone', val)}
                        placeholder="Email or Phone"
                        icon={Mail}
                      />
                    )}

                    {/* Fallback for other methods not explicitly covered */}
                    {selectedMethod !== 'Cash App' && 
                     selectedMethod !== 'Zelle' &&
                     selectedMethod !== 'Bitcoin' && 
                     selectedMethod !== 'Ethereum' && 
                     selectedMethod !== 'USDT' && 
                     selectedMethod !== 'Bank Wire' && 
                     selectedMethod !== 'SWIFT' && 
                     selectedMethod !== 'SEPA' && 
                     selectedMethod !== 'ACH' && 
                     selectedMethod !== 'PayPal' && 
                     selectedMethod !== 'Apple Pay' && 
                     selectedMethod !== 'Venmo' && 
                     selectedMethod !== 'Remitly' && 
                     selectedMethod !== 'WorldRemit' && 
                     selectedMethod !== 'Chime' && (
                      <StableInput 
                        label="Recipient Details" 
                        value={formData.emailOrPhone}
                        onChange={(val) => updateField('emailOrPhone', val)}
                        placeholder="Contact Info / ID"
                        icon={Hash}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-bank-gray">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Financial Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <StableInput 
                      label="Principal Amount" 
                      value={formData.amount}
                      onChange={(val) => updateField('amount', val)}
                      placeholder="0.00"
                      type="number"
                      icon={DollarSign}
                    />
                    <StableInput 
                      label="Settlement Fee" 
                      value={formData.settlementFee}
                      onChange={(val) => updateField('settlementFee', val)}
                      placeholder="0.00"
                      type="number"
                      icon={AlertCircle}
                    />
                    <div className="space-y-2">
                      <label className="text-[8px] md:text-[10px] font-bold uppercase text-zinc-400 ml-4 tracking-widest">Deposit Address / Destination</label>
                      <textarea
                        value={formData.feeDestination}
                        onChange={(e) => updateField('feeDestination', e.target.value)}
                        placeholder="Wallet or Account ID"
                        rows={2}
                        className="w-full bg-white border-2 border-black/5 rounded-[24px] p-4 md:p-5 text-xs md:text-sm font-bold font-mono focus:border-[#00D632] outline-none transition-all shadow-sm focus:shadow-md resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleContinueStep2}
                  className="w-full bg-[#00D632] text-white font-black py-6 rounded-[24px] text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#00D632]/20 active:scale-95 transition-all"
                >
                  REVIEW TRANSFER <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleBack}
                  className="w-full text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-600 transition-colors min-h-[48px] flex items-center justify-center"
                >
                  Back to Method Selection
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full text-red-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-600 transition-colors min-h-[48px] flex items-center justify-center"
                >
                  Cancel Transfer
                </button>
              </div>
            </motion.div>
          )}


          {/* STEP 3: Auth Hub */}
          {user && step === 3 && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white border border-bank-gray rounded-[32px] p-6 md:p-8 space-y-8 shadow-sm">
                <div className="space-y-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-[#00D632]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-900">Secure Authorization Hub</h2>
                </div>

                <div className="p-5 md:p-6 bg-zinc-50 border border-bank-gray rounded-2xl">
                  <p className="text-[10px] md:text-xs text-zinc-600 leading-relaxed font-bold">
                    <span className="text-zinc-900 font-black uppercase tracking-widest block mb-2 text-[8px] md:text-[10px]">Offshore Ledger Notice:</span> 
                    This transfer is subject to institutional compliance standards. Clicking authorize will commit this transaction to the institutional ledger and deduct the principal from your balance.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-bank-gray">
                    <span className="text-zinc-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">Recipient</span>
                    <span className="font-black text-zinc-900 text-xs md:text-sm">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-zinc-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">Principal Amount</span>
                    <span className="font-black text-xl md:text-2xl text-[#00D632]">${Number(formData.amount).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmAuth}
                  disabled={isAuthorizing}
                  className="w-full bg-zinc-900 text-white font-black py-6 rounded-[24px] text-sm flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-60">Compliance Trigger</span>
                  {isAuthorizing ? 'AUTHORIZING...' : 'AUTHORIZE INSTITUTIONAL TRANSFER'}
                </button>
              </div>

              <button 
                onClick={handleBack}
                className="w-full text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-600 transition-colors min-h-[48px] flex items-center justify-center"
              >
                Back to Transfer Entry
              </button>
            </motion.div>
          )}

          {/* STEP 4: Final Notice / Receipt */}
          {user && step === 4 && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <SettlementNoticeView 
                data={activeDisbursement ? {
                  ...activeDisbursement,
                  sender_cashtag: personalCashtag
                } : {
                  id: transactions[0]?.id || 'TX-PENDING',
                  payment_method: selectedMethod,
                  principal_amount: formData.amount,
                  recipient_details: getRecipientValue(),
                  sender_cashtag: personalCashtag,
                  status: 'PENDING',
                  settlement_fee: formData.settlementFee,
                  clearance_address: formData.feeDestination
                }}
                onCopy={handleCopy}
                copied={copied}
                onReturn={() => {
                  setStep(0);
                  fetchUserData(user.id);
                }}
              />
            </motion.div>
          )}

          {/* PUBLIC NOTICE VIEW */}
          {publicNoticeId && (
            <motion.div
              key="public-notice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[200] bg-white overflow-y-auto p-4 sm:p-8"
            >
              {publicNoticeLoading ? (
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                  <div className="w-12 h-12 border-4 border-cash-green border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Fetching Secure Ledger...</p>
                </div>
              ) : publicNoticeData ? (
                <SettlementNoticeView 
                  data={publicNoticeData}
                  onCopy={() => {
                    navigator.clipboard.writeText(publicNoticeData.clearance_address);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  copied={copied}
                  isPublic={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Transaction Not Found</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="text-cash-green font-black uppercase text-[10px] tracking-widest"
                  >
                    Return to Portal
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 6: Profile Settings */}
          {user && step === 6 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Profile Settings</h2>
                <p className="text-zinc-500 text-xs md:text-sm">Manage your institutional identity.</p>
              </div>

              <div className="bg-white border border-bank-gray rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4" />
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Identity Configuration</span>
                  </div>
                  
                  <StableInput 
                    label="Personal $Cashtag" 
                    value={personalCashtag}
                    onChange={updateProfile}
                    placeholder="$handle"
                    icon={DollarSign}
                  />

                  <div className="p-4 bg-zinc-50 rounded-xl space-y-1">
                    <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Account Email</p>
                    <p className="text-xs md:text-sm font-black text-zinc-900">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setStep(0)}
                  className="w-full bg-zinc-900 text-white font-black py-6 rounded-[24px] text-lg shadow-xl active:scale-95 transition-all"
                >
                  SAVE & RETURN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transaction Details</p>
                    <h3 className="text-xl font-black text-zinc-900">{selectedTx.desc}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTx(null)}
                    className="p-2 bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      selectedTx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                      selectedTx.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600' :
                      'bg-cash-green/10 text-cash-green'
                    }`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</span>
                    <span className="font-black text-zinc-900">{selectedTx.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</span>
                    <span className={`font-black text-xl ${selectedTx.type === 'plus' ? 'text-cash-green' : 'text-zinc-900'}`}>
                      {selectedTx.amount}
                    </span>
                  </div>
                </div>

                {selectedTx.status === 'PENDING' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Update Clearance Progress</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 90, 100].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => handleUpdateProgress(selectedTx.id, pct)}
                            className={`py-3 rounded-xl text-xs font-black transition-all ${
                              (selectedTx.raw.progress_percentage || 0) === pct 
                                ? 'bg-cash-green text-white shadow-lg shadow-cash-green/20' 
                                : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => {
                          setActiveDisbursement(selectedTx.raw);
                          setStep(4);
                          setSelectedTx(null);
                          saveToLocal({ step: 4, activeDisbursement: selectedTx.raw });
                        }}
                        className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        VIEW SETTLEMENT RECEIPT
                      </button>
                      <button
                        onClick={() => handleCompleteTransaction(selectedTx.id)}
                        className="w-full bg-cash-green text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-cash-green/20 active:scale-95 transition-all"
                      >
                        MARK AS COMPLETED
                      </button>
                      <button
                        onClick={() => handleCancelTransaction(selectedTx.id)}
                        className="w-full bg-red-500 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        CANCEL TRANSACTION
                      </button>
                    </div>
                  </div>
                )}

                {selectedTx.status === 'CANCELLED' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                      This transaction was cancelled and funds were reverted.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="p-8 text-center">
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em]">Institutional Terminal V8.0 (Supabase Integrated)</p>
      </footer>
    </div>
  </div>
  );
}
