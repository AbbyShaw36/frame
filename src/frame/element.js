class Element {
	constructor({tagName, attrs={}, children=[], events=[]}) {
		this.tagName = tagName;
		this.attrs = attrs;
		this.children = children;
		this.events = events;
	}
	render() {
		this.node = document.createElement(this.tagName);
		this._setAttrs();
		this._setChildren();
		this._setEvents();

		return this.node;
	}
	_setAttrs() {
		let node = this.node;
		let attrs = this.attrs;

		for (let attrKey in attrs) {
			const attrValue = attrs[attrKey];
			node.setAttribute(attrKey, attrValue);
		}
	}
	_setChildren() {
		let node = this.node;
		let children = this.children;

		for (let child of children) {
			let childEl;

			console.log(child);

			if (child instanceof Element) {
				childEl = child.render();
			} else if (child instanceof HTMLElement) {
				childEl = child;
			} else {
				childEl = document.createTextNode(child);
			}

				console.log("child", childEl);

			node.appendChild(childEl);
		}
	}
	_setEvents() {
		let node = this.node;
		let events = this.events;

		for (let type in events) {
			const handler = events[type];

			node.addEventListener(type, handler);
		}
	}
	addProps(attrs) {
		Object.assign(this.attrs, attrs);
	}
	addChildren(children) {
		this.children = this.children.concat(children);
	}
}

export default Element;