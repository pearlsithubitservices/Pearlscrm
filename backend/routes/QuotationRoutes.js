const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Quotation = require("../models/Quotation");

router.use(protect);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calculateQuotationTotals = (items = [], additionalCharges = 0) => {
  const subtotal = (items || []).reduce((sum, item) => {
    const quantity = toNumber(item.quantity, 0);
    const unitPrice = toNumber(item.unitPrice, 0);
    const base = quantity * unitPrice;
    const discountValue = item.discountType === "percent"
      ? base * (toNumber(item.discountValue, 0) / 100)
      : toNumber(item.discountValue, 0);
    return sum + Math.max(base - discountValue, 0);
  }, 0);

  const discount = (items || []).reduce((sum, item) => {
    const quantity = toNumber(item.quantity, 0);
    const unitPrice = toNumber(item.unitPrice, 0);
    const base = quantity * unitPrice;
    const discountValue = item.discountType === "percent"
      ? base * (toNumber(item.discountValue, 0) / 100)
      : toNumber(item.discountValue, 0);
    return sum + Math.min(discountValue, base);
  }, 0);

  const tax = (items || []).reduce((sum, item) => {
    const quantity = toNumber(item.quantity, 0);
    const unitPrice = toNumber(item.unitPrice, 0);
    const base = quantity * unitPrice;
    const discountValue = item.discountType === "percent"
      ? base * (toNumber(item.discountValue, 0) / 100)
      : toNumber(item.discountValue, 0);
    const taxable = Math.max(base - discountValue, 0);
    const taxPercentage = toNumber(item.taxPercentage || item.tax, 0);
    return sum + taxable * (taxPercentage / 100);
  }, 0);

  const additional = toNumber(additionalCharges, 0);
  const grandTotal = subtotal + tax + additional;

  return { subtotal, discount, tax, additionalCharges: additional, grandTotal };
};

const nextQuotationNumber = async () => {
  const count = await Quotation.countDocuments();
  const nextIndex = count + 1;
  const year = new Date().getFullYear();
  return `QT-${year}-${String(nextIndex).padStart(4, "0")}`;
};

router.get("/", async (req, res) => {
  try {
    const { status, department, customer } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (department && department !== "all") {
      query.department = department;
    }

    if (customer) {
      const search = customer.trim();
      query.$or = [
        { quotationNumber: { $regex: search, $options: "i" } },
        { "customerDetails.customerName": { $regex: search, $options: "i" } },
        { "customerDetails.companyName": { $regex: search, $options: "i" } },
        { "customerDetails.email": { $regex: search, $options: "i" } },
      ];
    }

    const quotations = await Quotation.find(query).sort({ quotationDate: -1, createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch quotations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(400).json({ success: false, message: "Invalid quotation ID" });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.customerName && !payload.customerDetails?.customerName) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }

    if (!payload.quotationDate) {
      return res.status(400).json({ success: false, message: "Quotation date is required" });
    }

    if (!payload.validUntil) {
      return res.status(400).json({ success: false, message: "Valid until date is required" });
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one quotation item is required" });
    }

    const totals = calculateQuotationTotals(payload.items, payload.additionalCharges || 0);
    const quotationNumber = payload.quotationNumber || (await nextQuotationNumber());

    const quotation = await Quotation.create({
      ...payload,
      quotationNumber,
      customerDetails: payload.customerDetails || {
        customerName: payload.customerName || "",
        companyName: payload.companyName || "",
        email: payload.email || "",
        phone: payload.phone || "",
        billingAddress: payload.billingAddress || "",
        shippingAddress: payload.shippingAddress || "",
      },
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      additionalCharges: totals.additionalCharges,
      grandTotal: totals.grandTotal,
      activityHistory: [
        {
          user: req.user?.name || "System",
          action: "Created",
          remarks: "Quotation created",
        },
      ],
    });

    res.status(201).json(quotation);
  } catch (error) {
    console.error("Error creating quotation:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate quotation number" });
    }

    res.status(500).json({ success: false, message: "Failed to create quotation" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const existing = await Quotation.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    const totals = calculateQuotationTotals(payload.items || existing.items || [], payload.additionalCharges ?? existing.additionalCharges ?? 0);
    const updated = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        ...payload,
        customerDetails: payload.customerDetails || existing.customerDetails || {},
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        additionalCharges: totals.additionalCharges,
        grandTotal: totals.grandTotal,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    res.json(updated);
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(400).json({ success: false, message: "Failed to update quotation" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(400).json({ success: false, message: "Failed to delete quotation" });
  }
});

router.post("/:id/submit", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    quotation.status = "Pending Approval";
    quotation.approvalStatus = "Pending";
    quotation.submittedBy = req.user._id || req.user.id;
    quotation.submittedAt = new Date();
    quotation.activityHistory.push({
      user: req.user?.name || "System",
      action: "Submitted",
      remarks: "Quotation submitted for approval",
    });

    await quotation.save();
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Error submitting quotation:", error);
    res.status(500).json({ success: false, message: "Failed to submit quotation" });
  }
});

router.post("/:id/approve", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    quotation.status = "Approved";
    quotation.approvalStatus = "Approved";
    quotation.approvedBy = req.user._id || req.user.id;
    quotation.approvedAt = new Date();
    quotation.activityHistory.push({
      user: req.user?.name || "System",
      action: "Approved",
      remarks: req.body?.remarks || "Quotation approved",
    });

    await quotation.save();
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Error approving quotation:", error);
    res.status(500).json({ success: false, message: "Failed to approve quotation" });
  }
});

router.post("/:id/reject", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    quotation.status = "Rejected";
    quotation.approvalStatus = "Rejected";
    quotation.rejectedBy = req.user._id || req.user.id;
    quotation.rejectedAt = new Date();
    quotation.rejectionReason = req.body?.reason || "Rejected by approval team";
    quotation.activityHistory.push({
      user: req.user?.name || "System",
      action: "Rejected",
      remarks: quotation.rejectionReason,
    });

    await quotation.save();
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Error rejecting quotation:", error);
    res.status(500).json({ success: false, message: "Failed to reject quotation" });
  }
});

router.post("/:id/send", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    quotation.status = "Sent";
    quotation.sentAt = new Date();
    quotation.activityHistory.push({
      user: req.user?.name || "System",
      action: "Sent",
      remarks: "Quotation email sent to customer",
    });

    await quotation.save();
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Error sending quotation:", error);
    res.status(500).json({ success: false, message: "Failed to send quotation" });
  }
});

router.post("/:id/accept", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    quotation.status = "Accepted";
    quotation.acceptedAt = new Date();
    quotation.activityHistory.push({
      user: req.user?.name || "System",
      action: "Accepted",
      remarks: req.body?.remarks || "Customer accepted quotation",
    });

    await quotation.save();
    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Error accepting quotation:", error);
    res.status(500).json({ success: false, message: "Failed to accept quotation" });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const source = await Quotation.findById(req.params.id);

    if (!source) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    const clone = source.toObject();
    delete clone._id;
    delete clone.__v;
    clone.quotationNumber = `${source.quotationNumber}-COPY`;
    clone.status = "Draft";
    clone.approvalStatus = "Pending";
    clone.submittedBy = null;
    clone.submittedAt = null;
    clone.approvedBy = null;
    clone.approvedAt = null;
    clone.rejectedBy = null;
    clone.rejectedAt = null;
    clone.sentAt = null;
    clone.acceptedAt = null;
    clone.activityHistory = [{
      user: req.user?.name || "System",
      action: "Duplicated",
      remarks: "Quotation duplicated from original record",
    }];

    const duplicated = await Quotation.create(clone);
    res.status(201).json(duplicated);
  } catch (error) {
    console.error("Error duplicating quotation:", error);
    res.status(500).json({ success: false, message: "Failed to duplicate quotation" });
  }
});

router.get("/:id/history", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json({ success: true, history: quotation.activityHistory || [] });
  } catch (error) {
    console.error("Error fetching quotation history:", error);
    res.status(400).json({ success: false, message: "Failed to fetch quotation history" });
  }
});

module.exports = router;
