
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { HistoryItem } from '../types';

interface WellnessTrendsProps {
  history: HistoryItem[];
}

export const WellnessTrends: React.FC<WellnessTrendsProps> = ({ history }) => {
  // Process data: Reverse (Oldest -> Newest) and format
  const data = [...history].reverse().map(item => ({
    date: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    fullDate: new Date(item.timestamp).toLocaleString(),
    stress: item.result.stressLevel,
    mood: item.result.mood
  }));

  if (data.length < 2) return null;

  return (
    <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] shadow-soft border border-stone-200 dark:border-stone-800 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 font-heading">Stress Trends</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">Your well-being over time</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
           <span className="w-2 h-2 rounded-full bg-orange-500"></span> Stress Level (1-10)
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" className="dark:opacity-10" />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 12, fill: '#a8a29e'}} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              domain={[0, 10]} 
              tick={{fontSize: 12, fill: '#a8a29e'}} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1c1917', 
                border: 'none', 
                borderRadius: '16px', 
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#a8a29e', fontSize: '12px', marginBottom: '4px' }}
              itemStyle={{ color: '#fdba74', fontWeight: 'bold' }}
              cursor={{ stroke: '#f97316', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="stress" 
              stroke="#f97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorStress)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
