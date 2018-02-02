class Watcher {
	constructor(vm, key, cb) {
		this.vm = vm;
		this.key = key;
		this.cb = cb;
		this.depList = {};
	}
	addDep(dep) {
		if (this.depList[dep.id]) {
			return;
		}

		this.depList[dep.id] = dep;
		dep.addSub(this);
	}
	update() {
		const context = this.vm;
		const oldValue = this.value;
		const newValue = this.vm.getter(this.key);
		const cb = this.cb.bind(context, newValue, oldValue);

		cb();
		this.value = newValue;
	}
}

export default Watcher;