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

// ============================================================
// E-SIGNATURE INVITATION ROUTE
// ============================================================
router.post("/esign-invite", async (req, res) => {
    try {
        const {
            signers,
            email,
            name,
            docName = "Document",
            docId = "",
            signUrl,
            senderName = "Pearls IT Hub Team",
            message = "",
            origin = "",
        } = req.body;

        // Normalize signers list
        let signerList = [];
        if (Array.isArray(signers) && signers.length > 0) {
            signerList = signers.filter((s) => s && s.email && s.email.trim());
        } else if (email && email.trim()) {
            signerList = [{ name: name || "Signer", email: email.trim() }];
        }

        if (signerList.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid signer email address provided",
            });
        }

        const baseUrl = (origin || req.headers.origin || process.env.FRONTEND_URL || "https://pearlscrm.vercel.app").replace(/\/$/, "");
        const results = [];

        for (const signer of signerList) {
            const recipientEmail = signer.email.trim();
            const recipientName = signer.name ? signer.name.trim() : "Valued Signer";
            
            // Build the signing URL, strictly ensuring docId is present if provided
            let targetSignUrl = signUrl;
            if (docId) {
                if (!targetSignUrl || !targetSignUrl.includes(docId)) {
                    targetSignUrl = `${baseUrl}/e-signatures/editor/${docId}?mode=signer`;
                }
            } else if (!targetSignUrl) {
                targetSignUrl = `${baseUrl}/e-signatures/editor?mode=signer`;
            }

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signature Request: ${docName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0b2b57; padding: 28px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">
                      PEARLS IT HUB
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      E-Signature & Document Management
                    </p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                      Action Required
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 600;">
                Signature Requested
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                Hello <strong>${recipientName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                <strong>${senderName}</strong> has sent you a document for electronic signature on Pearls CRM.
              </p>

              <!-- Document Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                      Document Name
                    </div>
                    <div style="font-size: 15px; color: #0f172a; font-weight: 700;">
                      📄 ${docName}
                    </div>
                    ${
                      message
                        ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #475569; font-style: italic;">
                            "${message}"
                           </div>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${targetSignUrl}" target="_blank" style="display: inline-block; background-color: #175ea8; color: #ffffff; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 8px rgba(23, 94, 168, 0.35);">
                      Review & Sign Document ✍️
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                If the button above does not work, please copy and paste the following URL into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 11px; color: #2563eb; word-break: break-all; background-color: #eff6ff; padding: 8px 12px; border-radius: 6px;">
                <a href="${targetSignUrl}" style="color: #2563eb; text-decoration: none;">${targetSignUrl}</a>
              </p>

              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

              <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                🔒 This is an automated email from Pearls CRM E-Signature service. Electronic signatures generated through Pearls CRM comply with electronic consent standards.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Pearls IT Hub Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
            `;

            try {
                const info = await sendEmail({
                    to: recipientEmail,
                    subject: `Signature Request: ${docName}`,
                    html: htmlContent,
                });
                results.push({ email: recipientEmail, status: "sent", info });
            } catch (sendErr) {
                console.error(`Failed to send email to ${recipientEmail}:`, sendErr.message);
                results.push({ email: recipientEmail, status: "error", error: sendErr.message });
            }
        }

        const sentCount = results.filter((r) => r.status === "sent").length;

        res.json({
            success: sentCount > 0,
            count: sentCount,
            total: signerList.length,
            results,
            message:
                sentCount === signerList.length
                    ? `Signature invitation sent successfully to ${sentCount} recipient(s)`
                    : `Sent ${sentCount} of ${signerList.length} invitations`,
        });
    } catch (err) {
        console.error("Error in /api/email/esign-invite:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;