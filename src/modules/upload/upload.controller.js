const path = require("path");
const response_handler = require("../../helpers/response_handler");
const {
  upload_file_to_s3,
  get_presigned_url,
} = require("../../utils/s3_uploader");

exports.create_upload = async (req, res) => {
  try {
    if (!req.file) {
      return response_handler(res, 400, "Image is required");
    }
    let detected_type = null;
    let extension;
    try {
      const ft = await import("file-type");
      const detector =
        ft.fileTypeFromBuffer || ft.fromBuffer || ft.default?.fromBuffer;
      if (detector) {
        detected_type = await detector(req.file.buffer);
      }
    } catch (e) {
      console.log(`Error while detecting file type: ${e.message}`);
    }

    if (detected_type) {
      extension = detected_type.ext;
    } else {
      extension = path.extname(req.file.originalname).replace(".", "");
    }

    const base_name = path
      .basename(req.file.originalname, path.extname(req.file.originalname))
      .toLowerCase();

    const final_file_name = `${base_name}.${extension}`;

    const s3_options = {
      region: process.env.SPACES_REGION || "in-maa-1",
      endpoint: process.env.SPACES_ENDPOINT,
      credentials: {
        accessKeyId: process.env.SPACES_ACCESS_KEY,
        secretAccessKey: process.env.SPACES_SECRET_KEY,
      },
      bucket: process.env.SPACES_BUCKET || "customer-documents",
    };

    const file_url = await upload_file_to_s3(
      req.file,
      final_file_name,
      "true-legacy-files-dev",
      s3_options
    );
    return response_handler(res, 200, "File uploaded successfully", file_url);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
