import Dep from "./dependency";

const resetArrayProto = (arr, dep) => {
	const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

	methods.forEach((method) => {
		const original = arr.__proto__[method];
		const newFn = function() {
			dep.notify();
			return original.apply(this, arguments);
		}

		Object.defineProperty(arr, method, {
			value: newFn
		})
	});
}

function observe(data) {
	if (!data || typeof data !== 'object') {
		return;
	}

	Object.keys(data).forEach((key) => new Observer(data, key));
}

class Observer {
	constructor(data, key) {
		const value = this.value = data[key];
		const dep = this.dep = new Dep();

		observe(value);
		this.defineReactive(data, key);

		if (Array.isArray(value)) {
			resetArrayProto(value, dep);
		}
	}
	defineReactive(data, key) {
		const dep = this.dep;
		const _self = this;

		Object.defineProperty(data, key, {
			enumberable: true,
			get: () => {
				const watcher = Dep.target;

				if (watcher) {
					console.log(watcher, key, dep);
					watcher.addDep(dep);
				}

				return _self.value;
			},
			set: (newValue) => {
				console.log('value changed: ', _self.value, ' => ', newValue, data, dep);
				_self.value = newValue;
				dep.notify();
			}
		});
	}
}

export default observe;