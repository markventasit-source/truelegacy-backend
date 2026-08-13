const response_handler = (res, status, message, data, total_count) => {
  if (status >= 400) {
    res.locals.error_message = message || "";
  }
  const res_structure = {
    status,
    message,
    data,
    total_count,
  };
  return res.status(status).json(res_structure);
};

module.exports = response_handler;
