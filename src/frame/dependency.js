let id = 0;

class Dep {
	constructor() {
		this.subs = [];
		this.id = id++;
		console.log("[create dep]", this);
	}
	addSub(sub) {
		this.subs.push(sub);
		console.log('[dep add sub]', this, "add", sub);
	}
	notify() {
		this.subs.forEach((sub) => {
			sub.update();
		});
		console.log("[dep notify]", this);
	}
}

export default Dep;