const hindu_rules = require("./rules/hindu.rules");
const christian_rules = require("./rules/christian.rules");
const muslim_rules = require("./rules/muslim.rules");

class RuleMatcher {
  constructor() {
    this.rules = [...hindu_rules, ...christian_rules, ...muslim_rules];
  }

  find_matching_rule(survey_data) {
    const normalized = this.normalize_input(survey_data);

    const matched_rule = this.rules.find(
      (rule) =>
        rule.gender === normalized.gender &&
        rule.religion === normalized.religion &&
        this.evaluate_conditions(rule.conditions, normalized)
    );

    if (matched_rule) {
      return matched_rule;
    }

    //* Return religion-specific fallback
    const fallback_rule = this.rules.find(
      rule => rule.religion === normalized.religion && rule.case_id.includes('FALLBACK')
    );

    return fallback_rule || {
      case_id: "GENERIC_FALLBACK",
      description: `Fallback rule for ${normalized.gender} ${normalized.religion}`,
      religion: normalized.religion,
      gender: normalized.gender
    };
  }

  evaluate_conditions(conditions, normalized) {
    for (const [key, value] of Object.entries(conditions)) {
      if (normalized[key] !== value) return false;
    }
    return true;
  }

  normalize_input(survey_data) {
    const { deceased } = survey_data;

    return {
      gender: deceased.gender,
      religion: deceased.religion,
      married: deceased.married,
      divorced: deceased.divorced || false,
      spouse_alive: deceased.spouse_alive || false,
      has_children: (deceased.children?.sons || 0) + (deceased.children?.daughters || 0) > 0,
      father_alive: deceased.parents?.father_alive || false,
      mother_alive: deceased.parents?.mother_alive || false,
      children: {
        sons: deceased.children?.sons || 0,
        daughters: deceased.children?.daughters || 0,
        any: (deceased.children?.sons || 0) + (deceased.children?.daughters || 0) > 0,
      },
      parents: {
        mother_alive: deceased.parents?.mother_alive || false,
        father_alive: deceased.parents?.father_alive || false,
      },
      siblings: {
        brothers: deceased.siblings?.brothers || 0,
        sisters: deceased.siblings?.sisters || 0,
        any: (deceased.siblings?.brothers || 0) + (deceased.siblings?.sisters || 0) > 0,
      },
    };
  }
}

module.exports = new RuleMatcher();