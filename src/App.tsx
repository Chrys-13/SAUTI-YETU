import { useState, useEffect } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useNavigate 
} from "react-router-dom";
import { 
  Home as HomeIcon, 
  BookOpen, 
  PlusCircle, 
  ShieldAlert, 
  History, 
  WifiOff, 
  Wifi,
  ChevronLeft,
  User,
  Map as MapIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  Video,
  Paperclip,
  Send,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import localforage from "localforage";
import { cn } from "./lib/utils";
import { Report, TrainingModule } from "./types";
import { TRAINING_MODULES, REPORT_TYPES } from "./constants";
import { GoogleGenAI } from "@google/genai";

import ReactMarkdown from "react-markdown";

// --- Components ---

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={cn(
      "w-full py-1 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-300",
      isOnline ? "bg-green-600 text-white" : "bg-yellow-500 text-black"
    )}>
      {isOnline ? (
        <><Wifi size={14} /> Online Mode</>
      ) : (
        <><WifiOff size={14} /> Offline Mode</>
      )}
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home", labelSw: "Home" },
    { path: "/training", icon: BookOpen, label: "Training", labelSw: "Elimu" },
    { path: "/report", icon: PlusCircle, label: "Report", labelSw: "Ondoa Ripoti" },
    { path: "/sos", icon: ShieldAlert, label: "SOS", labelSw: "Msaada SOS" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 pb-safe shadow-lg z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-[#0a1f44]" : "text-gray-500"
            )}
          >
            <item.icon size={24} className={isActive ? "fill-blue-50" : ""} />
            <span className="text-[10px] font-medium">{item.labelSw}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const Header = ({ title, showBack = false }: { title: string, showBack?: boolean }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-[#0a1f44] text-white p-4 flex items-center gap-4 sticky top-0 z-40 shadow-md">
      {showBack && (
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-[#1a2f54] rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="text-lg font-bold flex-1 text-center uppercase tracking-wider">{title}</h1>
      <div className="w-8 h-8 bg-[#1a2f54] rounded-full flex items-center justify-center">
        <User size={18} />
      </div>
    </header>
  );
};

// --- Pages ---

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={cn("w-12 h-12", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield Shape */}
    <path 
      d="M200 40C140 40 100 60 80 80C80 180 80 260 200 360C320 260 320 180 320 80C300 60 260 40 200 40Z" 
      stroke="#0a1f44" 
      strokeWidth="25" 
      strokeLinejoin="round"
    />
    {/* Megaphone Shape */}
    <g transform="translate(140, 130) scale(1.2)">
      <path 
        d="M20 40L60 20V80L20 60V40Z" 
        fill="#2d6a4f" 
      />
      <path 
        d="M60 20C80 20 100 40 100 50C100 60 80 80 60 80V20Z" 
        fill="#2d6a4f" 
      />
      <rect x="10" y="45" width="10" height="10" fill="#2d6a4f" />
    </g>
  </svg>
);

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [aiInsight, setAiInsight] = useState<string>("Inapakia maelezo...");
  const [isSyncing, setIsSyncing] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateAIAnalysis = async (currentReports: Report[], currentInsight: string) => {
    if (!navigator.onLine) {
      setAiAnalysis("Huwezi kupata uchambuzi wa AI ukiwa nje ya mtandao. Tafadhali unganisha intaneti.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        Wewe ni mtaalamu wa uchambuzi wa uchaguzi nchini Tanzania. 
        Chambua data ifuatayo ya ripoti za ufuatiliaji wa vijana na utoe muhtasari wa kina wa hali ya sasa ya uchaguzi.
        
        Muhtasari wa sasa wa haraka: ${currentInsight}
        
        Data ya Ripoti za Kina:
        ${JSON.stringify(currentReports.map(r => ({ type: r.type, description: r.description, station: r.stationNumber })))}
        
        Toa muhtasari wa kitaalamu, wenye kutia moyo lakini wa kweli, kwa lugha ya Kiswahili. 
        Lenga katika mambo makuu yanayojitokeza, mienendo (trends), na mapendekezo ya haraka kwa waangalizi.
        Tumia format ya markdown kwa muhtasari wako.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setAiAnalysis(response.text || "Samahani, imeshindikana kupata uchambuzi kwa sasa.");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("Hitilafu imetokea wakati wa kuchambua data. Tafadhali jaribu tena baadaye.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadReports = async () => {
    const stored = await localforage.getItem<Report[]>("reports") || [];
    setReports(stored);
    
    const pending = stored.filter(r => r.status === 'offline').length;
    let insight = "";
    if (pending > 0) {
      insight = `Wapiga kura ${pending + 4} wameripoti kuchelewa kwa vituo mbalimbali. Kuna ripoti ${pending} zinasubiri kusawazishwa.`;
    } else {
      insight = "Vituo vingi vinaendelea vizuri. Hakuna matukio makubwa yaliyoripotiwa hivi karibuni.";
    }
    setAiInsight(insight);
    
    // Trigger AI Analysis if online
    if (navigator.onLine) {
      generateAIAnalysis(stored, insight);
    } else {
      setAiAnalysis("Unganisha intaneti ili kupata uchambuzi wa kina wa AI.");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    // Simulate sync delay
    await new Promise(r => setTimeout(r, 2000));
    const stored = await localforage.getItem<Report[]>("reports") || [];
    const updated = stored.map(r => ({ ...r, status: 'sent' as const }));
    await localforage.setItem("reports", updated);
    setReports(updated);
    setIsSyncing(false);
    loadReports();
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div>
            <h2 className="text-xl font-black text-[#0a1f44] leading-tight">SAUTI YETU</h2>
            <p className="text-[10px] font-bold text-[#2d6a4f] tracking-tighter uppercase">Our Voice | Youth-Led Civic Network</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
          <User size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/training" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
            <BookOpen size={28} className="text-black" />
          </div>
          <div>
            <p className="font-bold text-sm">Mafunzo</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Training</p>
          </div>
        </Link>
        <Link to="/report" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
            <PlusCircle size={28} className="text-black" />
          </div>
          <div>
            <p className="font-bold text-sm">Ripoti Uchaguzi</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold text-nowrap">Election Report</p>
          </div>
        </Link>
        <Link to="/map" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
            <MapIcon size={28} className="text-black" />
          </div>
          <div>
            <p className="font-bold text-sm">Ramani Matukio</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold text-nowrap">Incident Map</p>
          </div>
        </Link>
        <Link to="/history" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={28} className="text-black" />
          </div>
          <div>
            <p className="font-bold text-sm">Historia Ripoti</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold text-nowrap">Report History</p>
          </div>
        </Link>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Status</h3>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              reports.some(r => r.status === 'offline') ? "bg-red-500 animate-pulse" : "bg-green-500"
            )} />
            <p className="text-sm font-medium">
              Ripoti <span className="font-bold">{reports.filter(r => r.status === 'offline').length}</span> Zinasubiri Kusawazishwa
            </p>
          </div>
          {reports.some(r => r.status === 'offline') && navigator.onLine && (
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-green-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {isSyncing ? <Clock size={14} className="animate-spin" /> : <Send size={14} />}
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-green-50 p-5 rounded-2xl border border-green-100 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Logo className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
          <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
            <Info size={14} />
          </div>
          <span>Ujumbe wa AI</span>
        </div>
        <p className="text-sm text-green-900 leading-relaxed font-medium">
          {aiInsight}
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldAlert size={14} />
            </div>
            <span>AI Analysis</span>
          </div>
          {navigator.onLine && (
            <button 
              onClick={() => generateAIAnalysis(reports, aiInsight)}
              disabled={isAnalyzing}
              className="text-xs text-green-700 font-bold hover:underline disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Refresh Analysis"}
            </button>
          )}
        </div>
        
        {isAnalyzing ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        ) : aiAnalysis ? (
          <div className="text-sm text-gray-700 prose prose-sm max-w-none prose-green">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Bado hakuna uchambuzi wa kina.</p>
        )}
      </div>
    </div>
  );
};

const TrainingPage = () => {
  return (
    <div className="p-4 space-y-4 pb-24">
      {TRAINING_MODULES.map((module) => (
        <motion.div 
          key={module.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-green-900">{module.titleSw}</h3>
            <p className="text-xs text-gray-500">(Video: {module.duration})</p>
          </div>
          <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-green-800 border-b-[8px] border-b-transparent ml-1" />
               </div>
            </div>
            <img src={`https://picsum.photos/seed/${module.id}/400/225`} alt="Video thumbnail" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <p className="text-xs font-bold text-yellow-800 uppercase mb-2 text-center">QUIZ ?</p>
              <p className="text-sm font-bold mb-3">{module.quiz.questionSw}</p>
              <div className="space-y-2">
                {module.quiz.optionsSw.map((opt, idx) => (
                  <button 
                    key={idx}
                    className={cn(
                      "w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                      idx === 0 ? "bg-green-600 text-white" : 
                      idx === 1 ? "bg-yellow-500 text-white" :
                      idx === 2 ? "bg-blue-500 text-white" : "bg-gray-400 text-white"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full w-1/3" />
            </div>
            <p className="text-[10px] text-gray-400">Module complete...</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ReportPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    stationNumber: "",
    votingBoothNumber: "",
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  const navigate = useNavigate();

  useEffect(() => {
    if ("geolocation" in navigator) {
      setLocationStatus("fetching");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus("success");
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus("error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus("error");
    }
  }, []);

  const handleSave = async () => {
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      location: location || undefined,
      timestamp: Date.now(),
      status: 'offline',
    };
    const existing = await localforage.getItem<Report[]>("reports") || [];
    await localforage.setItem("reports", [...existing, newReport]);
    navigate("/history");
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapIcon size={18} className={cn(
              locationStatus === "success" ? "text-green-600" : 
              locationStatus === "fetching" ? "text-blue-500 animate-pulse" : "text-gray-400"
            )} />
            <span className="text-xs font-bold text-gray-600">
              {locationStatus === "fetching" ? "Inatafuta Mahali..." : 
               locationStatus === "success" ? "Mahali Pamepatikana" : 
               locationStatus === "error" ? "Mahali Hakijapatikana" : "Mahali"}
            </span>
          </div>
          {location && (
            <span className="text-[10px] text-gray-400 font-mono">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Aina ya Ripoti</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="">Chagua Aina...</option>
            {REPORT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.labelSw}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Maelezo</label>
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 h-32"
            placeholder="Elezea kilichotokea..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Namba ya Kituo</label>
          <input 
            type="text"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
            placeholder="Mfano: 112"
            value={formData.stationNumber}
            onChange={(e) => setFormData({ ...formData, stationNumber: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Namba ya Chumba cha Kupigia Kura</label>
          <input 
            type="text"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
            placeholder="Mfano: 01"
            value={formData.votingBoothNumber}
            onChange={(e) => setFormData({ ...formData, votingBoothNumber: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Tuma Picha au Video</label>
          <div className="grid grid-cols-3 gap-3">
            <button className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-gray-200 transition-colors">
              <Camera size={24} />
              <span className="text-[10px]">Picha</span>
            </button>
            <button className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-gray-200 transition-colors">
              <Video size={24} />
              <span className="text-[10px]">Video</span>
            </button>
            <button className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-gray-200 transition-colors">
              <Paperclip size={24} />
              <span className="text-[10px]">Faili</span>
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-600 h-full w-1/3" />
          </div>
          <p className="text-xs text-gray-500">Step 1 of 3</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleSave}
              className="bg-green-800 text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-green-900 transition-colors"
            >
              Hifadhi Offline
            </button>
            <button className="bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-green-700 transition-colors">
              Hakiki Ripoti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const load = async () => {
      const stored = await localforage.getItem<Report[]>("reports") || [];
      setReports(stored.sort((a, b) => b.timestamp - a.timestamp));
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Historia Ripoti | Report History</h2>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <User size={12} />
          <span>My Profile</span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400 space-y-2">
          <History size={48} className="mx-auto opacity-20" />
          <p>Hakuna ripoti bado.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              <History size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Ripoti #{report.id.substr(0, 3)}: {report.status === 'offline' ? 'Inasubiri (Offline)' : 'Imetumwa'}</p>
              <p className="text-[10px] text-gray-400">{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <button className="text-gray-300 hover:text-red-500 transition-colors">
              <PlusCircle size={20} className="rotate-45" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const MapPage = () => {
  const incidents = [
    { id: 1, title: "Kituo #112: Uhasama", sub: "Disturbance", type: "red" },
    { id: 2, title: "Kituo #098: Kuchelewa", sub: "Delay", type: "red" },
    { id: 3, title: "Ward X: Uhesabuji Utata", sub: "Irregular Counting", type: "red" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-1 bg-gray-100 relative overflow-hidden">
        {/* Mock Map Background */}
        <img 
          src="https://picsum.photos/seed/tanzania-map/800/1200?grayscale" 
          alt="Map" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        
        {/* Mock Markers */}
        <div className="absolute top-1/4 left-1/3 text-green-600"><MapIcon size={32} fill="currentColor" /></div>
        <div className="absolute top-1/2 left-1/2 text-red-600 animate-bounce"><MapIcon size={32} fill="currentColor" /></div>
        <div className="absolute top-1/3 right-1/4 text-yellow-600"><MapIcon size={32} fill="currentColor" /></div>
        <div className="absolute bottom-1/4 left-1/4 text-green-600"><MapIcon size={32} fill="currentColor" /></div>

        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-white/50 flex items-center gap-2">
            <PlusCircle size={20} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Tafuta Ward au Kituo..." 
              className="bg-transparent border-none outline-none text-sm flex-1"
            />
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-600"><MapIcon size={16} /></div>
              <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-600 rotate-45"><Send size={16} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 space-y-4 max-h-[40%] overflow-y-auto border-t border-gray-100 rounded-t-3xl shadow-2xl">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
        <div className="space-y-4">
          <div className="bg-red-600 text-white p-2 rounded-lg text-xs font-bold text-center uppercase tracking-widest">Kanda Nyekundu</div>
          {incidents.map(inc => (
            <div key={inc.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertTriangle size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">{inc.title}</p>
                <p className="text-[10px] text-gray-500">{inc.sub}</p>
              </div>
              <button className="text-gray-300"><PlusCircle size={16} className="rotate-45" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SOSPage = () => {
  return (
    <div className="p-4 space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-red-600">Msaada wa SOS</h2>
        <p className="text-gray-500 text-sm">Bonyeza kitufe hapa chini kwa msaada wa haraka</p>
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="w-48 h-48 bg-red-600 rounded-full shadow-2xl flex flex-col items-center justify-center text-white gap-2 border-8 border-red-100"
      >
        <ShieldAlert size={64} />
        <span className="text-2xl font-black">SOS</span>
      </motion.button>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
          <p className="font-bold text-sm">Piga Simu</p>
          <p className="text-xs text-gray-400">Call Support</p>
        </button>
        <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
          <p className="font-bold text-sm">Tuma SMS</p>
          <p className="text-xs text-gray-400">Send SMS</p>
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        <OfflineBanner />
        
        <Routes>
          <Route path="/" element={<><Header title="Sauti Yetu" /><Dashboard /></>} />
          <Route path="/training" element={<><Header title="Mafunzo | Training" showBack /><TrainingPage /></>} />
          <Route path="/report" element={<><Header title="Ripoti Uchaguzi" showBack /><ReportPage /></>} />
          <Route path="/map" element={<><Header title="Ramani Matukio" showBack /><MapPage /></>} />
          <Route path="/history" element={<><Header title="Historia Ripoti" showBack /><HistoryPage /></>} />
          <Route path="/sos" element={<><Header title="Msaada SOS" showBack /><SOSPage /></>} />
        </Routes>

        <BottomNav />
      </div>
    </Router>
  );
}
