const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const cloudinary = require("../cloudinary");

const documentTypes = new Set(["resume", "panCard", "aadhaarCard", "certificates", "experience"]);

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || "", lastName: parts.join(" ") };
};

const serializeUser = (user) => {
  const fallback = splitName(user.name);
  return {
    _id: user._id,
    id: user._id,
    firstName: user.firstName || fallback.firstName,
    lastName: user.lastName || fallback.lastName,
    name: user.name,
    email: user.email,
    role: user.role,
    industry: user.industry,
    avatar: user.avatar,
    profile: user.profile || {},
  };
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, user: serializeUser(user) });
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const {
      firstName, lastName, email, dob, gender, phone, emergencyNo, empId, address,
      designation, department, joiningDate, reportingManager, workLocation,
      description,
      bankDetails,
    } = req.body;
    const isBankOnlyUpdate = bankDetails && typeof bankDetails === "object" && !firstName && !email;
    if (isBankOnlyUpdate) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { "profile.bankDetails": {
          accountHolderName: String(bankDetails.accountHolderName || "").trim(),
          accountNumber: String(bankDetails.accountNumber || "").trim(),
          bankName: String(bankDetails.bankName || "").trim(),
          branchName: String(bankDetails.branchName || "").trim(),
          ifscCode: String(bankDetails.ifscCode || "").trim(),
          accountType: String(bankDetails.accountType || "").trim(),
        } } },
        { new: true, runValidators: true }
      ).select("-password");
      return res.json({ success: true, message: "Bank details updated successfully", user: serializeUser(updatedUser) });
    }
    if (!String(firstName || "").trim() || !String(email || "").trim()) {
      return res.status(422).json({ success: false, message: "First name and email are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(422).json({ success: false, message: "Please provide a valid email" });
    }
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existing) return res.status(409).json({ success: false, message: "This email is already registered" });

    const updates = {
      firstName: String(firstName).trim(),
      lastName: String(lastName || "").trim(),
      name: [String(firstName).trim(), String(lastName || "").trim()].filter(Boolean).join(" "),
      email: normalizedEmail,
      "profile.dob": dob || null,
      "profile.gender": gender || "",
      "profile.phone": String(phone || "").trim(),
      "profile.emergencyNo": String(emergencyNo || "").trim(),
      "profile.empId": String(empId || "").trim(),
      "profile.address": String(address || "").trim(),
      "profile.description": String(description || "").trim(),
      "profile.designation": String(designation || "").trim(),
      "profile.department": String(department || "").trim(),
      "profile.joiningDate": joiningDate || null,
      "profile.reportingManager": String(reportingManager || "").trim(),
      "profile.workLocation": String(workLocation || "").trim(),
    };
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    return res.json({ success: true, message: "Profile updated successfully", user: serializeUser(updatedUser) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "This email is already registered" });
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(422).json({ success: false, message: "Please check the profile details and dates" });
    }
    console.error("Profile update error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save profile right now" });
  }
};

const updateDescription = async (req, res) => {
  try {
    const description = String(req.body.description || "").trim();
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { "profile.description": description } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, message: "Description updated successfully", user: serializeUser(user) });
  } catch (error) {
    console.error("Description update error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update description" });
  }
};

const uploadToCloudinary = (file) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder: "crm_profiles", resource_type: "auto" }, (error, result) => {
    if (error || !result?.secure_url) return reject(error || new Error("Cloudinary upload failed"));
    resolve(result);
  });
  stream.end(file.buffer);
});

const saveLocally = (req, file) => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return { secure_url: `${req.protocol}://${req.get("host")}/uploads/${filename}`, public_id: "" };
};

const removeCloudinaryFile = async (document) => {
  if (document?.publicId) {
    try { await cloudinary.uploader.destroy(document.publicId, { resource_type: "raw" }); } catch (error) { console.error("Profile document cleanup failed:", error.message); }
  }
};

const uploadDocument = async (req, res) => {
  const { documentType } = req.body;
  if (!documentTypes.has(documentType) || !req.file) return res.status(422).json({ success: false, message: "Document type and file are required" });
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const previous = user.profile?.documents?.[documentType];
  let uploaded;
  try { uploaded = await uploadToCloudinary(req.file); } catch (error) { uploaded = saveLocally(req, req.file); }
  await removeCloudinaryFile(previous);
  user.profile = user.profile || {};
  user.profile.documents = user.profile.documents || {};
  user.profile.documents[documentType] = { fileName: req.file.originalname, fileUrl: uploaded.secure_url, publicId: uploaded.public_id || "" };
  await user.save();
  return res.json({ success: true, message: "Document uploaded successfully", document: user.profile.documents[documentType] });
};

const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(422).json({ success: false, message: "Avatar image is required" });
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(422).json({ success: false, message: "Avatar must be an image" });
  }
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  let uploaded;
  try {
    uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "crm_profile_avatars", resource_type: "image" }, (error, result) => {
        if (error || !result?.secure_url) return reject(error || new Error("Avatar upload failed"));
        resolve(result);
      });
      stream.end(req.file.buffer);
    });
  } catch (error) {
    uploaded = saveLocally(req, req.file);
  }

  user.avatar = uploaded.secure_url;
  await user.save();
  return res.json({ success: true, message: "Avatar updated successfully", avatar: user.avatar });
};

const deleteDocument = async (req, res) => {
  const { documentType } = req.params;
  if (!documentTypes.has(documentType)) return res.status(422).json({ success: false, message: "Invalid document type" });
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const document = user.profile?.documents?.[documentType];
  if (document) await removeCloudinaryFile(document);
  if (user.profile?.documents) user.profile.documents[documentType] = undefined;
  await user.save();
  return res.json({ success: true, message: "Document deleted successfully" });
};

module.exports = { getProfile, updateProfile, updateDescription, uploadDocument, uploadAvatar, deleteDocument };