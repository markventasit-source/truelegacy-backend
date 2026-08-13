const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { v4: uuidv4 } = require("uuid");
const { resolve_template_path } = require("./template.mapper");
const { upload_file_to_s3 } = require("../../../utils/s3_uploader");

const generate_succession_pdf = async ({ survey, tree_image_base64 }) => {
  const template_path = resolve_template_path(survey);

  if (!fs.existsSync(template_path)) {
    throw new Error("Template PDF not found");
  }

  const template_bytes = fs.readFileSync(template_path);
  const template_pdf = await PDFDocument.load(template_bytes);

  const final_pdf = await PDFDocument.create();

  const page_width = 595;
  const page_height = 842;

  const page = final_pdf.addPage([page_width, page_height]);

  const bg_path = path.join(
    __dirname,
    "../../../assets/succession_templates/first_page_background.png"
  );

  if (!fs.existsSync(bg_path)) {
    throw new Error("Background image not found");
  }

  const bg_bytes = fs.readFileSync(bg_path);
  const bg_image = await final_pdf.embedPng(bg_bytes);

  page.drawImage(bg_image, {
    x: 0,
    y: 0,
    width: page_width,
    height: page_height,
  });

  const base64_data = tree_image_base64.replace(
    /^data:image\/png;base64,/,
    ""
  );

  const image_buffer = Buffer.from(base64_data, "base64");
  const tree_image = await final_pdf.embedPng(image_buffer);

  const tree_dims = tree_image.scale(1);

  const max_width = 500;
  const max_height = 600;

  let scale = Math.min(
    max_width / tree_dims.width,
    max_height / tree_dims.height
  );

  const scaled_width = tree_dims.width * scale;
  const scaled_height = tree_dims.height * scale;

  const x = (page_width - scaled_width) / 2;
  const y = 120; 

  page.drawImage(tree_image, {
    x,
    y,
    width: scaled_width,
    height: scaled_height,
  });

  const template_pages = await final_pdf.copyPages(
    template_pdf,
    template_pdf.getPageIndices()
  );

  template_pages.forEach((p) => final_pdf.addPage(p));

  return await final_pdf.save();
};

const upload_generated_pdf = async (pdf_buffer) => {
  const file = {
    buffer: pdf_buffer,
    mimetype: "application/pdf",
    originalname: "succession_report.pdf",
  };

  const unique_file_name = `${uuidv4()}_succession_report.pdf`;

  const file_url = await upload_file_to_s3(
    file,
    unique_file_name,
    "true-legacy-files/succession-reports"
  );

  return file_url;
};

module.exports = {
  generate_succession_pdf,
  upload_generated_pdf,
};