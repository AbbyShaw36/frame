import templateCompiler from './templateCompiler';
import observe from './observer';
import updateEl from './updateEl';
import diffEl from './diffEl';
import createEl from './createEl';

class Component {
	constructor(options={}) {
		const data = this._data = options.data || {};
		const methods = options.methods || {};
		const template = options.template;
		const props = options.props || {};
		const addWatcher = true;
		const vm = this;
		const elOptions = templateCompiler(template);

		console.log('template compiler result', elOptions);

		Object.keys(data).forEach((key) => this._proxyData(key));
		observe(data);

		Object.keys(methods).forEach((key) => {
			if (this[key]) {
				return;
			}
			this[key] = methods[key].bind(this);
		});

		Object.keys(props).forEach((key) => this._proxyProps(key));
		// observe(props);

		this.$options = options;
		this.$el = createEl(elOptions, vm, addWatcher);
		console.log(this.$el);
	}
	_proxyData(key) {
		Object.defineProperty(this, key, {
			enumberable: true,
			get: () => this._data[key],
			set: (newValue) => this._data[key] = newValue
		});
	}
	_proxyProps(key) {
		if (this[key]) {
			return;
		}

		Object.defineProperty(this, key, {
			enumberable: true,
			get: () => this.$options.props[key]
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
	render() {
		return this.$el.render();
	}
	update() {
		if (this.updateTimer) {
			clearTimeout(this.updateTimer);
		}

		this.updateTimer = setTimeout(() => {
			const template = this.$options.template;
			const oldEl = this.$el;
			const newEl = templateCompiler(template, this);

			console.log(oldEl, newEl);
			updateEl(diffEl(oldEl, newEl));

			this.updateTimer = null;
		}, 200);
	}
}

export default Component;