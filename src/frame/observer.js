import Dep from "./dependency";

function observe(data) {
	if (!data || typeof data !== 'object') {
		return;
	}

	Object.keys(data).forEach((key) => new Observer(data, key));
}

class Observer {
	constructor(data, key) {
		this.value = data[key];

		observe(this.value);

		this.defineReactive(data, key);
	}
	defineReactive(data, key) {
		const dep = new Dep();
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