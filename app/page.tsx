"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, ArrowRight, History, Copy, FileDown, CheckCircle2, Folder } from "lucide-react";
import Image from "next/image";
import AnimatedBackground from "./components/AnimatedBackground";
import PWAInstall from "./components/PWAInstall";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

interface SavedSolution {
  id: string;
  timestamp: number;
  image: string;
  answer: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedSolution[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const projects = ["science", "math"];

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("platypus_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (img: string, ans: string) => {
    const newEntry: SavedSolution = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      image: img,
      answer: ans,
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem("platypus_history", JSON.stringify(updatedHistory));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnswer(null);
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setAnswer(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setAnswer(null);
    setError(null);

    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Received invalid response format.");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setAnswer(data.answer);
      saveToHistory(preview, data.answer);
    } catch (err: any) {
      setError(err.message || "Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (answer) {
      navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPDF = async () => {
    if (solutionRef.current) {
      const canvas = await html2canvas(solutionRef.current, {
        backgroundColor: "#000000",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("solution.pdf");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-zinc-800 flex flex-col font-sans relative">
      <AnimatedBackground />
      <PWAInstall />
      
      {/* Navigation */}
      <nav className="border-b border-white/10 py-4 relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="relative w-10 h-10">
              <Image 
                src="/logo.png" 
                alt="Platypus AI Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span>Platypus AI</span>
          </div>
          <div className="flex items-center gap-6">
            <SignedIn>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="md:hidden flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <History className="w-4 h-4" />
                Recent Solves
              </button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 border-l border-white/10 z-40 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-lg">History</h2>
            <button onClick={() => setShowHistory(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-zinc-500 text-sm">No recent solutions found.</p>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-black/40 border border-white/5 p-3 rounded-xl cursor-pointer hover:border-white/20 transition-all"
                  onClick={() => {
                    setPreview(item.image);
                    setAnswer(item.answer);
                    setShowHistory(false);
                  }}
                >
                  <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2">
                    <Image src={item.image} alt="History" fill className="object-cover" unoptimized />
                  </div>
                  <p className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex relative z-10">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Projects</h2>
            <button className="text-zinc-400 hover:text-white transition-colors text-lg leading-none">+</button>
          </div>

          <div className="space-y-1 pb-4 border-b border-white/10">
            {projects.map((project) => (
              <button
                key={project}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2 capitalize">
                  <Folder className="w-4 h-4" />
                  {project}
                </span>
                <span className="text-xs text-zinc-500">0</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`mt-4 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showHistory ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            Recent Solves
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-2xl w-full space-y-8">
          
          {/* Header */}
          {!preview && (
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Homework solved in seconds.
              </h1>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                Upload a picture of your assignment and let our AI provide detailed, step-by-step solutions.
              </p>
            </div>
          )}

          {/* Upload Area */}
          <div 
            className={`
              relative group cursor-pointer 
              border-2 border-dashed rounded-3xl p-10 
              transition-all duration-300 ease-in-out backdrop-blur-sm
              ${preview ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-800 hover:border-white hover:bg-zinc-900/30'}
            `}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />

            {preview ? (
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-2xl">
                <Image 
                  src={preview} 
                  alt="Homework preview" 
                  fill 
                  className="object-contain"
                  unoptimized
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center group-hover:bg-zinc-800 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                  <Upload className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-white">Click to upload image</p>
                  <p className="text-sm text-zinc-500 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {preview && !answer && !error && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                  flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full 
                  font-semibold text-lg hover:bg-zinc-200 disabled:opacity-50 
                  disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Solve Problem
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-2xl text-center">
              {error}
              <button onClick={clearFile} className="block mx-auto mt-2 underline text-sm">Try another image</button>
            </div>
          )}

          {/* Answer Section */}
          {answer && (
            <div 
              ref={solutionRef}
              className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-8 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-xl text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  Solution
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={downloadPDF}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                    title="Download as PDF"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answer}
                </ReactMarkdown>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                <button 
                  onClick={clearFile}
                  className="text-sm font-medium text-zinc-500 hover:text-white underline decoration-zinc-700 hover:decoration-white underline-offset-4 transition-all"
                >
                  Upload another
                </button>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} Platypus AI. AI can make mistakes.</p>
      </footer>
    </main>
  );
}
