let id = 0;

class Dep {
	constructor() {
		this.subs = [];
		this.id = id++;
	}
	addSub(sub) {
		console.log('add sub', sub);
		this.subs.push(sub);
	}
	notify() {
		this.subs.forEach((sub) => {
			sub.update();
			console.log(sub);
		});
	}
}

export default Dep;