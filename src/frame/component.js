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
		Object.keys(methods).forEach((key) => {
			this[key] = methods[key].bind(this);
		});
		observe(data);

		console.log("[create component]", this);
	}
	render(props, addWatcher) {
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

		this.$el = createEl(template, this, addWatcher);

		console.log("[component render]", this.$el);

		return this.$el;
	}
	_proxyData(key) {
		Object.defineProperty(this, key, {
			enumberable: true,
			get: () => this._data[key],
			set: (value) => this._data[key] = value
		});

		console.log("[proxy data]", key);
	}
	getter(exp) {
		const expArr = exp.split(".");
		let res = this;

		while(res && expArr.length) {
			res = res[expArr.shift()];
		}

		console.log("[get]", exp, ":", res);

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

		console.log("[set]", exp, ":", value);
	}
	update() {
		if (this.updateTimer) {
			clearTimeout(this.updateTimer);
		}

		this.updateTimer = setTimeout(() => {
			const template = this._template;
			const addWatcher = false;
			const oldEl = this.$el;
			const newEl = createEl(template, this, addWatcher);
			const diff = diffEl(oldEl, newEl);

			updateEl(diff);
			this.updateTimer = null;
			console.log("[update vm]", oldEl, "=>", newEl, ":", diff);
		}, 200);
	}
}

export default Component;