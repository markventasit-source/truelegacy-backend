class ReadinessSurveyService {
  constructor() {
    this.score_map = {
      age_category: {
        "Below 45 years": 3,
        "45-60 years": 2,
        "60-70 years": 1,
        "Above 70 years": 0,
      },
      net_worth_awareness: {
        "Less than ₹1 crore": 0,
        "₹1 crore - ₹5 crores": 1,
        "₹5 crores - ₹10 crores": 2,
        "Above ₹10 crores": 3,
      },
      physical_control_immovable: {
        Yes: 2,
        Partially: 1,
        No: 0,
      },
      ownership_documents_available: {
        Yes: 2,
        No: 0,
      },
      nominee_vs_legal_heir_awareness: {
        Yes: 2,
        No: 0,
      },
      inheritance_law_awareness: {
        Yes: 2,
        Partially: 1,
        No: 0,
      },
      overseas_inheritance_awareness: {
        Yes: 2,
        No: 0,
      },
      family_wealth_sharing: {
        Yes: 2,
        Partially: 1,
        No: 0,
      },
      has_will: {
        Yes: 2,
        No: 0,
      },
      has_private_trust: {
        Yes: 2,
        No: 0,
      },
      has_executor_trustee: {
        Yes: 2,
        No: 0,
      },
    };
  }

  calculate_score(answers) {
    let total_score = 0;
    for (const key of Object.keys(this.score_map)) {
      const answer = answers[key];
      const score_for_answer = this.score_map[key]?.[answer];
      if (typeof score_for_answer !== "number") {
        throw new Error(`Invalid answer for ${key}`);
      }
      total_score += score_for_answer;
    }
    return total_score;
  }

  get_ranking(score) {
    let ranking = "Limited";

    if (score >= 19 && score <= 24) ranking = "Excellent";
    else if (score >= 14 && score <= 18) ranking = "Good";
    else if (score >= 8 && score <= 13) ranking = "Average";
    else ranking = "Limited";

    const interpretation_text_map = {
      Excellent:
        "Excellent planning! Well done! You are highly prepared in terms of wealth management, asset protection, and inheritance planning. You demonstrate an excellent understanding of inheritance laws, the impact of asset distribution, and the proactive steps required to protect your wealth. You have a comprehensive plan in place to ensure that your family will be well taken care of. Keep up the great work! However, it's always beneficial to periodically review your plans and stay updated on any changes in the law or your personal financial situation to maintain your high level of preparedness.",
      Good:
        "Good planning, You are generally well-prepared and knowledgeable about your wealth, inheritance laws, and asset management. You've taken significant steps towards ensuring your wealth is protected and distributed as per your wishes. However, there might still be small areas to improve upon, such as ensuring that all necessary documentation is in place, or formalizing the roles of executors or trustees. Continuing to refine your planning and considering professional advice can help make sure that your assets are completely secure and your family is well taken care of.",
      Average:
        "Average level of planning. You have a reasonable understanding of your wealth and inheritance planning but may have some gaps in key areas such as legal documentation, asset distribution, and communication with your family. You may be aware of certain elements but need to improve in others, such as creating a will or ensuring that your legal heirs understand how your wealth will be distributed. It's recommended that you consult with a financial advisor or estate planning expert to address these gaps and make your wealth management more comprehensive. Taking action now will better protect your assets and your family’s future.",
      Limited:
        "Limited preparation. It appears that you may not have fully prepared for the management of your wealth, inheritance planning, or asset protection. You might not be aware of key areas that could affect your financial future. It is highly recommended that you seek professional advice to ensure that your assets and wealth are well-managed, your family is protected, and your estate planning is in order. Consider educating yourself on inheritance laws, preparing a will, and having proper documentation for all assets. Starting early can help avoid complications in the future.",
    };

    return {
      ranking,
      interpretation_text: interpretation_text_map[ranking],
    };
  }
}

module.exports = new ReadinessSurveyService();
