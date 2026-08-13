const rule_matcher = require('../../helpers/rule_matcher');
const calculator_factory = require('../../helpers/calculator.factory');
const family_tree_generator = require('../../helpers/family_tree_generator');

class SuccessionService {

  transform_survey_data(frontend_data) {
    const parents_alive = frontend_data.parents_alive;
    const effective_religion = frontend_data.inter_caste ? 'christian' : frontend_data.religion;
    const marital_status =
      frontend_data.marital_status ||
      (frontend_data.divorced
        ? "divorced"
        : frontend_data.married
          ? "married"
          : "unmarried");

    return {
      deceased: {
        gender: frontend_data.gender.toLowerCase(),
        religion: effective_religion.toLowerCase(),
        married: frontend_data.married,
        inter_caste: frontend_data.inter_caste || false,
        divorced: frontend_data.divorced || false,
        spouse_alive: frontend_data.spouse_alive,
        marital_status,
        children: {
          sons: frontend_data.children?.sons || 0,
          daughters: frontend_data.children?.daughters || 0,
          deceased_sons: frontend_data.children?.deceased_sons || 0,
          deceased_daughters: frontend_data.children?.deceased_daughters || 0
        },
        parents: {
          mother_alive: parents_alive === 'both' || parents_alive === 'mother',
          father_alive: parents_alive === 'both' || parents_alive === 'father'
        },
        siblings: {
          brothers: frontend_data.siblings?.brothers || 0,
          sisters: frontend_data.siblings?.sisters || 0
        }
      },
    };
  }

  find_member_in_tree(node, member_id) {
    if (node.id === member_id) return node;
    if (node.spouse?.id === member_id) return node.spouse;

    if (node.children) {
      for (const child of node.children) {
        const found = this.find_member_in_tree(child, member_id);
        if (found) return found;
      }
    }

    if (node.siblings) {
      for (const sibling of node.siblings) {
        if (sibling.id === member_id) return sibling;
      }
    }

    if (node.parents) {
      for (const parent of node.parents) {
        if (parent.id === member_id) return parent;
      }
    }

    return null;
  }

  remove_member_from_survey(survey, member_id) {
    const member = this.find_member_in_tree(survey.family_tree.tree_data, member_id);
    if (!member) return { success: false, message: 'Member not found' };

    switch (member.relationship) {
      case 'son':
        member.living_status === 'alive' ? survey.deceased.children.sons-- : survey.deceased.children.deceased_sons--;
        break;
      case 'daughter':
        member.living_status === 'alive' ? survey.deceased.children.daughters-- : survey.deceased.children.deceased_daughters--;
        break;
      case 'mother':
        survey.deceased.parents.mother_alive = false;
        break;
      case 'father':
        survey.deceased.parents.father_alive = false;
        break;
      case 'brother':
        survey.deceased.siblings.brothers--;
        break;
      case 'sister':
        survey.deceased.siblings.sisters--;
        break;
      case 'wife':
      case 'husband':
        survey.deceased.spouse_alive = false;
        if (survey.deceased.religion === 'christian' || survey.deceased.inter_caste) {
          survey.deceased.married = false;
        }
        break;
    }
    return { success: true };
  }

  synchronize_survey_data(survey) {
    const tree = survey.family_tree.tree_data;
    let sons = 0, daughters = 0, dec_sons = 0, dec_daughters = 0;
    let brothers = 0, sisters = 0;
    let spouse_alive = false, mother_alive = false, father_alive = false;

    const count = (node) => {
      if (node.relationship === 'son') node.living_status === 'alive' ? sons++ : dec_sons++;
      if (node.relationship === 'daughter') node.living_status === 'alive' ? daughters++ : dec_daughters++;
      node.children?.forEach(count);
    };
    count(tree);

    tree.siblings?.forEach(s => {
      if (s.relationship === 'brother') brothers++;
      if (s.relationship === 'sister') sisters++;
    });

    if (tree.spouse) spouse_alive = tree.spouse.living_status === 'alive';
    tree.parents?.forEach(p => {
      if (p.relationship === 'mother') mother_alive = true;
      if (p.relationship === 'father') father_alive = true;
    });

    Object.assign(survey.deceased.children, { sons, daughters, deceased_sons: dec_sons, deceased_daughters: dec_daughters });
    Object.assign(survey.deceased.siblings, { brothers, sisters });
    survey.deceased.spouse_alive = spouse_alive;
    survey.deceased.parents.mother_alive = mother_alive;
    survey.deceased.parents.father_alive = father_alive;

    if ((survey.deceased.inter_caste || survey.deceased.religion === 'christian') && !spouse_alive) {
      survey.deceased.married = false;
    }

    return survey;
  }

  add_member_to_survey(survey, relationship, memberData = {}) {
    const alive = (memberData.living_status || 'alive') === 'alive';

    switch (relationship) {
      case 'son': alive ? survey.deceased.children.sons++ : survey.deceased.children.deceased_sons++; break;
      case 'daughter': alive ? survey.deceased.children.daughters++ : survey.deceased.children.deceased_daughters++; break;
      case 'wife':
      case 'husband': survey.deceased.spouse_alive = alive; survey.deceased.married = true; break;
      case 'father': survey.deceased.parents.father_alive = alive; break;
      case 'mother': survey.deceased.parents.mother_alive = alive; break;
      case 'brother': survey.deceased.siblings.brothers++; break;
      case 'sister': survey.deceased.siblings.sisters++; break;
    }
    return survey;
  }

  async recalculate_inheritance(survey) {
    try {
      this.synchronize_survey_data(survey);

      const { deceased } = survey;
      const matched_rule = rule_matcher.find_matching_rule({ deceased });
      if (!matched_rule) throw new Error('No matching rule');

      const { computed_shares, total_percent } = calculator_factory.calculate_shares({ deceased });

      const updated_tree = family_tree_generator.update_tree_shares(
        survey.family_tree.tree_data,
        computed_shares,
        deceased.religion,
        deceased.gender,
        deceased
      );

      survey.computed_shares = computed_shares;
      survey.total_percent = total_percent;
      survey.matched_case_id = matched_rule.case_id;
      survey.matched_case_description = matched_rule.description;
      survey.family_tree.tree_data = updated_tree;
      survey.family_tree.last_updated = new Date();

      ['family_tree.tree_data', 'computed_shares', 'deceased', 'matched_case_id'].forEach(path =>
        survey.markModified(path)
      );

      return await survey.save();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new SuccessionService();