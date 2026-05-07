import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function LeadManagement() {
  const { config } = useIndustry();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const leads = [
    { id: '1', businessName: 'Acme Corp', contactPerson: 'John Smith', phone: '+1 234 567 890', email: 'john@acme.com', status: 'Interested', lastContacted: '2 days ago', followUp: '2024-05-15' },
    { id: '2', businessName: 'Global Tech', contactPerson: 'Sarah Wilson', phone: '+1 987 654 321', email: 'sarah@global.tech', status: 'New', lastContacted: '1 day ago', followUp: '2024-05-10' },
    { id: '3', businessName: 'Urban Design', contactPerson: 'Michael Brown', phone: '+1 555 123 456', email: 'mike@urban.design', status: 'Follow-up', lastContacted: '4 hours ago', followUp: '2024-05-08' },
    { id: '4', businessName: 'Health First', contactPerson: 'Emma Davis', phone: '+1 444 777 888', email: 'emma@healthfirst.com', status: 'Closed', lastContacted: '1 week ago', followUp: '-' },
    { id: '5', businessName: 'Bright Ideas', contactPerson: 'Ray Chen', phone: '+1 333 999 000', email: 'ray@bright.ideas', status: 'Contacted', lastContacted: '3 days ago', followUp: '2024-05-12' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Interested': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Follow-up': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Closed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Not Interested': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'Contacted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{config.labels.leads}</h1>
          <p className="text-gray-500">Manage and track your business opportunities.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {config.labels.lead}
        </button>
      </header>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${config.labels.leads.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Last Contact</th>
                <th className="px-6 py-4">Next Follow-up</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                        {lead.businessName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{lead.businessName}</p>
                        <p className="text-xs text-gray-400">{lead.contactPerson}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border",
                      getStatusColor(lead.status)
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <p>{lead.phone}</p>
                    <p>{lead.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lead.lastContacted}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {lead.followUp}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
