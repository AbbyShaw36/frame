import templateCompiler from './templateCompiler';
import observe from './observer';
import updateEl from './updateEl';
import diffEl from './diffEl';

class Component {
	constructor(options={}) {
		const data = this._data = options.data;
		const methods = options.methods;

		Object.keys(data).forEach((key) => this._proxyData(key));
		observe(data);

		Object.keys(methods).forEach((key) => this[key] = methods[key].bind(this));

		this.$options = options;
	}
	_proxyData(key) {
		Object.defineProperty(this, key, {
			enumberable: true,
			get: () => this._data[key],
			set: (newValue) => this._data[key] = newValue
		});
	}
	getter(exp) {
		const expArr = exp.split(".");
		let res = this;

		while(res && expArr.length) {
			res = res[expArr.shift()];
		}

		return res;
	}
	setter(exp, value) {
		const expArr = exp.split(".");
		let res = this;

		while(res && expArr.length - 1) {
			res = res[expArr.shift()];
		}

		if (res) {
			res[expArr.shift()] = value;
		}
	}
	render($parent) {
		const parentNode = this.$parent = $parent;
		const template = this.$options.template;
		const $el = this.$el = templateCompiler(template);
		$el.compiler(this);

		parentNode.appendChild($el.render());
		console.log($el);
	}
	update() {
		if (this.updateTimer) {
			clearTimeout(this.updateTimer);
		}

		this.updateTimer = setTimeout(() => {
			const parentNode = this.$parent;
			const template = this.$options.template;
			const oldEl = this.$el;
			const newEl = templateCompiler(template);

			newEl.compiler(this, true);
			console.log(oldEl, newEl);
			updateEl(diffEl(oldEl, newEl));

			this.updateTimer = null;
		}, 200);
		
	}
}

export default Component;