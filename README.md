# promiseAllMeta()
### Additional Data In Your Promise Results

This module operates the same way as `Promise.all()` except that it passes additional useful information to both (1) the `.then()` method and (2) the `.catch()` method.

```javascript
const iterable = [{
	reject: false,
	value: 0,
}, {
	reject: true,
	value: 1
}, {
	reject: false,
	value: 2,
}];

const iterator = (iterableElem) => {
	return new Promise((resolve, reject) => {
		return iterableElem.reject ? reject() : resolve(iterableElem.value);
	});
};

// Object returned from before() will be included in elements 'meta' property
const before = (iterableElem) => {
	return { elem: iterableElem };
};

// Object returned from onResolved() will be merged into the elements 'meta' property
const onResolved = (resolvedValue) => {
	return { doubledResults: resolvedValue * 2 };
};

// Object returned from onRejected() will be merged into the elements 'meta' property
const onRejected = (rejectedValue) => {
	return { additional: 'rejected-data' };
};

const grouped = promiseAllMeta(iterable, iterator, before, onResolved, onRejected);

grouped.then((all) => {
	console.log(all);
	// If all promises succeeded
	// [{
	// 	type: Symbol('resolved'),
	// 	error: null,
	// 	meta: {
	// 		elem: {
	// 			reject: false,
	// 			value: 0,
	// 		},
	// 		doubledResult: 0,
	// 	},
	// 	result: 0,
	// }, {
	// 	type: Symbol('rejected'),
	// 	error: Error,
	// 	meta: {
	// 		elem: {
	// 			reject: true,
	// 			value: 1,
	// 		},
	// 	},
	// 	result: null,
	// }, {
	// 	type: Symbol('resolved'),
	// 	error: null,
	// 	meta: {
	// 		elem: {
	// 			reject: false,
	// 			value: 2,
	// 		},
	// 		doubledResult: 4,
	// 	},
	// 	result: 2,
	// }]

}).catch((groups) => {
	const { all, resolved, rejected } = grouped;

	console.log(all);
	// If any promises fails
	// [{
	// 	type: Symbol('resolved'),
	// 	error: null,
	// 	meta: {
	// 		elem: {
	// 			reject: false,
	// 			value: 0,
	// 		},
	// 		doubledResult: 0,
	// 	},
	// 	result: 0,
	// }, {
	// 	type: Symbol('rejected'),
	// 	error: Error,
	// 	meta: {
	// 		elem: {
	// 			reject: true,
	// 			value: 1,
	// 		},
	// 	},
	// 	result: null,
	// }, {
	// 	type: Symbol('resolved'),
	// 	error: null,
	// 	meta: {
	// 		elem: {
	// 			reject: false,
	// 			value: 2,
	// 		},
	// 		doubledResult: 4,
	// 	},
	// 	result: 2,
	// }]

	console.log(resolved);
	// If all promises succeeded
	// [{
	// 	type: Symbol('resolved'),
	// 	error: null,
	// 	meta: {
	// 		elem: {
	// 			reject: false,
	// 			value: 0,
	// 		},
	// 		doubledResult: 0,
	// 	},
	// 	result: 0,
	// }, {
	// 	type: Symbol('resolved'),
	// 	error: null,
	// 	meta: {
	// 		elem: {
	// 			reject: false,
	// 			value: 2,
	// 		},
	// 		doubledResult: 4,
	// 	},
	// 	result: 2,
	// }]

	console.log(rejected);
	// [{
	// 	type: Symbol('rejected'),
	// 	error: Error,
	// 	meta: {
	// 		elem: {
	// 			reject: true,
	// 			value: 1,
	// 		},
	// 	},
	// 	result: null,
	// }]
});
```
