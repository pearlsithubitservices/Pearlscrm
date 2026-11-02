import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import quotationApi from "../services/quotationApi.js";

const STATUS_OPTIONS = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Sent",
  "Viewed",
  "Negotiation",
  "Accepted",
  "Rejected",
  "Expired",
  "Cancelled",
];

const TABS = [
  // { key: "overview", label: "Dashboard" },
  { key: "all", label: "All Quotations" },
  { key: "create", label: "Create Quotation" },
  { key: "templates", label: "Templates" },
  { key: "settings", label: "Settings" },
];

const DEFAULT_ITEMS = [
  {
    id: Date.now(),
    name: "",
    description: "",
    quantity: 1,
    unit: "pcs",
    unitPrice: 0,
    discountType: "none",
    discountValue: 0,
    tax: 0,
    taxPercentage: 0,
    lineTotal: 0,
  },
];

const DEFAULT_FORM = {
  quotationNumber: "QT-2026-0001",
  customerName: "",
  companyName: "",
  email: "",
  phone: "",
  billingAddress: "",
  shippingAddress: "",
  quotationDate: new Date().toISOString().slice(0, 10),
  validUntil: "",
  salesPerson: "",
  department: "Sales",
  referenceNumber: "",
  relatedLead: "",
  relatedProject: "",
  relatedDeal: "",
  currency: "INR",
  paymentTerms: "50% Advance",
  paymentMethod: "Bank Transfer",
  advancePayment: 0,
  balancePayment: 0,
  paymentDueDays: 15,
  paymentInstructions: "",
  termsAndConditions: "Payment is due within 15 days; all goods remain the property of the supplier until paid in full.",
  notes: "",
  status: "Draft",
  additionalCharges: {
    shipping: 0,
    delivery: 0,
    installation: 0,
    service: 0,
    other: 0,
  },
  items: DEFAULT_ITEMS,
};

const toCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const calculateLineTotal = (item) => {
  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const baseAmount = quantity * unitPrice;
  const discountValue = item.discountType === "percent"
    ? (baseAmount * (Number(item.discountValue || 0) / 100))
    : Number(item.discountValue || 0);
  const taxableAmount = Math.max(baseAmount - discountValue, 0);
  const taxAmount = taxableAmount * ((Number(item.taxPercentage || item.tax || 0) || 0) / 100);
  return taxableAmount + taxAmount;
};

const calculateTotals = (items, additionalCharges = {}) => {
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const lineBase = quantity * unitPrice;
    const discountValue = item.discountType === "percent"
      ? lineBase * (Number(item.discountValue || 0) / 100)
      : Number(item.discountValue || 0);
    return sum + Math.max(lineBase - discountValue, 0);
  }, 0);

  const taxTotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const base = quantity * unitPrice;
    const discountValue = item.discountType === "percent"
      ? base * (Number(item.discountValue || 0) / 100)
      : Number(item.discountValue || 0);
    const taxable = Math.max(base - discountValue, 0);
    return sum + taxable * ((Number(item.taxPercentage || item.tax || 0) || 0) / 100);
  }, 0);

  const additional = Object.values(additionalCharges || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  const discountTotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const base = quantity * unitPrice;
    const discountValue = item.discountType === "percent"
      ? base * (Number(item.discountValue || 0) / 100)
      : Number(item.discountValue || 0);
    return sum + Math.min(discountValue, base);
  }, 0);

  const grandTotal = subtotal + taxTotal + additional;

  return {
    subtotal,
    discount: discountTotal,
    tax: taxTotal,
    additionalCharges: additional,
    grandTotal,
  };
};

const buildBlankForm = () => ({
  ...DEFAULT_FORM,
  quotationNumber: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  items: [
    {
      id: Date.now(),
      name: "",
      description: "",
      quantity: 1,
      unit: "pcs",
      unitPrice: 0,
      discountType: "none",
      discountValue: 0,
      tax: 0,
      taxPercentage: 0,
      lineTotal: 0,
    },
  ],
});

export default function QuotationManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const quotationBasePath = currentPath.startsWith("/employee/quotations")
    ? "/employee/quotations"
    : "/quotations";
  const navigateToQuotationPath = (path = "") => navigate(`${quotationBasePath}${path}`);

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [form, setForm] = useState(buildBlankForm());

  const activeTab = useMemo(() => {
    if (currentPath.includes("/create")) return "create";
    if (currentPath.includes("/templates")) return "templates";
    if (currentPath.includes("/settings")) return "settings";
    if (currentPath === quotationBasePath || currentPath === `${quotationBasePath}/`) return "all";
    return "overview";
  }, [currentPath, quotationBasePath]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationApi.list();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Unable to load quotations.");
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const filteredQuotations = useMemo(() => {
    const query = search.toLowerCase();

    return quotations.filter((quotation) => {
      const matchesSearch = !query || [
        quotation.quotationNumber,
        quotation.customerName || quotation.customerDetails?.customerName,
        quotation.companyName || quotation.customerDetails?.companyName,
        quotation.email || quotation.customerDetails?.email,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || quotation.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [quotations, search, statusFilter, departmentFilter]);

  const stats = useMemo(() => {
    const total = quotations.length;
    const draft = quotations.filter((item) => item.status === "Draft").length;
    const pendingApproval = quotations.filter((item) => item.status === "Pending Approval").length;
    const approved = quotations.filter((item) => item.status === "Approved").length;
    const sent = quotations.filter((item) => item.status === "Sent").length;
    const accepted = quotations.filter((item) => item.status === "Accepted").length;
    const rejected = quotations.filter((item) => item.status === "Rejected").length;
    const expired = quotations.filter((item) => item.status === "Expired").length;

    const totalValue = quotations.reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);
    const acceptedValue = quotations
      .filter((item) => item.status === "Accepted")
      .reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);
    const pendingValue = quotations
      .filter((item) => ["Draft", "Pending Approval", "Approved", "Sent", "Viewed", "Negotiation"].includes(item.status))
      .reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);

    return {
      total,
      draft,
      pendingApproval,
      approved,
      sent,
      accepted,
      rejected,
      expired,
      totalValue,
      acceptedValue,
      pendingValue,
    };
  }, [quotations]);

  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const byMonth = monthNames.map((month) => {
      const amount = quotations
        .filter((item) => new Date(item.quotationDate || Date.now()).toLocaleString("en-US", { month: "short" }) === month)
        .reduce((sum, value) => sum + Number(value.grandTotal || 0), 0);
      return { month, value: amount };
    });

    const statusCounts = STATUS_OPTIONS.map((status) => ({
      name: status,
      value: quotations.filter((item) => item.status === status).length,
    })).filter((item) => item.value > 0);

    const acceptedRejected = [
      { name: "Accepted", value: quotations.filter((item) => item.status === "Accepted").length },
      { name: "Rejected", value: quotations.filter((item) => item.status === "Rejected").length },
    ];

    return { byMonth, statusCounts, acceptedRejected };
  }, [quotations]);

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const nextItem = { ...item, [field]: value };
        if (["quantity", "unitPrice", "discountValue", "taxPercentage", "tax"].includes(field)) {
          nextItem.lineTotal = calculateLineTotal(nextItem);
        }
        return nextItem;
      }),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now() + Math.random(),
          name: "",
          description: "",
          quantity: 1,
          unit: "pcs",
          unitPrice: 0,
          discountType: "none",
          discountValue: 0,
          tax: 0,
          taxPercentage: 0,
          lineTotal: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, itemIndex) => itemIndex !== index) : prev.items,
    }));
  };

  const handleSave = async () => {
    if (!form.customerName || !form.quotationDate || !form.validUntil || !form.items?.some((item) => item.name && item.name.trim())) {
      toast.error("Customer, quotation date, valid until, and at least one item are required.");
      return;
    }

    const totals = calculateTotals(form.items, form.additionalCharges);
    const payload = {
      ...form,
      companyDetails: {
        companyName: form.companyName || "Pearls IT Hub",
        email: form.email || "sales@pearlsit.com",
        phone: form.phone || "+0000000000",
      },
      customerDetails: {
        customerName: form.customerName,
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        billingAddress: form.billingAddress,
        shippingAddress: form.shippingAddress,
      },
      items: form.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        discountValue: Number(item.discountValue || 0),
        taxPercentage: Number(item.taxPercentage || item.tax || 0),
        lineTotal: calculateLineTotal(item),
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      additionalCharges: totals.additionalCharges,
      grandTotal: totals.grandTotal,
      status: form.status || "Draft",
    };

    try {
      let savedQuotation;
      if (selectedId) {
        savedQuotation = await quotationApi.update(selectedId, payload);
        toast.success("Quotation updated successfully.");
      } else {
        savedQuotation = await quotationApi.create(payload);
        toast.success("Quotation created successfully.");
      }

      await loadQuotations();
      setSelectedId(savedQuotation?._id || selectedId);
      navigateToQuotationPath();
    } catch (error) {
      toast.error(error.message || "Unable to save quotation.");
    }
  };

  const handleEdit = (quotation) => {
    setSelectedId(quotation._id || quotation.id);
    setForm({
      ...DEFAULT_FORM,
      ...quotation,
      currency: "INR",
      quotationDate: quotation.quotationDate ? new Date(quotation.quotationDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().slice(0, 10) : "",
      customerName: quotation.customerName || quotation.customerDetails?.customerName || "",
      companyName: quotation.companyName || quotation.customerDetails?.companyName || "",
      email: quotation.email || quotation.customerDetails?.email || "",
      phone: quotation.phone || quotation.customerDetails?.phone || "",
      billingAddress: quotation.billingAddress || quotation.customerDetails?.billingAddress || "",
      shippingAddress: quotation.shippingAddress || quotation.customerDetails?.shippingAddress || "",
      items: Array.isArray(quotation.items) && quotation.items.length > 0 ? quotation.items.map((item, index) => ({
        ...item,
        id: item._id || `${Date.now()}-${index}`,
      })) : buildBlankForm().items,
      additionalCharges: quotation.additionalCharges || DEFAULT_FORM.additionalCharges,
    });
    navigateToQuotationPath("/create");
  };

  const openQuotationDetails = (quotation) => {
    setSelectedQuotation(quotation);
  };

  const closeQuotationDetails = () => {
    setSelectedQuotation(null);
  };

  const handleDuplicate = async (quotation) => {
    try {
      const duplicated = await quotationApi.duplicate(quotation._id);
      await loadQuotations();
      toast.success(`Created duplicate for ${duplicated?.quotationNumber || "quotation"}.`);
    } catch (error) {
      toast.error(error.message || "Unable to duplicate quotation.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await quotationApi.remove(id);
      await loadQuotations();
      toast.success("Quotation deleted successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to delete quotation.");
    }
  };

  const tableColumns = [
    "Quotation Number",
    "Customer",
    "Company",
    "Date",
    "Valid Until",
    "Amount",
    "Status",
    "Approval",
    "Actions",
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Quotations", value: stats.total, icon: FileText, accent: "bg-blue-600" },
          { label: "Draft Quotations", value: stats.draft, icon: Pencil, accent: "bg-slate-600" },
          { label: "Pending Approval", value: stats.pendingApproval, icon: Filter, accent: "bg-amber-500" },
          { label: "Accepted Quotations", value: stats.accepted, icon: CheckCircle2, accent: "bg-emerald-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`${card.accent} flex h-12 w-12 items-center justify-center rounded-xl text-white`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Quotations by Month</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => toCurrency(value)} />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.statusCounts} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {chartData.statusCounts.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Quotations</h3>
          <div className="space-y-3">
            {quotations.slice(0, 5).map((item) => (
              <div key={item._id || item.quotationNumber} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-semibold text-slate-900">{item.quotationNumber}</p>
                  <p className="text-sm text-slate-500">{item.customerName || item.customerDetails?.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{toCurrency(item.grandTotal || 0)}</p>
                  <p className="text-xs text-slate-500">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => navigateToQuotationPath("/create")} className="flex w-full items-center justify-between rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white">
              <span>Create Quotation</span>
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={() => navigateToQuotationPath()} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              <span>View All Quotations</span>
              <FileText className="h-4 w-4" />
            </button>
            <button onClick={() => navigateToQuotationPath()} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              <span>Pending Approvals</span>
              <Filter className="h-4 w-4" />
            </button>
            <button onClick={() => navigateToQuotationPath("/templates")} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              <span>Quotation Templates</span>
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAll = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none ring-0 transition focus:border-blue-400"
            placeholder="Search quotation number, customer, company or email"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
           
          </select>

          <button onClick={() => navigateToQuotationPath("/create")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" />
            New Quotation
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {tableColumns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-4 py-10 text-center text-slate-500">Loading quotations...</td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-4 py-10 text-center text-slate-500">No quotations found.</td>
                </tr>
              ) : (
                            filteredQuotations.map((quotation) => (
                              <tr
                                key={quotation._id || quotation.quotationNumber}
                                className="cursor-pointer border-t border-slate-200 align-top transition hover:bg-slate-50"
                                onClick={() => openQuotationDetails(quotation)}
                              >
                                <td className="px-4 py-3 font-medium text-slate-900" onClick={(event) => { event.stopPropagation(); openQuotationDetails(quotation); }}>
                                  {quotation.quotationNumber}
                                </td>
                                <td className="px-4 py-3">{quotation.customerName || quotation.customerDetails?.customerName || "—"}</td>
                                <td className="px-4 py-3">{quotation.companyName || quotation.customerDetails?.companyName || "—"}</td>
                                <td className="px-4 py-3">{quotation.quotationDate ? new Date(quotation.quotationDate).toLocaleDateString() : "—"}</td>
                                <td className="px-4 py-3">{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "—"}</td>
                                <td className="px-4 py-3 font-semibold">{toCurrency(quotation.grandTotal || 0)}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{quotation.status || "Draft"}</span>
                                </td>
                                <td className="px-4 py-3">{quotation.approvalStatus || "Pending"}</td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                                    <button onClick={() => handleEdit(quotation)} className="rounded-lg border border-slate-200 p-1.5 hover:border-blue-500">
                                      <Pencil className="h-4 w-4 text-slate-700" />
                        </button>
                                    <button onClick={() => handleDuplicate(quotation)} className="rounded-lg border border-slate-200 p-1.5 hover:border-emerald-500">
                                      <FileText className="h-4 w-4 text-emerald-700" />
                        </button>
                                    <button onClick={() => toast("PDF generation placeholder", { icon: "ℹ️" })} className="rounded-lg border border-slate-200 p-1.5 hover:border-purple-500">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-purple-700"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17.5v.5h16v-.5" /></svg>
                        </button>
                                    <button onClick={() => toast("Send quotation flow ready", { icon: "📨" })} className="rounded-lg border border-slate-200 p-1.5 hover:border-blue-500">
                                      <Send className="h-4 w-4 text-blue-700" />
                                    </button>
                                    <button onClick={() => handleDelete(quotation._id)} className="rounded-lg border border-slate-200 p-1.5 hover:border-red-500">
                                      <Trash2 className="h-4 w-4 text-red-700" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreate = () => {
    const totals = calculateTotals(form.items, form.additionalCharges);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedId ? "Edit Quotation" : "Create Quotation"}</h2>
              <p className="text-sm text-slate-500">Manage customer, product details, pricing and approval workflow.</p>
            </div>
            <button onClick={handleSave} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              {selectedId ? "Update Quotation" : "Save Quotation"}
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Company Details</h3>
              <input value={form.companyName} onChange={(event) => updateFormField("companyName", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Company Name" />
              <input value={form.email} onChange={(event) => updateFormField("email", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Company Email" />
              <input value={form.phone} onChange={(event) => updateFormField("phone", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Company Phone" />
              <textarea value={form.termsAndConditions} onChange={(event) => updateFormField("termsAndConditions", event.target.value)} rows="4" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Terms & Conditions" />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Customer Details</h3>
              <input value={form.customerName} onChange={(event) => updateFormField("customerName", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Customer Name" />
              <input value={form.companyName} onChange={(event) => updateFormField("companyName", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Customer Company" />
              <input value={form.email} onChange={(event) => updateFormField("email", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Customer Email" />
              <input value={form.phone} onChange={(event) => updateFormField("phone", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Customer Phone" />
              <textarea value={form.billingAddress} onChange={(event) => updateFormField("billingAddress", event.target.value)} rows="2" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Billing Address" />
              <textarea value={form.shippingAddress} onChange={(event) => updateFormField("shippingAddress", event.target.value)} rows="2" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Shipping Address" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Quotation Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <input value={form.quotationNumber} onChange={(event) => updateFormField("quotationNumber", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Quotation Number" />
            <input type="date" value={form.quotationDate} onChange={(event) => updateFormField("quotationDate", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" />
            <input type="date" value={form.validUntil} onChange={(event) => updateFormField("validUntil", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" />
            <input value={form.salesPerson} onChange={(event) => updateFormField("salesPerson", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Sales Person" />
            <select value={form.department} onChange={(event) => updateFormField("department", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5">
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
            </select>
            <input value={form.referenceNumber} onChange={(event) => updateFormField("referenceNumber", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Reference Number" />
            <input value={form.relatedLead} onChange={(event) => updateFormField("relatedLead", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Related Lead" />
            <input value={form.relatedProject} onChange={(event) => updateFormField("relatedProject", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Related Project" />
            <input value={form.relatedDeal} onChange={(event) => updateFormField("relatedDeal", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Related Deal" />
            <input value={form.currency} onChange={(event) => updateFormField("currency", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Currency" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Quotation Items</h3>
            <button onClick={addItem} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-slate-600">
                  <th className="px-2 py-2">Product</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Unit</th>
                  <th className="px-2 py-2">Unit Price</th>
                  <th className="px-2 py-2">Discount</th>
                  <th className="px-2 py-2">Tax %</th>
                  <th className="px-2 py-2">Line Total</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => (
                  <tr key={item.id || index} className="rounded-xl bg-slate-50">
                    <td className="px-2 py-2"><input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2" placeholder="Item name" /></td>
                    <td className="px-2 py-2"><input value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2" placeholder="Description" /></td>
                    <td className="px-2 py-2"><input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, "quantity", Number(event.target.value))} className="w-20 rounded-lg border border-slate-200 px-2 py-2" /></td>
                    <td className="px-2 py-2"><input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} className="w-20 rounded-lg border border-slate-200 px-2 py-2" /></td>
                    <td className="px-2 py-2"><input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", Number(event.target.value))} className="w-28 rounded-lg border border-slate-200 px-2 py-2" /></td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <select value={item.discountType} onChange={(event) => updateItem(index, "discountType", event.target.value)} className="rounded-lg border border-slate-200 px-2 py-2">
                          <option value="none">None</option>
                          <option value="percent">%</option>
                          <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" min="0" value={item.discountValue} onChange={(event) => updateItem(index, "discountValue", Number(event.target.value))} className="w-20 rounded-lg border border-slate-200 px-2 py-2" />
                      </div>
                    </td>
                    <td className="px-2 py-2"><input type="number" min="0" value={item.taxPercentage} onChange={(event) => updateItem(index, "taxPercentage", Number(event.target.value))} className="w-20 rounded-lg border border-slate-200 px-2 py-2" /></td>
                    <td className="px-2 py-2 font-semibold">{toCurrency(calculateLineTotal(item))}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => removeItem(index)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Subtotal</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{toCurrency(totals.subtotal)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Discount</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{toCurrency(totals.discount)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Tax</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{toCurrency(totals.tax)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Additional Charges</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{toCurrency(totals.additionalCharges)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 lg:col-span-2">
              <p className="text-xs uppercase text-slate-500">Grand Total</p>
              <p className="mt-2 text-2xl font-bold text-blue-700">{toCurrency(totals.grandTotal)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Payment Details</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <input value={form.paymentTerms} onChange={(event) => updateFormField("paymentTerms", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Payment Terms" />
            <input value={form.paymentMethod} onChange={(event) => updateFormField("paymentMethod", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Payment Method" />
            <input type="number" value={form.advancePayment} onChange={(event) => updateFormField("advancePayment", Number(event.target.value))} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Advance Payment" />
            <input type="number" value={form.balancePayment} onChange={(event) => updateFormField("balancePayment", Number(event.target.value))} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Balance Payment" />
            <input type="number" value={form.paymentDueDays} onChange={(event) => updateFormField("paymentDueDays", Number(event.target.value))} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Payment Due Days" />
            <input value={form.paymentInstructions} onChange={(event) => updateFormField("paymentInstructions", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Payment Instructions" />
          </div>
        </div>
      </div>
    );
  };

  const renderTemplates = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Quotation Templates</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { name: "Standard Proposal", description: "General quotation for services and onboarding" },
          { name: "Product Quote", description: "Catalog and product-focused quote layout" },
          { name: "Maintenance Contract", description: "Support-based recurring revenue quotation" },
        ].map((template) => (
          <div key={template.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-lg font-semibold text-slate-900">{template.name}</p>
            <p className="mt-2 text-sm text-slate-600">{template.description}</p>
            <button onClick={() => navigateToQuotationPath("/create")} className="mt-4 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white">Use Template</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <h2 className="text-xl font-bold text-slate-900">Quotation Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Default Currency</p>
          <input defaultValue="INR" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Default Tax</p>
          <input defaultValue="5" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Approval Workflow</p>
          <input defaultValue="Manager / Admin Review" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Quotation Expiry Days</p>
          <input defaultValue="30" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </div>
      </div>
    </div>
  );

  const details = selectedQuotation
    ? {
        customerName: selectedQuotation.customerName || selectedQuotation.customerDetails?.customerName || "—",
        companyName: selectedQuotation.companyName || selectedQuotation.customerDetails?.companyName || "—",
        email: selectedQuotation.email || selectedQuotation.customerDetails?.email || "—",
        phone: selectedQuotation.phone || selectedQuotation.customerDetails?.phone || "—",
        quotationDate: selectedQuotation.quotationDate ? new Date(selectedQuotation.quotationDate).toLocaleDateString() : "—",
        validUntil: selectedQuotation.validUntil ? new Date(selectedQuotation.validUntil).toLocaleDateString() : "—",
        paymentTerms: selectedQuotation.paymentTerms || "—",
        status: selectedQuotation.status || "Draft",
        approvalStatus: selectedQuotation.approvalStatus || "Pending",
        grandTotal: selectedQuotation.grandTotal || 0,
        subtotal: selectedQuotation.subtotal || 0,
        tax: selectedQuotation.tax || 0,
        additionalCharges: selectedQuotation.additionalCharges || 0,
        discount: selectedQuotation.discount || 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Quotation Management</h1>
                <p className="text-sm text-slate-500">Sales and marketing quotation operations</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => navigateToQuotationPath(tab.key === "overview" || tab.key === "all" ? "" : `/${tab.key}`)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "all" && renderAll()}
        {activeTab === "create" && renderCreate()}
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "settings" && renderSettings()}

        {selectedQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.12em] text-blue-600">Quotation Details</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedQuotation.quotationNumber}</h3>
                </div>
                <button onClick={closeQuotationDetails} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:border-slate-300 hover:text-slate-700">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Customer</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{details.customerName}</p>
                  <p className="text-sm text-slate-600">{details.companyName}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Status</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{details.status}</span>
                    <span className="text-sm text-slate-500">Approval: {details.approvalStatus}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Contact</p>
                  <p className="mt-2 text-sm text-slate-700">Email: {details.email}</p>
                  <p className="text-sm text-slate-700">Phone: {details.phone}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Validity</p>
                  <p className="mt-2 text-sm text-slate-700">Issued: {details.quotationDate}</p>
                  <p className="text-sm text-slate-700">Valid Until: {details.validUntil}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-900">Line Items</h4>
                  <p className="text-sm text-slate-500">Payment Terms: {details.paymentTerms}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Item</th>
                        <th className="px-3 py-2 font-semibold">Qty</th>
                        <th className="px-3 py-2 font-semibold">Unit Price</th>
                        <th className="px-3 py-2 font-semibold">Tax</th>
                        <th className="px-3 py-2 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedQuotation.items || []).map((item, index) => (
                        <tr key={item._id || item.id || `${item.name}-${index}`} className="border-t border-slate-200">
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-900">{item.name || "Unnamed item"}</p>
                            <p className="text-xs text-slate-500">{item.description || "No description"}</p>
                          </td>
                          <td className="px-3 py-2">{item.quantity || 0}</td>
                          <td className="px-3 py-2">{toCurrency(item.unitPrice || 0)}</td>
                          <td className="px-3 py-2">{Number(item.taxPercentage || item.tax || 0)}%</td>
                          <td className="px-3 py-2 font-semibold">{toCurrency(item.lineTotal || calculateLineTotal(item))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Notes</p>
                  <p className="mt-2 text-sm text-slate-600">{selectedQuotation.notes || "No notes provided."}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex justify-between"><span>Subtotal</span><span>{toCurrency(details.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Discount</span><span>-{toCurrency(details.discount)}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>{toCurrency(details.tax)}</span></div>
                    <div className="flex justify-between"><span>Additional Charges</span><span>{toCurrency(details.additionalCharges)}</span></div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900"><span>Total</span><span>{toCurrency(details.grandTotal)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
