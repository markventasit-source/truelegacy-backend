const validation = require("./enquiries.validation");
const response_handler = require("../../helpers/response_handler");
const Enquiries = require("./enquiries.model");
const { CRM_URL, CRM_TOKEN, PUBLIC_CRM_URL } = process.env;

exports.create_enquiry = async (req, res) => {
  try {
    const { error, value } = validation.create_enquiry.validate(req.body);
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }

    value.crm_id = null;
    value.crm_sync_status = "pending";
    value.crm_error = null;
    value.crm_last_attempt_at = new Date();

    const mark_crm_failed = (message) => {
      value.crm_id = null;
      value.crm_sync_status = "failed";
      value.crm_error = message || "CRM API Error";
      value.crm_last_attempt_at = new Date();
    };

    const mark_crm_success = (crmId) => {
      value.crm_id = String(crmId);
      value.crm_sync_status = "success";
      value.crm_error = null;
      value.crm_last_attempt_at = new Date();
    };

    if (!CRM_URL || !CRM_TOKEN) {
      console.error(
        "CRM configuration missing:",
        JSON.stringify({ hasCRM_URL: Boolean(CRM_URL), hasCRM_TOKEN: Boolean(CRM_TOKEN) })
      );
      mark_crm_failed("CRM configuration missing");
    } else {
      try {
        const crm_response = await fetch(CRM_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CRM_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              name: value.name,
              email: value.email,
              phone: value.phone,
              message: value.message,
              source: value.source,
              type: value.type,
              ...(value.date && { date: value.date }),
              ...(value.time && { time: value.time }),
              ...(value.date && value.time && (() => {
                try {
                  const [day, month, year] = value.date.split('-');
                  const timeMatch = value.time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
                  if (!timeMatch) return null;
                  let [, hour, minute, period] = timeMatch;
                  hour = parseInt(hour, 10);
                  minute = parseInt(minute, 10);
                  period = period.toUpperCase();
                  if (period === 'PM' && hour !== 12) hour += 12;
                  if (period === 'AM' && hour === 12) hour = 0;
                  const isoDate = new Date(`${year}-${month}-${day}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
                  if (isNaN(isoDate.getTime())) return null;
                  return { callback_scheduled_at: isoDate.toISOString() };
                } catch (e) {
                  return null;
                }
              })()),
            },
          }),
        });

        if (!crm_response.ok) {
          let crm_error_text = "";
          try {
            crm_error_text = await crm_response.text();
          } catch (e) {
            crm_error_text = "";
          }
          const trimmed = (crm_error_text || "").slice(0, 500);
          console.error("CRM API non-2xx response:", {
            status: crm_response.status,
            statusText: crm_response.statusText,
            body: trimmed,
          });
          mark_crm_failed(
            `CRM API request failed with status ${crm_response.status}${trimmed ? `: ${trimmed}` : ""}`
          );
        } else {
          let crm_payload = null;
          let raw_text = "";
          try {
            raw_text = await crm_response.text();
          } catch (e) {
            raw_text = "";
          }

          if (raw_text) {
            try {
              crm_payload = JSON.parse(raw_text);
            } catch (e) {
              crm_payload = null;
            }
          }

          const maybeData = crm_payload?.data;
          const crm_id =
            (typeof maybeData === "string" || typeof maybeData === "number"
              ? maybeData
              : maybeData?.id) ?? null;

          console.log("FULL CRM RESPONSE:", JSON.stringify(crm_payload, null, 2));

          if (crm_payload?.response !== "200") {
            console.error("CRM returned failure:", crm_payload);

            mark_crm_failed(crm_payload?.message || "CRM internal error");
          } else if (!crm_id) {
            console.error("CRM response missing lead id", {
              payload: crm_payload,
            });
            mark_crm_failed("CRM API response missing lead id");
          } else {
            mark_crm_success(crm_id);
          }
        }
      } catch (err) {
        console.error("CRM API call error:", err?.message || err);
        mark_crm_failed(err?.message || "CRM API Error");
      }
    }

    
    if (PUBLIC_CRM_URL) {
      try {
        const public_response = await fetch(PUBLIC_CRM_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              name: value.name,
              email: value.email,
              phone: value.phone,
              message: value.message,
              source: value.source,
              type: value.type,
            },
          }),
        });

        const public_text = await public_response.text();

        let public_payload = {};
        try {
          public_payload = JSON.parse(public_text);
        } catch (e) {}

        console.log("PUBLIC CRM RESPONSE:", public_payload);
      } catch (err) {
        console.error("PUBLIC CRM ERROR:", err.message);
      }
    }
    const enquiry = await Enquiries.create(value);
    return response_handler(res, 200, "Enquiry created ", enquiry);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_enquiries = async (req, res) => {
  try {
    const { page_no = 1, limit = 10, search } = req.query;
    const skip_count = limit * (page_no - 1);
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    const [enquiries, total_count] = await Promise.all([
      Enquiries.find(filter)
        .skip(skip_count)
        .limit(limit)
        .sort({ createdAt: -1, _id: -1 }),
      Enquiries.countDocuments(filter),
    ]);

    return response_handler(
      res,
      200,
      "Enquiries fetched successfully",
      enquiries,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_enquiry_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Enquiry ID is required");
    }
    const enquiry = await Enquiries.findById(id);
    return response_handler(res, 200, "Enquiry fetched successfully", enquiry);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_enquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Enquiry ID is required");
    }
    const enquiry = await Enquiries.findByIdAndDelete(id);
    return response_handler(res, 200, "Enquiry deleted successfully", enquiry);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_enquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Enquiry ID is required");
    }
    const { error, value } = validation.update_enquiry.validate(req.body);
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }
    const enquiry = await Enquiries.findByIdAndUpdate(id, value, { new: true });
    return response_handler(res, 200, "Enquiry updated successfully", enquiry);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
