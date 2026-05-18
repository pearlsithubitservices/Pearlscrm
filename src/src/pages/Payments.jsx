import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Filter, 
  FileText,
  DollarSign,
  PieChart,
  Calendar
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { name: 'Income', value: 45000, color: '#000' },
  { name: 'Expense', value: 12000, color: '#E2E8F0' },
  { name: 'Revenue', value: 33000, color: '#3B82F6' },
];

export default function Payments() {
  const { config } = useIndustry();

  const transactions = [
    { id: '1', client: 'Acme Corp', type: 'Income', amount: '$4,200', status: 'Paid', date: 'May 5, 2024', invoice: 'INV-2024-001' },
    { id: '2', client: 'Global Tech', type: 'Income', amount: '$850', status: 'Pending', date: 'May 4, 2024', invoice: 'INV-2024-002' },
    { id: '3', client: 'AWS Cloud', type: 'Expense', amount: '$1,200', status: 'Paid', date: 'May 3, 2024', invoice: 'SUB-2024-001' },
    { id: '4', client: 'Sarah Wilson', type: 'Income', amount: '$2,400', status: 'Partial', date: 'May 2, 2024', invoice: 'INV-2024-003' },
  ];

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Financial Center</h1>
          <p className="text-gray-500">Monitor revenue, expenses, and pending invoices.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Received</p>
            <h3 className="text-2xl font-bold text-black">$84,200</h3>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Amount</p>
            <h3 className="text-2xl font-bold text-black font-sans text-orange-600">$12,450</h3>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PieChart className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Net Revenue</p>
            <h3 className="text-2xl font-bold text-black">$71,750</h3>
          </div>

          <div className="md:col-span-3 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-6">Cash Flow Summary</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 600}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-black rounded-3xl p-6 text-white overflow-hidden relative shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <CreditCard className="w-8 h-8 opacity-50" />
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Operational Account</p>
                <p className="text-xs font-bold">**** 4291</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1">Total Balance</p>
            <h3 className="text-3xl font-bold mb-8">$142,500.00</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Card Holder</p>
                <p className="text-sm font-bold uppercase tracking-widest">Administrator</p>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4 brightness-0 invert" alt="" />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  t.type === 'Income' ? 'bg-green-50' : 'bg-red-50'
                )}>
                  {t.type === 'Income' ? (
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{t.client}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400">{t.invoice}</span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-gray-400">{t.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-bold mb-1 font-sans",
                  t.type === 'Income' ? 'text-black' : 'text-red-500'
                )}>
                  {t.type === 'Income' ? '+' : '-'}{t.amount}
                </p>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                  t.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                )}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
