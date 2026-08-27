import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  CheckCircle2,
  Users,
  MessageSquareText,
  FileText,
  Paperclip,
  Activity,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useEmployees from '../../Hooks/useEmployees';
import { apiUrl } from '../../config/api';
import ProjectOverview from '../../components/ProjectDetails/ProjectOverview';
import ProjectMilestone from '../../components/ProjectDetails/ProjectMilestone';
import ProjectNotes from '../../components/ProjectDetails/ProjectNotes';
import ProjectTeam from '../../components/ProjectDetails/ProjectTeam';
import ProjectActivity from '../../components/ProjectDetails/ProjectActivity';

export default function EmpProjectDetails() {
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();
  const { id } = useParams();
  const { employees } = useEmployees();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/projects'));
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching project details for employee:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [id]);

  const projectById = useMemo(() => {
    return projects.filter((item) => String(item._id || item.id) === String(id));
  }, [projects, id]);

  const projectObj = projectById[0] || {};

  const tabs = ['Overview', 'Milestones', 'Notes', 'Team', 'Activity'];

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <ProjectOverview projects={projectById} />;
      case 'Milestones':
        return <ProjectMilestone project={projectObj} projects={projectById} fetchProjects={fetchProjects} />;
      case 'Notes':
        return <ProjectNotes project={projectObj} projects={projectById} fetchProjects={fetchProjects} />;
      case 'Team':
        return <ProjectTeam projects={projectById} fetchProjects={fetchProjects} />;
      case 'Activity':
        return <ProjectActivity project={projectObj} projects={projectById} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb] p-4 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl mx-auto bg-white rounded-[28px] overflow-hidden shadow-xl border border-gray-200/80"
      >
        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-[#0b2b57] tracking-tight">
                  {projectObj.title || 'Project Details'}
                </h1>
              </div>

              <p className="text-xs md:text-sm text-gray-600 font-medium">
                Client / Company:{' '}
                <span className="font-bold text-[#2563a9]">{projectObj.company || 'Pearls Client'}</span> • Location:{' '}
                <span className="font-semibold text-gray-700">{projectObj.companylocation || 'India'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  (projectObj.status || '').toLowerCase() === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : (projectObj.status || '').toLowerCase() === 'in progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                ● {projectObj.status || 'Active'}
              </span>

              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  (projectObj.priority || '').toLowerCase() === 'urgent' ||
                  (projectObj.priority || '').toLowerCase() === 'high'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {projectObj.priority || 'Medium Priority'}
              </span>

              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-gray-200 bg-white px-6 md:px-8">
          <div className="flex items-center gap-6 md:gap-12 overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab ? 'text-[#2563a9]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeEmpTab"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2563a9] rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="p-6 md:p-8 min-h-[350px] max-h-[calc(100vh-240px)] overflow-y-auto no-scrollbar"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
