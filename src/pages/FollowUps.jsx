import React from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  ChevronRight,
  TrendingUp,
  User
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function FollowUps() {
  const { config } = useIndustry();

  const followUps = [
    { id: '1', name: 'Acme Corp', contact: 'John Smith', time: '10:30 AM', priority: 'High', type: 'Call', overdue: true },
    { id: '2', name: 'Global Tech', contact: 'Sarah Wilson', time: '02:00 PM', priority: 'Medium', type: 'Email', overdue: false },
    { id: '3', name: 'Urban Design', contact: 'Michael Brown', time: '11:15 AM', priority: 'High', type: 'Call', overdue: true },
    { id: '4', name: 'Bright Ideas', contact: 'Ray Chen', time: '04:30 PM', priority: 'Low', type: 'Meeting', overdue: false },
  ];

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Follow-up System</h1>
          <p className="text-gray-500">Never miss a contact point with your {config.labels.leads.toLowerCase()}.</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold">Today, May 7</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold">Overdue</h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Action Required</span>
            </div>
            <div className="space-y-4">
              {followUps.filter(f => f.overdue).map((f) => (
                <motion.div 
                  key={f.id}
                  whileHover={{ x: 5 }}
                  className="p-5 bg-white border border-red-100 rounded-2xl shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-black">{f.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {f.contact}
                        </span>
                        <span className="text-xs text-red-600 font-bold uppercase">Missed at {f.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all">
                      {f.type === 'Call' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </button>
                    <button className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
                      Complete <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold">Upcoming Today</h2>
            </div>
            <div className="space-y-4">
              {followUps.filter(f => !f.overdue).map((f) => (
                <div key={f.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between group cursor-pointer hover:border-black/10 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 shadow-inner">
                      {f.type === 'Call' ? <Phone className="w-5 h-5 text-gray-400" /> : <Calendar className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-black">{f.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {f.contact}
                        </span>
                        <span className="text-xs text-blue-600 font-bold uppercase">{f.time}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-black">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-[#F3F4F6] rounded-[32px]">
            <h3 className="text-xl font-bold mb-6 font-sans">Performance</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Success Rate</span>
                  <span className="text-sm font-bold">88%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-[88%] bg-black rounded-full" />
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold font-sans">14</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Avg. daily closures</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold mb-4">Quick Tip</h3>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "Follow-ups made within 5 minutes of a new inquiry are 9x more likely to convert. Keep your notifications active!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
