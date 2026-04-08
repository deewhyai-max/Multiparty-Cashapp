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
    <h2 className="text-5xl font-serif font-black text-white">
      ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </h2>
  );
};

const SettlementNoticeView = ({ data, onCopy, copied, isPublic = false }: { data: any, onCopy: () => void, copied: boolean, isPublic?: boolean }) => {
  const blockchainHash = '0x' + data.id.replace(/-/g, '').substring(0, 40);
  
  return (
    <div className="space-y-8 max-w-md mx-auto">
      {data.payment_method === 'Cash App' ? (
        <div className="bg-white border border-bank-gray rounded-[32px] overflow-hidden shadow-2xl print:shadow-none print:border-zinc-200">
          <div className="bg-cash-green p-8 text-white space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Payment Initiated</h2>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black">${Number(data.principal_amount).toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-bold uppercase text-[9px] tracking-widest">From</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm">{data.sender_cashtag || '$WealthManager'}</span>
                  <div className="bg-white text-cash-green p-0.5 rounded-full">
                    <Check className="w-2 h-2" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-bold uppercase text-[9px] tracking-widest">To</span>
                <span className="font-black text-sm">{data.recipient_details}</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`flex items-center gap-2 px-6 py-2 rounded-full border ${
                data.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                data.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                'bg-cash-green/10 text-cash-green border-cash-green/20'
              }`}>
                {data.status === 'PENDING' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse-yellow" />}
                <span className="text-xs font-black uppercase tracking-widest">{data.status} SECURITY HOLD</span>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-[24px] border border-bank-gray p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-black uppercase text-[10px] tracking-widest">Required Settlement Fee</span>
                <span className="font-black text-xl text-red-600">${Number(data.settlement_fee).toLocaleString()}</span>
              </div>
              
              <div className="space-y-2 pt-2">
                <p className="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Fee Payment Destination</p>
                <button 
                  onClick={onCopy}
                  className="w-full group relative p-4 bg-white border-2 border-zinc-900 rounded-2xl font-mono text-[11px] break-all text-center text-zinc-900 font-black hover:border-cash-green transition-all"
                >
                  {data.clearance_address}
                  <div className="mt-1 text-[8px] text-zinc-300 group-hover:text-cash-green transition-colors uppercase tracking-widest">
                    {copied ? 'Copied' : 'Click to Copy'}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Transaction ID</span>
                <span className="text-[10px] font-mono font-black text-zinc-900">{data.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Blockchain Hash</span>
                <span className="text-[10px] font-mono font-black text-zinc-500 break-all">{blockchainHash}</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 rounded-2xl flex items-center justify-center gap-3 text-white">
              <ShieldCheck className="w-4 h-4 text-cash-green" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Institutional Ledger Active</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-bank-gray rounded-[32px] p-8 space-y-8 shadow-2xl print:shadow-none print:border-zinc-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`flex items-center gap-3 px-8 py-3 rounded-full border ${
              data.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
              data.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
              'bg-cash-green/10 text-cash-green border-cash-green/20'
            }`}>
              {data.status === 'PENDING' && <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse-yellow" />}
              <span className="text-lg font-black uppercase tracking-widest">{data.status}</span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Settlement Required</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-zinc-50 rounded-[24px] border border-bank-gray space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Principal Amount</span>
                <span className="font-black text-zinc-900">${Number(data.principal_amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Recipient Details</span>
                <span className="font-black text-zinc-900 truncate max-w-[150px]">{data.recipient_details}</span>
              </div>
              
              <div className="pt-4 border-t border-bank-gray space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-black uppercase text-[10px] tracking-widest">Required Settlement Fee</span>
                  <span className="font-black text-2xl text-red-600">${Number(data.settlement_fee).toLocaleString()}</span>
                </div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase text-center leading-relaxed">
                  This fee is mandatory for ledger synchronization. Once settled, the principal amount will be released immediately.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Secure Payment Box</p>
              <button 
                onClick={onCopy}
                className="w-full group relative p-6 bg-white border-2 border-zinc-900 rounded-[24px] font-mono text-sm break-all text-center text-zinc-900 font-black shadow-inner hover:border-cash-green transition-all active:scale-[0.98]"
              >
                {data.clearance_address}
                <div className="mt-2 text-[8px] text-zinc-300 group-hover:text-cash-green transition-colors uppercase tracking-widest">
                  {copied ? 'Copied to Clipboard' : 'Click to Copy Address'}
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Transaction ID</span>
              <span className="text-[10px] font-mono font-black text-zinc-900">{data.id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Blockchain Hash</span>
              <span className="text-[10px] font-mono font-black text-zinc-500 break-all">{blockchainHash}</span>
            </div>
          </div>

          <div className="p-5 bg-zinc-900 rounded-2xl flex items-center justify-center gap-3 text-white">
            <ShieldCheck className="w-5 h-5 text-cash-green" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Security Active</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="w-full bg-zinc-100 text-zinc-900 font-black py-6 rounded-[24px] text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" /> PRINT / DOWNLOAD RECEIPT
        </button>
        
        {!isPublic && (
          <button 
            onClick={() => window.location.reload()}
            className="w-full text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-600 transition-colors min-h-[48px] flex items-center justify-center"
          >
            Return to Dashboard
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
    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-4 tracking-widest">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className={`w-full bg-white border-2 border-black/5 rounded-[24px] p-5 ${Icon ? 'pl-14' : ''} text-lg font-bold focus:border-cash-green outline-none transition-all shadow-sm focus:shadow-md`}
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

  const [step, setStep] = useState(0); // 0: Dashboard, 1: Selection, 2: Form, 3: Auth, 4: Admin, 5: Notice, 6: Profile
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
        setStep(0);
      } else {
        setStep(0);
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
    }
  }, []);

  const saveToLocal = useCallback((newData: Partial<AppState>) => {
    const current = {
      formData,
      isFinalized,
      step,
      selectedMethod,
      ...newData
    };
    localStorage.setItem('multipay_v4_1', JSON.stringify(current));
  }, [formData, isFinalized, step, selectedMethod]);

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
    if (!user) return;
    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid transfer amount');
      return;
    }

    try {
      // 1. Insert Disbursement
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
          status: 'PENDING'
        })
        .select()
        .single();

      if (disbError) throw disbError;

      // 2. Update Balance
      const newBalance = balance - amount;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ available_balance: newBalance })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Update Local State
      await fetchUserData(user.id);
      setIsFinalized(true);
      setStep(5);
      saveToLocal({ step: 5, isFinalized: true });
    } catch (err: any) {
      alert("Transfer failed: " + err.message);
    }
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
    setStep(5);
    saveToLocal({ isFinalized: true, step: 5 });
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
    if (selectedMethod === 'Cash App') return 'Recipient Cashtag';
    if (method?.type === 'GLOBAL') return 'Pickup Location';
    return 'Recipient Handle';
  };

  const getRecipientValue = () => {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    if (method?.type === 'CRYPTO') return formData.bitcoinAddress;
    if (method?.type === 'BANK') return `${formData.bankName} (${formData.accountNumber})`;
    if (selectedMethod === 'Cash App') return formData.cashtag;
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
            className="fixed inset-y-0 left-0 w-72 bg-white z-[70] md:hidden flex flex-col shadow-2xl"
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
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all min-h-[56px] ${step === 1 || step === 2 || step === 3 || step === 5 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
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
        <aside className="hidden md:flex w-64 bg-white border-r border-bank-gray flex-col sticky top-0 h-screen">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 || step === 2 || step === 3 || step === 5 ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
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
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-bank-gray px-4 py-4 flex justify-between items-center">
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
                <h1 className="text-sm font-bold text-zinc-900 truncate max-w-[120px]">{user.email}</h1>
                <div className="flex items-center gap-1 text-[10px] text-cash-green font-bold uppercase tracking-wider">
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

        <main className="flex-1 max-w-md mx-auto w-full p-4 sm:p-6 space-y-8">
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
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Bank Access</h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Institutional Terminal V4.1</p>
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
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Total Available Balance</p>
                <AnimatedBalance value={balance} />
                <div className="flex items-center justify-center gap-2 text-cash-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verified Institutional Account</span>
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
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Recent Transactions</h3>
                  <button className="text-[10px] font-bold text-cash-green uppercase tracking-widest">See All</button>
                </div>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="bg-white border border-bank-gray p-5 rounded-[24px] flex justify-between items-center group hover:border-zinc-300 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-zinc-900">{tx.desc}</p>
                          {tx.status === 'PENDING' && (
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse-yellow" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">{tx.date}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
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
                      <p className={`font-black text-sm ${tx.type === 'plus' ? 'text-cash-green' : 'text-zinc-900'}`}>
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
                  onClick={() => setStep(5)}
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
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Transfer Method</h2>
                <p className="text-zinc-500 text-sm">Select your preferred institutional gateway.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-4 text-center relative ${
                      selectedMethod === method.id 
                        ? 'border-cash-green bg-cash-green/5 shadow-xl shadow-cash-green/10' 
                        : 'border-bank-gray bg-white hover:border-zinc-300'
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute top-3 right-3 bg-cash-green rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method.color}`}>
                      {method.icon}
                    </div>
                    <span className="font-black text-[10px] text-zinc-900 uppercase tracking-widest leading-tight">{method.id}</span>
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
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Transfer Details</h2>
                <p className="text-zinc-500 text-sm">Enter destination information for <span className="text-cash-green font-bold">{selectedMethod}</span>.</p>
              </div>

              <div className="space-y-6">
                <StableInput 
                  label="Recipient Full Name" 
                  value={formData.fullName}
                  onChange={(val) => updateField('fullName', val)}
                  placeholder="Legal Name"
                  icon={User}
                />

                {/* Dynamic Fields Based on Method Type */}
                {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.type === 'CRYPTO' && (
                  <div className="space-y-4">
                    <StableInput 
                      label="Wallet Address" 
                      value={formData.bitcoinAddress}
                      onChange={(val) => updateField('bitcoinAddress', val)}
                      placeholder="Address ID"
                      icon={QrCode}
                    />
                    <StableInput 
                      label="Network Type" 
                      value={formData.networkType}
                      onChange={(val) => updateField('networkType', val)}
                      placeholder="e.g. ERC-20, TRC-20"
                      icon={ShieldCheck}
                    />
                  </div>
                )}

                {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.type === 'BANK' && (
                  <div className="space-y-4">
                    <StableInput 
                      label="Bank Name" 
                      value={formData.bankName}
                      onChange={(val) => updateField('bankName', val)}
                      placeholder="Institution Name"
                      icon={Building2}
                    />
                    <StableInput 
                      label="Routing / SWIFT" 
                      value={formData.routingNumber}
                      onChange={(val) => updateField('routingNumber', val)}
                      placeholder="Routing or SWIFT Code"
                      icon={Hash}
                    />
                    <StableInput 
                      label="Account Number" 
                      value={formData.accountNumber}
                      onChange={(val) => updateField('accountNumber', val)}
                      placeholder="Account ID"
                      icon={Hash}
                    />
                  </div>
                )}

                {selectedMethod === 'Cash App' && (
                  <StableInput 
                    label="$Cashtag" 
                    value={formData.cashtag}
                    onChange={(val) => updateField('cashtag', val)}
                    placeholder="$handle"
                    icon={DollarSign}
                  />
                )}

                {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.type === 'P2P' && selectedMethod !== 'Cash App' && (
                  <StableInput 
                    label="Recipient Handle / Email" 
                    value={formData.emailOrPhone}
                    onChange={(val) => updateField('emailOrPhone', val)}
                    placeholder="Contact Info"
                    icon={Mail}
                  />
                )}

                {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.type === 'GLOBAL' && (
                  <div className="space-y-4">
                    <StableInput 
                      label="Pickup Location" 
                      value={formData.pickupLocation}
                      onChange={(val) => updateField('pickupLocation', val)}
                      placeholder="City, Country"
                      icon={Globe}
                    />
                  </div>
                )}

                <StableInput 
                  label="Transfer Amount ($)" 
                  value={formData.amount}
                  onChange={(val) => updateField('amount', val)}
                  placeholder="0.00"
                  type="number"
                  icon={DollarSign}
                />

                {/* Settlement Details - Visible to Sender Only */}
                <div className="pt-6 border-t border-bank-gray space-y-6">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Settlement Configuration</span>
                  </div>
                  
                  <StableInput 
                    label="Required Settlement Fee ($)" 
                    value={formData.settlementFee}
                    onChange={(val) => updateField('settlementFee', val)}
                    placeholder="0.00"
                    type="number"
                    icon={AlertCircle}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-4 tracking-widest">Fee Payment Destination</label>
                    <textarea
                      value={formData.feeDestination}
                      onChange={(e) => updateField('feeDestination', e.target.value)}
                      placeholder="Wallet or Account ID"
                      rows={2}
                      className="w-full bg-white border-2 border-black/5 rounded-[24px] p-5 text-sm font-bold font-mono focus:border-cash-green outline-none transition-all shadow-sm focus:shadow-md resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleContinueStep2}
                  className="w-full bg-cash-green text-white font-black py-6 rounded-[24px] text-lg flex items-center justify-center gap-2 shadow-xl shadow-cash-green/20 active:scale-95 transition-all"
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
              <div className="bg-white border border-bank-gray rounded-[32px] p-8 space-y-8 shadow-sm">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-cash-green" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">Secure Authorization Hub</h2>
                </div>

                <div className="p-6 bg-zinc-50 border border-bank-gray rounded-2xl">
                  <p className="text-xs text-zinc-600 leading-relaxed font-bold">
                    <span className="text-zinc-900 font-black uppercase tracking-widest block mb-2 text-[10px]">First-Time Payout Policy:</span> 
                    This transfer is subject to institutional compliance standards. A one-time ledger synchronization fee is required for all first-time recipient authorizations to ensure cross-border liquidity.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-bank-gray">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Recipient</span>
                    <span className="font-black text-zinc-900">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Principal Amount</span>
                    <span className="font-black text-2xl text-cash-green">${Number(formData.amount).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmAuth}
                  className="w-full bg-zinc-900 text-white font-black py-6 rounded-[24px] text-sm flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-60">Compliance Trigger</span>
                  AUTHORIZE INSTITUTIONAL TRANSFER
                </button>
              </div>

              <button 
                onClick={handleBack}
                className="w-full text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-600 transition-colors min-h-[48px] flex items-center justify-center"
              >
                Back to Transfer Entry
              </button>
              <button 
                onClick={handleReset}
                className="w-full text-red-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-600 transition-colors min-h-[48px] flex items-center justify-center"
              >
                Cancel Transfer
              </button>
            </motion.div>
          )}

          {/* STEP 5: Final Notice / Receipt */}
          {user && step === 5 && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <SettlementNoticeView 
                data={{
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
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Profile Settings</h2>
                <p className="text-zinc-500 text-sm">Manage your institutional identity.</p>
              </div>

              <div className="bg-white border border-bank-gray rounded-[32px] p-8 space-y-6 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Identity Configuration</span>
                  </div>
                  
                  <StableInput 
                    label="Personal $Cashtag" 
                    value={personalCashtag}
                    onChange={updateProfile}
                    placeholder="$handle"
                    icon={DollarSign}
                  />

                  <div className="p-4 bg-zinc-50 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Account Email</p>
                    <p className="text-sm font-black text-zinc-900">{user.email}</p>
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
                  <div className="grid grid-cols-1 gap-3">
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

      {/* Footer Branding */}
      <footer className="p-8 text-center">
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em]">MultiPay Premium v4.1.0</p>
      </footer>
    </div>
  </div>
  );
}
