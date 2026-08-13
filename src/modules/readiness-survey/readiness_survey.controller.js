const response_handler = require("../../helpers/response_handler");
const validation = require("./readiness_survey.validation");
const ReadinessSurveyResponse = require("./readiness_survey.model");
const readiness_survey_service = require("./readiness_survey.service");
const { get_signed_url } = require("../../utils/s3_uploader");

const readiness_survey_controller = {
  questions: async (req, res) => {
    try {
      const opts = validation.answer_options;
      const questions = [
        {
          id: 1,
          key: "age_category",
          title: "Which age category do you belong to?",
          options: opts.age_category,
        },
        {
          id: 2,
          key: "net_worth_awareness",
          title: "Do you know your current Net Worth (Assets - Liabilities)?",
          options: opts.net_worth_awareness,
        },
        {
          id: 3,
          key: "physical_control_immovable",
          title: "Do you have physical control over all your immovable properties (land plots, buildings, etc.)?",
          options: opts.physical_control_immovable,
        },
        {
          id: 4,
          key: "ownership_documents_available",
          title: "Do you have all the proper documents to prove your ownership over your immovable properties (land plots, buildings, etc.)?",
          options: opts.ownership_documents_available,
        },
        {
          id: 5,
          key: "nominee_vs_legal_heir_awareness",
          title: "Are you aware that your nominee is not necessarily the only legal heir?",
          options: opts.nominee_vs_legal_heir_awareness,
        },
        {
          id: 6,
          key: "inheritance_law_awareness",
          title: "Do you know how your wealth will be divided among your legal heirs under the Indian inheritance laws, and how this could affect your assets?",
          options: opts.inheritance_law_awareness,
        },
        {
          id: 7,
          key: "overseas_inheritance_awareness",
          title: "Are you aware that Inheritance Laws in India do not apply to your overseas investments?",
          options: opts.overseas_inheritance_awareness,
        },
        {
          id: 8,
          key: "family_wealth_sharing",
          title: "Have you shared the details of your wealth with your spouse and children?",
          options: opts.family_wealth_sharing,
        },
        {
          id: 9,
          key: "has_will",
          title: "Have you prepared your Will?",
          options: opts.has_will,
        },
        {
          id: 10,
          key: "has_private_trust",
          title: "Have you created a private family trust to protect your assets?",
          options: opts.has_private_trust,
        },
        {
          id: 11,
          key: "has_executor_trustee",
          title: "Do you have a trusted friend or consultant who can act as an Executor / Trustee to manage the assets distributed to your family in your absence?",
          options: opts.has_executor_trustee,
        },
      ];

      return response_handler(res, 200, "Questions fetched successfully", questions);
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  submit: async (req, res) => {
    try {
      const { error, value } =
        validation.submit_readiness_survey_validation.validate(req.body);
      if (error) {
        return response_handler(res, 400, error.details[0].message);
      }

      const { answers } = value;

      const total_score = readiness_survey_service.calculate_score(answers);
      const { ranking, interpretation_text } =
        readiness_survey_service.get_ranking(total_score);

      await ReadinessSurveyResponse.create({
        answers,
        total_score,
        ranking,
        interpretation_text,
      });

      return response_handler(res, 200, "Survey submitted successfully", {
        total_score,
        ranking,
        interpretation_text,
      });
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  download_pdf: async (req, res) => {
    try {
      const pdf_key = "readiness-survey/Succession_Planning_Truelegacy.pdf";
      const signed_url = await get_signed_url(pdf_key);
      
      return response_handler(res, 200, "PDF download URL generated", {
        download_url: signed_url,
      });
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },
};

module.exports = readiness_survey_controller;
