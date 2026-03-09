import React from 'react';
import { Settings, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SetupGuide() {
  const missingKeys = [];
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === "") missingKeys.push("REACT_APP_SUPABASE_URL");
  if (!process.env.SUPABASE_KEY || process.env.SUPABASE_KEY === "") missingKeys.push("REACT_APP_SUPABASE_KEY");
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "") missingKeys.push("REACT_APP_GEMINI_KEY");
  if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === "") missingKeys.push("REACT_APP_CLAUDE_KEY");

  if (missingKeys.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-100/50 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-blue-700 p-10 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Setup Required</h1>
          </div>
          <p className="text-emerald-50 text-lg leading-relaxed">
            To launch **BistroScan**, you need to connect your Supabase database and AI providers.
          </p>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Missing Environment Variables
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {missingKeys.map(key => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <code className="text-sm font-mono font-bold text-slate-700">{key}</code>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">Required</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              How to fix this:
            </h3>
            <ol className="space-y-4 text-blue-800 text-sm font-medium">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Open the <strong>Settings</strong> menu in the top right of AI Studio.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Add the variables listed above with your actual API keys and URLs.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>The application will automatically refresh and connect once the keys are saved.</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Get Supabase Keys <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-center text-xs text-slate-400 font-medium">
              Need help? Check the <a href="https://ai.google.dev/gemini-api/docs/billing" className="text-blue-600 hover:underline">Gemini Billing Docs</a> for AI keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
