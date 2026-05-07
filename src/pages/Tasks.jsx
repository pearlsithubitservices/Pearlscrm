import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  Flag
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function TaskManagement() {
  const { config } = useIndustry();
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Call back Acme Corp regarding contract', deadline: '2024-05-08', priority: 'High', status: 'Pending', assignedTo: 'John Doe' },
    { id: '2', title: 'Prepare project roadmap for Clinic XYZ', deadline: '2024-05-10', priority: 'Medium', status: 'In Progress', assignedTo: 'Sarah Wilson' },
    { id: '3', title: 'Review last week\'s lead conversions', deadline: '2024-05-07', priority: 'High', status: 'Delayed', assignedTo: 'Admin' },
    { id: '4', title: 'Update client billing information', deadline: '2024-05-12', priority: 'Low', status: 'Pending', assignedTo: 'Michael Brown' },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Delayed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-200" />;
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Task Management</h1>
          <p className="text-gray-500">Track and manage internal team operations.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-gray-400 mb-1">Pending Tasks</p>
          <h3 className="text-2xl font-bold">12</h3>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-gray-400 mb-1">Due Today</p>
          <h3 className="text-2xl font-bold text-orange-600">4</h3>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-gray-400 mb-1">Completed This Week</p>
          <h3 className="text-2xl font-bold text-green-600">28</h3>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
              <button className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </button>
              
              <div className="flex-1">
                <h4 className={cn(
                  "text-sm font-semibold text-black",
                  task.status === 'Completed' && "line-through text-gray-400"
                )}>{task.title}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
                    <User className="w-3 h-3" /> {task.assignedTo}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
                    <Calendar className="w-3 h-3" /> {task.deadline}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-lg",
                  task.status === 'Delayed' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'
                )}>
                  {task.status}
                </span>
                <button className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
