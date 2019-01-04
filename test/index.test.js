const chai = require('chai');
const spies = require('chai-spies');
const chaiAsPromised = require('chai-as-promised');
chai.use(spies);
chai.use(chaiAsPromised);
const { assert, expect } = chai;
const { promiseAllMeta, symbols } = require('../index');

const iterable = [];
const iterator = () => {};
const onResolved = () => {};
const onRejected = () => {};

describe(`promiseAllMeta`, () => {
	it(`returns a function`, () => {
		return assert.isFunction(promiseAllMeta);
	});

	it(`accepts 4 arguments`, () => {
		return assert.equal(promiseAllMeta.length, 4);
	});

	it(`returns a promise when executed`, () => {
		return assert.exists(promiseAllMeta(iterable, iterator, onResolved, onRejected).then);
	});

	describe(`arguments`, () => {
		describe(`iterator`, () => {
			it(`is called with nth 'iterable' element as the argument`, () => {
				const iterable = [0, 1, 2];
				const iterator = (value) => Promise.resolve(value);
				const spy = chai.spy(iterator);

				promiseAllMeta(iterable, spy, onResolved, onRejected);

				expect(spy).to.have.been.called.exactly(3);
				expect(spy).to.have.been.first.called.with(0);
				expect(spy).to.have.been.second.called.with(1);
				expect(spy).to.have.been.third.called.with(2);
			});
		});

		describe(`onResolved`, () => {
			it(`is executed when the 'iterator' returned value resolves`, async () => {
				const iterable = [
					{ value: 0, reject: false },
					{ value: 1, reject: true },
					{ value: 2, reject: false },
				];
				const iterator = (value) => value.reject ? Promise.reject() : Promise.resolve();
				const resolveSpy = chai.spy(() => {});

				return promiseAllMeta(iterable, iterator, resolveSpy).catch((e) => {
					return expect(resolveSpy).to.have.been.called.exactly(2);
				});
			});

			it(`is passed the result of the returned 'iterator' promise`, async () => {
				const iterable = [0, 1, 2];
				const iterator = (value) => Promise.resolve(value);
				const onResolved = () => {};
				const spy = chai.spy(onResolved);

				await promiseAllMeta(iterable, iterator, spy, onRejected);

				expect(spy).to.have.been.first.called.with(0);
				expect(spy).to.have.been.second.called.with(1);
				expect(spy).to.have.been.third.called.with(2);
			});

			it(`merges the return value into the 'meta' property of the returned object`, () => {
				const iterable = [0, 1, 2];
				const iterator = (value) => Promise.resolve(value);

				const traversed = promiseAllMeta(iterable, iterator, (result) => {
					return {
						value: result,
					};
				});

				return traversed.then((results) => {
					assert.deepEqual(results[0].meta, { value: 0 });
					assert.deepEqual(results[1].meta, { value: 1 });
					assert.deepEqual(results[2].meta, { value: 2 });
				}).catch((e) => {
					assert.fail(e.message);
				});
			});
		});

		describe(`onRejected`, () => {
			it(`is executed when the 'iterator' returned value rejects`, () => {
				const iterable = [
					{ value: 0, reject: false },
					{ value: 1, reject: true },
					{ value: 2, reject: false },
				];
				const iterator = (value) => value.reject ? Promise.reject() : Promise.resolve();
				const rejectSpy = chai.spy(() => {});

				return promiseAllMeta(iterable, iterator, onResolved, rejectSpy).catch((e) => {
					expect(rejectSpy).to.have.been.called.exactly(1);
				});
			});

			it(`is passed the result of the returned 'iterator' promise`, () => {
				const iterable = [0, 1, 2];
				const iterator = (value) => Promise.reject(value);
				const onRejected = () => {};
				const spy = chai.spy(onRejected);

				return promiseAllMeta(iterable, iterator, onResolved, spy).catch((e) => {
					expect(spy).to.have.been.first.called.with(0);
					expect(spy).to.have.been.second.called.with(1);
					expect(spy).to.have.been.third.called.with(2);
				});
			});

			it(`merges the return value into the 'meta' property of the returned object`, () => {
				const iterable = [0, 1, 2];
				const iterator = (value) => Promise.reject(value);

				const traversed = promiseAllMeta(iterable, iterator, onResolved, (result) => {
					return {
						value: result,
					};
				});

				return traversed.catch(({ all }) => {
					assert.deepEqual(all[0].meta, { value: 0 });
					assert.deepEqual(all[1].meta, { value: 1 });
					assert.deepEqual(all[2].meta, { value: 2 });
				});
			});
		});
	});

	describe(`return value`, () => {
		describe(`.then`, () => {
			it(`executes the callback if all promises resolve`, () => {
				const iterable = [0, 1, 2];
				const iterator = () => Promise.resolve();

				return promiseAllMeta(iterable, iterator).then(() => {
					assert.isTrue(true)
				}).catch((e) => {
					assert.fail('.then was not called');
				});
			});

			it(`passes formatted results to the callback`, () => {
				const iterable = [0, 1, 2];
				const iterator = (value) => Promise.resolve(value);
				const expected = [{
					type: symbols.RESOLVED,
					result: 0,
					meta: {},
					error: null,
				},
				{
					type: symbols.RESOLVED,
					result: 1,
					meta: {},
					error: null,
				},
				{
					type: symbols.RESOLVED,
					result: 2,
					meta: {},
					error: null,
				}];

				return promiseAllMeta(iterable, iterator).then((results) => {
					assert.deepEqual(results, expected);
				}).catch((e) => {
					assert.fail('.then was not called');
				});
			});
		});

		describe(`.catch`, () => {
			it(`executes the callback if any iterator promise rejects`, () => {
				const iterable = [
					{ value: 0, reject: false },
					{ value: 1, reject: true },
					{ value: 2, reject: false },
				];
				const iterator = (value) => value.reject ? Promise.reject() : Promise.resolve();

				return promiseAllMeta(iterable, iterator).then(() => {
					assert.fail('.catch was not called')
				}).catch((e) => {
					assert.isTrue(true);
				});
			});

			it(`provides all, resolved, rejected values in the error.message`, () => {
				const iterable = [0, 1, 2];
				const iterator = () => Promise.reject();

				return promiseAllMeta(iterable, iterator).then(() => {
					assert.fail('did not run .catch');
				}).catch(({ all, resolved, rejected }) => {
					assert.isOk(all);
					assert.isOk(resolved);
					assert.isOk(rejected);
				});
			});
		});
	});

});
