import Component from './component';

class F extends Component {
	constructor({selector, template, data, methods}) {
		super({template, data, methods});

		this._selector = selector;
		this.render();

		console.log("[create module]", this);
	}
	render() {
		this.$el = super.render(null, true);
		this.$parent = document.querySelector(this._selector);
		this.$parent.appendChild(this.$el.render());
	}
}

F.componentList = {};
F.component = (name, configs) => {
	F.componentList[name] = new Component(configs);
	console.log("[component list]", F.componentList);
};

export default F;