import templateCompiler from './templateCompiler';
import observe from './observer';
import updateEl from './updateEl';
import diffEl from './diffEl';
import createEl from './createEl';

class Component {
	constructor({template, data, methods, propsSetting}) {
		this._template = templateCompiler(template);
		this._data = data;
		this._methods = methods;
		this._propsSetting = propsSetting;

		Object.keys(data).forEach((key) => this._proxyData(key));
		Object.keys(methods).forEach((key) => this[key] = methods[key].bind(this));
		observe(data);
	}
	render(props) {
		const template = this._template;
		const propsSetting = this._propsSetting;
		
		// checkProps(props, propsSetting);

		if (props) {
			Object.keys(props).forEach((key) => {
				if (this[key]) {
					return;
				}

				this[key] = props[key];
			});
		}

		this.$el = createEl(template, this, true);

		console.log("component render result", this.$el);

		return this.$el;
	}
	_proxyData(key) {
		Object.defineProperty(this, key, {
			enumberable: true,
			get: () => this._data[key],
			set: (value) => this._data[key] = value
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
	update() {
		if (this.updateTimer) {
			clearTimeout(this.updateTimer);
		}

		this.updateTimer = setTimeout(() => {
			const template = this.template;
			const oldEl = this.$el;
			const newEl = createEl(template, this);

			console.log(oldEl, newEl);
			updateEl(diffEl(oldEl, newEl));

			this.updateTimer = null;
		}, 200);
	}
}

export default Component;