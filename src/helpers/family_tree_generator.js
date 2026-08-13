const calculator_factory = require('./calculator.factory');

class family_tree_generator {
  generate_unique_id(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generate_family_tree(survey, existing_tree = null) {
    const { deceased, computed_shares } = survey;
    const tree = {
      id: 'you',
      name: 'You',
      relationship: 'self',
      gender: deceased.gender,
      living_status: 'deceased',
      share_percent: 0,
      children: []
    };

    const individual_shares = this.get_individual_shares(computed_shares, deceased.religion);

    //* Add spouse
    if (deceased.married) {
      const spouse_heir_type = deceased.gender === 'male' ? 'wife' : 'husband';
      const spouse_share = individual_shares[spouse_heir_type];
      const share_percent = deceased.spouse_alive && spouse_share ? spouse_share.individual_share_percent : 0;
      tree.spouse = {
        id: this.generate_unique_id(spouse_heir_type),
        name: deceased.gender === 'male' ? 'Wife' : 'Husband',
        relationship: spouse_heir_type,
        heir_type: spouse_heir_type,
        gender: deceased.gender === 'male' ? 'female' : 'male',
        living_status: deceased.spouse_alive ? 'alive' : 'deceased',
        share_percent: share_percent,
        description: this.get_legal_description(spouse_heir_type, share_percent, deceased.religion, spouse_heir_type, deceased, deceased.spouse_alive ? 'alive' : 'deceased'  )
      };
    }

    //* Add children (including deceased)
    if (deceased.children && (
      deceased.children.sons > 0 ||
      deceased.children.daughters > 0 ||
      deceased.children.deceased_sons > 0 ||
      deceased.children.deceased_daughters > 0
    )) {
      const existing_children = existing_tree?.children || [];
      tree.children = this.generate_children(deceased, individual_shares, existing_children);
    }

    tree.parents = this.generate_parents(deceased, individual_shares, deceased.religion, deceased.gender);
    tree.siblings = this.generate_siblings(deceased, individual_shares, deceased.religion, deceased.gender);

    return tree;
  }

  generate_children(deceased, individual_shares, existing_children = []) {
    const children = [];
    const son_share = individual_shares['son'];
    const daughter_share = individual_shares['daughter'];

    //* Living sons
    for (let i = 1; i <= deceased.children.sons; i++) {
      const id = this.generate_unique_id(`son_${i}`);
      const existing = existing_children.find(c => c.relationship === 'son' && c.living_status === 'alive');
      const share_percent = son_share ? son_share.individual_share_percent : 0;
      children.push({
        id,
        name: existing?.name || `Son ${i}`,
        relationship: 'son',
        heir_type: 'son',
        gender: 'male',
        living_status: 'alive',
        share_percent: share_percent,
        description: this.get_legal_description('son', share_percent, deceased.religion, 'son', deceased, 'alive')
      });
    }

    //* Deceased sons
    for (let i = 1; i <= (deceased.children.deceased_sons || 0); i++) {
      const id = this.generate_unique_id(`deceased_son_${i}`);
      const existing = existing_children.find(c => c.relationship === 'son' && c.living_status === 'deceased');
      children.push({
        id,
        name: existing?.name || `Son ${deceased.children.sons + i}`,
        relationship: 'son',
        heir_type: 'son',
        gender: 'male',
        living_status: 'deceased',
        share_percent: 0,
        description: this.get_legal_description('son', 0, deceased.religion, 'son', deceased, 'deceased')
      });
    }

    //* Living daughters
    for (let i = 1; i <= deceased.children.daughters; i++) {
      const id = this.generate_unique_id(`daughter_${i}`);
      const existing = existing_children.find(c => c.relationship === 'daughter' && c.living_status === 'alive');
      const share_percent = daughter_share ? daughter_share.individual_share_percent : 0;
      children.push({
        id,
        name: existing?.name || `Daughter ${i}`,
        relationship: 'daughter',
        heir_type: 'daughter',
        gender: 'female',
        living_status: 'alive',
        share_percent: share_percent,
        description: this.get_legal_description('daughter', share_percent, deceased.religion, 'daughter', deceased, 'alive')
      });
    }

    //* Deceased daughters
    for (let i = 1; i <= (deceased.children.deceased_daughters || 0); i++) {
      const id = this.generate_unique_id(`deceased_daughter_${i}`);
      const existing = existing_children.find(c => c.relationship === 'daughter' && c.living_status === 'deceased');
      children.push({
        id,
        name: existing?.name || `Daughter ${deceased.children.daughters + i}`,
        relationship: 'daughter',
        heir_type: 'daughter',
        gender: 'female',
        living_status: 'deceased',
        share_percent: 0,
        description: this.get_legal_description('daughter', 0, deceased.religion, 'daughter', deceased, 'deceased')
      });
    }

    return children;
  }

  generate_parents(deceased, individual_shares, religion, gender) {
    const parents = [];

    if (deceased.parents?.mother_alive) {
      const heir_type = this.get_heir_type_for_relationship('mother', religion, gender, deceased);
      const share = individual_shares[heir_type];
      const share_percent = share ? share.individual_share_percent : 0;
      parents.push({
        id: this.generate_unique_id('mother'),
        name: 'Mother',
        relationship: 'mother',
        heir_type,
        gender: 'female',
        living_status: 'alive',
        share_percent: share_percent,
        description: this.get_legal_description(heir_type, share_percent, religion, 'mother', deceased, 'alive')
      });
    }

    if (deceased.parents?.father_alive) {
      const heir_type = this.get_heir_type_for_relationship('father', religion, gender, deceased);
      const share = individual_shares[heir_type];
      const share_percent = share ? share.individual_share_percent : 0;
      parents.push({
        id: this.generate_unique_id('father'),
        name: 'Father',
        relationship: 'father',
        heir_type,
        gender: 'male',
        living_status: 'alive',
        share_percent: share_percent,
        description: this.get_legal_description(heir_type, share_percent, religion, 'father', deceased, 'alive')
      });
    }

    return parents;
  }

  generate_siblings(deceased, individual_shares, religion, gender) {
    const siblings = [];
    const brothers = deceased.siblings?.brothers || 0;
    const sisters = deceased.siblings?.sisters || 0;

    const brother_heir_type = this.get_heir_type_for_relationship('brother', religion, gender, deceased);
    const sister_heir_type = this.get_heir_type_for_relationship('sister', religion, gender, deceased);
    const brother_share = individual_shares[brother_heir_type];
    const sister_share = individual_shares[sister_heir_type];

    for (let i = 1; i <= brothers; i++) {
      const share_percent = brother_share ? brother_share.individual_share_percent : 0;
      siblings.push({
        id: this.generate_unique_id(`brother_${i}`),
        name: `Brother ${i}`,
        relationship: 'brother',
        heir_type: brother_heir_type,
        gender: 'male',
        living_status: 'alive',
        share_percent: share_percent,
        description: this.get_legal_description(brother_heir_type, share_percent, religion, 'brother', deceased, 'alive')
      });
    }

    for (let i = 1; i <= sisters; i++) {
      const share_percent = sister_share ? sister_share.individual_share_percent : 0;
      siblings.push({
        id: this.generate_unique_id(`sister_${i}`),
        name: `Sister ${i}`,
        relationship: 'sister',
        heir_type: sister_heir_type,
        gender: 'female',
        living_status: 'alive',
        share_percent: share_percent,
        description: this.get_legal_description(sister_heir_type, share_percent, religion, 'sister', deceased, 'alive')
      });
    }

    return siblings;
  }

  get_heir_type_for_relationship(relationship, religion, gender, deceased_data = null) {
    const effective_religion = deceased_data?.inter_caste ? 'christian' : religion;

    let prefix = gender === 'male' ? 'husbands_' : 'wife_';

    if (effective_religion === 'hindu' && gender === 'female') {
      const use_husbands_family = deceased_data?.married && !deceased_data?.divorced;
      prefix = use_husbands_family ? 'husbands_' : 'wife_';
    }

    const map = {
      son: 'son',
      daughter: 'daughter',
      wife: 'wife',
      husband: 'husband',
      mother: `${prefix}mother`,
      father: `${prefix}father`,
      brother: `${prefix}brother`,
      sister: `${prefix}sister`,
      residuary_heirs: 'residuary_heirs'
    };

    return map[relationship] || relationship;
  }

  get_individual_shares(computed_shares, religion) {
    try {
      const calculator = calculator_factory.get_calculator(religion);
      return calculator.get_individual_shares(computed_shares);
    } catch (error) {
      return this.extract_individual_shares_directly(computed_shares);
    }
  }

  extract_individual_shares_directly(computed_shares) {
    const shares = {};
    computed_shares.forEach(share => {
      shares[share.heir_type] = {
        individual_share_percent: share.individual_share_percent || 0,
        total_share_percent: share.share_percent || 0,
        count: share.individual_count || 1
      };
    });
    return shares;
  }

  get_share_for_relationship(relationship, individual_shares, religion, gender, deceased_data = null) {
    let heir_type;

    if (religion === 'christian') {
      if (gender === 'male') {
        const map = { son: 'son', daughter: 'daughter', wife: 'wife', mother: 'husbands_mother', father: 'husbands_father', brother: 'husbands_brother', sister: 'husbands_sister' };
        heir_type = map[relationship];
      } else {
        const map = { son: 'son', daughter: 'daughter', husband: 'husband', mother: 'wife_mother', father: 'wife_father', brother: 'wife_brother', sister: 'wife_sister' };
        heir_type = map[relationship];
      }
    } else if (religion === 'muslim') {
      const prefix = gender === 'male' ? 'husbands_' : 'wife_';
      const map = {
        son: 'son', daughter: 'daughter',
        wife: 'wife', husband: 'husband',
        mother: `${prefix}mother`, father: `${prefix}father`,
        brother: `${prefix}brother`, sister: `${prefix}sister`,
        residuary_heirs: 'residuary_heirs'
      };
      heir_type = map[relationship];
    } else {
      // Hindu
      if (gender === 'male') {
        const map = { son: 'son', daughter: 'daughter', wife: 'wife', mother: 'husbands_mother', father: 'husbands_father', brother: 'husbands_brother', sister: 'husbands_sister' };
        heir_type = map[relationship];
      } else {
        const use_husbands_family = deceased_data?.married && !deceased_data?.divorced;
        const prefix = use_husbands_family ? 'husbands_' : 'wife_';
        const map = {
          son: 'son', daughter: 'daughter', husband: 'husband',
          mother: `${prefix}mother`, father: `${prefix}father`,
          brother: `${prefix}brother`, sister: `${prefix}sister`
        };
        heir_type = map[relationship];
      }
    }
    return individual_shares[heir_type];
  }

  update_tree_shares(tree, computed_shares, religion, gender, deceased) {
    const individual_shares = this.get_individual_shares(computed_shares, religion);

    const update = (node) => {
      if (node.living_status === 'alive') {
        const share = this.get_share_for_relationship(node.relationship, individual_shares, religion, gender, deceased);
        const share_percent = share ? share.individual_share_percent : 0;
        node.share_percent = share_percent;
        node.description = this.get_legal_description(
          node.heir_type,
          share_percent,
          religion,
          node.relationship,
          deceased,
          node.living_status 
        );
      } else {
        node.share_percent = 0;
        node.description = this.get_legal_description(
          node.heir_type,
          0,
          religion,
          node.relationship,
          deceased,
          node.living_status 
        );
      }
      ['children', 'siblings', 'parents'].forEach(key => {
        if (node[key]) node[key].forEach(update);
      });
      if (node.spouse) update(node.spouse);
      return node;
    };

    const cloned = JSON.parse(JSON.stringify(tree));
    return update(cloned);
  }

  get_legal_description(heir_type, share_percent, religion, relationship, deceased_data = null, living_status = 'alive') {
  const religion_acts = {
    hindu: "Hindu Succession Act",
    muslim: "Muslim Personal Law",
    christian: "Indian Succession Act"
  };

  const act_name = religion_acts[religion.toLowerCase()] || `${religion.charAt(0).toUpperCase() + religion.slice(1)} Succession Law`;

  // Special handling only for wife/husband relationships
  if (relationship === 'wife' || relationship === 'husband') {
    if (living_status === 'deceased') {
      const spouse_term = relationship === 'wife' ? 'Deceased wife' : 'Deceased husband';
      return `${spouse_term} is excluded`;
    }
    
    if (share_percent > 0) {
      const spouse_term = relationship === 'wife' ? 'Wife' : 'Husband';
      return `${spouse_term} receives ${share_percent}%, under ${act_name}`;
    } else {
      const spouse_term = relationship === 'wife' ? 'Wife' : 'Husband';
      return `${spouse_term} receives no share under ${act_name}`;
    }
  }

  // For all other relationships (son, daughter, mother, father, brother, sister)
  const plural_relationships = ['son', 'daughter', 'brother', 'sister'];
  
  if (share_percent > 0) {
    // Check if this is a plural relationship and we have multiple members
    if (plural_relationships.includes(relationship)) {
      // Get the count of living members for this relationship
      let member_count = 0;
      
      switch(relationship) {
        case 'son':
          member_count = deceased_data?.children?.sons || 0;
          break;
        case 'daughter':
          member_count = deceased_data?.children?.daughters || 0;
          break;
        case 'brother':
          member_count = deceased_data?.siblings?.brothers || 0;
          break;
        case 'sister':
          member_count = deceased_data?.siblings?.sisters || 0;
          break;
      }
      
      if (member_count > 1) {
        const plural_form = {
          son: 'Sons',
          daughter: 'Daughters', 
          brother: 'Brothers',
          sister: 'Sisters'
        }[relationship];
        
        return `${plural_form} receive ${share_percent}% Each, under ${act_name}`;
      }
    }
    
    // Singular case or non-plural relationships
    const singular_form = relationship.charAt(0).toUpperCase() + relationship.slice(1);
    return `${singular_form} receives ${share_percent}%, under ${act_name}`;
  } else {
    // For zero share percentage
    if (plural_relationships.includes(relationship)) {
      const plural_form = {
        son: 'Sons',
        daughter: 'Daughters',
        brother: 'Brothers', 
        sister: 'Sisters'
      }[relationship];
      
      return `${plural_form} receive no share under ${act_name}`;
    } else {
      const singular_form = relationship.charAt(0).toUpperCase() + relationship.slice(1);
      return `${singular_form} receives no share under ${act_name}`;
    }
  }
}

  get_default_name(relationship) {
    const names = {
      husband: "Husband", wife: "Wife",
      father: "Father", mother: "Mother",
      brother: "Brother", sister: "Sister",
      son: "Son", daughter: "Daughter"
    };
    const base = names[relationship] || relationship.charAt(0).toUpperCase() + relationship.slice(1);
    return `${base} ${Date.now().toString().slice(-5)}`;
  }

  get_gender(relationship) {
    if (["husband", "father", "brother", "son"].includes(relationship)) return "male";
    if (["wife", "mother", "sister", "daughter"].includes(relationship)) return "female";
    return null;
  }

  generate_member_node(relationship, memberData = {}, deceased) {
    const heir_type = this.get_heir_type_for_relationship(relationship, deceased.religion, deceased.gender, deceased);
    const share_percent = memberData.share_percent || 0;
    return {
      id: this.generate_unique_id(relationship),
      name: memberData.name || this.get_default_name(relationship),
      relationship,
      heir_type,
      gender: this.get_gender(relationship),
      living_status: memberData.living_status || "alive",
      share_percent: share_percent,
      description: this.get_legal_description(heir_type, share_percent, deceased.religion, relationship, deceased, memberData.living_status || "alive")
    };
  }

  add_member(tree, relationship, memberData = {}, deceased) {
    const newMember = this.generate_member_node(relationship, memberData, deceased);

    switch (relationship) {
      case "husband":
      case "wife":
        tree.spouse = newMember;
        break;
      case "father":
      case "mother":
        if (!tree.parents) tree.parents = [];
        tree.parents = tree.parents.filter(p => p.relationship !== relationship);
        tree.parents.push(newMember);
        break;
      case "brother":
      case "sister":
        if (!tree.siblings) tree.siblings = [];
        tree.siblings.push(newMember);
        break;
      case "son":
      case "daughter":
        if (!tree.children) tree.children = [];
        tree.children.push(newMember);
        break;
      default:
        throw new Error(`Unsupported relationship: ${relationship}`);
    }
    return tree;
  }

  add_child(tree, parent_id, child_data) {
    const add = (node) => {
      if (node.id === parent_id) {
        if (!node.children) node.children = [];
        const count = node.children.filter(c => c.relationship === child_data.relationship).length + 1;
        node.children.push({
          id: `${child_data.relationship}-${count}`,
          name: child_data.name || `${child_data.relationship.charAt(0).toUpperCase() + child_data.relationship.slice(1)} ${count}`,
          relationship: child_data.relationship,
          heir_type: child_data.relationship,
          gender: child_data.gender,
          living_status: child_data.living_status || 'alive',
          share_percent: 0,
        });
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (add(child)) return true;
        }
      }
      return false;
    };
    add(tree);
    return tree;
  }

  update_member(tree, member_id, updates) {
    const update = (node) => {
      if (node.id === member_id) {
        Object.keys(updates).forEach(key => {
          if (updates[key] !== undefined && updates[key] !== null) {
            node[key] = updates[key];
          }
        });
        return node;
      }
      if (node.spouse?.id === member_id) Object.assign(node.spouse, updates);
      if (node.children) node.children = node.children.map(update);
      if (node.siblings) node.siblings = node.siblings.map(update);
      if (node.parents) node.parents.forEach(p => p.id === member_id && Object.assign(p, updates));
      return node;
    };
    return update(tree);
  }

  remove_member_from_tree(tree, member_id) {
    const remove = (node) => {
      if (node.children) node.children = node.children.filter(c => c.id !== member_id).map(remove);
      if (node.siblings) node.siblings = node.siblings.filter(s => s.id !== member_id).map(remove);
      if (node.parents) node.parents = node.parents.filter(p => p.id !== member_id);
      if (node.spouse?.id === member_id) delete node.spouse;
      return node;
    };
    return remove(tree);
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
}

module.exports = new family_tree_generator();