const response_handler = require("../../helpers/response_handler");
const { create_succession_validation, share_succession_validation } = require("./succession.validation");
const Survey = require("./succession.model");
const SuccessionShare = require("./succession_share.model");
const User = require("../user/user.model");
const { RELIGION, RELIGION_CONFIG } = require("../../config/constants");
const family_tree_generator = require("../../helpers/family_tree_generator");
const succession_service = require("./succession.service");
const rule_matcher = require("../../helpers/rule_matcher");
const calculator_factory = require("../../helpers/calculator.factory");
const { generate_token } = require("../auth/auth.service");
const pdf_service = require("./services/pdf.service");
const whatsapp_service = require("./services/whatsapp.service");
const share_tool_service = require("./services/share_tool.service");
const email_service = require("./services/email.service");

const succession_controller = {
  create_survey: async (req, res) => {
    try {
      const { error, value } = create_succession_validation.validate(req.body);
      if (error) return response_handler(res, 400, error.details[0].message);

      const { religion } = value;
      if (!RELIGION_CONFIG[religion] || !RELIGION_CONFIG[religion].supported) {
        return response_handler(
          res,
          400,
          `${religion} religion is not supported yet`
        );
      }

      //* Transform incoming data into backend structure
      const survey_data = succession_service.transform_survey_data(value);

      //* Match inheritance rule
      const matched_rule = rule_matcher.find_matching_rule(survey_data);
      if (!matched_rule) {
        return response_handler(
          res,
          404,
          `No matching ${RELIGION_CONFIG[religion].name} inheritance rule found for the provided family structure`
        );
      }

      const { computed_shares, total_percent } =
        calculator_factory.calculate_shares(survey_data);

      //* Generate family tree
      const family_tree = family_tree_generator.generate_family_tree({
        deceased: survey_data.deceased,
        computed_shares,
      });

      //* Create temporary user
      const temp_user = new User({
        role: "guest",
      });
      await temp_user.save();

      const token = generate_token(temp_user._id);

      const survey = new Survey({
        user_id: temp_user._id,
        deceased: survey_data.deceased,
        computed_shares,
        matched_case_id: matched_rule.case_id,
        matched_case_description: matched_rule.description,
        total_percent,
        family_tree: {
          tree_data: family_tree,
          last_updated: new Date(),
        },
      });
      await survey.save();

      return response_handler(
        res,
        201,
        `${value.inter_caste ? 'Christian (Inter-caste)' : RELIGION_CONFIG[religion].name} survey created successfully`,
        {
          survey: {
            id: survey._id,
            religion: survey.deceased.religion,
            original_religion: value.religion,
            inter_caste: survey.deceased.inter_caste,
            matched_case_id: survey.matched_case_id,
            matched_case_description: survey.matched_case_description,
            computed_shares: survey.computed_shares,
            total_percent: survey.total_percent,
            family_tree: survey.family_tree.tree_data,
            createdAt: survey.createdAt,
          },
          temporary_user: {
            user_id: temp_user._id,
            token,
            is_logged_in: temp_user.email ? true : false,
          },
        }
      );
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  cleanup_temp_survey_data: async (req, res) => {
    try {
      const user_id = req.params.id;

      await Survey.deleteMany({ user_id });
      await User.findByIdAndDelete(user_id);

      response_handler(res, 200, "Temporary data cleaned up successfully");
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  add_child: async (req, res) => {
    try {
      const { relationship, name, living_status = "alive" } = req.body;
      const survey_id = req.params.id;

      if (!["son", "daughter"].includes(relationship)) {
        return response_handler(
          res,
          400,
          "Relationship must be son or daughter"
        );
      }

      const survey = await Survey.findById(survey_id);
      if (!survey) return response_handler(res, 404, "Survey not found");

      const updated_tree = family_tree_generator.add_child(
        survey.family_tree.tree_data,
        "you",
        {
          relationship,
          name:
            name ||
            `${relationship.charAt(0).toUpperCase() + relationship.slice(1)
            } ${Date.now()}`,
          living_status: living_status.toLowerCase(),
          gender: relationship === "son" ? "male" : "female",
        }
      );

      if (living_status.toLowerCase() === "alive") {
        if (relationship === "son") {
          survey.deceased.children.sons += 1;
        } else {
          survey.deceased.children.daughters += 1;
        }
      } else {
        if (relationship === "son") {
          survey.deceased.children.deceased_sons += 1;
        } else {
          survey.deceased.children.deceased_daughters += 1;
        }
      }

      survey.family_tree.tree_data = updated_tree;
      survey.family_tree.last_updated = new Date();

      survey.markModified("family_tree.tree_data");
      survey.markModified("deceased.children");
      await survey.save();

      //* Recalculate inheritance
      const updated_survey = await succession_service.recalculate_inheritance(
        survey
      );

      response_handler(res, 200, "Child added successfully", {
        family_tree: updated_survey.family_tree.tree_data,
        computed_shares: updated_survey.computed_shares,
        total_percent: updated_survey.total_percent,
        updated_counts: {
          sons: updated_survey.deceased.children.sons,
          daughters: updated_survey.deceased.children.daughters,
          deceased_sons: updated_survey.deceased.children.deceased_sons,
          deceased_daughters:
            updated_survey.deceased.children.deceased_daughters,
        },
      });
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  add_member: async (req, res) => {
    try {
      const { relationship, name, living_status = "alive" } = req.body;
      const survey_id = req.params.id;

      const validRelationships = [
        "husband", "wife", "father", "mother",
        "brother", "sister", "son", "daughter"
      ];

      if (!validRelationships.includes(relationship)) {
        return response_handler(res, 400, "Invalid relationship type");
      }

      const survey = await Survey.findById(survey_id);
      if (!survey) return response_handler(res, 404, "Survey not found");

      const memberData = { name, living_status };

      //* Add to tree using correct generator
      const updated_tree = family_tree_generator.add_member(
        survey.family_tree.tree_data,
        relationship,
        memberData,
        survey.deceased
      );

      //* Update survey counts
      succession_service.add_member_to_survey(survey, relationship, memberData);

      survey.family_tree.tree_data = updated_tree;
      survey.family_tree.last_updated = new Date();
      survey.markModified("family_tree");
      survey.markModified("deceased");

      await survey.save();

      //* Recalculate inheritance
      const updated_survey = await succession_service.recalculate_inheritance(survey);

      return response_handler(res, 200, `${relationship.charAt(0).toUpperCase() + relationship.slice(1)
        } added successfully`, {
        added_member: {
          relationship,
          name: name || succession_service.get_default_name(relationship),
          living_status
        },
        family_tree: updated_survey.family_tree.tree_data,
        computed_shares: updated_survey.computed_shares,
        total_percent: updated_survey.total_percent,
      });

    } catch (error) {
      console.error("Add member error:", error);
      return response_handler(res, 500, error.message || "Failed to add member");
    }
  },

  remove_member: async (req, res) => {
    try {
      const { member_id } = req.body;
      const survey_id = req.params.id;

      if (!member_id)
        return response_handler(res, 400, "Member ID is required");

      let survey = await Survey.findById(survey_id);
      if (!survey) return response_handler(res, 404, "Survey not found");

      const removal_result = succession_service.remove_member_from_survey(
        survey,
        member_id
      );
      if (!removal_result.success) {
        return response_handler(res, 400, removal_result.message);
      }

      const updated_tree = family_tree_generator.remove_member_from_tree(
        survey.family_tree.tree_data,
        member_id
      );

      survey.family_tree.tree_data = updated_tree;
      survey.family_tree.last_updated = new Date();

      //* Synchronize and recalculate
      survey = succession_service.synchronize_survey_data(survey);

      survey.markModified("family_tree.tree_data");
      survey.markModified("deceased.children");
      survey.markModified("deceased.siblings");
      survey.markModified("deceased.parents");
      await survey.save();

      const updated_survey = await succession_service.recalculate_inheritance(
        survey
      );

      response_handler(res, 200, "Member removed successfully", {
        family_tree: updated_survey.family_tree.tree_data,
        computed_shares: updated_survey.computed_shares,
        total_percent: updated_survey.total_percent,
        removed_member: member_id,
      });
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  edit_member: async (req, res) => {
    try {
      const { member_id, name, living_status } = req.body;
      const survey_id = req.params.id;

      if (!member_id)
        return response_handler(res, 400, "Member ID is required");

      let survey = await Survey.findById(survey_id);
      if (!survey) return response_handler(res, 404, "Survey not found");

      const updates = {};
      if (name) updates.name = name;
      if (living_status) updates.living_status = living_status.toLowerCase();

      const updated_tree = family_tree_generator.update_member(
        survey.family_tree.tree_data,
        member_id,
        updates
      );

      survey.family_tree.tree_data = updated_tree;
      survey.family_tree.last_updated = new Date();
      survey.markModified("family_tree.tree_data");

      if (living_status === "deceased") {
        survey = succession_service.synchronize_survey_data(survey);
        survey.markModified("deceased.children");
        survey.markModified("deceased.siblings");
      }

      await survey.save();

      const updated_survey = await succession_service.recalculate_inheritance(
        survey
      );

      response_handler(res, 200, "Member updated successfully", {
        family_tree: updated_survey.family_tree.tree_data,
        computed_shares: updated_survey.computed_shares,
        total_percent: updated_survey.total_percent,
      });
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  recalculate_shares: async (req, res) => {
    try {
      const survey = await Survey.findById(req.params.id);
      if (!survey) return response_handler(res, 404, "Survey not found");

      const updated_survey = await succession_service.recalculate_inheritance(
        survey
      );

      response_handler(res, 200, "Shares recalculated successfully", {
        family_tree: updated_survey.family_tree.tree_data,
        computed_shares: updated_survey.computed_shares,
        total_percent: updated_survey.total_percent,
        matched_case_id: updated_survey.matched_case_id,
        matched_case_description: updated_survey.matched_case_description,
      });
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  get_my_survey: async (req, res) => {
    try {
      const survey = await Survey.findOne({ user_id: req.user_id });
      if (!survey) return response_handler(res, 404, "Survey not found");
      const mapped_data = {
        id: survey._id,
        religion: survey.deceased.religion,
        matched_case_id: survey.matched_case_id,
        matched_case_description: survey.matched_case_description,
        computed_shares: survey.computed_shares,
        total_percent: survey.total_percent,
        family_tree: survey.family_tree.tree_data,
        createdAt: survey.createdAt,
      };
      response_handler(res, 200, "Survey retrieved successfully", mapped_data);
    } catch (error) {
      return response_handler(res, 500, `Internal Server Error ${error.message}`);
    }
  },

  share_succession: async (req, res) => {
    try {
      const { error, value } = share_succession_validation.validate(req.body);

      if (error)
        return response_handler(res, 400, error.details[0].message);

      const { survey_id, tree_image, mobile, name, email } = value;

      const survey = await Survey.findById(survey_id);

      if (!survey)
        return response_handler(res, 404, "Survey not found");

      if (survey.user_id.toString() !== req.user_id.toString()) {
        return response_handler(res, 403, "Unauthorized access");
      }

      //* Generate PDF
      const pdf_buffer = await pdf_service.generate_succession_pdf({
        survey,
        tree_image_base64: tree_image,
      });

      //* Upload to S3
      const file_url = await pdf_service.upload_generated_pdf(pdf_buffer);

      const tasks = [];

      if (mobile) {
        tasks.push(
          whatsapp_service.send_succession_pdf({
            mobile,
            file_url,
            user_name: survey.deceased?.name || name || "User"
          })
        );
      }

      if (email) {
        tasks.push(
          email_service.send_succession_email({
            email,
            name,
            pdf_url: file_url
          })
        );
      }

      tasks.push(
        share_tool_service.create_lead({
          survey,
          mobile,
          name,
          email,
          pdf_url: file_url
        })
      );

      const results = await Promise.allSettled(tasks);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Service ${index} failed:`, result.reason);
        }
      });

      await SuccessionShare.create({
        survey_id: survey._id,
        user_id: survey.user_id,
        mobile,
        name,
        email,
        pdf_url: file_url,
        status: "success",
      });

      return response_handler(
        res,
        200,
        "Succession report shared successfully"
      );

    } catch (error) {
      console.error("share_succession error:", error);
      return response_handler(
        res,
        500,
        `Internal Server Error ${error.message}`
      );
    }
  },
};

module.exports = succession_controller;