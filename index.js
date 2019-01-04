const RESOLVED = Symbol('resolved');
const REJECTED = Symbol('rejected');

function promiseAllMeta(iterable, iterator, onResolved, onRejected) {
	const promises = iterable.map((item) => {
		return iterator(item);
	});

	const formatted = promises.map((promise) => {
		return promise.then((value) => {
			const meta = onResolved && onResolved(value);

			return {
				type: RESOLVED,
				result: value,
				meta: Object.assign({}, meta),
				error: null,
			};

		}).catch((error) => {
			const meta = onRejected && onRejected(error);

			return {
				type: REJECTED,
				result: null,
				meta: Object.assign({}, meta),
				error,
			};
		});
	});

	const final = new Promise((resolve, reject) => {
		Promise.all(formatted).then((results) => {
			const resolved = resolvedPromises(results);
			const rejected = rejectedPromises(results);

			if (rejected.length > 0) {
				return reject({ all: results, resolved, rejected });
			}

			return resolve(results);
		}).catch((e) => {
			return reject(e);
		});
	});

	return final;
}

function resolvedPromises(categorized) {
	return categorized.filter((category) => {
		return category.type === RESOLVED;
	});
}

function rejectedPromises(categorized) {
	return categorized.filter((category) => {
		return category.type === REJECTED;
	});
}

exports.symbols = { RESOLVED, REJECTED };
exports.promiseAllMeta = promiseAllMeta;
