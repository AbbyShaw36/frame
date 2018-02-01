import Component from './component';

class Module extends Component {
	constructor(options={}) {
		super(options);

		const parentNode = document.querySelector(options.selector);
		this.render(parentNode);
	}
}

export default Module;