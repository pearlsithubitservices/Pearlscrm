import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import useEmployees from '../Hooks/useEmployees';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  ListTodo,
  PenSquare,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Video,
  XCircle,
  BellRing,
  Filter,
  ChevronRight,
} from 'lucide-react';

const meetingTypes = [
  'Team Meeting',
  'Client Meeting',
  'Project Meeting',
  'One-to-One',
  'Review Meeting',
  'Interview',
  'Training',
  'Follow-up',
  'Sales Meeting',
  'Other',
];

const priorities = ['Low', 'Normal', 'High', 'Urgent'];
const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'];

const createDefaultForm = () => ({
  title: '',
  description: '',
  type: 'Team Meeting',
  priority: 'Normal',
  date: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '10:00',
  timezone: 'UTC',
  organizer: '',
  participants: [],
  locationType: 'Office',
  address: '',
  meetingUrl: '',
  status: 'Scheduled',
});

const getRouteState = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const meetingIndex = segments.indexOf('meeting');
  const afterMeeting = meetingIndex >= 0 ? segments.slice(meetingIndex + 1) : [];

  if (afterMeeting[0] === 'calendar') return { mode: 'calendar' };
  if (afterMeeting[0] === 'my-meetings') return { mode: 'myMeetings' };
  if (afterMeeting[0] === 'create') return { mode: 'create' };
  if (afterMeeting[0] && afterMeeting[1] === 'edit') return { mode: 'edit', id: afterMeeting[0] };
  if (afterMeeting[0]) return { mode: 'details', id: afterMeeting[0] };

  return { mode: 'dashboard' };
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusClass = (status) => {
  const classes = {
    Scheduled: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-rose-100 text-rose-700',
    Rescheduled: 'bg-violet-100 text-violet-700',
    'No Show': 'bg-slate-200 text-slate-700',
  };

  return classes[status] || 'bg-slate-100 text-slate-700';
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const { employees = [] } = useEmployees();
  const location = useLocation();
  const navigate = useNavigate();
  const route = getRouteState(location.pathname);
  const meetingBasePath = location.pathname.startsWith('/employee/meeting')
    ? '/employee/meeting'
    : '/meeting';

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showForm, setShowForm] = useState(route.mode === 'create' || route.mode === 'edit');
  const [formData, setFormData] = useState(createDefaultForm());
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', role: 'Attendee' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [activeDate, setActiveDate] = useState(new Date());

  const handleEmployeeParticipantSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId);

    if (!employeeId) {
      setNewParticipant((prev) => ({ ...prev, name: '', email: '' }));
      return;
    }

    const selectedEmployee = employees.find(
      (employee) => String(employee._id || employee.id || employee.uid) === String(employeeId)
    );

    if (!selectedEmployee) return;

    setNewParticipant((prev) => ({
      ...prev,
      name: selectedEmployee.employeeName || selectedEmployee.name || '',
      email: selectedEmployee.email || '',
    }));
  };

  const loadMeetings = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/meetings', { params: filters });
      const items = response?.data?.data || [];
      setMeetings(items);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Unable to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {};
    if (route.mode === 'myMeetings') params.mine = 'true';
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    loadMeetings(params);
  }, [route.mode, searchTerm, statusFilter, typeFilter, priorityFilter, user]);

  useEffect(() => {
    const activeId = route.id;
    if (!activeId) {
      setSelectedMeeting(null);
      return;
    }

    const current = meetings.find((item) => String(item._id) === String(activeId));
    if (current) {
      setSelectedMeeting(current);
    }
  }, [meetings, route.id]);

  useEffect(() => {
    const shouldOpenForm = route.mode === 'create' || route.mode === 'edit';
    setShowForm(shouldOpenForm);

    if (route.mode === 'edit' && route.id) {
      const meeting = meetings.find((item) => String(item._id) === String(route.id));
      if (meeting) {
        setFormData({
          title: meeting.title || '',
          description: meeting.description || '',
          type: meeting.type || 'Team Meeting',
          priority: meeting.priority || 'Normal',
          date: formatDate(meeting.date),
          startTime: meeting.startTime || '09:00',
          endTime: meeting.endTime || '10:00',
          timezone: meeting.timezone || 'UTC',
          organizer: meeting.organizer?._id || meeting.organizer || user?.id || '',
          participants: meeting.participants || [],
          locationType: meeting.location?.type || 'Office',
          address: meeting.location?.address || '',
          meetingUrl: meeting.location?.meetingUrl || '',
          status: meeting.status || 'Scheduled',
        });
      }
    }

    if (route.mode === 'create') {
      setFormData(createDefaultForm());
      setFormData((prev) => ({ ...prev, organizer: user?.id || '' }));
    }
  }, [route.mode, route.id, meetings, user]);

  const filteredMeetings = useMemo(() => {
    let items = [...meetings];

    if (route.mode === 'myMeetings') {
      items = items.filter((meeting) => {
        const userId = user?.id || user?._id;
        const organizerMatch = String(meeting.organizer?._id || meeting.organizer) === String(userId);
        const participantMatch = (meeting.participants || []).some(
          (participant) => String(participant.user) === String(userId) || participant.email === user?.email
        );
        return organizerMatch || participantMatch;
      });
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((meeting) =>
        [meeting.title, meeting.description, meeting.type, meeting.status, meeting.location?.address]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    return items;
  }, [meetings, route.mode, searchTerm, user]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    return {
      today: filteredMeetings.filter((meeting) => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= today && meetingDate <= endOfToday;
      }).length,
      upcoming: filteredMeetings.filter((meeting) => new Date(meeting.date) > new Date()).length,
      completed: filteredMeetings.filter((meeting) => meeting.status === 'Completed').length,
      cancelled: filteredMeetings.filter((meeting) => meeting.status === 'Cancelled').length,
      pendingInvitations: filteredMeetings.filter((meeting) =>
        (meeting.participants || []).some((participant) => participant.responseStatus === 'Pending')
      ).length,
      followUps: filteredMeetings.filter((meeting) => meeting.followUpDetails?.required).length,
    };
  }, [filteredMeetings]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantAdd = () => {
    if (!newParticipant.name && !newParticipant.email) {
      toast.error('Please select an employee or add a participant name/email');
      return;
    }

    const employeeLookupId = selectedEmployeeId || null;
    const selectedEmployee = employeeLookupId
      ? employees.find(
          (employee) => String(employee._id || employee.id || employee.uid) === String(employeeLookupId)
        )
      : null;

    setFormData((prev) => ({
      ...prev,
      participants: [
        ...(prev.participants || []),
        {
          ...newParticipant,
          user: selectedEmployee ? selectedEmployee._id || selectedEmployee.id || selectedEmployee.uid : null,
          name: newParticipant.name || selectedEmployee?.employeeName || selectedEmployee?.name || '',
          email: newParticipant.email || selectedEmployee?.email || '',
          responseStatus: 'Pending',
          attendanceStatus: 'Not Responded',
          isExternal: !selectedEmployee,
        },
      ],
    }));
    setNewParticipant({ name: '', email: '', role: 'emp' });
    setSelectedEmployeeId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        organizer: formData.organizer || user?.id || user?._id,
      };

      if (!payload.title || !payload.date || !payload.startTime || !payload.endTime) {
        toast.error('Meeting title, date, start time and end time are required');
        return;
      }

      if (payload.startTime >= payload.endTime) {
        toast.error('End time must be after start time');
        return;
      }

      if (route.mode === 'edit' && route.id) {
        await api.put(`/meetings/${route.id}`, payload);
        toast.success('Meeting updated');
      } else {
        await api.post('/meetings', payload);
        toast.success('Meeting scheduled');
      }

      setShowForm(false);
      navigate(meetingBasePath);
      await loadMeetings();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save meeting');
    }
  };

  const handleStatusAction = async (meetingId, action) => {
    try {
      if (action === 'delete') {
        await api.delete(`/meetings/${meetingId}`);
        toast.success('Meeting deleted');
      } else if (action === 'cancel') {
        await api.patch(`/meetings/${meetingId}/cancel`, { reason: 'Cancelled by user' });
        toast.success('Meeting cancelled');
      } else if (action === 'start') {
        await api.patch(`/meetings/${meetingId}/start`);
        toast.success('Meeting started');
      } else if (action === 'complete') {
        await api.patch(`/meetings/${meetingId}/end`);
        toast.success('Meeting completed');
      }

      await loadMeetings();
      navigate(meetingBasePath);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Action failed');
    }
  };

  const openMeeting = (id) => navigate(`${meetingBasePath}/${id}`);
  const openEdit = (id) => navigate(`${meetingBasePath}/${id}/edit`);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          ['Today', stats.today, 'Today'],
          ['Upcoming', stats.upcoming, 'Upcoming'],
          ['Completed', stats.completed, 'Completed'],
          ['Cancelled', stats.cancelled, 'Cancelled'],
          ['Pending Invitations', stats.pendingInvitations, 'Invites'],
          ['Follow-ups Required', stats.followUps, 'Follow-up'],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900">{value}</span>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">{hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Meetings</h3>
            <button onClick={() => navigate(meetingBasePath)} className="text-sm font-medium text-indigo-600">View all</button>
          </div>

          <div className="space-y-3">
            {filteredMeetings.slice(0, 5).map((meeting) => (
              <div key={meeting._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{meeting.title}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(meeting.status)}`}>{meeting.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(meeting.date)} • {meeting.startTime} - {meeting.endTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openMeeting(meeting._id)} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">View</button>
                  <button onClick={() => openEdit(meeting._id)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Agenda</h3>
          <div className="space-y-3">
            {filteredMeetings.slice(0, 4).map((meeting) => (
              <div key={meeting._id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-800">{meeting.title}</p>
                  <span className="text-xs text-slate-500">{meeting.type}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{meeting.startTime} - {meeting.endTime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Title', 'Date', 'Time', 'Type', 'Organizer', 'Participants', 'Priority', 'Status', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMeetings.map((meeting) => (
              <tr key={meeting._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{meeting.title}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(meeting.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{meeting.startTime} - {meeting.endTime}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{meeting.type}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{meeting.organizer?.name || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{(meeting.participants || []).slice(0, 2).map((p) => p.name || p.email).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{meeting.priority}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(meeting.status)}`}>{meeting.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openMeeting(meeting._id)} className="text-indigo-600">View</button>
                    <button onClick={() => openEdit(meeting._id)} className="text-slate-600">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Calendar
        value={activeDate}
        onChange={(date) => setActiveDate(date)}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;
          const matches = filteredMeetings.filter((meeting) => {
            const meetingDate = new Date(meeting.date);
            return meetingDate.toDateString() === date.toDateString();
          });

          return matches.length ? (
            <div className="mt-2 flex flex-col gap-1 text-left text-[10px]">
              {matches.slice(0, 2).map((meeting) => (
                <button key={meeting._id} onClick={() => openMeeting(meeting._id)} className="rounded bg-indigo-100 px-1 text-left text-indigo-700 truncate">
                  {meeting.title}
                </button>
              ))}
            </div>
          ) : null;
        }}
      />
    </div>
  );

  const renderMyMeetings = () => (
    <div className="space-y-4">
      {filteredMeetings.length ? filteredMeetings.map((meeting) => (
        <div key={meeting._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-slate-900">{meeting.title}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(meeting.status)}`}>{meeting.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatDateTime(meeting.date)} • {meeting.startTime} - {meeting.endTime}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openMeeting(meeting._id)} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">View</button>
              <button onClick={() => handleStatusAction(meeting._id, 'start')} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Start</button>
            </div>
          </div>
        </div>
      )) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No meetings found in your schedule.</div>
      )}
    </div>
  );

  const renderDetailPanel = () => {
    if (!selectedMeeting) return null;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Meeting Details</p>
            <h3 className="text-2xl font-bold text-slate-900">{selectedMeeting.title}</h3>
          </div>
          <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(selectedMeeting.status)}`}>{selectedMeeting.status}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Type:</span> {selectedMeeting.type}</p>
            <p><span className="font-semibold text-slate-900">Date:</span> {formatDate(selectedMeeting.date)}</p>
            <p><span className="font-semibold text-slate-900">Time:</span> {selectedMeeting.startTime} - {selectedMeeting.endTime}</p>
            <p><span className="font-semibold text-slate-900">Priority:</span> {selectedMeeting.priority}</p>
            <p><span className="font-semibold text-slate-900">Organizer:</span> {selectedMeeting.organizer?.name || '—'}</p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Participants:</span> {(selectedMeeting.participants || []).map((participant) => participant.name || participant.email).join(', ') || 'No participants'}</p>
            <p><span className="font-semibold text-slate-900">Location:</span> {selectedMeeting.location?.address || selectedMeeting.location?.meetingUrl || '—'}</p>
            <p><span className="font-semibold text-slate-900">Notes:</span> {selectedMeeting.notes || 'No notes yet'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => openEdit(selectedMeeting._id)} className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white">Edit</button>
          <button onClick={() => handleStatusAction(selectedMeeting._id, 'start')} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">Start</button>
          <button onClick={() => handleStatusAction(selectedMeeting._id, 'complete')} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">Complete</button>
          <button onClick={() => handleStatusAction(selectedMeeting._id, 'cancel')} className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600">Cancel</button>
          <button onClick={() => handleStatusAction(selectedMeeting._id, 'delete')} className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600">Delete</button>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">{route.mode === 'edit' ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
        <button onClick={() => { setShowForm(false); navigate(meetingBasePath); }} className="text-sm text-slate-500">Close</button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="font-medium">Meeting Title</span>
            <input name="title" value={formData.title} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Quarterly review" required />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Meeting Type</span>
            <select name="type" value={formData.type} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
              {meetingTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Priority</span>
            <select name="priority" value={formData.priority} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
              {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="font-medium">Description</span>
            <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Objectives, agenda, or notes" />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Date</span>
            <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Timezone</span>
            <input name="timezone" value={formData.timezone} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Start Time</span>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">End Time</span>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="font-medium">Location Type</span>
            <select name="locationType" value={formData.locationType} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
              {['Office', 'Google Meet', 'Zoom', 'Microsoft Teams', 'Phone Call', 'Custom'].map((option) => (<option key={option} value={option}>{option}</option>))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="font-medium">Location / URL</span>
            <input name="address" value={formData.address} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Meeting room, Zoom link, or address" />
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="font-medium">Meeting URL</span>
            <input name="meetingUrl" value={formData.meetingUrl} onChange={handleFormChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="https://..." />
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900">Participants</h4>
            <span className="text-xs text-slate-500">{(formData.participants || []).length} added</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.3fr_1.1fr_1.1fr_auto]">
            <select
              value={selectedEmployeeId}
              onChange={(event) => handleEmployeeParticipantSelect(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => {
                const employeeId = employee._id || employee.id || employee.uid;
                const label = employee.employeeName || employee.name || employee.email || 'Employee';

                return (
                  <option key={employeeId} value={employeeId}>
                    {label}
                  </option>
                );
              })}
            </select>
            <input value={newParticipant.name} onChange={(event) => setNewParticipant((prev) => ({ ...prev, name: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Name" />
            <input value={newParticipant.email} onChange={(event) => setNewParticipant((prev) => ({ ...prev, email: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Email" />
            <button type="button" onClick={handleParticipantAdd} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(formData.participants || []).map((participant, index) => (
              <span key={`${participant.email || participant.name}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm">
                {participant.name || participant.email}
                <button type="button" onClick={() => setFormData((prev) => ({ ...prev, participants: prev.participants.filter((_, idx) => idx !== index) }))} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => { setShowForm(false); navigate(meetingBasePath); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white">{route.mode === 'edit' ? 'Save Changes' : 'Schedule Meeting'}</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Meeting Module</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Meetings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Search size={16} />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search meetings" className="w-40 border-0 bg-transparent outline-none placeholder:text-slate-400" />
          </div>
          <button onClick={() => navigate(`${meetingBasePath}/create`)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
            <Plus size={16} />
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { label: 'Dashboard', value: 'dashboard', icon: BarChart },
          { label: 'List', value: 'list', icon: ListTodo },
          { label: 'Calendar', value: 'calendar', icon: CalendarDays },
          { label: 'My Meetings', value: 'myMeetings', icon: Video },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              if (tab.value === 'dashboard') navigate(meetingBasePath);
              if (tab.value === 'calendar') navigate(`${meetingBasePath}/calendar`);
              if (tab.value === 'myMeetings') navigate(`${meetingBasePath}/my-meetings`);
              if (tab.value === 'list') navigate(meetingBasePath);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${route.mode === tab.value ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <option value="all">All Statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>

        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <option value="all">All Types</option>
          {meetingTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>

        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <option value="all">All Priorities</option>
          {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading meetings...</div>
      ) : showForm ? (
        renderForm()
      ) : route.mode === 'details' ? (
        renderDetailPanel()
      ) : route.mode === 'calendar' ? (
        renderCalendar()
      ) : route.mode === 'myMeetings' ? (
        renderMyMeetings()
      ) : (
        <>
          {renderDashboard()}
          {renderList()}
        </>
      )}
    </div>
  );
}

function BarChart(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M4 18h16M7 14V9m5 5V5m5 9v-7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
