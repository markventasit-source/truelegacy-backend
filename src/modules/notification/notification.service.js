require("dotenv").config();
const axios = require("axios");
const { NODE_MAIL, NODE_PASS } = process.env;
const nodemailer = require("nodemailer");
const User = require("../user/user.model");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getMimeType(url) {
  try {
    const response = await axios.head(url);
    return response.headers["content-type"];
  } catch (err) {
    console.warn(`Could not detect MIME type for ${url}:`, err.message);
    return null;
  }
}

function getExtensionFromMime(mime) {
  if (!mime) return "";
  if (mime === "application/pdf") return ".pdf";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  return "";
}

const handle_email_notification = async (users, body) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: NODE_MAIL,
      pass: NODE_PASS,
    },
  });

  const { image, link } = body;
  const attachments = [];
  if (image) {
    const mimeType = await getMimeType(image);
    const ext = getExtensionFromMime(mimeType);
    const baseName = new URL(image).pathname.split("/").pop() || "file";
    const filename = baseName.includes(".") ? baseName : `${baseName}${ext}`;

    attachments.push({
      filename: decodeURIComponent(filename),
      path: image,
    });
  }
  const formatted_content = format_email_content(body.content);
  const html = `
  <html>
    <head>
      <style>
        .logo { max-height: 60px; }
        body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 0; margin: 0; }
        .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: 30px auto; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .footer { font-size: 12px; color: #888; margin-top: 30px; text-align: center; }
        .cta-button {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center;">
          <img src="https://api.ipaconnect.org/public/logo.jpg" alt="Logo" class="logo" />
        </div>
        <h2 style="text-align: center; margin-top: 20px;">${body.subject}</h2>
         ${formatted_content}
        ${
          link
            ? `<div style="text-align: center;"><a href="${link}" class="cta-button">View More</a></div>`
            : ""
        }
        <div class="footer">&copy; ${new Date().getFullYear()} True Legacy. All rights reserved.</div>
      </div>
    </body>
  </html>
`;

  const query = {
    _id: { $in: users.map((u) => u) },
    email: { $exists: true, $ne: null },
  };

  try {
    const user_docs = await User.find(query).select("email");
    const sendResults = [];

    for (const user of user_docs) {
      const mail_options = {
        from: NODE_MAIL,
        to: user.email,
        subject: body.subject,
        html,
        attachments,
      };

      let attempts = 0;
      let sent = false;

      while (attempts < 3 && !sent) {
        try {
          const result = await transporter.sendMail(mail_options);
          sendResults.push(result);
          sent = true;
        } catch (error) {
          attempts++;
          console.error(
            `Attempt ${attempts} failed for ${user.email}:`,
            error.message
          );

          if (
            error.message.includes("421-4.3.0") ||
            error.message.includes("Temporary System Problem")
          ) {
            await delay(3000); //! wait 3 seconds before retrying
          } else {
            throw error;
          }
        }
      }
      //! Small delay between emails to avoid rate limit
      await delay(200);
    }

    console.log("Email notifications sent", sendResults);
    return {
      success: true,
      message: "Email notifications sent",
    };
  } catch (error) {
    throw new Error(`Email notification failed: ${error.message}`);
  }
};

function format_email_content(content) {
  const is_HTML = /<\/?[a-z][\s\S]*>/i.test(content);
  if (is_HTML) {
    return content;
  } else {
    const escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
  }
}

module.exports = {
  handle_email_notification,
};
