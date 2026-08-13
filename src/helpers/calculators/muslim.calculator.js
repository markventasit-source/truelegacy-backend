class MuslimInheritanceCalculator {
  calculate_shares(survey_data) {
    const { deceased } = survey_data;

    const sons = deceased.children?.sons || 0;
    const daughters = deceased.children?.daughters || 0;
    const hasChildren = sons + daughters > 0;
    const hasSons = sons > 0;

    const fatherAlive = deceased.parents?.father_alive || false;
    const motherAlive = deceased.parents?.mother_alive || false;

    const brothers = deceased.siblings?.brothers || 0;
    const sisters = deceased.siblings?.sisters || 0;

    const spouseAlive = deceased.spouse_alive || false;
    const isMale = deceased.gender === "male";

    // Define keys ONCE at the top — used everywhere
    const wifeKey = "wife";
    const husbandKey = "husband";
    const motherKey = isMale ? "husbands_mother" : "wife_mother";
    const fatherKey = isMale ? "husbands_father" : "wife_father";
    const brotherKey = isMale ? "husbands_brother" : "wife_brother";
    const sisterKey = isMale ? "husbands_sister" : "wife_sister";

    const shares = {};
    let totalFixed = 0;

    // ==================== 1. FIXED SHARES ====================

    // Spouse
    if (spouseAlive) {
      const spouseShare = isMale
        ? (hasChildren ? 12.5 : 25)     // wife
        : (hasChildren ? 25 : 50);      // husband

      shares[isMale ? wifeKey : husbandKey] = {
        share: spouseShare,
        count: 1,
        individual_share: spouseShare
      };
      totalFixed += spouseShare;
    }

    // Father — always gets 1/6 fixed if alive
    if (fatherAlive) {
      shares[fatherKey] = { share: 16.6667, count: 1, individual_share: 16.6667 };
      totalFixed += 16.6667;
    }

    // Mother
    if (motherAlive) {
      const motherFixed = hasChildren ? 16.6667 : 33.3333;
      shares[motherKey] = { share: motherFixed, count: 1, individual_share: motherFixed };
      totalFixed += motherFixed;
    }

    // Daughters (only when no sons)
    if (!hasSons && daughters > 0) {
      if (daughters === 1) {
        shares.daughter = { share: 50, count: 1, individual_share: 50 };
      } else {
        const total = 66.6667;
        shares.daughter = {
          share: total,
          count: daughters,
          individual_share: total / daughters
        };
      }
      totalFixed += shares.daughter.share;
    }

    let residuary = 100 - totalFixed;

    // ==================== 2. RESIDUARY ====================

    if (residuary > 0.01) {
      // 1. Sons + daughters 2:1
      if (hasSons) {
        const totalParts = sons * 2 + daughters;
        const part = residuary / totalParts;

        shares.son = {
          share: part * 2 * sons,
          count: sons,
          individual_share: part * 2
        };

        if (daughters > 0) {
          const dauTotal = part * daughters;
          shares.daughter = shares.daughter || { share: 0, count: daughters };
          shares.daughter.share += dauTotal;
          shares.daughter.individual_share = dauTotal / daughters;
        }
      }
      // 2. Father gets all residuary
      else if (fatherAlive) {
        shares[fatherKey].share += residuary;
        shares[fatherKey].individual_share += residuary;
      }
      // 3. Siblings 2:1
      else if ((brothers > 0 || sisters > 0) && !fatherAlive) {
        const totalParts = brothers * 2 + sisters;
        const part = residuary / totalParts;

        if (brothers > 0) {
          const broTotal = part * 2 * brothers;
          shares[brotherKey] = {
            share: broTotal,
            count: brothers,
            individual_share: broTotal / brothers
          };
        }
        if (sisters > 0) {
          const sisTotal = part * sisters;
          shares[sisterKey] = {
            share: sisTotal,
            count: sisters,
            individual_share: sisTotal / sisters
          };
        }
      }
      // 4. SPECIAL: Mother + Daughter(s) → 50/50 split
      else if (daughters > 0 && motherAlive && !fatherAlive && brothers === 0 && sisters === 0) {
        const half = residuary / 2;
        shares[motherKey].share += half;
        shares[motherKey].individual_share += half;

        shares.daughter.share += half;
        shares.daughter.individual_share = shares.daughter.share / daughters;
      }
      // 5. Only daughters
      else if (daughters > 0) {
        shares.daughter.share += residuary;
        shares.daughter.individual_share = shares.daughter.share / daughters;
      }
      // 6. Only mother
      else if (motherAlive) {
        shares[motherKey].share += residuary;
        shares[motherKey].individual_share += residuary;
      }
      // 7. Only SPOUSE 
      else if (spouseAlive) {
        const spouseKey = isMale ? "wife" : "husband";
        shares[spouseKey].share = 100;
        shares[spouseKey].individual_share = 100;
        residuary = 0;
      }
      // 8. Will paper
      else {
        shares.will_paper = { share: residuary, count: 1, individual_share: residuary };
      }
    }

    // ==================== 3. FORMAT OUTPUT ====================
    return this.format_output(shares, {
      isMale,
      wifeKey,
      husbandKey,
      motherKey,
      fatherKey,
      brotherKey,
      sisterKey
    });
  }

  format_output(shares, keys) {
    const {
      isMale,
      wifeKey,
      husbandKey,
      motherKey,
      fatherKey,
      brotherKey,
      sisterKey
    } = keys;

    const result = [];

    const add = (type, data) => {
      if (!data || data.share < 0.01) return;
      result.push({
        heir_type: type,
        share_percent: parseFloat(data.share.toFixed(4)),
        individual_count: data.count || 1,
        individual_share_percent: parseFloat((data.individual_share || data.share).toFixed(4)),
        class: "Class 1",
        note: data.note || ""
      });
    };

    // Order as expected by frontend
    if (shares[wifeKey]) add(wifeKey, shares[wifeKey]);
    if (shares[husbandKey]) add(husbandKey, shares[husbandKey]);
    if (shares.son) add("son", shares.son);
    if (shares.daughter) add("daughter", shares.daughter);
    if (shares[fatherKey]) add(fatherKey, shares[fatherKey]);
    if (shares[motherKey]) add(motherKey, shares[motherKey]);
    if (shares[brotherKey]) add(brotherKey, shares[brotherKey]);
    if (shares[sisterKey]) add(sisterKey, shares[sisterKey]);
    if (shares.will_paper) add("will_paper", shares.will_paper);

    const total = result.reduce((sum, h) => sum + h.share_percent, 0);

    return {
      computed_shares: result,
      total_percent: parseFloat(total.toFixed(2))
    };
  }
}

module.exports = new MuslimInheritanceCalculator();