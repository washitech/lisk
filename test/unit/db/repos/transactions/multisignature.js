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

const DBSandbox = require('../../../../common/db_sandbox').DBSandbox;
const transactionsFixtures = require('../../../../fixtures/index').transactions;
const seeder = require('../../../../common/db_seed');
const transactionTypes = require('../../../../../helpers/transaction_types');

const numSeedRecords = 5;

let db;
let dbSandbox;
let multiSignaturesRepo;

describe('db', () => {
	before(done => {
		dbSandbox = new DBSandbox(
			__testContext.config.db,
			'lisk_test_db_transactions_multisignature'
		);

		dbSandbox.create((err, __db) => {
			db = __db;
			multiSignaturesRepo = db['transactions.multisignature'];
			done(err);
		});
	});

	after(done => {
		dbSandbox.destroy();
		done();
	});

	beforeEach(done => {
		seeder
			.seed(db)
			.then(() => done())
			.catch(done);
	});

	afterEach(done => {
		sinonSandbox.restore();
		seeder
			.reset(db)
			.then(() => done(null))
			.catch(done);
	});

	it('should initialize db.blocks repo', () => {
		return expect(multiSignaturesRepo).to.be.not.null;
	});

	describe('MultiSigTransactionsRepo', () => {
		describe('constructor()', () => {
			it('should assign param and data members properly', () => {
				expect(multiSignaturesRepo.db).to.be.eql(db);
				expect(multiSignaturesRepo.pgp).to.be.eql(db.$config.pgp);
				expect(multiSignaturesRepo.dbTable).to.be.eql('multisignatures');
				expect(multiSignaturesRepo.dbFields).to.be.eql([
					'min',
					'lifetime',
					'keysgroup',
					'transactionId',
				]);

				expect(multiSignaturesRepo.cs).to.be.an('object');
				expect(multiSignaturesRepo.cs).to.not.empty;
				return expect(multiSignaturesRepo.cs).to.have.all.keys('insert');
			});
		});

		describe('save', () => {
			it('should insert entry into "delegates" table for type 4 transactions', function*() {
				const block = seeder.getLastBlock();
				const transactions = [];
				for (let i = 0; i < numSeedRecords; i++) {
					transactions.push(
						transactionsFixtures.Transaction({
							blockId: block.id,
							type: transactionTypes.MULTI,
						})
					);
				}
				yield db.transactions.save(transactions);

				const result = yield db.query('SELECT * FROM multisignatures');

				expect(result).to.not.empty;
				expect(result).to.have.lengthOf(numSeedRecords);
				expect(result.map(r => r.min)).to.be.eql(
					transactions.map(t => t.asset.multisignature.min)
				);
				expect(result.map(r => r.lifetime)).to.be.eql(
					transactions.map(t => t.asset.multisignature.lifetime)
				);
				expect(result.map(r => r.keysgroup)).to.be.eql(
					transactions.map(t => t.asset.multisignature.keysgroup.join())
				);
				return expect(result.map(r => r.transactionId)).to.be.eql(
					transactions.map(t => t.id)
				);
			});
		});
	});
});
