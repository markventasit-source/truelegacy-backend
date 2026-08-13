function parse_s3_url(s3_url) {
  const url = new URL(s3_url);
  const hostParts = url.hostname.split(".");
  const bucket = hostParts[0];
  const key = decodeURIComponent(url.pathname.slice(1));
  return { bucket, key };
}

module.exports = { parse_s3_url };
