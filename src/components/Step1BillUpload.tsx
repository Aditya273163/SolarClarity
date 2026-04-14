import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Info, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  onConfirm: (units: number) => void;
  onBack: () => void;
  key?: string;
}

export default function Step1BillUpload({ onConfirm, onBack }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedUnits, setExtractedUnits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setExtractedUnits(null);
      setError(null);
      processBill(selectedFile);
    }
  };

  const processBill = async (imageFile: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();

      console.log('Extracted Text:', text);

      // Simple regex to find units
      // Looking for patterns like "Units: 123", "Consumption: 456", "kWh: 789"
      const unitsRegex = /(?:Units|Consumption|kWh|Total Units|Billing Units)\s*[:\-]?\s*(\d+)/i;
      const match = text.match(unitsRegex);

      if (match && match[1]) {
        setExtractedUnits(parseInt(match[1], 10));
      } else {
        // Fallback: look for any 3-digit number that might be units
        const fallbackRegex = /\b(\d{2,4})\b/g;
        const matches = text.match(fallbackRegex);
        if (matches && matches.length > 0) {
          // Just take the first one for now, user can correct
          setExtractedUnits(parseInt(matches[0], 10));
        } else {
          setError("We couldn't find the units automatically. Please enter them manually.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error processing image. Please enter units manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto w-full px-6 py-12"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to start
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload your UPPCL Bill</h2>
          <p className="text-slate-500">We'll automatically extract your monthly consumption units.</p>
        </div>

        <div className="p-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all group"
            >
              <div className="bg-slate-50 p-4 rounded-full mb-4 group-hover:bg-amber-100 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-600" />
              </div>
              <p className="font-medium text-slate-900 mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500">PNG, JPG or PDF (Max 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {preview && <img src={preview} alt="Bill preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />}
                <div className="flex-grow">
                  <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreview(null); setExtractedUnits(null); }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>

              {isProcessing && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Reading your bill... this takes a few seconds.</span>
                </div>
              )}

              {extractedUnits !== null && !isProcessing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">We found your consumption details!</span>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Monthly Units Consumed (kWh)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={extractedUnits}
                        onChange={(e) => setExtractedUnits(parseInt(e.target.value, 10) || 0)}
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      />
                      <div className="bg-slate-200 px-4 py-3 rounded-xl font-bold text-slate-600">kWh</div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Please verify this number with your actual bill.
                    </p>
                  </div>

                  <button
                    onClick={() => onConfirm(extractedUnits)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    Confirm & Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {error && !isProcessing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Enter Monthly Units Manually</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        placeholder="e.g. 350"
                        onChange={(e) => setExtractedUnits(parseInt(e.target.value, 10) || 0)}
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      />
                      <div className="bg-slate-200 px-4 py-3 rounded-xl font-bold text-slate-600">kWh</div>
                    </div>
                  </div>

                  <button
                    disabled={!extractedUnits}
                    onClick={() => extractedUnits && onConfirm(extractedUnits)}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
