
import React, { useEffect, useState } from 'react';
import { AnalysisResult, ResourceItem, Coordinates } from '../types';
import { findLocalResources } from '../services/gemini';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  MapPin, 
  ExternalLink, 
  HeartHandshake, 
  BrainCircuit, 
  ShieldCheck,
  ChevronRight 
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  location: Coordinates | null;
}

export const AnalysisResults: React.FC<Props> = ({ result, location }) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourceAdvice, setResourceAdvice] = useState<string>("");
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      if (location) {
        setLoadingResources(true);
        try {
          const { resources, advice } = await findLocalResources(location);
          setResources(resources);
          setResourceAdvice(advice);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingResources(false);
        }
      }
    };

    if (location) {
      fetchResources();
    }
  }, [location]);

  // Data for the simple stress chart
  const stressData = [
    { name: 'Relaxed', value: 3, color: '#2ec4b6' }, // Baseline (Teal)
    { name: 'Current', value: result.stressLevel, color: result.stressLevel > 7 ? '#f87171' : result.stressLevel > 4 ? '#ffb085' : '#2ec4b6' },
    { name: 'Max', value: 10, color: '#4a4a4a' }, // Max reference
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header Summary */}
      <section className="bg-neutral-50 dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-soft-lg border border-neutral-200 dark:border-slate-800 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-highlight-light dark:bg-orange-900/30 text-highlight-dark dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider border border-highlight-light dark:border-orange-900/50">
                Detected Mood
              </span>
              <h2 className="text-4xl font-extrabold text-neutral-800 dark:text-white capitalize font-heading">{result.mood}</h2>
            </div>
            <p className="text-xl text-neutral-600 dark:text-slate-300 leading-relaxed font-medium">
              "{result.summary}"
            </p>
          </div>
          
          {/* Stress Meter */}
          <div className="w-full md:w-1/3 h-52 bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-neutral-200 dark:border-slate-700 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-DEFAULT to-highlight-DEFAULT"></div>
            <h3 className="text-center text-xs font-bold text-neutral-400 dark:text-slate-500 mb-4 uppercase tracking-wider">Stress Level</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f9f9f9', borderRadius: '12px', padding: '8px 12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24} background={{ fill: 'transparent' }}>
                  {stressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Coping Strategies */}
        <section className="bg-neutral-50 dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-soft border border-neutral-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-300">
               <BrainCircuit size={24} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-white font-heading">Strategies</h3>
          </div>
          <ul className="space-y-4">
            {result.copingStrategies.map((strategy, idx) => (
              <li key={idx} className="flex items-start gap-5 p-5 rounded-3xl bg-white dark:bg-slate-800 hover:bg-neutral-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-neutral-200 dark:hover:border-slate-700 transition-all duration-300 shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-neutral-100 dark:bg-slate-700 text-neutral-700 dark:text-slate-300 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-neutral-200 dark:border-slate-600">
                  {idx + 1}
                </div>
                <p className="text-neutral-600 dark:text-slate-300 font-medium leading-relaxed">{strategy}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Local Resources */}
        <section className="bg-neutral-50 dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-soft border border-neutral-200 dark:border-slate-800 flex flex-col transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-accent-light dark:bg-teal-900/30 rounded-2xl text-accent-dark dark:text-teal-300">
               <MapPin size={24} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-white font-heading">Nearby Help</h3>
          </div>
          
          {!location ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <ShieldCheck size={48} className="mb-4 text-neutral-300 dark:text-slate-600 opacity-50" />
              <p className="font-medium">Enable location to find local support groups & therapists.</p>
            </div>
          ) : loadingResources ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-10 h-10 border-4 border-accent-light dark:border-teal-900 border-t-accent-DEFAULT dark:border-t-teal-400 rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-500 dark:text-slate-400 animate-pulse font-medium">Scanning local map...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6 italic font-medium px-2">{resourceAdvice.slice(0, 150)}{resourceAdvice.length > 150 ? '...' : ''}</p>
              
              {resources.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {resources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block p-5 rounded-3xl border-2 border-neutral-200 dark:border-slate-800 hover:border-accent-DEFAULT dark:hover:border-teal-500 hover:shadow-md transition-all bg-white dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-neutral-700 dark:text-slate-200 group-hover:text-accent-dark dark:group-hover:text-teal-400 transition-colors mb-1">
                            {res.title}
                          </h4>
                          <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-slate-700 rounded text-[10px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">{res.source}</span>
                        </div>
                        <div className="p-2 bg-neutral-50 dark:bg-slate-700 rounded-full group-hover:bg-accent-light dark:group-hover:bg-teal-900/50 transition-colors">
                           <ExternalLink size={16} className="text-neutral-400 dark:text-slate-500 group-hover:text-accent-DEFAULT dark:group-hover:text-teal-400" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-6 rounded-3xl text-sm font-medium border border-amber-100 dark:border-amber-900/30">
                  We couldn't pinpoint exact locations, but we recommend searching for "therapists near me" on Google.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="bg-gradient-to-r from-accent-DEFAULT to-teal-500 dark:from-teal-800 dark:to-teal-600 rounded-[2.5rem] p-8 text-center text-white shadow-xl shadow-accent-DEFAULT/20 dark:shadow-none">
        <HeartHandshake className="inline-block mb-3 opacity-90" size={32} />
        <p className="font-bold text-lg">You are not alone. Support is always available.</p>
        <p className="text-sm mt-2 opacity-80 font-medium">If you are in immediate danger, please call your local emergency number immediately.</p>
      </div>
    </div>
  );
};
