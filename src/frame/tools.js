import El from './el';

const isEl = (el) => {
	return el instanceof El;
}

const isUndefined = (value) => {
	return value === void 0;
}

const isString = (str) => {
	return typeof str === 'string';
}

const isFunction = (fun) => {
	return typeof fun === 'function';
}

export {isEl, isUndefined, isString, isFunction}