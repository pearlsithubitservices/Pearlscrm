const mongoose = require("mongoose");

const quotationItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unit: { type: String, trim: true, default: "pcs" },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    discountType: { type: String, enum: ["none", "percent", "fixed"], default: "none" },
    discountValue: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    taxPercentage: { type: Number, min: 0, default: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: true },
);

const quotationActivitySchema = new mongoose.Schema(
  {
    user: { type: String, trim: true },
    action: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    remarks: { type: String, trim: true },
  },
  { _id: true },
);

const quotationVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    createdBy: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    revisionReason: { type: String, trim: true },
  },
  { _id: true },
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: "Sales",
    },
    salesPerson: {
      type: String,
      trim: true,
      default: "",
    },
    quotationDate: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    companyDetails: {
      companyName: { type: String, trim: true, default: "Pearls IT Hub" },
      logo: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
      taxNumber: { type: String, trim: true, default: "" },
    },
    customerDetails: {
      customerName: { type: String, trim: true, default: "" },
      companyName: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      billingAddress: { type: String, trim: true, default: "" },
      shippingAddress: { type: String, trim: true, default: "" },
    },
    items: [quotationItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    additionalCharges: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    paymentTerms: { type: String, trim: true, default: "" },
    paymentMethod: { type: String, trim: true, default: "" },
    advancePayment: { type: Number, default: 0 },
    balancePayment: { type: Number, default: 0 },
    paymentDueDays: { type: Number, default: 0 },
    paymentInstructions: { type: String, trim: true, default: "" },
    deliveryTerms: { type: String, trim: true, default: "" },
    warranty: { type: String, trim: true, default: "" },
    termsAndConditions: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: [
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
      ],
      default: "Draft",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    submittedAt: { type: Date },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: "" },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    acceptedAt: { type: Date },
    customerComments: { type: String, trim: true, default: "" },
    convertedTo: {
      type: String,
      trim: true,
      default: "",
    },
    versionHistory: [quotationVersionSchema],
    activityHistory: [quotationActivitySchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

quotationSchema.index({ quotationNumber: 1 }, { unique: true });
quotationSchema.index({ client: 1, status: 1, approvalStatus: 1, department: 1, quotationDate: 1 });

module.exports = mongoose.model("Quotation", quotationSchema);
