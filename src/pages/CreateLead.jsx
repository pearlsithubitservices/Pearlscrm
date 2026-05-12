import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Building, 
  Phone, 
  Send,
  CheckCircle,
  Activity,
  UserCheck,
  Globe,
  DollarSign,
  Repeat,
  Monitor,
  CalendarDays,
} from 'lucide-react';

export default function CreateLead() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    status: 'New',
    assigned: '',
    source: 'Website',
    budget: '',
    followUps: '0',
    platform: 'Google',
    nextAction: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const createLead = async (e) => {

  e.preventDefault();

  setIsSubmitting(true);

  try {

    const response = await fetch(
      'https://pearlscrm.onrender.com/api/leads',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    console.log(data);

    setIsSuccess(true);

    setTimeout(() => {

      navigate('/');

    }, 1500);

  } catch (error) {

    console.error('Error creating lead:', error);

  } finally {

    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto px-4">
      <button 
    onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 blur-[100px] -z-10" />

        <div className="mb-10">
          <h2 className="text-3xl font-display font-bold mb-2">Create New Lead</h2>
          <p className="text-gray-400">Capture lead details and next steps to streamline your pipeline.</p>
        </div>

        <form onSubmit={createLead} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lead Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Lead Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Company Name</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. Innovatech Solutions"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Status</label>
              <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
            </div>

            {/* Assigned to */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Assigned To</label>
              <div className="relative group">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="assigned"
                  placeholder="Agent Name"
                  value={formData.assigned}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Source</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Direct">Direct</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Budget ($)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="number"
                  name="budget"
                  placeholder="0.00"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Follow-ups */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Follow-ups Count</label>
              <div className="relative group">
                <Repeat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="number"
                  name="followUps"
                  min="0"
                  value={formData.followUps}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Platform</label>
              <div className="relative group">
                <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="Google">Google</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter (X)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone (Keeping for completeness) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Next Action */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Next Action</label>
              <div className="relative group">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="nextAction"
                  placeholder="e.g. Follow-up meeting on Friday"
                  value={formData.nextAction}
                  onChange={handleChange}
                  className="w-full bg-[#151521]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full relative py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg shadow-xl shadow-purple-500/20 hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-4"
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Lead...
                </motion.div>
              ) : isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  Lead Created Successfully!
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Add Lead to Dashboard
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
