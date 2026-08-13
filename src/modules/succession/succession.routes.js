const express = require('express');
const succession_controller = require('./succession.controller');
const auth_verify = require("../../middlewares/auth_verify");
const log_activity = require("../../middlewares/log_activity");

const router = express.Router();

//* Public routes
router.post('/', log_activity("create_succession"), succession_controller.create_survey);
router.delete('/cleanup-temporary/:id',
  log_activity("cleanup_temporary_data"),
  succession_controller.cleanup_temp_survey_data
);
router.put('/:id/add-child', log_activity("add_child"), succession_controller.add_child);
router.put('/:id/add-member', log_activity("add_member"), succession_controller.add_member);
router.put('/:id/remove-member', log_activity("remove_member"), succession_controller.remove_member);
router.put('/:id/edit-member', log_activity("edit_member"), succession_controller.edit_member);
router.put('/:id/recalculate', log_activity("recalculate_shares"), succession_controller.recalculate_shares);

//* Protected routes
router.use(auth_verify);

router.get("/my-successions", log_activity("view_my_succession"), succession_controller.get_my_survey);
router.post("/share", log_activity("share_succession"), succession_controller.share_succession);

module.exports = router;  