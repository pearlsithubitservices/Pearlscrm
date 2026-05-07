import React, { useState } from 'react';
import { 
  UserCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  ExternalLink,
  History,
  CreditCard,
  Plus
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { cn } from '../lib/utils';

export default function Clients() {
  const { config } = useIndustry();
  const [searchQuery, setSearchQuery] = useState('');

  const clients = [
    { id: '1', name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', phone: '+1 234 567 890', location: 'New York, NY', projects: 2, totalSpent: '$12,400' },
    { id: '2', name: 'Sarah Wilson', company: 'Global Tech', email: 'sarah@global.tech', phone: '+1 987 654 321', location: 'San Francisco, CA', projects: 1, totalSpent: '$8,500' },
    { id: '3', name: 'Emma Davis', company: 'Health First', email: 'emma@healthfirst.com', phone: '+1 444 777 888', location: 'Chicago, IL', projects: 3, totalSpent: '$24,000' },
  ];

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{config.labels.clients}</h1>
          <p className="text-gray-500">View and manage your long-term customer relationships.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-black transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {clients.map((client) => (
                <div key={client.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-black transition-colors">
                      <UserCircle className="w-6 h-6 text-gray-300 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-black">{client.name}</h4>
                      <p className="text-sm text-gray-400">{client.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:block">
                      <p className="text-xs font-bold text-gray-300 uppercase mb-1">Projects</p>
                      <p className="text-sm font-semibold text-black">{client.projects}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs font-bold text-gray-300 uppercase mb-1">Total Spent</p>
                      <p className="text-sm font-semibold text-black">{client.totalSpent}</p>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-black">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-black text-white rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold mb-4">Client Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Clients</span>
                <span className="font-bold">1,248</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Active projects</span>
                <span className="font-bold">84</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Avg. Retention</span>
                <span className="font-bold">92%</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
              DOWNLOAD CLIENT REPORT
            </button>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-black mb-4">Recent Notes</h3>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="text-xs leading-relaxed">
                  <p className="text-gray-500 italic mb-1">"Updated the service agreement for Acme Corp. They requested a 10% discount on the next billing cycle..."</p>
                  <p className="font-bold text-gray-400">— Sarah W. • 2h ago</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
