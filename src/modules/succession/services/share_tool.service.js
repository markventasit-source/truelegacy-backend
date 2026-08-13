const axios = require("axios");

const create_lead = async ({ survey, mobile, name, pdf_url, email }) => {
  const access_token = process.env.CRM_TOKEN;

  if (!access_token) {
    console.error("CRM_TOKEN missing in env");
    return;
  }

    const payload = {
      data: {
        name: name,
        email: email,
        phone: mobile,
        survey_data: {
          survey_id: survey._id.toString(),
          metadata: {
            religion: survey.deceased.religion,
            gender: survey.deceased.gender,
            marital_status: survey.deceased.marital_status,
            inter_caste: survey.deceased.inter_caste,
            matched_case_id: survey.matched_case_id,
            matched_case_description: survey.matched_case_description,
            total_percent: survey.total_percent,
          },

          deceased: survey.deceased,

          computed_shares: survey.computed_shares,

          family_tree: survey.family_tree.tree_data,

          pdf_url: pdf_url,
        },
        source: "succession-tool",
      },
    };

  // CRM
  axios
    .post(process.env.CRM_URL, payload, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    })
    .then((res) => console.log("CRM Success:", res.data))
    .catch((err) => console.error("CRM Failed:", err.message));

  // Public CRM
  axios
    .post(process.env.PUBLIC_CRM_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    })
    .then((res) => console.log("Public CRM Success:", res.data))
    .catch((err) => console.error("Public CRM Failed:", err.message));

  return { status: "queued" };
};

module.exports = {
  create_lead,
};