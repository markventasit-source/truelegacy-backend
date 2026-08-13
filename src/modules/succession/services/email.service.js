const axios = require("axios");

const send_succession_email = async ({ email, name, pdf_url }) => {
    try {

        const pdf_response = await axios.get(pdf_url, {
            responseType: "arraybuffer",
            timeout: 10000
        });
        const pdf_base64 = Buffer.from(pdf_response.data).toString("base64");

        const payload = {
            from: {
                address: process.env.ZEPTO_FROM_EMAIL,
                name: "True Legacy"
            },

            to: [
                {
                    email_address: {
                        address: email,
                        name: name
                    }
                }
            ],

            subject: "Your Customised Succession Report",

            htmlbody: `
        <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.6; color:#333; max-width:600px;">
          <p><b>Dear ${name || "User"},</b></p>

          <p>Thank you for using our Succession Tool.</p>

          <p>
          Your customised Succession Report is now ready. It explains how your legal heirs would be determined under the applicable Succession Law if there is no Will or succession plan in place.
          </p>

          <p><b>Download your report:</b></p>

          <p>
            <a href="${pdf_url}"
              style="background:#2d6cdf;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">
              Download Now
            </a>
          </p>

          <p>
          Please review the report and feel free to reach out if you would like assistance in structuring your estate plan.
          </p>

          <br/>

          <p>
          Best regards,<br/>
          <b>True Legacy</b>
          </p>

        </div>
      `,
            attachments: [
                {
                    name: "Succession_Report.pdf",
                    mime_type: "application/pdf",
                    content: pdf_base64
                }
            ]
        };

        const response = await axios.post(
            process.env.ZEPTO_API_URL,
            payload,
            {
                headers: {
                    Authorization: process.env.ZEPTO_TOKEN,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to send email"
        );
    }
};

module.exports = {
    send_succession_email
};