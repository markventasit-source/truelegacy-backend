const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const {
  SPACES_REGION,
  SPACES_ACCESS_KEY,
  SPACES_SECRET_KEY,
  SPACES_BUCKET,
  SPACES_ENDPOINT,
} = process.env;

const upload_file_to_s3 = async (
  file,
  name = "",
  folder_path = "true-legacy-files",
  options = {}
) => {
  const file_name = name
    ? `${Date.now()}_${name}`
    : `${Date.now()}_${file.originalname}`;
  const key = folder_path ? `${folder_path}/${file_name}` : file_name;

  const region = options.region || SPACES_REGION || "in-maa-1";
  const accessKeyId =
    (options.credentials && options.credentials.accessKeyId) ||
    SPACES_ACCESS_KEY;
  const secretAccessKey =
    (options.credentials && options.credentials.secretAccessKey) ||
    SPACES_SECRET_KEY;
  const bucket = options.bucket || SPACES_BUCKET;
  const endpoint = options.endpoint || SPACES_ENDPOINT;

  const s3ClientConfig = {
    region,
  };

  if (accessKeyId && secretAccessKey) {
    s3ClientConfig.credentials = { accessKeyId, secretAccessKey };
  }

  if (endpoint) {
    s3ClientConfig.endpoint = endpoint;
    if (typeof options.forcePathStyle !== "undefined") {
      s3ClientConfig.forcePathStyle = !!options.forcePathStyle;
    }
  }

  const s3 = new S3Client(s3ClientConfig);

  const upload_params = {
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const upload = new Upload({
    client: s3,
    params: upload_params,
  });

  await upload.done();
  if (endpoint && bucket) {
    const host = endpoint.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${bucket}.${host}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const get_signed_url = async (key, expiresIn = 3600) => {
  const s3ClientConfig = {
    region: SPACES_REGION || "in-maa-1",
  };

  if (SPACES_ACCESS_KEY && SPACES_SECRET_KEY) {
    s3ClientConfig.credentials = { 
      accessKeyId: SPACES_ACCESS_KEY, 
      secretAccessKey: SPACES_SECRET_KEY 
    };
  }

  if (SPACES_ENDPOINT) {
    s3ClientConfig.endpoint = SPACES_ENDPOINT;
  }

  const s3 = new S3Client(s3ClientConfig);

  const command = new GetObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
};

module.exports = { upload_file_to_s3, get_signed_url };
