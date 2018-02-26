import Component from './component';

class F {
	constructor({selector, template, data, methods}) {
		this._selector = selector;
		this._template = template;
		this._data = data;
		this._methods = methods;

		this.render();
	}
	render() {
		const vm = new Component({
			template: this._template,
			data: this._data,
			methods: this._methods
		});

		this.$el = vm.render();
		console.log(this.$el);
		this.$parent = document.querySelector(this._selector);
		this.$parent.appendChild(this.$el.render());
	}
}

F.componentList = {};
F.component = (name, configs) => {
	F.componentList[name] = new Component(configs);
	console.log("component list: ", F.componentList);
};

export default F;