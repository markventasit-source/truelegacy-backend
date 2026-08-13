const path = require("path");

const resolve_template_path = (survey) => {
  if (!survey || !survey.deceased) {
    throw new Error("Invalid survey data");
  }

  const {
    religion,
    gender,
    inter_caste,
    marital_status
  } = survey.deceased;

  if (!gender) {
    throw new Error("Gender missing in survey data");
  }

  if (!marital_status) {
    throw new Error("Marital status missing in survey data");
  }

  let folder_name;

  if (inter_caste === true) {
    folder_name = "special_marriage_act";
  } else {
    if (!religion) {
      throw new Error("Religion missing in survey data");
    }
    folder_name = religion.toLowerCase();
  }

  return path.join(
    __dirname,
    `../../../assets/succession_templates/${folder_name}/${marital_status}_${gender}.pdf`
  );
};

module.exports = {
  resolve_template_path,
};