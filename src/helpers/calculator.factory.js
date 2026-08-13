const hindu_calculator = require('./calculators/hindu.calculator');
const christian_calculator = require('./calculators/christian.calculator');
const muslim_calculator = require('./calculators/muslim.calculator');

class CalculatorFactory {
  get_calculator(religion) {
    switch (religion.toLowerCase()) {
      case 'hindu':
        return hindu_calculator;
      case 'christian':
        return christian_calculator;
      case 'muslim':
        return muslim_calculator;
      default:
        throw new Error(`Unsupported religion: ${religion}`);
    }
  }

  calculate_shares(survey_data) {
    const { deceased } = survey_data;
    const calculator = this.get_calculator(deceased.religion);
    return calculator.calculate_shares(survey_data);
  }
}

module.exports = new CalculatorFactory();