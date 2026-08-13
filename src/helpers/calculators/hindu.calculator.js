class HinduInheritanceCalculator {
  calculate_shares(survey_data) {
    try {
      const { deceased } = survey_data;
      this.deceased_data = deceased; 
      this.deceased_gender = deceased.gender; 
      
      if (deceased.gender === 'male') {
        return this.calculate_male_hindu_shares(deceased);
      } else {
        return this.calculate_female_hindu_shares(deceased);
      }
    } catch (error) {
      throw new Error('Failed to calculate Hindu inheritance shares');
    }
  }

  calculate_male_hindu_shares(deceased) {
    const living_heirs = this.get_male_living_heirs(deceased);
    return this.distribute_equal_shares(living_heirs);
  }

  calculate_female_hindu_shares(deceased) {
    const living_heirs = this.get_female_living_heirs(deceased);
    return this.distribute_equal_shares(living_heirs);
  }

  get_male_living_heirs(deceased) {
    const living_heirs = [];
    const add_living_heirs = (heir_type, count, class_type, priority) => {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          // ✅ UPDATED: Use prefixed heir types
          const prefixed_heir_type = this.get_prefixed_heir_type(heir_type, 'male', deceased);
          living_heirs.push({
            heir_type: prefixed_heir_type,
            class: class_type,
            priority
          });
        }
      }
    };

    //* MALE HEIR PRIORITY
    //* 1. SPOUSE, CHILDREN, MOTHER
    if (deceased.married && deceased.spouse_alive) {
      living_heirs.push({
        heir_type: 'wife', // No prefix needed for spouse
        class: 'Class 1',
        priority: 1
      });
    }

    //* 2. CHILDREN
    const living_sons = deceased.children?.sons || 0;
    const living_daughters = deceased.children?.daughters || 0;
    add_living_heirs('son', living_sons, 'Class 1', 2);
    add_living_heirs('daughter', living_daughters, 'Class 1', 2);

    //* 3. MOTHER
    if (deceased.parents?.mother_alive || deceased.parents_alive === 'both' || deceased.parents_alive === 'mother') {
      living_heirs.push({
        heir_type: 'husbands_mother', 
        class: 'Class 1',
        priority: 3
      });
    }

    //* 4. If no Class I heirs, then check for FATHER (Class II heir)
    if (living_heirs.length === 0) {
      if (deceased.parents?.father_alive || deceased.parents_alive === 'both' || deceased.parents_alive === 'father') {
        living_heirs.push({
          heir_type: 'husbands_father',
          class: 'Class 2',
          priority: 4
        });
      }
    }

    //* 5. If no father, then check for SIBLINGS (Class II heirs)
    if (living_heirs.length === 0) {
      const living_brothers = deceased.siblings?.brothers || 0;
      const living_sisters = deceased.siblings?.sisters || 0;
      add_living_heirs('brother', living_brothers, 'Class 2', 5);
      add_living_heirs('sister', living_sisters, 'Class 2', 5);
    }

    return living_heirs;
  }

  get_female_living_heirs(deceased) {
    const living_heirs = [];
    const add_living_heirs = (heir_type, count, class_type, priority) => {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          // ✅ UPDATED: Use prefixed heir types
          const prefixed_heir_type = this.get_prefixed_heir_type(heir_type, 'female', deceased);
          living_heirs.push({
            heir_type: prefixed_heir_type,
            class: class_type,
            priority
          });
        }
      }
    };

    const has_children = (deceased.children?.sons || 0) + (deceased.children?.daughters || 0) > 0;
    const living_sons = deceased.children?.sons || 0;
    const living_daughters = deceased.children?.daughters || 0;

    //* Determine if we should use husband's family or her own family
    const use_husbands_family = deceased.married && !deceased.divorced;

    //* FEMALE HEIR PRIORITY:
    //* 1. MARRIED WITH HUSBAND ALIVE
    if (deceased.married && deceased.spouse_alive) {
      living_heirs.push({
        heir_type: 'husband', // No prefix needed for spouse
        class: 'Class 1',
        priority: 1
      });
      add_living_heirs('son', living_sons, 'Class 1', 2);
      add_living_heirs('daughter', living_daughters, 'Class 1', 2);
    }
    //* 2. MARRIED WITH HUSBAND DECEASED OR UNMARRIED/DIVORCED
    else {
      if (has_children) {
        //* Priority: Children only (same for all cases)
        add_living_heirs('son', living_sons, 'Class 1', 1);
        add_living_heirs('daughter', living_daughters, 'Class 1', 1);
      } else {
        if (use_husbands_family) {
          //* MARRIED FEMALE: Husband's family
          //* Priority: Husband's mother → Husband's father → Husband's siblings
          if (deceased.parents?.mother_alive) {
            living_heirs.push({
              heir_type: 'husbands_mother', 
              class: 'Class 2',
              priority: 1
            });
          } else if (deceased.parents?.father_alive) {
            living_heirs.push({
              heir_type: 'husbands_father', 
              class: 'Class 2',
              priority: 2
            });
          } else {
            const husband_brothers = deceased.siblings?.brothers || 0;
            const husband_sisters = deceased.siblings?.sisters || 0;
            add_living_heirs('brother', husband_brothers, 'Class 2', 3);
            add_living_heirs('sister', husband_sisters, 'Class 2', 3);
          }
        } else {
          //* UNMARRIED/DIVORCED FEMALE: Her own family
          //* Priority: Mother → Father → Siblings
          if (deceased.parents?.mother_alive) {
            living_heirs.push({
              heir_type: 'wife_mother', 
              class: 'Class 1',
              priority: 1
            });
          } else if (deceased.parents?.father_alive) {
            living_heirs.push({
              heir_type: 'wife_father', 
              class: 'Class 1',
              priority: 2
            });
          } else {
            const her_brothers = deceased.siblings?.brothers || 0;
            const her_sisters = deceased.siblings?.sisters || 0;
            add_living_heirs('brother', her_brothers, 'Class 2', 3);
            add_living_heirs('sister', her_sisters, 'Class 2', 3);
          }
        }
      }
    }

    return living_heirs;
  }

  distribute_equal_shares(living_heirs) {
    if (living_heirs.length === 0) {
      return {
        computed_shares: [{
          heir_type: 'will_paper',
          share_percent: 100,
          class: 'Will',
          note: 'No living heirs found'
        }],
        total_percent: 100
      };
    }

    const shares = {};
    const share_per_heir = 100 / living_heirs.length;

    living_heirs.forEach(heir => {
      if (!shares[heir.heir_type]) {
        shares[heir.heir_type] = {
          share_percent: 0,
          class: heir.class,
          individual_count: 0,
          individual_share_percent: parseFloat(share_per_heir.toFixed(2))
        };
      }
      shares[heir.heir_type].share_percent += share_per_heir;
      shares[heir.heir_type].individual_count += 1;
    });

    return this.format_output(shares);
  }

  format_output(shares) {
    const computed_shares = [];
    Object.keys(shares).forEach(heir_type => {
      const group = shares[heir_type];
      computed_shares.push({
        heir_type: heir_type, // Already prefixed from the living_heirs creation
        share_percent: parseFloat(group.share_percent.toFixed(2)),
        class: group.class,
        individual_count: group.individual_count,
        individual_share_percent: group.individual_share_percent,
        note: `${group.individual_count} living member(s) - ${group.individual_share_percent}% each`
      });
    });

    const total_percent = computed_shares.reduce((sum, share) => sum + share.share_percent, 0);
    return {
      computed_shares,
      total_percent: parseFloat(total_percent.toFixed(2))
    };
  }

  get_prefixed_heir_type(heir_type, gender, deceased_data) {
    // These relationships don't need prefixes
    if (['son', 'daughter', 'wife', 'husband', 'will_paper'].includes(heir_type)) {
      return heir_type;
    }
    
    const prefix = this.get_prefix(gender, deceased_data);
    const map = {
      'mother': `${prefix}mother`,
      'father': `${prefix}father`,
      'brother': `${prefix}brother`,
      'sister': `${prefix}sister`
    };
    
    return map[heir_type] || heir_type;
  }

  get_prefix(gender, deceased_data) {
    if (deceased_data.religion === 'hindu' && gender === 'female') {
      const use_husbands_family = deceased_data.married && !deceased_data.divorced;
      return use_husbands_family ? 'husbands_' : 'wife_';
    }
    return gender === 'male' ? 'husbands_' : 'wife_';
  }

  get_individual_shares(computed_shares) {
    const individual_shares = {};
    computed_shares.forEach(share => {
      individual_shares[share.heir_type] = {
        individual_share_percent: share.individual_share_percent || 0,
        total_share_percent: share.share_percent || 0,
        count: share.individual_count || 1
      };
    });
    return individual_shares;
  }
}

module.exports = new HinduInheritanceCalculator();