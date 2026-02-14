
import React from 'react';
import { MOCK_MEDIA } from '../SampleData';
import { ActivityOverviewChart, MediaMixChart } from './UI/ChartComponents';

export const Dashboard: React.FC = () => {
  const recentlyStarted = MOCK_MEDIA.filter(m => m.status === 'In-progress').slice(0, 3);
  const recentlyFinished = MOCK_MEDIA.filter(m => m.status === 'Completed').slice(0, 4);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Recent Insights</h1>
          <p className="text-slate-500 mt-1">Focused summary of your media consumption this week.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            <span className="material-icons text-xl">file_download</span>
            <span>Export Data</span>
          </button>
          <button className="bg-primary hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-icons text-xl">add</span>
            <span>Track New Item</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-icons text-2xl">calendar_month</span>
            </div>
            <span className="text-xs font-bold text-sage bg-sage/10 px-2 py-1 rounded-full">+4 this week</span>
          </div>
          <p className="text-slate-500 font-medium">Items Tracked This Month</p>
          <h3 className="text-3xl font-extrabold mt-1 text-slate-900">24</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center text-accent-orange">
              <span className="material-icons text-2xl">timer</span>
            </div>
            <span className="text-xs font-bold text-accent-orange bg-accent-orange/10 px-2 py-1 rounded-full">On Track</span>
          </div>
          <p className="text-slate-500 font-medium">Hours Spent This Week</p>
          <h3 className="text-3xl font-extrabold mt-1 text-slate-900">18.5h</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-900 font-bold mb-4">Recently Started</p>
          <div className="space-y-4">
            {recentlyStarted.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.type === 'Game' ? 'bg-primary/10 text-primary' :
                  item.type === 'Book' ? 'bg-sage/10 text-sage' : 'bg-accent-purple/10 text-accent-purple'
                }`}>
                  <span className="material-icons text-sm">
                    {item.type === 'Game' ? 'videogame_asset' : item.type === 'Book' ? 'auto_stories' : 'movie'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold leading-none text-slate-900">Activity Overview</h3>
              <p className="text-sm text-slate-500 mt-2">Daily consumption trends over the last 7 days</p>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">
              Last 7 Days
            </div>
          </div>
          <ActivityOverviewChart />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-900">Media Mix (Week)</h3>
          <MediaMixChart />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Recently Finished</h3>
          <button className="text-primary font-bold hover:underline">View Library</button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar">
          {recentlyFinished.map(item => (
            <div key={item.id} className="flex-none w-48 group">
              <div className="relative overflow-hidden rounded-xl aspect-[2/3] shadow-md mb-3">
                <img 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src={item.coverImage} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <button className="bg-primary text-white py-2 rounded-lg text-sm font-bold">Quick Review</button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-md uppercase tracking-wide ${
                    item.type === 'Game' ? 'bg-primary' : 
                    item.type === 'Book' ? 'bg-sage' : 
                    item.type === 'Movie' ? 'bg-accent-purple' : 'bg-accent-orange'
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>
              <h4 className="font-bold text-sm truncate text-slate-900">{item.title}</h4>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`material-icons text-xs ${i < Math.floor(item.rating) ? 'text-accent-orange' : 'text-slate-200'}`}
                  >
                    star
                  </span>
                ))}
                <span className="text-[11px] text-slate-500 font-bold ml-1">{item.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
