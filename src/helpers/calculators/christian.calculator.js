class ChristianInheritanceCalculator {
  calculate_shares(survey_data) {
    try {
      const { deceased } = survey_data;
      const computed_shares = [];

      const distribution = this.apply_christian_distribution_rules(deceased);

      //* Convert to computed shares format
      Object.keys(distribution).forEach(heir_type => {
        const share_data = distribution[heir_type];

        computed_shares.push({
          heir_type: heir_type,
          share_percent: parseFloat(share_data.share_percent.toFixed(2)),
          class: share_data.class,
          individual_count: share_data.count,
          individual_share_percent: share_data.individual_share,
          note: share_data.note
        });
      });

      const total_percent = computed_shares.reduce((sum, share) => sum + share.share_percent, 0);

      return {
        computed_shares,
        total_percent: parseFloat(total_percent.toFixed(2))
      };

    } catch (error) {
      throw new Error('Failed to calculate Christian inheritance shares');
    }
  }

  apply_christian_distribution_rules(deceased) {
    const distribution = {};
    const is_male = deceased.gender === 'male';
    const has_spouse = deceased.married && deceased.spouse_alive;
    const living_children = (deceased.children?.sons || 0) + (deceased.children?.daughters || 0);
    const has_children = living_children > 0;
    const has_father = deceased.parents?.father_alive;
    const has_mother = deceased.parents?.mother_alive;
    const has_brothers = deceased.siblings?.brothers > 0;
    const has_sisters = deceased.siblings?.sisters > 0;
    const has_siblings = has_brothers || has_sisters;
    const total_siblings = (deceased.siblings?.brothers || 0) + (deceased.siblings?.sisters || 0);

    const spouse_type = is_male ? 'wife' : 'husband';
    const father_type = is_male ? 'husbands_father' : 'wife_father';
    const mother_type = is_male ? 'husbands_mother' : 'wife_mother';
    const brother_type = is_male ? 'husbands_brother' : 'wife_brother';
    const sister_type = is_male ? 'husbands_sister' : 'wife_sister';

    //* ===== MARRIED SCENARIOS =====
    if (deceased.married) {
      if (has_spouse && !has_children) {
        if (has_father && has_mother) {
          distribution[spouse_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Spouse gets 1/2 share' };
          distribution[father_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Father gets 1/2 share' };
        } else if (has_mother && !has_father && !has_siblings) {
          distribution[spouse_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Spouse gets 1/2 share' };
          distribution[mother_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Mother gets 1/2 share' };
        } else if (has_mother && !has_father && has_siblings) {
          distribution[spouse_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Spouse gets 1/2 share' };
          const remaining_share = 50;
          const remaining_heirs = 1 + (deceased.siblings?.brothers || 0) + (deceased.siblings?.sisters || 0);
          const share_per_heir = remaining_share / remaining_heirs;

          distribution[mother_type] = { share_percent: share_per_heir, class: 'Class 1', count: 1, individual_share: share_per_heir, note: `Mother gets ${share_per_heir.toFixed(2)}%` };

          if (has_brothers) {
            distribution[brother_type] = {
              share_percent: share_per_heir * deceased.siblings.brothers,
              class: 'Class 1',
              count: deceased.siblings.brothers,
              individual_share: share_per_heir,
              note: `${deceased.siblings.brothers} brother(s) get ${share_per_heir.toFixed(2)}% each`
            };
          }

          if (has_sisters) {
            distribution[sister_type] = {
              share_percent: share_per_heir * deceased.siblings.sisters,
              class: 'Class 1',
              count: deceased.siblings.sisters,
              individual_share: share_per_heir,
              note: `${deceased.siblings.sisters} sister(s) get ${share_per_heir.toFixed(2)}% each`
            };
          }
        } else if (has_father && !has_mother && !has_siblings) {
          distribution[spouse_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Spouse gets 1/2 share' };
          distribution[father_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Father gets 1/2 share' };
        } else if (has_father && !has_mother && has_siblings) {
          distribution[spouse_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Spouse gets 1/2 share' };
          distribution[father_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Father gets 1/2 share' };
        } else if (!has_father && !has_mother && !has_siblings) {
          distribution[spouse_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Spouse gets 100% share' };
        } else if (!has_father && !has_mother && has_siblings) {
          distribution[spouse_type] = { share_percent: 50, class: 'Class 1', count: 1, individual_share: 50, note: 'Spouse gets 1/2 share' };
          const remaining_share = 50;
          const total_siblings = (deceased.siblings?.brothers || 0) + (deceased.siblings?.sisters || 0);
          const share_per_sibling = remaining_share / total_siblings;

          if (has_brothers) {
            distribution[brother_type] = {
              share_percent: share_per_sibling * deceased.siblings.brothers,
              class: 'Class 1',
              count: deceased.siblings.brothers,
              individual_share: share_per_sibling,
              note: `${deceased.siblings.brothers} brother(s) get ${share_per_sibling.toFixed(2)}% each`
            };
          }

          if (has_sisters) {
            distribution[sister_type] = {
              share_percent: share_per_sibling * deceased.siblings.sisters,
              class: 'Class 1',
              count: deceased.siblings.sisters,
              individual_share: share_per_sibling,
              note: `${deceased.siblings.sisters} sister(s) get ${share_per_sibling.toFixed(2)}% each`
            };
          }
        }
      }
      else if (has_spouse && has_children) {
        const spouse_share = 33.33;
        const children_share = 66.67;
        const share_per_child = children_share / living_children;

        distribution[spouse_type] = {
          share_percent: spouse_share,
          class: 'Class 1',
          count: 1,
          individual_share: spouse_share,
          note: 'Spouse gets 1/3 share'
        };

        if (deceased.children?.sons > 0) {
          distribution['son'] = {
            share_percent: share_per_child * deceased.children.sons,
            class: 'Class 1',
            count: deceased.children.sons,
            individual_share: share_per_child,
            note: `${deceased.children.sons} son(s) get ${share_per_child.toFixed(2)}% each (2/3 share divided equally)`
          };
        }

        if (deceased.children?.daughters > 0) {
          distribution['daughter'] = {
            share_percent: share_per_child * deceased.children.daughters,
            class: 'Class 1',
            count: deceased.children.daughters,
            individual_share: share_per_child,
            note: `${deceased.children.daughters} daughter(s) get ${share_per_child.toFixed(2)}% each (2/3 share divided equally)`
          };
        }
      }
      else if (!has_spouse && deceased.married) {
        if (has_children) {
          const share_per_child = 100 / living_children;

          if (deceased.children?.sons > 0) {
            distribution['son'] = {
              share_percent: share_per_child * deceased.children.sons,
              class: 'Class 1',
              count: deceased.children.sons,
              individual_share: share_per_child,
              note: `${deceased.children.sons} son(s) get ${share_per_child.toFixed(2)}% each (100% share divided equally)`
            };
          }

          if (deceased.children?.daughters > 0) {
            distribution['daughter'] = {
              share_percent: share_per_child * deceased.children.daughters,
              class: 'Class 1',
              count: deceased.children.daughters,
              individual_share: share_per_child,
              note: `${deceased.children.daughters} daughter(s) get ${share_per_child.toFixed(2)}% each (100% share divided equally)`
            };
          }
        } else {
          if (has_father && has_mother) {
            distribution[father_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Father gets 100% share' };
          } else if (has_mother && !has_father && !has_siblings) {
            distribution[mother_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Mother gets 100% share' };
          } else if (has_mother && !has_father && has_siblings) {
            const total_heirs = 1 + total_siblings;
            const share_per_heir = 100 / total_heirs;

            distribution[mother_type] = { share_percent: share_per_heir, class: 'Class 1', count: 1, individual_share: share_per_heir, note: `Mother gets ${share_per_heir.toFixed(2)}%` };

            if (has_brothers) {
              distribution[brother_type] = {
                share_percent: share_per_heir * deceased.siblings.brothers,
                class: 'Class 1',
                count: deceased.siblings.brothers,
                individual_share: share_per_heir,
                note: `${deceased.siblings.brothers} brother(s) get ${share_per_heir.toFixed(2)}% each`
              };
            }

            if (has_sisters) {
              distribution[sister_type] = {
                share_percent: share_per_heir * deceased.siblings.sisters,
                class: 'Class 1',
                count: deceased.siblings.sisters,
                individual_share: share_per_heir,
                note: `${deceased.siblings.sisters} sister(s) get ${share_per_heir.toFixed(2)}% each`
              };
            }
          } else if (has_father && !has_mother) {
            distribution[father_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Father gets 100% share' };
          } else if (!has_father && !has_mother) {
            if (has_siblings) {
              const share_per_sibling = 100 / total_siblings;

              if (has_brothers) {
                distribution[brother_type] = {
                  share_percent: share_per_sibling * deceased.siblings.brothers,
                  class: 'Class 1',
                  count: deceased.siblings.brothers,
                  individual_share: share_per_sibling,
                  note: `${deceased.siblings.brothers} brother(s) get ${share_per_sibling.toFixed(2)}% each`
                };
              }

              if (has_sisters) {
                distribution[sister_type] = {
                  share_percent: share_per_sibling * deceased.siblings.sisters,
                  class: 'Class 1',
                  count: deceased.siblings.sisters,
                  individual_share: share_per_sibling,
                  note: `${deceased.siblings.sisters} sister(s) get ${share_per_sibling.toFixed(2)}% each`
                };
              }
            } else {
              distribution['distant_relative'] = { share_percent: 100, class: 'Class 2', count: 1, individual_share: 100, note: 'No immediate heirs - goes to distant relatives or government' };
            }
          }
        }
      }
    }
    //* ==== UNMARRIED/DIVORCED SCENARIOS ====
    else {
      if (has_children) {
        const share_per_child = 100 / living_children;

        if (deceased.children?.sons > 0) {
          distribution['son'] = {
            share_percent: share_per_child * deceased.children.sons,
            class: 'Class 1',
            count: deceased.children.sons,
            individual_share: share_per_child,
            note: `${deceased.children.sons} son(s) get ${share_per_child.toFixed(2)}% each (100% share divided equally)`
          };
        }

        if (deceased.children?.daughters > 0) {
          distribution['daughter'] = {
            share_percent: share_per_child * deceased.children.daughters,
            class: 'Class 1',
            count: deceased.children.daughters,
            individual_share: share_per_child,
            note: `${deceased.children.daughters} daughter(s) get ${share_per_child.toFixed(2)}% each (100% share divided equally)`
          };
        }
      } else {
        if (has_father && has_mother) {
          distribution[father_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Father gets 100% share' };
        } else if (has_mother && !has_father && !has_siblings) {
          distribution[mother_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Mother gets 100% share' };
        } else if (has_mother && !has_father && has_siblings) {
          const total_heirs = 1 + total_siblings;
          const share_per_heir = 100 / total_heirs;

          distribution[mother_type] = { share_percent: share_per_heir, class: 'Class 1', count: 1, individual_share: share_per_heir, note: `Mother gets ${share_per_heir.toFixed(2)}%` };

          if (has_brothers) {
            distribution[brother_type] = {
              share_percent: share_per_heir * deceased.siblings.brothers,
              class: 'Class 1',
              count: deceased.siblings.brothers,
              individual_share: share_per_heir,
              note: `${deceased.siblings.brothers} brother(s) get ${share_per_heir.toFixed(2)}% each`
            };
          }

          if (has_sisters) {
            distribution[sister_type] = {
              share_percent: share_per_heir * deceased.siblings.sisters,
              class: 'Class 1',
              count: deceased.siblings.sisters,
              individual_share: share_per_heir,
              note: `${deceased.siblings.sisters} sister(s) get ${share_per_heir.toFixed(2)}% each`
            };
          }
        } else if (has_father && !has_mother) {
          distribution[father_type] = { share_percent: 100, class: 'Class 1', count: 1, individual_share: 100, note: 'Father gets 100% share' };
        } else if (!has_father && !has_mother) {
          if (has_siblings) {
            const share_per_sibling = 100 / total_siblings;

            if (has_brothers) {
              distribution[brother_type] = {
                share_percent: share_per_sibling * deceased.siblings.brothers,
                class: 'Class 1',
                count: deceased.siblings.brothers,
                individual_share: share_per_sibling,
                note: `${deceased.siblings.brothers} brother(s) get ${share_per_sibling.toFixed(2)}% each`
              };
            }

            if (has_sisters) {
              distribution[sister_type] = {
                share_percent: share_per_sibling * deceased.siblings.sisters,
                class: 'Class 1',
                count: deceased.siblings.sisters,
                individual_share: share_per_sibling,
                note: `${deceased.siblings.sisters} sister(s) get ${share_per_sibling.toFixed(2)}% each`
              };
            }
          } else {
            distribution['distant_relative'] = { share_percent: 100, class: 'Class 2', count: 1, individual_share: 100, note: 'No immediate heirs - goes to distant relatives or government' };
          }
        }
      }
    }

    if (distribution['distant_relative']) {
      distribution['will_paper'] = {
        share_percent: 100,
        class: 'Will',
        count: 0,
        individual_share: 0,
        note: 'No immediate heirs - property goes to legal heirs or government'
      };
      delete distribution['distant_relative'];
    }

    //* Fallback if no distribution found
    if (Object.keys(distribution).length === 0) {
      distribution['will_paper'] = {
        share_percent: 100,
        class: 'Will',
        count: 0,
        individual_share: 0,
        note: 'No eligible heirs found under Christian law'
      };
    }

    return distribution;
  }
}

module.exports = new ChristianInheritanceCalculator();