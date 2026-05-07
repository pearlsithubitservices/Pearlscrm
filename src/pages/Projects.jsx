import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  MoreVertical, 
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Projects() {
  const { config } = useIndustry();
  
  const projects = [
    { id: '1', name: 'Website Redesign', client: 'Acme Corp', progress: 75, status: 'Ongoing', team: 4, deadline: 'May 20' },
    { id: '2', name: 'Mobile App V2', client: 'Global Tech', progress: 40, status: 'Ongoing', team: 6, deadline: 'June 15' },
    { id: '3', name: 'Security Audit', client: 'Health First', progress: 100, status: 'Completed', team: 2, deadline: 'May 1' },
    { id: '4', name: 'Cloud Migration', client: 'Bright Ideas', progress: 15, status: 'Started', team: 3, deadline: 'July 10' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Ongoing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Review': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{config.labels.projects}</h1>
          <p className="text-gray-500">Track milestones and progress of active engagements.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          New {config.labels.project}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
              </div>
              <button className="p-1 text-gray-300 hover:text-black">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-black mb-1">{project.name}</h3>
            <p className="text-xs text-gray-400 mb-6">{project.client}</p>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-bold text-black">{project.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    project.progress === 100 ? "bg-green-500" : "bg-black"
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[...Array(Math.min(project.team, 3))].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                    TM
                  </div>
                ))}
                {project.team > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[8px] font-bold text-gray-400">
                    +{project.team - 3}
                  </div>
                )}
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                getStatusColor(project.status)
              )}>
                {project.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold">Upcoming Milestones</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-black">Beta Testing Phase</p>
                  <p className="text-xs text-gray-400">Mobile App V2 • Due in 5 days</p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-black border border-gray-100 rounded-lg">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
