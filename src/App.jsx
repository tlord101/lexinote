import React, { useState, useEffect, createContext, useContext, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  Mic, FileText, Search, Settings, Check, AlertCircle, Loader2, 
  Moon, Sun, LogOut, Plus, Brain, FolderSync, X, Menu, 
  ChevronDown, Pause, Trash2, Image as ImageIcon, FileUp, 
  Clock, Zap, LayoutGrid, List, Tag, ArrowUp, 
  PanelLeft, PanelRight, Bold, Italic, List as ListIcon, Undo, Redo, 
  Wand2, GripVertical, Camera, Bookmark, 
  Maximize2, Sparkles, RefreshCw, Upload, Edit,
  PenTool, Eye, ChevronLeft, ArrowLeft, ArrowRight,
  FileType, ChevronRight, Chrome
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

const firebaseConfig = {
  apiKey: "AIzaSyAocB-xjAk8-xIIcDLjx72k9I8OK4jHVgE",
  authDomain: "tlord-1ab38.firebaseapp.com",
  databaseURL: "https://tlord-1ab38-default-rtdb.firebaseio.com",
  projectId: "tlord-1ab38",
  storageBucket: "tlord-1ab38.firebasestorage.app",
  messagingSenderId: "750743868519",
  appId: "1:750743868519:web:5a937bc8e75e86a96570c2",
  measurementId: "G-5MDEM4EWHJ"
};

// Initialize Firebase safely
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Global App ID for Firestore paths (Rule 1)
const APP_ID = "1:750743868519:web:5a937bc8e75e86a96570c2";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/* -------------------------------------------------------------------------- */
/* THEME SYSTEM                                 */
/* -------------------------------------------------------------------------- */

const COLORS = {
  light: {
    primary: '#1F3A5F',    secondary: '#C9A24D',  background: '#FAF9F6',
    surface: '#F1EFEA',    textPrimary: '#1E1E1E', textSecondary: '#5F6C7B',
    border: '#D6D6D6',     error: '#B83A3A',      success: '#3E8E7E',
    warning: '#E0A800',    active: '#D64545',     overlay: 'rgba(31, 58, 95, 0.05)',
  },
  dark: {
    primary: '#4A7FB8',    secondary: '#B89B5E',  background: '#121417',
    surface: '#1C1F26',    textPrimary: '#EDEDED', textSecondary: '#A0A6B1',
    border: '#2C313A',     error: '#CF6679',      success: '#4E9E8F',
    warning: '#FFC107',    active: '#E05A5A',     overlay: 'rgba(255, 255, 255, 0.05)',
  }
};

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(prev => !prev);
  const theme = useMemo(() => isDark ? COLORS.dark : COLORS.light, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      <div 
        className={`min-h-screen w-full transition-colors duration-300 ease-in-out font-sans ${isDark ? 'dark' : ''}`}
        style={{ 
          backgroundColor: theme.background, 
          color: theme.textPrimary,
          fontFamily: '"Inter", "Roboto", sans-serif'
        }}
      >
        <style>{`
          :root { --primary: ${theme.primary}; --bg: ${theme.background}; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
          .ripple { position: relative; overflow: hidden; transform: translate3d(0, 0, 0); }
          .ripple:after { content: ""; display: block; position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; background-image: radial-gradient(circle, #fff 10%, transparent 10.01%); background-repeat: no-repeat; background-position: 50%; transform: scale(10, 10); opacity: 0; transition: transform .5s, opacity 1s; }
          .ripple:active:after { transform: scale(0, 0); opacity: 0.2; transition: 0s; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(214, 69, 69, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(214, 69, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(214, 69, 69, 0); } }
          .recording-pulse { animation: pulse-red 2s infinite; }
          
          /* Markdown Styles - Enhanced */
          .markdown-body { white-space: pre-wrap; line-height: 1.8; color: var(--text-main); font-size: 1.05em; }
          .markdown-body h1 { font-size: 1.8em; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.8em; color: var(--primary); letter-spacing: -0.02em; border-bottom: 1px solid ${theme.border}; padding-bottom: 0.2em; }
          .markdown-body h2 { font-size: 1.4em; font-weight: 700; margin-top: 1.2em; margin-bottom: 0.6em; color: var(--text-main); }
          .markdown-body h3 { font-size: 1.2em; font-weight: 600; margin-top: 1em; margin-bottom: 0.4em; color: ${theme.secondary}; }
          .markdown-body p { margin-bottom: 1em; }
          .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
          .markdown-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
          .markdown-body li { margin-bottom: 0.4em; padding-left: 0.2em; }
          .markdown-body blockquote { border-left: 4px solid var(--secondary); padding: 0.5em 1em; font-style: italic; margin-bottom: 1.2em; background: rgba(0,0,0,0.03); border-radius: 0 8px 8px 0; }
          .markdown-body code { background: rgba(0,0,0,0.06); padding: 0.2em 0.4em; rounded: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85em; color: var(--primary); }
          .markdown-body pre { background: #1e1e1e; color: #eee; padding: 1.2em; overflow-x: auto; border-radius: 12px; margin-bottom: 1.5em; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .markdown-body strong { font-weight: 700; color: var(--primary); }
          .katex-display { margin: 1.5em 0; overflow-x: auto; overflow-y: hidden; padding: 0.5em 0; }
        `}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/* AUTH CONTEXT                                */
/* -------------------------------------------------------------------------- */

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const register = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    setIsNewUser(true);
    return res;
  };
  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    // Mark onboarding for new accounts created via Google
    if (res?._tokenResponse?.isNewUser) setIsNewUser(true);
    return res;
  };
  const logout = () => { setIsNewUser(false); return signOut(auth); };
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const completeOnboarding = () => setIsNewUser(false);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, resetPassword, isNewUser, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/* REUSABLE COMPONENTS                             */
/* -------------------------------------------------------------------------- */

const Button = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
  const { theme } = useContext(ThemeContext);
  const baseStyle = "ripple px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm";
  const variants = {
    primary: { backgroundColor: theme.primary, color: '#FFFFFF', boxShadow: `0 4px 14px -4px ${theme.primary}80` },
    secondary: { backgroundColor: theme.surface, color: theme.primary, border: `1px solid ${theme.border}` },
    ghost: { backgroundColor: 'transparent', color: theme.textSecondary, boxShadow: 'none', padding: '0.5rem' },
    danger: { backgroundColor: theme.error, color: '#FFFFFF' }
  };
  return (
    <button className={`${baseStyle} ${className}`} style={variants[variant]} disabled={isLoading} {...props}>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

const Input = ({ label, error, icon: Icon, textarea, ...props }) => {
  const { theme } = useContext(ThemeContext);
  const [focused, setFocused] = useState(false);
  const Component = textarea ? 'textarea' : 'input';

  return (
    <div className="w-full mb-4">
      {label && <label className="block text-xs font-bold mb-1.5 ml-1 tracking-wide uppercase" style={{ color: focused ? theme.primary : theme.textSecondary }}>{label}</label>}
      <div 
        className="relative flex items-center rounded-xl transition-all duration-200 border-2"
        style={{ backgroundColor: theme.surface, borderColor: error ? theme.error : (focused ? theme.primary : 'transparent') }}
      >
        {Icon && !textarea && <Icon className="ml-3 w-5 h-5 transition-colors" style={{ color: focused ? theme.primary : theme.textSecondary }} />}
        <Component 
          {...props}
          className={`w-full p-3 bg-transparent outline-none text-base ${textarea ? 'min-h-[100px] resize-none' : ''}`}
          style={{ color: theme.textPrimary }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
      </div>
      {error && <div className="flex items-center mt-1 ml-1 text-xs" style={{ color: theme.error }}><AlertCircle className="w-3 h-3 mr-1" />{error}</div>}
    </div>
  );
};

const Card = ({ children, className = '', noPadding, onClick }) => {
  const { theme, isDark } = useContext(ThemeContext);
  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      style={{ 
        backgroundColor: theme.surface,
        border: `1px solid ${isDark ? theme.border : 'transparent'}`,
        boxShadow: isDark ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    const { theme } = useContext(ThemeContext);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items:end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
                style={{ backgroundColor: theme.background }}
            >
                <div className="p-5 border-b flex justify-between items-center shrink-0" style={{ borderColor: theme.border }}>
                    <h3 className="font-bold text-lg" style={{ color: theme.textPrimary }}>{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
                        <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* HELPER MODULES                                     */
/* -------------------------------------------------------------------------- */

const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const loadKatex = () => {
  if (window.katex) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.onload = () => {
        const autoRender = document.createElement('script');
        autoRender.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
        autoRender.onload = resolve;
        document.head.appendChild(autoRender);
    };
    document.head.appendChild(script);
  });
};

const MarkdownView = ({ content }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        loadKatex().then(() => {
            if (contentRef.current && window.renderMathInElement) {
                window.renderMathInElement(contentRef.current, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            }
        });
    }, [content]);

    // Enhanced Parser for cleaner output, handling LaTeX preservation
    const parseMarkdown = (text) => {
        if (!text) return '';
        let html = text
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold/Italic
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Lists - Handle list merging properly
            .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
            .replace(/<\/ul>\s*<ul>/gim, '') 
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            // Horizontal Rule
            .replace(/^---$/gim, '<hr />');
            // Removed global newline replacement to support LaTeX and pre-wrap CSS

        return html;
    };

    return (
        <div 
            ref={contentRef}
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
        />
    );
};

/* -------------------------------------------------------------------------- */
/* UPLOADER COMPONENTS                                */
/* -------------------------------------------------------------------------- */

const PdfUploader = ({ isOpen, onClose, onComplete }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfStatus, setPdfStatus] = useState('idle');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    if (!title) setTitle(file.name.replace('.pdf', ''));
    setPdfStatus('rendering');
    setPages([]);
    try {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const renderedPages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            renderedPages.push({
                id: `p${i}_${Math.random().toString(36).substr(2, 5)}`,
                pageNumber: i,
                preview: canvas.toDataURL('image/jpeg', 0.8),
                blob: await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.8)),
                status: 'pending', progress: 0, text: ''
            });
        }
        setPages(renderedPages);
        setPdfStatus('ready');
    } catch (err) {
        console.error("PDF Render Error", err);
        setPdfStatus('idle');
    }
  };

  const processPage = async (page, noteId) => {
      try {
          setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: 'processing', progress: 20 } : p));
          const storageRef = ref(storage, `artifacts/${APP_ID}/users/${user.uid}/images/${noteId}/${page.id}.jpg`);
          await uploadBytes(storageRef, page.blob);
          const downloadUrl = await getDownloadURL(storageRef);
          setPages(prev => prev.map(p => p.id === page.id ? { ...p, progress: 50 } : p));
          const base64 = page.preview.split(',')[1];
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Extract text from this document page. Use clear Markdown headers, bullet points, and tables. Do not add commentary." }, { inline_data: { mime_type: 'image/jpeg', data: base64 } }] }] })
          });
          const data = await response.json();
          const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!extractedText) throw new Error("AI extraction failed");
          setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: 'success', progress: 100, text: extractedText } : p));
          const newPage = { id: page.id, title: `Page ${page.pageNumber}`, content: extractedText, imageUrl: downloadUrl };
          const noteRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId);
          await updateDoc(noteRef, { pages: arrayUnion(newPage), lastModified: serverTimestamp() });
          return true;
      } catch (err) {
          console.error(`Page ${page.pageNumber} failed`, err);
          setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: 'error', progress: 0 } : p));
          return false;
      }
  };

  const handleFinish = () => { if(currentNoteId) onComplete(currentNoteId); onClose(); };

  const processAll = async () => {
      if (pages.length === 0) return;
      setIsProcessing(true);
      let noteId = currentNoteId;
      if (!noteId) {
           const noteRef = await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'notes'), {
                title: title || "PDF Import", description: `Imported from ${pdfFile?.name}`, category: 'PDF', tags: ['pdf', 'import'], createdAt: serverTimestamp(), lastModified: serverTimestamp(), pages: [], color: theme.primary
            });
            noteId = noteRef.id;
            setCurrentNoteId(noteId);
      }
      
      let allSuccess = true;
      const pendingPages = pages.filter(p => p.status === 'pending');
      for (const page of pendingPages) { 
          const success = await processPage(page, noteId);
          if (!success) allSuccess = false;
      }
      setIsProcessing(false);
      
      if (allSuccess && !pages.some(p => p.status === 'error')) {
          handleFinish();
      }
  };

  const retryPage = async (id) => {
      if (!currentNoteId) return;
      const page = pages.find(p => p.id === id);
      if(page) await processPage(page, currentNoteId);
  };

  const hasPending = pages.some(p => p.status === 'pending');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PDF Ingestion">
       <div className="space-y-4">
           <Input label="Document Title" value={title} onChange={e => setTitle(e.target.value)} disabled={isProcessing || !!currentNoteId} />
           {pdfStatus === 'idle' && (
                <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors" style={{ borderColor: theme.border }}>
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                    <FileType size={32} className="mb-2" style={{ color: theme.secondary }} />
                    <p className="font-medium">Tap to Select PDF</p>
                </div>
           )}
           {pdfStatus === 'rendering' && <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto mb-2" size={24} /><p className="text-sm">Rendering PDF...</p></div>}
           {(pdfStatus === 'ready' || pdfStatus === 'processing') && (
               <div className="space-y-2 max-h-64 overflow-y-auto">
                   {pages.map((page) => (
                       <div key={page.id} className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                           <div className="w-10 h-14 bg-white border shadow-sm shrink-0 overflow-hidden"><img src={page.preview} className="w-full h-full object-contain" alt="" /></div>
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between mb-1"><span className="text-xs font-bold">Page {page.pageNumber}</span><span className={`text-[10px] font-bold uppercase ${page.status === 'success' ? 'text-green-500' : page.status === 'error' ? 'text-red-500' : 'text-blue-500'}`}>{page.status}</span></div>
                               <div className="h-1 bg-gray-200 rounded-full overflow-hidden"><div className="h-full transition-all duration-300" style={{ width: `${page.progress}%`, backgroundColor: theme.primary }} /></div>
                           </div>
                           {page.status === 'error' && <button onClick={() => retryPage(page.id)} className="p-1 hover:bg-black/10 rounded"><RefreshCw size={14} /></button>}
                       </div>
                   ))}
               </div>
           )}
           <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1">Cancel</Button>
                {hasPending ? (
                    <Button onClick={processAll} isLoading={isProcessing} disabled={isProcessing} className="flex-2">{isProcessing ? 'Extracting...' : 'Start Extraction'}</Button>
                ) : pages.length > 0 && (
                    <Button onClick={handleFinish} className="flex-2 variant-success">Finish</Button>
                )}
           </div>
       </div>
    </Modal>
  );
};

const ImageUploader = ({ isOpen, onClose, onComplete, targetNoteId }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState(targetNoteId || null);
  const fileInputRef = useRef(null);

  useEffect(() => { if (targetNoteId) setCurrentNoteId(targetNoteId); }, [targetNoteId]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newImages = files.map((file) => ({ id: Math.random().toString(36).substr(2, 9), file, preview: URL.createObjectURL(file), status: 'pending', progress: 0, text: '' }));
    setImages(prev => [...prev, ...newImages]);
    if (!title && !targetNoteId) setTitle(`Scanned Notes ${new Date().toLocaleDateString()}`);
  };

  const convertToBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type });
      reader.onerror = reject;
  });

  const processImage = async (img, noteId) => {
     try {
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'processing', progress: 10 } : p));
        const storageRef = ref(storage, `artifacts/${APP_ID}/users/${user.uid}/images/${noteId}/${img.id}`);
        await uploadBytes(storageRef, img.file);
        const downloadUrl = await getDownloadURL(storageRef);
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, progress: 40 } : p));
        const { base64, mimeType } = await convertToBase64(img.file);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [ { text: "Transcribe this image into clean, formatted Markdown. Preserve headings, lists, and tables. Output ONLY the content." }, { inline_data: { mime_type: mimeType, data: base64 } } ] }] })
        });
        const data = await response.json();
        const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!extractedText) throw new Error("No text extracted");
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'success', progress: 100, text: extractedText } : p));
        const newPage = { id: img.id, title: `Page from Image`, content: extractedText, imageUrl: downloadUrl };
        const noteRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId);
        await updateDoc(noteRef, { pages: arrayUnion(newPage), lastModified: serverTimestamp() });
     } catch (err) {
        console.error("Processing failed", err);
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'error', progress: 0 } : p));
     }
  };

  const processQueue = async () => {
    if (images.length === 0) return;
    setIsGlobalProcessing(true);
    let noteId = currentNoteId;
    if (!noteId) {
        const noteRef = await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'notes'), { title: title || "Untitled Scan", description: "Processing scanned images...", category: 'Scans', tags: ['scan', 'ocr'], createdAt: serverTimestamp(), lastModified: serverTimestamp(), pages: [], color: theme.secondary });
        noteId = noteRef.id;
        setCurrentNoteId(noteId);
    }
    for (const img of images.filter(img => img.status === 'pending')) { await processImage(img, noteId); }
    setIsGlobalProcessing(false);
  };

  const handleFinish = () => { if (currentNoteId) { if (onComplete) onComplete(currentNoteId); onClose(); } else { onClose(); } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={targetNoteId ? "Add Pages via Scan" : "Scan & OCR Processing"}>
       <div className="space-y-4">
          {!targetNoteId && ( <Input label="Document Title" value={title} onChange={e => setTitle(e.target.value)} disabled={!!currentNoteId || isGlobalProcessing} /> )}
          <div onClick={() => !isGlobalProcessing && fileInputRef.current.click()} className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-black/5" style={{ borderColor: theme.border }}>
             <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} disabled={isGlobalProcessing} />
             <Upload size={32} className="mb-2" style={{ color: theme.primary }} /><p className="text-sm font-medium">{isGlobalProcessing ? 'Processing...' : 'Tap to add images'}</p>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
             {images.map((img, idx) => (
                <div key={img.id} className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                   <div className="w-12 h-12 rounded bg-cover bg-center shrink-0 border" style={{ backgroundImage: `url(${img.preview})`, borderColor: theme.border }} />
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1"><span className="text-xs font:bold truncate">Page {idx + 1}</span><span className={`text-[10px] font-bold uppercase ${img.status === 'success' ? 'text-green-500' : img.status === 'error' ? 'text-red-500' : 'text-blue-500'}`}>{img.status}</span></div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"><div className="h-full transition-all duration-300 rounded-full" style={{ width: `${img.progress}%`, backgroundColor: img.status === 'error' ? theme.error : theme.primary }} /></div>
                   </div>
                </div>
             ))}
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" onClick={onClose} disabled={isGlobalProcessing} className="flex-1">Cancel</Button>
             {images.some(i => i.status === 'pending') && (<Button onClick={processQueue} disabled={isGlobalProcessing} isLoading={isGlobalProcessing} className="flex-2">{isGlobalProcessing ? 'Processing...' : 'Process All'}</Button>)}
             {!images.some(i => i.status === 'pending') && images.length > 0 && !isGlobalProcessing && (<Button onClick={handleFinish} className="flex-2 variant-success">Finish</Button>)}
          </div>
       </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/* LIVE RECORDER COMPONENT                          */
/* -------------------------------------------------------------------------- */

const RecorderOverlay = ({ onClose, onSaved }) => {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [structuredNotes, setStructuredNotes] = useState('');
    const [aiStatus, setAiStatus] = useState('Ready');
    const [currentNoteId, setCurrentNoteId] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const recognitionRef = useRef(null);
    const animationFrameRef = useRef(null);
    const transcriptBufferRef = useRef('');
    const notesContainerRef = useRef(null);

    const formatTime = (secs) => { const mins = Math.floor(secs / 60); const seconds = secs % 60; return `${mins}:${seconds.toString().padStart(2, '0')}`; };

    useEffect(() => { if (notesContainerRef.current) notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight; }, [structuredNotes]);

    const visualize = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteTimeDomainData(dataArray);
            ctx.fillStyle = theme.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = theme.active;
            ctx.beginPath();
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;
            for(let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height/2);
            ctx.stroke();
        };
        draw();
    };

    const processBufferWithAI = async () => {
        const bufferLength = transcriptBufferRef.current?.length || 0;
        console.log(`[AI Processing] Buffer length: ${bufferLength} chars`);
        
        if (!transcriptBufferRef.current || bufferLength < 15) {
            console.log('[AI Processing] Skipped - insufficient content');
            setAiStatus('Listening...');
            return;
        }
        
        if (!API_KEY) {
            console.error('[AI Processing] Gemini API key not configured');
            setAiStatus('API Key Missing');
            return;
        }
        
        const chunk = transcriptBufferRef.current.trim();
        transcriptBufferRef.current = "";
        console.log(`[AI Processing] Processing ${chunk.length} characters...`);
        setAiStatus('AI Writing...');
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `You are an attentive student taking notes during a lecture. Convert this raw speech transcript into structured, high-quality study notes.
                            1. **Focus**: Extract only the educational content. Ignore background noise, interruptions, or irrelevant chatter.
                            2. **Formulas**: Detect verbal descriptions of math/science formulas and convert them into LaTeX syntax (e.g. $E=mc^2$).
                            3. **Format**: Use Markdown with clear bullet points. Use **bold** for key terms and definitions.
                            4. **Style**: Write in a clear, concise academic tone.
                            5. **Output**: Return ONLY the Markdown content to append to the notes.
                            
                            Raw Transcript: "${chunk}"` }] }] })
            });
            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            if (aiText) {
                console.log(`[AI Processing] Generated ${aiText.length} characters`);
                const newContent = structuredNotes + "\n\n" + aiText;
                setStructuredNotes(newContent);
                if (currentNoteId) {
                    const noteRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', currentNoteId);
                    await updateDoc(noteRef, { pages: [{ id: '1', title: 'Live Notes', content: newContent }], lastModified: serverTimestamp(), preview: newContent.substring(0, 100) + "..." });
                }
                setAiStatus('Live ✓');
            } else {
                console.log('[AI Processing] No content generated');
                setAiStatus('Live');
            }
        } catch (err) {
            console.error("[AI Processing] Error:", err);
            setAiStatus('Error - Retry');
            transcriptBufferRef.current = chunk + " " + transcriptBufferRef.current;
        }
    };

    useEffect(() => { 
        let interval; 
        if (isRecording) { 
            console.log('[Recording] AI processing interval started (every 10s)');
            interval = setInterval(() => {
                console.log('[Recording] 10s interval triggered');
                processBufferWithAI();
            }, 10000); 
        } 
        return () => {
            if (interval) {
                console.log('[Recording] AI processing interval cleared');
                clearInterval(interval);
            }
        };
    }, [isRecording, currentNoteId]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
            const noteRef = await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'notes'), {
                title: `Live Lecture ${new Date().toLocaleString()}`, preview: "Recording in progress...", category: 'Lecture', tags: ['audio', 'lecture', 'live'], createdAt: serverTimestamp(), lastModified: serverTimestamp(), color: theme.active, pages: [{ id: '1', title: 'Live Notes', content: '' }]
            });
            setCurrentNoteId(noteRef.id);
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 2048;
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            visualize();
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';
                recognitionRef.current.onresult = (event) => {
                    let finalTranscriptChunk = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) { if (event.results[i].isFinal) finalTranscriptChunk += event.results[i][0].transcript; }
                    if (finalTranscriptChunk) { setTranscript(prev => prev + ' ' + finalTranscriptChunk); transcriptBufferRef.current += ' ' + finalTranscriptChunk; }
                };
                recognitionRef.current.start();
            } else { alert("Speech recognition not supported in this browser. Audio will be recorded but not transcribed live."); }
        } catch (err) { console.error("Error starting recording:", err); alert("Could not access microphone."); }
    };

    const stopRecording = async () => {
        if (!mediaRecorderRef.current) return;
        mediaRecorderRef.current.stop();
        if (recognitionRef.current) recognitionRef.current.stop();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setIsRecording(false);
        setAiStatus('Finalizing...');
        await processBufferWithAI();
        setAiStatus('Saving...');
        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const storageRef = ref(storage, `artifacts/${APP_ID}/users/${user.uid}/audio/${currentNoteId}.webm`);
            try {
                await uploadBytes(storageRef, audioBlob);
                const downloadURL = await getDownloadURL(storageRef);
                if (currentNoteId) {
                     const noteRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', currentNoteId);
                     await updateDoc(noteRef, { audioUrl: downloadURL, rawTranscript: transcript });
                    setAiStatus('Saved!');
                    setTimeout(() => { onSaved(currentNoteId); onClose(); }, 1000);
                }
            } catch (err) { console.error("Upload failed", err); setAiStatus('Saved (Audio Upload Failed)'); setTimeout(onClose, 2000); }
        };
    };

    useEffect(() => { let interval; if (isRecording) { interval = setInterval(() => setDuration(s => s + 1), 1000); } return () => clearInterval(interval); }, [isRecording]);

    return (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: theme.background }}>
            <div className="h-16 px-6 flex items-center justify-between shrink-0" style={{ backgroundColor: theme.surface }}>
                <button onClick={onClose} disabled={isRecording} className="p-2 rounded-full hover:bg-black/5"><ChevronDown size={24} style={{ color: theme.textSecondary }} /></button>
                <div className="flex flex-col items-center"><span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.active }}>{isRecording ? 'Recording Live' : 'Ready to Record'}</span><span className="font-mono text-xl font-medium" style={{ color: theme.textPrimary }}>{formatTime(duration)}</span></div>
                <div className="w-10" />
            </div>
            <div className="h-[120px] shrink-0 relative flex flex-col" style={{ backgroundColor: theme.background }}>
                <canvas ref={canvasRef} width={window.innerWidth} height={120} className="w-full h-full" />
            </div>
            {/* Removed the Live Transcript container, allowing AI Note container to grow */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white/50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]" style={{ backgroundColor: theme.surface }}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
                    <div className="flex gap-4"><span className="font-bold text-sm" style={{ color: theme.primary }}>AI Notes</span><span className="font-bold text-sm opacity-50" style={{ color: theme.textSecondary }}>Formatted Live</span></div>
                    <div className="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700"><Sparkles size={12} />{aiStatus}</div>
                </div>
                <div ref={notesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                    {structuredNotes ? (
                        <MarkdownView content={structuredNotes} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-40 gap-2"><Brain size={32} /><p>Waiting for speech...</p></div>
                    )}
                </div>
            </div>
            <div className="h-32 shrink-0 flex items-center justify-center gap-8 pb-8" style={{ backgroundColor: theme.surface }}>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-red-500 shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  >
                    <Mic size={32} color="white" />
                  </button>
                ) : (
                  <React.Fragment>
                    <button className="p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
                      <Pause size={24} />
                    </button>
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center recording-pulse relative"
                    >
                      <div className="w-8 h-8 rounded bg-red-500" />
                    </button>
                    <button
                      className="p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                      onClick={() => (transcriptBufferRef.current += " [BOOKMARK] ")}
                    >
                      <Bookmark size={24} />
                    </button>
                  </React.Fragment>
                )}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* UPDATED DASHBOARD & APP INTEGRATION                 */
/* -------------------------------------------------------------------------- */

const CreateNoteModal = ({ isOpen, onClose, onCreate, onStartLiveRecording }) => {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState({ title: '', desc: '', tags: '', color: '#1F3A5F' });
  const [loading, setLoading] = useState(false);
  const colors = ['#1F3A5F', '#C9A24D', '#3E8E7E', '#B83A3A', '#E0A800', '#5F6C7B', '#8E44AD', '#2C3E50'];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!data.title.trim()) return;
    setLoading(true);
    await onCreate({ title: data.title, description: data.desc, tags: data.tags.split(',').map(t => t.trim()).filter(Boolean), color: data.color, pages: [{ id: Date.now().toString(), title: 'Page 1', content: '' }] });
    setLoading(false); onClose(); setData({ title: '', desc: '', tags: '', color: '#1F3A5F' });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Note">
      <form onSubmit={handleSubmit} className="space-y-4">
        {onStartLiveRecording && (
          <button
            type="button"
            onClick={() => { onClose(); onStartLiveRecording(); }}
            className="w-full p-4 mb-1 rounded-xl flex items-center justify-between border transition-all hover:shadow-sm"
            style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.active }}>
                <Mic size={18} color="#fff" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold" style={{ color: theme.textPrimary }}>Go Live</div>
                <div className="text-xs" style={{ color: theme.textSecondary }}>Record audio and create notes instantly.</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: theme.textSecondary }} />
          </button>
        )}
        <Input label="Notebook Title" placeholder="e.g., Linear Algebra Lectures" value={data.title} onChange={e => setData({...data, title: e.target.value})} autoFocus />
        <Input label="Description (Optional)" placeholder="Brief summary of this notebook..." textarea value={data.desc} onChange={e => setData({...data, desc: e.target.value})} />
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2 ml-1 tracking-wide uppercase" style={{ color: theme.textSecondary }}>Cover Color</label>
          <div className="flex flex-wrap gap-3">{colors.map(c => (<button key={c} type="button" onClick={() => setData({...data, color: c})} className={`w-8 h-8 rounded-full transition-transform ${data.color === c ? 'scale-110 ring-2 ring-offset-2' : 'hover:scale-105'}`} style={{ backgroundColor: c, ringColor: theme.primary }}>{data.color === c && <Check size={14} className="text-white mx-auto" />}</button>))}</div>
        </div>
        <Input label="Tags" placeholder="math, lecture, important (comma separated)" icon={Tag} value={data.tags} onChange={e => setData({...data, tags: e.target.value})} />
        <div className="p-4 border-2 border-dashed rounded-xl text-center mb-4 cursor-pointer hover:bg-black/5 transition-colors" style={{ borderColor: theme.border }}><ImageIcon className="mx-auto mb-2 opacity-50" size={24} style={{ color: theme.textPrimary }} /><span className="text-xs font-medium" style={{ color: theme.textSecondary }}>Tap to upload cover image</span></div>
        <Button type="submit" className="w-full" isLoading={loading}>Create Notebook</Button>
      </form>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/* EDITOR & GEMINI ENHANCEMENT ENGINE                 */
/* -------------------------------------------------------------------------- */

const Editor = ({ noteId, onClose }) => {
    const { theme, isDark } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const [note, setNote] = useState(null);
    const [activePageId, setActivePageId] = useState(null);
    const [showLeft, setShowLeft] = useState(false); // Default hidden
    const [showRight, setShowRight] = useState(false); // Default hidden
    const [status, setStatus] = useState('saved'); 
    const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false); // Enhancement State
    const [isEditing, setIsEditing] = useState(false); // Default to Viewer

    useEffect(() => {
        if(!noteId || !user) return;
        const unsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId), (doc) => {
            if(doc.exists()) {
                const data = doc.data();
                setNote({ id: doc.id, ...data });
                if (!activePageId && data.pages?.length > 0) setActivePageId(data.pages[0].id);
            }
        });
        return () => unsub();
    }, [noteId, user]);

    const saveTimeout = useRef(null);
    const handleContentChange = (newContent) => {
        if (!note || !activePageId) return;
        setStatus('saving');
        const updatedPages = note.pages.map(p => p.id === activePageId ? { ...p, content: newContent } : p);
        setNote(prev => ({ ...prev, pages: updatedPages }));
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            try {
                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId), { pages: updatedPages, lastModified: serverTimestamp() });
                setStatus('saved');
            } catch (err) { console.error(err); setStatus('error'); }
        }, 1500);
    };

    const handleKeyDown = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); setStatus('saved'); } };

    const addPage = async () => {
        const newPage = { id: Date.now().toString(), title: `Page ${note.pages.length + 1}`, content: '' };
        const updatedPages = [...note.pages, newPage];
        setNote(prev => ({ ...prev, pages: updatedPages }));
        setActivePageId(newPage.id);
        await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId), { pages: updatedPages });
    };

    const deletePage = async (pageId, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this page?")) return;
        
        // Optimistic UI update
        const updatedPages = note.pages.filter(p => p.id !== pageId);
        setNote(prev => ({ ...prev, pages: updatedPages }));
        
        // Handle navigation if active page deleted
        if (activePageId === pageId) {
            setActivePageId(updatedPages.length > 0 ? updatedPages[0].id : null);
        }

        // Firestore Update
        await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId), { 
            pages: updatedPages 
        });
    };

    const handleDeleteNote = async () => {
        if (!window.confirm("Delete this entire note?")) return;
        try { 
            await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId)); 
            onClose(); // Close editor
        } catch (err) { console.error("Error deleting note", err); }
    }

    // --- GEMINI ENHANCEMENT LOGIC ---
    const enhanceContent = async (mode = 'full') => {
        const activePage = note.pages.find(p => p.id === activePageId);
        if (!activePage || !activePage.content.trim()) { alert("Please write some notes first!"); return; }
        
        setIsEnhancing(true);
        setStatus('enhancing');

        let systemInstruction = "";
        if (mode === 'full') {
            systemInstruction = `You are an expert academic editor. Enhance the user's notes following these strict rules:
            1. **Grammar & Clarity**: Fix all grammar, spelling, and awkward phrasing.
            2. **Structure**: Organize text into clear Markdown headings (#, ##) and bullet points.
            3. **Formulas**: Detect mathematical expressions and wrap them in LaTeX syntax ($...$ for inline, $$...$$ for block).
            4. **Highlights**: Bold key terms, definitions, and important dates.
            5. **Fidelity**: Do not remove information. Keep the tone professional and academic.`;
        } else if (mode === 'grammar') {
            systemInstruction = "Fix all grammar, spelling, and punctuation errors in the following text. Do not change the structure or formatting.";
        } else if (mode === 'structure') {
            systemInstruction = "Reorganize the following text into a clean Markdown outline with headers and bullet points. Do not rewrite sentences, just structure them.";
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: activePage.content }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                })
            });

            const data = await response.json();
            const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (enhancedText) {
                handleContentChange(enhancedText);
                if (mode === 'full' || mode === 'structure') {
                    // Switch to preview to show off formatting
                    // setIsEditing(false); // Optional: keep them in editor to see changes
                }
            }
        } catch (err) {
            console.error("Enhancement failed", err);
            alert("AI enhancement failed. Please try again.");
        } finally {
            setIsEnhancing(false);
            setStatus('saved');
        }
    };

    if (!note) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    const activePage = note.pages.find(p => p.id === activePageId) || note.pages[0];
    const pageIndex = note.pages.findIndex(p => p.id === activePageId);

    const prevPage = () => { if (pageIndex > 0) setActivePageId(note.pages[pageIndex - 1].id); };
    const nextPage = () => { if (pageIndex < note.pages.length - 1) setActivePageId(note.pages[pageIndex + 1].id); };

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.background }}>
            {/* Header / Toolbar */}
            <div className="h-16 border-b flex items-center justify-between px-4 shrink-0 transition-all duration-300" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><ChevronLeft size={24} style={{ color: theme.textSecondary }} /></button>
                    <div>
                        <h2 className="font-bold text-sm leading-tight max-w-[200px] truncate" style={{ color: theme.textPrimary }}>{note.title}</h2>
                        {!isEditing && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <button onClick={prevPage} disabled={pageIndex === 0} className="p-0.5 rounded hover:bg-black/10 disabled:opacity-30"><ArrowLeft size={12} /></button>
                                <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Page {pageIndex + 1} of {note.pages.length}</span>
                                <button onClick={nextPage} disabled={pageIndex === note.pages.length - 1} className="p-0.5 rounded hover:bg-black/10 disabled:opacity-30"><ArrowRight size={12} /></button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleDeleteNote}
                        className="p-2 rounded hover:bg-red-50 text-red-500 mr-2"
                        title="Delete Note"
                    >
                        <Trash2 size={18} />
                    </button>

                    {/* Toggle Button for Mode */}
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent border border-indigo-200 text-indigo-600'}`}
                    >
                        {isEditing ? <Check size={16} /> : <Edit size={16} />}
                        {isEditing ? "Done" : "Edit Note"}
                    </button>
                    
                    {isEditing && (
                        <>
                            <div className="w-px h-6 bg-gray-300 mx-2" />
                            <button onClick={() => setShowLeft(!showLeft)} className={`p-2 rounded hover:bg-black/5 ${showLeft ? 'bg-black/5' : ''}`}><PanelLeft size={18} style={{ color: theme.textSecondary }} /></button>
                            <button onClick={() => setShowRight(!showRight)} className={`p-2 rounded hover:bg-black/5 ${showRight ? 'bg-black/5' : ''}`}><Brain size={18} style={{ color: theme.textSecondary }} /></button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Left Sidebar (Pages) - Only in Edit Mode */}
                {isEditing && showLeft && (
                    <div className="w-64 border-r flex flex-col shrink-0 transition-all z-20" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                        <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Pages</span>
                            <div className="flex gap-1">
                                <button onClick={() => setIsImageUploaderOpen(true)} className="p-1 hover:bg-black/5 rounded"><Camera size={16} style={{ color: theme.textPrimary }} /></button>
                                <button onClick={addPage} className="p-1 hover:bg-black/5 rounded"><Plus size={16} style={{ color: theme.textPrimary }} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {note.pages.map((page, idx) => (
                                <div key={page.id} className="flex items-center group/page">
                                    <button onClick={() => setActivePageId(page.id)} className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left`} style={{ backgroundColor: activePageId === page.id ? `${theme.primary}15` : 'transparent', color: activePageId === page.id ? theme.primary : theme.textSecondary }}>
                                        <span className="opacity-50 text-[10px] w-4">{idx + 1}</span><span className="truncate flex-1">{page.title}</span>{page.imageUrl && <ImageIcon size={10} className="text-blue-500" />}<GripVertical size={12} className="opacity-0 group-hover:opacity-50 cursor-grab" />
                                    </button>
                                    <button 
                                        onClick={(e) => deletePage(page.id, e)} 
                                        className="p-1.5 opacity-0 group-hover/page:opacity-100 hover:text-red-500 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Center Canvas */}
                <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white/50">
                    {/* Edit Mode Toolbar */}
                    {isEditing && (
                        <div className="h-10 border-b flex items-center px-4 gap-4 overflow-x-auto no-scrollbar shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                             <div className="flex items-center gap-1">
                                <button className="p-1.5 hover:bg-black/5 rounded"><Bold size={14} style={{ color: theme.textSecondary }}/></button>
                                <button className="p-1.5 hover:bg-black/5 rounded"><Italic size={14} style={{ color: theme.textSecondary }}/></button>
                                <button className="p-1.5 hover:bg-black/5 rounded"><ListIcon size={14} style={{ color: theme.textSecondary }}/></button>
                             </div>
                             <div className="w-px h-4 bg-gray-300" />
                             <div className="flex items-center gap-1">
                                <button className="p-1.5 hover:bg-black/5 rounded"><Undo size={14} style={{ color: theme.textSecondary }}/></button>
                                <button className="p-1.5 hover:bg-black/5 rounded"><Redo size={14} style={{ color: theme.textSecondary }}/></button>
                             </div>
                             <div className="flex-1" />
                             <span className="text-[10px] uppercase font-bold" style={{ color: status === 'saved' ? theme.success : theme.warning }}>{status}</span>
                        </div>
                    )}

                    {/* Image Preview - only in Edit mode */}
                    {isEditing && activePage?.imageUrl && ( 
                        <div className="h-48 shrink-0 bg-black/5 flex items-center justify-center border-b relative group" style={{ borderColor: theme.border }}>
                            <img src={activePage.imageUrl} className="h-full object-contain" alt="Page Reference" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                        </div> 
                    )}
                    
                    {/* Content Area */}
                    {isEditing ? (
                        <textarea 
                            className="flex-1 w-full p-8 resize-none outline-none text-base leading-relaxed font-mono" 
                            style={{ backgroundColor: theme.background, color: theme.textPrimary }} 
                            value={activePage?.content || ''} 
                            onChange={(e) => handleContentChange(e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            placeholder="# Start writing..." 
                        />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full scroll-smooth">
                            <MarkdownView content={activePage?.content || ''} />
                        </div>
                    )}
                </div>

                {/* Right Sidebar (AI) - Only in Edit Mode */}
                {isEditing && showRight && (
                    <div className="w-72 border-l flex flex-col shrink-0 transition-all z-20" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                        <div className="p-4 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: theme.primary }}><Wand2 size={16} /> AI Enhancement</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            <div className="p-3 rounded-lg mb-2 text-sm bg-white/50 border shadow-sm" style={{ borderColor: theme.border }}>
                                <p style={{ color: theme.textSecondary }}>I can polish your notes, fix grammar, and format formulas instantly.</p>
                            </div>
                            
                            <Button onClick={() => enhanceContent('full')} disabled={isEnhancing} className="w-full justify-start text-xs h-auto py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                                {isEnhancing ? <Loader2 className="animate-spin mr-2" size={16}/> : <Sparkles className="mr-2" size={16} />}
                                Magic Polish (All)
                            </Button>

                            <div className="h-px bg-gray-200 my-2" />

                            <Button variant="secondary" onClick={() => enhanceContent('grammar')} disabled={isEnhancing} className="w-full justify-start text-xs h-auto py-2">
                                <Check className="mr-2 opacity-70" size={16} /> Fix Grammar
                            </Button>
                            
                            <Button variant="secondary" onClick={() => enhanceContent('structure')} disabled={isEnhancing} className="w-full justify-start text-xs h:auto py-2">
                                <LayoutGrid className="mr-2 opacity-70" size={16} /> Format Structure
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            
            <ImageUploader isOpen={isImageUploaderOpen} onClose={() => setIsImageUploaderOpen(false)} targetNoteId={note.id} />
        </div>
    );
};

const Sidebar = ({ isOpen, onClose, activeItem, onNavigate }) => {
  const { theme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'notes', label: 'My Notes', icon: FileText },
    { id: 'ai-chat', label: 'AI Assistant', icon: Brain },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: theme.surface, borderRight: `1px solid ${theme.border}` }}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primary }}><FileText size={18} color="white" /></div>
            <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>LexiNote</h2>
          </div>
          <div className="flex-1 space-y-1">
            {menuItems.map(item => (
                <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeItem === item.id ? 'font-semibold' : ''}`} style={{ backgroundColor: activeItem === item.id ? `${theme.primary}15` : 'transparent', color: activeItem === item.id ? theme.primary : theme.textSecondary }}>
                  <item.icon size={20} /><span>{item.label}</span>
                </button>
            ))}
          </div>
          <div className="pt-6 border-t" style={{ borderColor: theme.border }}>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors"><LogOut size={20} /><span>Sign Out</span></button>
          </div>
        </div>
      </div>
    </>
  );
};

const QuickAction = ({ icon: Icon, label, desc, color, onClick }) => {
  const { theme, isDark } = useContext(ThemeContext);
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-start text-left p-4 rounded-2xl transition-all active:scale-95 group relative overflow-hidden h-full"
      style={{ 
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110"
        style={{ backgroundColor: color, color: '#fff' }}
      >
        <Icon size={20} />
      </div>
      <span className="font-bold text-sm mb-0.5" style={{ color: theme.textPrimary }}>{label}</span>
      <span className="text-[10px] leading-tight opacity-70" style={{ color: theme.textSecondary }}>{desc}</span>
    </button>
  );
};

const TopBar = ({ onMenuClick, title, avatarInitials, searchQuery, onSearchChange }) => {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  return (
    <div className="sticky top-0 z-30 px-5 py-4 flex items-center justify-between gap-4 backdrop-blur-lg bg-opacity-95" style={{ backgroundColor: theme.background }}>
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-90 transition-transform"><Menu size={24} style={{ color: theme.textPrimary }} /></button>
        
        {/* Integrated Search Bar */}
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textSecondary }} />
            <input 
              type="text" 
              placeholder={`Search ${title}...`}
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
              style={{ 
                  backgroundColor: theme.surface, 
                  color: theme.textPrimary, 
                  borderColor: theme.border,
                  '--tw-ring-color': theme.primary
              }}
            />
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
         <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5">{isDark ? <Sun size={20} color={theme.textSecondary} /> : <Moon size={20} color={theme.textSecondary} />}</button>
         <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border" style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.primary }}>{avatarInitials}</div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }) => {
  const { theme, isDark } = useContext(ThemeContext);
  return (
    <div 
      className="flex-1 min-w-[160px] p-5 rounded-2xl relative overflow-hidden transition-all hover:scale-[1.02]"
      style={{ 
        backgroundColor: theme.surface, 
        border: `1px solid ${theme.border}`,
        boxShadow: isDark ? 'none' : '0 4px 20px -5px rgba(0,0,0,0.05)'
      }}
    >
       <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: color }} />
       <div className="relative z-10 flex flex-col h-full justify-between gap-4">
          <div className="flex justify-between items-start">
             <div className="p-2.5 rounded-xl bg-opacity-10 backdrop-blur-sm" style={{ backgroundColor: `${color}15` }}>
                <Icon size={20} style={{ color: color }} />
             </div>
             {trend && (
                <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                   <span className="text-xs">↗</span> {trend}
                </div>
             )}
          </div>
          <div>
             <h4 className="text-3xl font-bold tracking-tight mb-1" style={{ color: theme.textPrimary }}>{value}</h4>
             <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: theme.textSecondary }}>{label}</p>
          </div>
       </div>
    </div>
  );
};

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  
  // States for Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false); // NEW
  const [isPdfUploaderOpen, setIsPdfUploaderOpen] = useState(false); // NEW
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // Filters
  const [filterQuery, setFilterQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'notes'), orderBy('createdAt', sortOrder));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingNotes(false);
    }, (error) => { console.error("Error fetching notes:", error); setLoadingNotes(false); });
    return () => unsubscribe();
  }, [user, sortOrder]);

  const handleCreateNote = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'notes'), {
            ...data,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp()
        });
        setEditingNoteId(docRef.id);
    } catch (error) { console.error("Error creating note:", error); }
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note?")) return;
    try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notes', noteId)); } catch (err) { console.error("Error deleting", err); }
  }

  const userInitials = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  
  // Enhanced search: search across title, description, tags, preview, and all page content
  const filteredNotes = notes.filter(n => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();
    
    // Search in title
    if (n.title?.toLowerCase().includes(query)) return true;
    
    // Search in description
    if (n.description?.toLowerCase().includes(query)) return true;
    
    // Search in preview
    if (n.preview?.toLowerCase().includes(query)) return true;
    
    // Search in tags
    if (n.tags?.some(t => t.toLowerCase().includes(query))) return true;
    
    // Search in all page content
    if (n.pages?.some(page => page.content?.toLowerCase().includes(query))) return true;
    
    // Search in page titles
    if (n.pages?.some(page => page.title?.toLowerCase().includes(query))) return true;
    
    return false;
  });

  // If editing, show Full Screen Editor
  if (editingNoteId) {
      return <Editor noteId={editingNoteId} onClose={() => setEditingNoteId(null)} />;
  }
  
  // If Recording, show Recorder Overlay
  if (isRecorderOpen) {
      return <RecorderOverlay onClose={() => setIsRecorderOpen(false)} onSaved={(id) => setEditingNoteId(id)} />;
  }

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: theme.background }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem={activePage} onNavigate={setActivePage} />
      
      <TopBar 
        onMenuClick={() => setSidebarOpen(true)} 
        title={activePage === 'dashboard' ? 'Dashboard' : 'My Notes'} 
        avatarInitials={userInitials}
        searchQuery={filterQuery}
        onSearchChange={(e) => setFilterQuery(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {activePage === 'dashboard' && (
            <>
                <div className="mt-2 mb-6">
                    <p className="text-sm" style={{ color: theme.textSecondary }}>Welcome back,</p>
                    <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{user.displayName?.split(' ')[0] || 'Student'}</h2>
                </div>
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar snap-x">
                    <StatCard label="Total Notes" value={notes.length} icon={FileText} color={theme.primary} trend="+2" />
                    <StatCard label="Study Hours" value="12.5" icon={Clock} color={theme.secondary} />
                    <StatCard label="AI Insights" value="85%" icon={Zap} color={theme.success} />
                </div>
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: theme.textSecondary }}>Quick Actions</h3></div>
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction 
                          label="Record Lecture" 
                          desc="Capture high-quality audio." 
                          icon={Mic} 
                          color={theme.active} 
                          onClick={() => setIsRecorderOpen(true)} 
                        />
                         <QuickAction 
                          label="Scan & OCR" 
                          desc="Extract text from images." 
                          icon={Maximize2} 
                          color={theme.primary} 
                          onClick={() => setIsImageUploaderOpen(true)} 
                        />
                        <QuickAction 
                          label="Upload PDF" 
                          desc="Import slides or books." 
                          icon={FileUp} 
                          color={theme.secondary} 
                          onClick={() => setIsPdfUploaderOpen(true)} 
                        />
                        <QuickAction 
                          label="New Notebook" 
                          desc="Create blank canvas." 
                          icon={Plus} 
                          color={theme.success} 
                          onClick={() => setIsCreateModalOpen(true)} 
                        />
                    </div>
                </div>
            </>
        )}

        {/* Notebook List (Visible on Dashboard and Notes page) */}
        <div>
          <div className="flex justify-between items-center mb-4 sticky top-0 py-2 z-10 bg-opacity-95 backdrop-blur-sm" style={{ backgroundColor: theme.background }}>
            <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: theme.textSecondary }}>{activePage === 'dashboard' ? 'Recent Notes' : 'All Notebooks'}</h3>
            <div className="flex gap-2">
                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="p-1.5 rounded bg-black/5"><ArrowUp size={16} style={{ color: theme.textSecondary, transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} /></button>
            </div>
          </div>

          {loadingNotes ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: theme.primary }} /></div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: theme.border }}>
               <FileText size={32} className="mx-auto mb-3 opacity-30" /><p className="text-sm opacity-50">No notes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredNotes.map(note => (
                <Card key={note.id} onClick={() => setEditingNoteId(note.id)} className="active:scale-[0.98] transition-transform hover:shadow-md relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: note.color || theme.primary }} />
                  <div className="pl-3">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold truncate pr-8" style={{ color: theme.textPrimary }}>{note.title}</h4>
                        <button onClick={(e) => handleDeleteNote(note.id, e)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                      </div>
                      <p className="text-sm line-clamp-2 mb-3 leading-relaxed opacity-80" style={{ color: theme.textSecondary }}>
                        {note.description || note.preview || "No preview available..."}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {note.tags?.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 font-medium" style={{ color: theme.textSecondary }}>#{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2" style={{ color: theme.textSecondary }}>
                         <span>{note.pages?.length || 1} pages</span>
                         <span>Edited {note.lastModified?.toDate().toLocaleDateString()}</span>
                      </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        style={{ backgroundColor: theme.primary, color: 'white' }}
      >
        <Plus size={28} />
      </button>

      <CreateNoteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateNote} 
        onStartLiveRecording={() => { setIsCreateModalOpen(false); setIsRecorderOpen(true); }}
      />
      <ImageUploader isOpen={isImageUploaderOpen} onClose={() => setIsImageUploaderOpen(false)} onComplete={setEditingNoteId} />
      <PdfUploader isOpen={isPdfUploaderOpen} onClose={() => setIsPdfUploaderOpen(false)} onComplete={setEditingNoteId} />
    </div>
  );
};

// ... existing Onboarding, AuthScreen, AppContent, and App components ...
const Onboarding = ({ onFinish }) => {
  const { theme } = useContext(ThemeContext);
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Capture Ideas Instantly", desc: "Record lectures, meetings, and ideas with a single tap.", icon: Mic, color: theme.active },
    { title: "AI-Powered Intelligence", desc: "LexiNote turns audio into structured summaries.", icon: Brain, color: theme.secondary },
    { title: "Sync & Organize", desc: "Seamlessly organize your knowledge base.", icon: FolderSync, color: theme.primary }
  ];
  const CurrentIcon = steps[step].icon;
  return (
    <div className="h-full flex flex-col items-center justify-between p-8 relative overflow-hidden" style={{ backgroundColor: theme.background }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 -mr-16 -mt-16 blur-3xl" style={{ backgroundColor: theme.primary }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 -ml-16 -mb-16 blur-3xl" style={{ backgroundColor: theme.secondary }} />
      <div className="w-full flex justify-end mt-4"><button onClick={onFinish} className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Skip</button></div>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs text-center">
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8 shadow-xl" style={{ backgroundColor: theme.surface }}><CurrentIcon size={48} style={{ color: steps[step].color }} /></div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>{steps[step].title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{steps[step].desc}</p>
      </div>
      <div className="w-full max-w-xs">
        <div className="flex justify-center gap-2 mb-8">{steps.map((_, i) => (<div key={i} className="h-2 rounded-full transition-all duration-300" style={{ width: i === step ? '2rem' : '0.5rem', backgroundColor: i === step ? theme.primary : theme.border }} />))}</div>
        <Button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onFinish()} className="w-full py-4 text-base">{step === steps.length - 1 ? "Get Started" : "Next"} <ChevronRight size={18} /></Button>
      </div>
    </div>
  );
};

const AuthScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { login, register, resetPassword, loginWithGoogle } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      if (mode === 'login') await login(formData.email, formData.password);
      else if (mode === 'register') await register(formData.email, formData.password, formData.name);
      else if (mode === 'forgot') { await resetPassword(formData.email); alert('Reset link sent!'); setMode('login'); }
    } catch (err) { setError(err.message.replace('Firebase: ', '')); } finally { setIsLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setError(''); setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: theme.primary }}><FileText size={32} color="white" /></div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: theme.textPrimary }}>LexiNote</h1>
          <p className="text-sm" style={{ color: theme.textSecondary }}>Your academic companion.</p>
        </div>
        <Card className="shadow-xl">
           <div className="flex mb-6 border-b" style={{ borderColor: theme.border }}>
             {['login', 'register'].map(m => (
               <button key={m} onClick={() => { setMode(m); setError(''); }} className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${mode === m ? '' : 'border-transparent'}`} style={{ color: mode === m ? theme.primary : theme.textSecondary, borderColor: mode === m ? theme.primary : 'transparent' }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
             ))}
           </div>
           <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && <Input label="Full Name" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />}
              <Input label="Email Address" type="email" placeholder="student@university.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              {mode !== 'forgot' && <Input label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />}
              {error && <div className="p-3 rounded-lg text-xs flex items-start gap-2 bg-red-50 border border-red-100" style={{ color: theme.error }}><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
              <Button type="submit" className="w-full mt-4" isLoading={isLoading}>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</Button>
           </form>
           {mode !== 'forgot' && (
             <div className="mt-5 space-y-3">
               <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: theme.textSecondary }}>
                 <span className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                 <span>or</span>
                 <span className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
               </div>
               <Button
                 type="button"
                 variant="secondary"
                 className="w-full"
                 onClick={handleGoogleAuth}
                 isLoading={googleLoading}
                 disabled={isLoading}
               >
                 <Chrome className="w-5 h-5" />
                 <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
               </Button>
             </div>
           )}
           {mode === 'login' && <div className="mt-4 text-center"><button type="button" onClick={() => setMode('forgot')} className="text-xs hover:underline" style={{ color: theme.primary }}>Forgot password?</button></div>}
           {mode === 'forgot' && <div className="mt-4 text-center"><button type="button" onClick={() => setMode('login')} className="text-xs hover:underline" style={{ color: theme.textSecondary }}>Back to Login</button></div>}
        </Card>
      </div>
    </div>
  );
};

const SplashScreen = () => {
  const { theme, isDark } = useContext(ThemeContext);
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: theme.background }}
    >
      {/* Animated Background Gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse" style={{ backgroundColor: theme.primary, animationDuration: '3s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse" style={{ backgroundColor: theme.secondary, animationDuration: '4s', animationDelay: '1s' }} />
      
      {/* Logo Container with Scale Animation */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform transition-all duration-500"
          style={{ 
            backgroundColor: theme.primary,
            boxShadow: `0 20px 60px -10px ${theme.primary}60`
          }}
        >
          <FileText size={48} color="white" strokeWidth={2.5} />
        </div>
        
        {/* App Name */}
        <h1 
          className="text-4xl font-bold mb-3 tracking-tight animate-in slide-in-from-bottom-4 duration-700"
          style={{ color: theme.textPrimary, animationDelay: '200ms' }}
        >
          LexiNote
        </h1>
        
        {/* Tagline */}
        <p 
          className="text-sm font-medium mb-8 animate-in slide-in-from-bottom-4 duration-700"
          style={{ color: theme.textSecondary, animationDelay: '400ms' }}
        >
          Your Academic Companion
        </p>
        
        {/* Loading Indicator */}
        <div className="flex items-center gap-3 animate-in fade-in duration-700" style={{ animationDelay: '600ms' }}>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.primary }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Loading...
          </span>
        </div>
      </div>
      
      {/* Bottom Branding */}
      <div className="absolute bottom-8 text-center animate-in fade-in duration-700" style={{ animationDelay: '800ms' }}>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: theme.textSecondary, opacity: 0.5 }}>
          Powered by AI
        </p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading, isNewUser, completeOnboarding } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  if (loading) return <SplashScreen />;
  if (!user) return <AuthScreen />;
  if (isNewUser) return <Onboarding onFinish={completeOnboarding} />;
  return <Dashboard />;
};

export default function App() {
  return <ThemeProvider><AuthProvider><AppContent /></AuthProvider></ThemeProvider>;
}
