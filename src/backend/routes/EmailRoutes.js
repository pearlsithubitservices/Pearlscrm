const express = require('express');
const { sendEmail } = require("../utils/Email");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, name, role } = req.body;


        await sendEmail({
            to: email,
            subject: "CRM Login Alert",
            html: `
        <h2>Hello ${name},</h2>

        <p>Your CRM account has been logged in successfully.</p>

        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>

        <br/>

        <p>If this wasn't you, please reset your password immediately.</p>
      `,
        });

        res.json({
            success: true,
            message: "Login email sent",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

//Send Invite Link

router.post("/invite", async (req, res) => {
    try {
        console.log("Invite Request:", req.body);

        const { id, name, email, role, origin } = req.body;

        const baseUrl = (origin || req.headers.origin || process.env.FRONTEND_URL || "https://pearlscrm.vercel.app").replace(/\/$/, '');
        const inviteLink = `${baseUrl}/accept-invite/${id}`;

        await sendEmail({
            to: email,
            subject: "You're invited to Pearls CRM",
            html: `
                <h2>Hello ${name || 'Team Member'}</h2>
                <p>You have been invited to Pearls CRM as an employee.</p>
                <p>Click the link below to set up your account and password:</p>
                <p><a href="${inviteLink}" style="display:inline-block;padding:10px 20px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Accept Invitation</a></p>
                <p style="color:#666;font-size:12px;">Or copy and paste this link: ${inviteLink}</p>
            `,
        });

        console.log("Invitation email sent to:", email);

        res.json({ success: true, inviteLink });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/welcome", async (req, res) => {
    try {
        console.log("Email route called");
        const { email, name, role } = req.body;
        console.log(req.body);
        await sendEmail({
            to: email,
            subject: "Welcome to CRM 🚀",
            html: `
        <h2>Hi ${name}</h2>
        <p>Your employee account is created in CRM.</p>
        <p><b>Role:</b> ${role}</p>
      `,
        });

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;