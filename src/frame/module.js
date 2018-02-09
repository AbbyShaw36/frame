import Component from './component';

class Module extends Component {
	constructor(options={}) {
		super(options);

		this.$parent = document.querySelector(options.selector);
	}
}

export default Module;