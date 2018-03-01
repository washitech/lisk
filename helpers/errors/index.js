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

class LiskError extends Error {
	constructor(message, ...args) {
		// Pass remaining parameters to parent Error constructor
		super(...args);

		this.name = this.constructor.name;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, LiskError);
		}

		// custom debugging information
		this.message = message;
		this.date = new Date();
	}
}

class HTTPServerError extends LiskError {
	constructor(message, statusCode, ...args) {
		// Pass remaining parameters to parent Error constructor
		super(message, ...args);

		this.name = this.constructor.name;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, HTTPServerError);
		}

		// custom debugging information
		this.statusCode = statusCode;
	}
}

class InvalidArgumentError extends LiskError {
	constructor(message, ...args) {
		// Pass remaining parameters to parent Error constructor
		super(message, ...args);

		this.name = this.constructor.name;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, InvalidArgumentError);
		}
	}
}

class ParamValidationError extends LiskError {
	constructor(message, params, ...args) {
		// Pass remaining parameters to parent Error constructor
		super(message, ...args);

		this.name = this.constructor.name;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ParamValidationError);
		}

		// custom debugging information
		this.params = params;
	}
}

class SQLError extends LiskError {
	constructor(message, statusCode, ...args) {
		// Pass remaining parameters to parent Error constructor
		super(message, ...args);

		this.name = this.constructor.name;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, SQLError);
		}

		// custom debugging information
		this.statusCode = statusCode;
	}
}

module.exports = {
	LiskError,
	HTTPServerError,
	InvalidArgumentError,
	ParamValidationError,
	SQLError,
};

Object.freeze(module.exports);
