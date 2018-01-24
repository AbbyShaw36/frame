class Element {
	constructor(tagName, props={}, children=[]) {
		this.tagName = tagName;
		this.props = props;
		this.children = children;

		this._init();
	}
	_init() {
		this.node = document.createElement(this.tagName);
		this.addChildren(this.children);
	}
	addChildren(children=[]) {
		let node = this.node;

		for (let child of children) {
			let childEl;

			if (child instanceof Element) {
				childEl = child.node;
			} else {
				childEl = document.createTextNode(child);
			}

			node.appendChild(childEl);
		}

		this.children = this.children.concat(children);
	}
}

export default Element;