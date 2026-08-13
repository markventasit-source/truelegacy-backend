const axios = require("axios");

const send_succession_pdf = async ({ mobile, file_url, user_name }) => {
  try {
    await axios.post(
      "https://backend.api-wa.co/campaign/chatico/api/v2",
      {
        apiKey: process.env.CHATICO_API_KEY,
        campaignName: "truelegacy_report_campaign",
        destination: mobile,
        userName: user_name || "User",
        media: {
          url: file_url,
          filename: "TrueLegacy_Succession_Report.pdf",
        },
      },
      {
        timeout: 15000,
      }
    );

  } catch (error) {
    console.error("WHATSAPP ERROR:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to send WhatsApp message"
    );
  }
};

module.exports = {
  send_succession_pdf,
};