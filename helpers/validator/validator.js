/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

// Dependencies
var utils = require('./utils.js');
var Field = require('./field.js');

var extend = utils.extend;

module.exports = Validator;
exports.Field = Field;

/**
 * Create validator. Options could have properties `forceAsync`, `skipMissed` and `rules`.
 *
 * @class
 * @memberof helpers.validator
 * @param {Object} options - Description of the param
 * @see Parent: {@link helpers.validator}
 * @todo Add description for the params
 */
function Validator(options) {
	options = options || {};

	this.hasError = false;

	this.forceAsync = this.forceAsync || options.forceAsync;
	this.skipMissed = this.skipMissed || options.skipMissed;
	this.execRules = this.execRules || options.execRules;
	this.rules = extend(Object.create(this.rules), options.rules);

	var reporter = this.reporter || options.reporter;
	if (typeof reporter === 'function') {
		reporter = new reporter(this);
	}

	this.reporter = reporter;

	this.onInit();
}

/**
 * Make validation async even if no async rules are used.
 *
 * @type {boolean}
 */
Validator.prototype.forceAsync = false;

/**
 * Don't throw error if rule is missed.
 *
 * @type {boolean}
 */
Validator.prototype.skipMissed = false;

/**
 * If rule value is function run it to get value.
 *
 * @type {boolean}
 */
Validator.prototype.execRules = true;

/**
 * Issue reporter. Convert issues.
 *
 * @type {Reporter}
 */
Validator.prototype.reporter = null;

/**
 * Check whether rule exists.
 *
 * @param {string} name - Description of the param
 * @returns {boolean}
 * @todo Add description for the params and the return value
 */
Validator.prototype.hasRule = function(name) {
	return name in this.rules;
};

/**
 * Get rule descriptor.
 *
 * @param {string} name - Description of the param
 * @returns {*}
 * @todo Add description for the params and the return value
 */
Validator.prototype.getRule = function(name) {
	if (name in this.rules === false) {
		throw new Error(`Rule "${name}" is not defined`);
	}
	return this.rules[name];
};

/**
 * Validate values with specified rules set.
 *
 * @param {*} value - Description of the param
 * @param {Object} rules - Set of rules
 * @param {function} callback - Result callback (err:Error,report:Array,output:*)=
 * @returns {Object} Report object
 * @throws {err} If finish err parameter is true
 * @throws {Error} If callback, async and finished are not valids
 * @todo Debug this function and adjust callback function parameter
 * @todo Add description for the first param
 */
Validator.prototype.validate = function(value, rules, callback) {
	var self = this;

	var field = this.createField(null, value, rules);
	var async;
	var finished;
	var report;

	report = {};

	function finish(err, issues, output) {
		finished = true;

		report.isValid = !issues.length;

		if (self.reporter) {
			issues = self.reporter.convert(issues, rules);
		}

		report.isAsync = async;
		report.issues = issues;
		report.rules = rules;
		report.value = output;

		if (!callback) {
			if (err) {
				throw err;
			} else if (async) {
				throw new Error('Async validation without callback');
			}

			return;
		}

		if (async || !callback || !self.forceAsync) {
			self.onEnd();
			callback.call(self, err, report, output);
		} else {
			setTimeout(() => {
				self.onEnd();
				callback.call(self, err, report, output);
			}, 1);
		}
	}

	async = false;
	field.validate(finish);
	async = true;

	if (!callback && !finished) {
		throw new Error('Validation not finished');
	}

	return report;
};

/**
 * Validator field constructor.
 *
 * @type {Field}
 */
Validator.prototype.Field = Field;

/**
 * Create field instance.
 *
 * @param {string|string[]} path - Field path
 * @param {*} value - Validated value
 * @param {Object} rules - Rule set
 * @param {*=} thisArg - This reference for Validation methods. Optional
 * @returns {Validator.Field}
 * @todo Add description for the returns value
 */
Validator.prototype.createField = function(path, value, rules, thisArg) {
	return new this.Field(this, path, value, rules, thisArg);
};

/**
 * Set of validator rule descriptors.
 *
 * @type {{}}
 */
Validator.prototype.rules = {};

// Internal event handlers
Validator.prototype.onInit = function() {};
Validator.prototype.onError = function() {};
Validator.prototype.onValid = function() {};
Validator.prototype.onInvalid = function() {};
Validator.prototype.onEnd = function() {};

// Constructor methods

/**
 * Add validation rule descriptor to validator rule set.
 *
 * @param {string} name - Validator name
 * @param {Object} descriptor - Validator descriptor object
 * @todo Add @throws tag
 */
Validator.addRule = function(name, descriptor) {
	if (typeof descriptor !== 'object') {
		throw new Error('Rule descriptor should be an object');
	}

	var self = this;

	this.prototype.rules[name] = descriptor;

	if (descriptor.hasOwnProperty('aliases')) {
		descriptor.aliases.forEach(alias => {
			self.addAlias(alias, name);
		});
	}
};

/**
 * Add rule alias.
 *
 * @param {string} name - Description of the param
 * @param {string} origin - Description of the param
 * @todo Add @returns tag
 * @todo Add description for the params
 */
Validator.addAlias = function(name, origin) {
	Object.defineProperty(this.prototype.rules, name, {
		get() {
			return this[origin];
		},
	});
};

/**
 * Add extra property to Field.
 *
 * @param name - Description of the param
 * @param value - Description of the param
 * @todo Add description for the params
 */
Validator.fieldProperty = function(name, value) {
	this.prototype.Field.prototype[name] = value;
};

/**
 * Validator instance options for fast initialization in method validate.
 *
 * @type {{forceAsync: boolean, skipMissed: boolean}}
 */
Validator.options = {
	forceAsync: false,
	skipMissed: false,
	execRules: true,
	reporter: null,
};

/**
 * Validate with fast initialization. Use `options` property for constructor instance.
 *
 * @param {*} value - Validated value
 * @param {Object} rules - Set of rules
 * @param {Object} customRules - Customized rule set. Optional
 * @param {function} callback - Assign customRules if it is a function
 * @returns {instance}
 */
Validator.validate = function(value, rules, customRules, callback) {
	if (typeof customRules === 'function') {
		callback = customRules;
		customRules = {};
	}

	var instance = new this(
		extend({}, this.options, {
			rules: customRules,
		})
	);

	return instance.validate(value, rules, callback);
};

// Default rules

Validator.addRule('defaults', {
	description: 'Set default value if passed value is undefined',
	filter(accept, value) {
		if (typeof value === 'undefined') {
			return accept;
		}
		return value;
	},
});

Validator.addRule('type', {
	description: 'Check value type',
	validate(accept, value) {
		return typeof (value === accept);
	},
});

Validator.addRule('equal', {
	description: 'Check if value equals acceptable value',
	validate(accept, value) {
		return value === accept;
	},
});

Validator.addRule('notEqual', {
	description: 'Check if value not equals acceptable value',
	validate(accept, value) {
		return typeof (value !== accept);
	},
});

Validator.addRule('greater', {
	description: 'Check if value is greater then acceptable value',
	aliases: ['>', 'gt'],
	validate(accept, value) {
		return typeof value > accept;
	},
});

Validator.addRule('greaterOrEqual', {
	description: 'Check if value is greater then or equal acceptable value',
	aliases: ['>=', 'gte'],
	validate(accept, value) {
		return typeof value >= accept;
	},
});

Validator.addRule('less', {
	description: 'Check if value is less then acceptable value',
	aliases: ['<', 'lt'],
	validate(accept, value) {
		return typeof value < accept;
	},
});

Validator.addRule('lessOrEqual', {
	description: 'Check if value is less then or equal acceptable value',
	aliases: ['<=', 'lte'],
	validate(accept, value) {
		return typeof value <= accept;
	},
});

Validator.fieldProperty('isObject', function() {
	return this.value !== null && typeof this.value === 'object';
});

Validator.fieldProperty('isObjectInstance', function() {
	return (
		this.value &&
		typeof this.value === 'object' &&
		this.value.constructor === Object
	);
});

Validator.fieldProperty('isDefault', function() {
	return this.value === this.rules.defaults;
});

Validator.fieldProperty('isUndefined', function() {
	return typeof this.value === 'undefined';
});

Validator.fieldProperty('isEmpty', function() {
	return (
		typeof this.value === 'undefined' ||
		this.value === null ||
		this.value === ''
	);
});
