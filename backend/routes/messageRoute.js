const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../cloudinary");

const Message = require("../models/Message/message");
const Chat = require("../models/Chat/Chat");
const User = require("../models/User");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");
const mongoose = require("mongoose");

// Figure out whether a chat participant id represents the Admin or a specific Employee
async function resolveRecipientChannel(participantId) {
  if (!participantId || participantId === "admin") {
    return { employeeId: null }; // Admin's notification center
  }

  if (mongoose.Types.ObjectId.isValid(participantId)) {
    try {
      const account = await User.findById(participantId).select("role");
      if (account && account.role === "Admin") {
        return { employeeId: null };
      }
    } catch (err) {
      // ignore lookup errors, fall back to treating as an employee below
    }
  }

  return { employeeId: String(participantId) };
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// UPLOAD ATTACHMENTS TO CLOUDINARY (WITH LOCAL BACKUP FALLBACK)
// Usage: POST /api/messages/upload
router.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve) => {
        let isResolved = false;

        const safeResolve = (data) => {
          if (!isResolved) {
            isResolved = true;
            resolve(data);
          }
        };

        // Fallback function to save locally
        const saveLocally = () => {
          try {
            const uploadsDir = path.join(__dirname, "..", "uploads");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = Date.now() + "_" + (file.originalname || "file").replace(/\s+/g, "_");
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, file.buffer);

            const host = req.get("host") || "localhost:5000";
            const protocol = req.protocol || "http";
            const fileUrl = `${protocol}://${host}/uploads/${filename}`;

            safeResolve({
              name: file.originalname,
              size: (file.size / 1024).toFixed(1) + " KB",
              type: file.mimetype,
              url: fileUrl,
            });
          } catch (err) {
            console.error("Local save fallback error:", err);
            safeResolve({
              name: file.originalname,
              size: (file.size / 1024).toFixed(1) + " KB",
              type: file.mimetype,
              url: "",
            });
          }
        };

        // Set a 5-second max timeout for Cloudinary response
        const timeoutId = setTimeout(() => {
          console.warn("Cloudinary upload timed out. Falling back to local storage.");
          saveLocally();
        }, 5000);

        try {
          const isImage = file.mimetype && file.mimetype.startsWith("image/");

          const uploadOptions = {
            folder: "crm_chat_attachments",
            resource_type: isImage ? "image" : "raw",
          };

          const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              clearTimeout(timeoutId);
              if (!error && result && result.secure_url) {
                safeResolve({
                  name: file.originalname,
                  size: (file.size / 1024).toFixed(1) + " KB",
                  type: file.mimetype,
                  url: result.secure_url,
                  public_id: result.public_id,
                });
              } else {
                saveLocally();
              }
            }
          );
          stream.end(file.buffer);
        } catch (streamErr) {
          clearTimeout(timeoutId);
          saveLocally();
        }
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }
});

// GET ALL MESSAGES FOR A CHAT
// Usage: GET /api/messages/:chatId
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// SEND A NEW MESSAGE
// Usage: POST /api/messages/:chatId
router.post("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text, attachments } = req.body;

    if (!senderId || (!text && (!attachments || attachments.length === 0))) {
      return res.status(400).json({
        success: false,
        message: "senderId and either text or attachments are required",
      });
    }

    const message = await Message.create({
      chatId,
      senderId,
      text: text || "",
      attachments: attachments || [],
      readBy: [senderId],
    });

    // Keep parent chat preview updated if valid ObjectId
    let chatDoc = null;
    if (mongoose.Types.ObjectId.isValid(chatId)) {
      chatDoc = await Chat.findByIdAndUpdate(chatId, {
        lastMessage: text && text.length > 0 ? text : "Sent an attachment",
        lastMessageAt: message.createdAt,
      });
    }

    // Emit live message globally and to room for instant sync
    try {
      const io = getIO();
      io.to(chatId.toString()).emit("newMessage", message);
      io.emit("newMessage", message);
      io.emit("chatUpdated", {
        chatId,
        lastMessage: text && text.length > 0 ? text : "Sent an attachment",
        lastMessageAt: message.createdAt,
      });

      // Notify every other participant of this chat (Admin -> Employee, Employee -> Admin,
      // or group/collab members), not just a single global alert.
      const recipients = (chatDoc?.participants || []).filter(
        (p) => String(p) !== String(senderId)
      );

      for (const recipient of recipients) {
        const { employeeId } = await resolveRecipientChannel(recipient);

        const notif = await Notification.create({
          title: chatDoc?.isGroup
            ? `New message in ${chatDoc.chatName || "group chat"}`
            : "New message",
          sub: text && text.length > 0 ? text : "Sent an attachment",
          notificationType: "General",
          employeeId,
          senderId,
        });

        if (employeeId) {
          io.to(`user_${employeeId}`).emit("newNotification", notif);
          io.to(String(employeeId)).emit("newNotification", notif);
        } else {
          io.emit("newNotification", notif);
        }
      }
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// EDIT A MESSAGE
// Usage: PUT /api/messages/:chatId/:messageId
router.put("/:chatId/:messageId", async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Updated text is required",
      });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { text: text.trim(), isEdited: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Emit live message update event
    try {
      const io = getIO();
      io.to(chatId.toString()).emit("messageEdited", message);
      io.emit("messageEdited", message);
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE A MESSAGE ("Delete for everyone")
// Usage: DELETE /api/messages/:chatId/:messageId
router.delete("/:chatId/:messageId", async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Emit live message deletion event
    try {
      const io = getIO();
      io.to(chatId.toString()).emit("messageDeleted", {
        messageId,
        chatId,
      });
      io.emit("messageDeleted", {
        messageId,
        chatId,
      });
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;