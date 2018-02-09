import Module from './module';
import templateCompiler from './templateCompiler';

class F extends Module {
	constructor(options={}) {
		super(options);
		// this._init();
	}
	_init() {
		this.$parent.appendChild(this.render());
	}
	static component(tagName, options) {
		this.components = this.components || {};
		this.components[tagName] = options;

		console.log(this.components);
	}
}

export default F;