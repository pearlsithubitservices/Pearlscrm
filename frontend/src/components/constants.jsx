export const INDUSTRY_CONFIGS = {
  'IT': {
    labels: {
      leads: 'Leads',
      lead: 'Lead',
      projects: 'Projects',
      project: 'Project',
      clients: 'Clients',
      client: 'Client',
      team: 'Developers',
      teamMember: 'Developer'
    },
    dashboardWidgets: ['revenue', 'active_projects', 'lead_conversion']
  },
  'Clinic': {
    labels: {
      leads: 'Patients',
      lead: 'Patient',
      projects: 'Treatments',
      project: 'Treatment',
      clients: 'Patients',
      client: 'Patient',
      team: 'Staff',
      teamMember: 'Doctor/Nurse'
    },
    dashboardWidgets: ['appointments', 'patient_growth', 'revenue']
  },
  'Real Estate': {
    labels: {
      leads: 'Property Leads',
      lead: 'Lead',
      projects: 'Properties',
      project: 'Property',
      clients: 'Buyers/Sellers',
      client: 'Client',
      team: 'Agents',
      teamMember: 'Agent'
    },
    dashboardWidgets: ['site_visits', 'closings', 'pipeline']
  },
  'Service': {
    labels: {
      leads: 'Leads',
      lead: 'Lead',
      projects: 'Service Tasks',
      project: 'Service',
      clients: 'Clients',
      client: 'Client',
      team: 'Service Team',
      teamMember: 'Technician'
    },
    dashboardWidgets: ['follow_ups', 'satisfaction', 'efficiency']
  },
  'Retail': {
    labels: {
      leads: 'Prospects',
      lead: 'Prospect',
      projects: 'Orders',
      project: 'Order',
      clients: 'Customers',
      client: 'Customer',
      team: 'Sales Staff',
      teamMember: 'Salesperson'
    },
    dashboardWidgets: ['sales_volume', 'inventory', 'customer_retention']
  },
  'Education': {
    labels: {
      leads: 'Inquiries',
      lead: 'Inquiry',
      projects: 'Courses',
      project: 'Course',
      clients: 'Students',
      client: 'Student',
      team: 'Faculty',
      teamMember: 'Instructor'
    },
    dashboardWidgets: ['enrollment', 'attendance', 'fees']
  }
};
