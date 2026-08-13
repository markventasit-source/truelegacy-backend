const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } =
  process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const delete_file_from_s3 = async (files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Files must be a non-empty array of URLs or keys");
  }

  const results = [];

  for (const file of files) {
    try {
      const key = file.includes(".amazonaws.com/")
        ? file.split(".amazonaws.com/")[1]
        : file;

      if (!key) throw new Error("Invalid file URL or key");

      const deleteParams = {
        Bucket: AWS_S3_BUCKET,
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command);
      results.push({ key, success: true });
    } catch (error) {
      console.error(`Failed to delete file: ${file}`, error.message);
      results.push({ key: file, success: false, error: error.message });
    }
  }

  return results;
};

module.exports = { delete_file_from_s3 };
