import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Send, 
  FileText, 
  Download, 
  Image as ImageIcon, 
  X, 
  Loader2,
  Maximize2,
  Minimize2,
  Calculator,
  Eraser
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { solveLinearAlgebraProblem } from './services/solverService';
import { MathRenderer } from './components/MathRenderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

export default function App() {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!input && !image) return;
    
    setIsLoading(true);
    setSolution(null);
    try {
      const result = await solveLinearAlgebraProblem(input, image || undefined);
      setSolution(result || "Kechirasiz, yechim topilmadi.");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#6366f1']
      });
    } catch (error) {
      setSolution("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!solutionRef.current) return;
    
    const element = solutionRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('chiziqli-algebra-yechim.pdf');
  };

  const clearAll = () => {
    setInput('');
    setImage(null);
    setSolution(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">LinearSolve AI</h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Chiziqli Algebra Mutaxassisi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {solution && (
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <Download size={16} />
              <span>PDF Yuklash</span>
            </button>
          )}
          <button 
            onClick={clearAll}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            title="Tozalash"
          >
            <Eraser size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Input */}
        <section className={`flex-1 border-r border-slate-200 flex flex-col bg-white transition-all duration-500 ${isFullWidth ? 'hidden md:flex md:w-0 md:opacity-0' : 'w-full md:w-1/2'}`}>
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masala matni</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Matritsa amallari, determinant, tenglamalar sistemasi yoki boshqa masalani kiriting..."
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 font-medium placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rasm orqali (OCR)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${image ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {image ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                    <img src={image} alt="Uploaded" className="w-full h-full object-contain" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur rounded-full text-slate-600 hover:text-rose-500 shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">Rasm yuklash yoki tashlash</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG formatlari</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100">
            <button
              onClick={handleSolve}
              disabled={isLoading || (!input && !image)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              <span>{isLoading ? 'Yechilmoqda...' : 'Masalani yechish'}</span>
            </button>
          </div>
        </section>

        {/* Right Panel: Solution */}
        <section className={`flex-1 flex flex-col bg-[#F8F9FA] relative transition-all duration-500 ${isFullWidth ? 'w-full' : 'w-full md:w-1/2'}`}>
          <div className="absolute top-4 right-4 z-10 hidden md:block">
            <button 
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isFullWidth ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {solution ? (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-3xl mx-auto"
                >
                  <div 
                    ref={solutionRef}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 min-h-[500px]"
                  >
                    <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
                      <FileText className="text-indigo-600" size={20} />
                      <h2 className="font-serif text-xl font-bold text-slate-800">Batafsil Yechim</h2>
                    </div>
                    <MathRenderer content={solution} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm border border-slate-100 mb-6">
                    <Calculator size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Yechim maydoni</h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Chap tomonda masala matnini kiriting yoki rasm yuklang. AI sizga qadamma-qadam yechimni taqdim etadi.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer / Mobile Nav */}
      <footer className="h-12 border-t border-slate-200 bg-white flex items-center justify-center px-6 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
        &copy; {new Date().getFullYear()} LinearSolve AI • Chiziqli Algebra Dasturi
      </footer>
    </div>
  );
}
