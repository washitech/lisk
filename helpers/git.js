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

var childProcess = require('child_process');

/**
 * Helper module for parsing git commit information.
 *
 * @module
 * @see Parent: {@link helpers}
 * @requires child_process
 */

/**
 * Returns hash of the last git commit if available.
 *
 * @returns {string} Hash of last git commit
 * @throws {Error} If cannot get last git commit
 */
function getLastCommit() {
	var spawn = childProcess.spawnSync('git', ['rev-parse', 'HEAD']);
	var err = spawn.stderr.toString().trim();

	if (err) {
		throw new Error(err);
	} else {
		return spawn.stdout.toString().trim();
	}
}

module.exports = {
	getLastCommit,
};
