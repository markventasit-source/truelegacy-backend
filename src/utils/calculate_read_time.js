const calculate_read_time = (content) => {
  if (!content || typeof content !== "string") {
    return "1 min read";
  }

  const words_per_minute = 200;
  const words = content.trim().split(/\s+/).length;
  const read_time_minutes = Math.ceil(words / words_per_minute);

  if (read_time_minutes < 1) {
    return "1 min read";
  }

  return `${read_time_minutes} min read`;
};

module.exports = calculate_read_time;
