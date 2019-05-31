if (typeof require !== 'undefined') {
  var Validator = require('../src/validator.js');
  var expect = require('chai').expect;
} else {
  var Validator = window.Validator;
  var expect = window.chai.expect;
}

describe('register a custom validation rule', function () {
  it('should be able to get validation rule', function () {
    Validator.register('telephone', function (val) {
      return val.match(/^\d{3}-\d{3}-\d{4}$/);
    });

    var validator = new Validator();
    expect(validator.getRule('telephone').validate).to.be.a.function;
  });

  it('should pass the custom telephone rule registration', function () {
    Validator.register('telephone', function (val) {
      return val.match(/^\d{3}-\d{3}-\d{4}$/);
    });

    var validator = new Validator({
      phone: '213-454-9988'
    }, {
        phone: 'telephone'
      });
    expect(validator.passes()).to.be.true;
  });

  it('should override custom rules', function () {
    Validator.register('string', function (val) {
      return true;
    });

    var validator = new Validator({
      field: ['not a string']
    }, {
        field: 'string'
      });

    expect(validator.passes()).to.be.true;
    expect(validator.fails()).to.be.false;
    Validator.register('string', function (val) {
      return typeof val === 'string';
    }, 'The :attribute must be a string.');
  });

  it('should throw error in case of unknown validator rule', function () {
    var validator = new Validator({
      field: 'test'
    }, {
        field: 'unknown'
      });

    expect(validator.passes).to.throw();
    expect(validator.fails).to.throw();
  });

  it('should allow to add custom validator to unknown validator rules', function () {
    Validator.registerMissedRuleValidator(function () {
      return true;
    });

    var validator = new Validator({
      field: 'test'
    }, {
        field: 'unknown'
      });

    expect(validator.passes()).to.be.true;
    expect(validator.fails()).to.be.false;
  });

  it('allow custom replacements to create a correct validation message', function () {
    Validator.register("before_day", function (val, ref) {
      return false;
    }, null, function(template, rule) {
      var parameters = rule.getParameters();
      return this._replacePlaceholders(rule, template, {
        before_day: this._getAttributeName(parameters[0])
      });
    });
    const validator = new Validator({
      orderFrom: 1,
      orderUntil: 2
    }, {
        orderFrom: 'before_day:orderUntil'
      }, {
        before_day: "\":attribute\" must be before \":before_day\"."
      });
    validator.setAttributeNames({
      orderFrom: 'Order From',
      orderUntil: 'Order Until',
      before_or_equal_day: "kaljsdflkajsdflkads"
    });

    expect(validator.fails()).to.be.true;
    expect(validator.errors.first('orderFrom')).to.equal('"Order From" must be before "Order Until".');
  });
});
