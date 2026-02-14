
import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// Sample data
const activityData = [
  { name: 'Mon', hours: 2 },
  { name: 'Tue', hours: 5 },
  { name: 'Wed', hours: 3 },
  { name: 'Thu', hours: 7 },
  { name: 'Fri', hours: 1 },
  { name: 'Sat', hours: 8 },
  { name: 'Sun', hours: 4 },
];

// Sample data
const mixData = [
  { name: 'Games', value: 45, color: '#f07167' },
  { name: 'Books', value: 30, color: '#81b29a' },
  { name: 'Movies', value: 25, color: '#9d4edd' },
];

export const ActivityOverviewChart: React.FC = () => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradient-activity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f07167" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#f07167" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
        />
        <YAxis 
          hide 
        />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="hours" 
          stroke="#f07167" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#gradient-activity)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const MediaMixChart: React.FC = () => (
  <div className="h-full flex flex-col items-center">
    <div className="relative w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={mixData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {mixData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-extrabold leading-none text-slate-900">3</span>
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Active Types</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6 w-full px-4">
      {mixData.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
          <span className="text-sm font-semibold text-slate-700">{item.name}</span>
          <span className="text-xs text-slate-400 ml-auto">{item.value}%</span>
        </div>
      ))}
      <div className="flex items-center gap-2 opacity-50">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
        <span className="text-sm font-semibold text-slate-400">TV</span>
        <span className="text-xs text-slate-400 ml-auto">0%</span>
      </div>
    </div>
  </div>
);
