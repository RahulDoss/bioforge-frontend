'use client';
import React, { useState } from 'react';
import { Microscope, Database, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

export default function DiscoveryWorkstation() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  // 3D Viewer
  const render3D = async (pdbData: string) => {
    const viewer = document.getElementById('molstar-viewer');
    if (!viewer || !pdbData) return;

    viewer.innerHTML = "";

    const iframe = document.createElement('iframe');
    iframe.src = `https://molstar.org/viewer/?pdb-inline=${encodeURIComponent(pdbData)}`;
    iframe.className = "w-full h-full border-none rounded-lg";

    viewer.appendChild(iframe);
  };

  // 🔥 CONNECTED TO YOUR RENDER BACKEND
  const startDiscovery = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://ai-drug-api-1.onrender.com/api/research', // ✅ UPDATED
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: query }),
        }
      );

      const result = await response.json();
      setData(result);

      // ✅ Safe check for PDB
      if (result.results?.length > 0 && result.results[0].pdb) {
        render3D(result.results[0].pdb);
      }

    } catch (e) {
      console.error("Discovery failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-mono p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded">
            <Microscope className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-blue-400">
            BIOFORGE // GEMMA-4 CORE
          </h1>
        </div>
        <div className="flex gap-6 text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-2 text-green-500">
            <Activity size={14}/> Engine: Active
          </span>
          <span className="text-slate-500 underline">v4.0.0-Stable</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Input */}
        <div className="col-span-4 space-y-6">
          <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-xl shadow-2xl">
            <label className="text-[10px] text-blue-500 font-bold mb-3 block uppercase">
              Scientific Directive
            </label>

            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-40 bg-black border border-slate-800 p-4 text-sm rounded-lg"
              placeholder="Design a cancer drug..."
            />

            <button 
              onClick={startDiscovery}
              disabled={loading}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg text-xs flex justify-center gap-2 uppercase"
            >
              {loading ? "G4 REASONING..." : "Execute Pipeline"} 
              <ChevronRight size={16}/>
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-xs text-purple-400 mb-4 flex gap-2 uppercase">
              <Database size={16}/> Agent Rationale
            </h3>
            <p className="text-xs text-slate-400 italic">
              {data?.explanation || "Waiting..."}
            </p>
          </div>
        </div>

        {/* 3D Viewer */}
        <div className="col-span-5 space-y-6">
          <div className="bg-black border border-slate-800 rounded-xl h-[500px]">
            <div id="molstar-viewer" className="w-full h-full" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            {data?.results?.[activeTab] && (
              <>
                <div className="p-4 bg-[#0a0a0a] border rounded">
                  <div className="text-xs">QED</div>
                  <div>{data.results[activeTab].qed?.toFixed(3) || "N/A"}</div>
                </div>
                <div className="p-4 bg-[#0a0a0a] border rounded">
                  <div className="text-xs">MW</div>
                  <div>{data.results[activeTab].mw?.toFixed(1) || "N/A"}</div>
                </div>
                <div className="p-4 bg-[#0a0a0a] border rounded">
                  <div className="text-xs">LogP</div>
                  <div>{data.results[activeTab].logp?.toFixed(2) || "N/A"}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="col-span-3 space-y-4">
          <h3 className="text-xs text-green-500 flex gap-2 uppercase">
            <ShieldCheck size={16}/> Leads
          </h3>

          {data?.results?.map((res: any, i: number) => (
            <div 
              key={i}
              onClick={() => {
                setActiveTab(i);
                if (res.pdb) render3D(res.pdb);
              }}
              className="p-4 border rounded cursor-pointer"
            >
              <div className="flex justify-between">
                <span>LEAD-{i+1}</span>
                <span>{res.final_score}%</span>
              </div>

              <div className="text-xs break-all">
                {res.smiles || res.sequence}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
