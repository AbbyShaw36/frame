class Watcher {
	constructor(vm, key, cb) {
		this.vm = vm;
		this.key = key;
		this.cb = cb;
	}
	addDep(dep) {
		if (this.dep) {
			return;
		}

		this.dep = dep;
		dep.addSub(this);
	}
	update() {
		const context = this.vm;
		const oldValue = this.value;
		const newValue = this.vm[this.key];
		const cb = this.cb.bind(context, newValue, oldValue);

		cb();
		this.value = newValue;
	}
}

export default Watcher;