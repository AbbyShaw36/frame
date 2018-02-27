import Element from './element';
import Watcher from './watcher';
import Dep from './dependency';
import Component from './component';

class El extends Element {
	constructor({tagName, attrs={}, children=[], events={}, model}) {
		super({tagName, attrs, children, events});
		this.model = model;

		console.log("[create El]", this);
	}
	render() {
		const model = this.model;

		this.children = this.children.map((child) => {
			if (child instanceof Component) {
				return child.render();
			}

			return child;
		});

		super.render();

		if (model) {
			model.setter(this.node);
		}

		console.log("[render El result]", this.node);
		return this.node;
	}
	replace(newEl) {
		this.tagName = newEl.tagName;
		this.attrs = newEl.attrs;
		this.children = newEl.children;
		this.events = newEl.events;
		this.model = newEl.model;
		this.render();
	}
	removeAttr(attr) {
		delete this.attrs[attr];
		this.node.removeAttribute(attr);
	}
	setAttr(attr, attrValue) {
		this.attrs[attr] = attrValue;
		this.node.setAttribute(attr, attrValue);
	}
	replaceChild(newChild, childIndex) {
		if (typeof newChild === 'string') {
			this.children[childIndex] = newChild;
			this.node.childNodes[childIndex].replaceWith(newChild);
		} else {
			this.children[childIndex].replace(newChild);
		}
	}
	removeChild(childIndex) {
		this.children.splice(childIndex, 1);
		this.node.childNodes[childIndex].remove();
	}
	addChild(newChild, childIndex) {
		const childNode = (typeof newChild === 'string') ? document.createTextNode(newChild) : newChild.render();
		const parentNode = this.node;
		const referenceNode = this.node.childNodes[childIndex];

		this.children.splice(childIndex, 0, newChild);
		parentNode.insertBefore(childNode, referenceNode);
	}
}

export default El;