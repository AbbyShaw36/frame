import Element from './element';
import Watcher from './watcher';
import Dep from './dependency';
import Component from './component';

class El extends Element {
	constructor({tagName, attrs={}, children=[], events={}, model}) {
		super({tagName, attrs, children, events});
		this.model = model;
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

		return this.node;
	}
	clone() {
		const new_tagName = this.tagName;
		const new_attrs = {};
		const new_children = [];
		const new_events = {};
		const old_attrs = this.attrs;
		const old_children = this.children;
		const old_events = this.events;
		const old_model = this.model;

		let new_model = null;

		for (let key in old_attrs) {
			new_attrs[key] = old_attrs[key];
		}

		for (let index in old_children) {
			const oldChild = old_children[index];
			let newChild;

			if (oldChild instanceof El) {
				newChild = oldChild.clone();
			} else {
				newChild = oldChild;
			}

			new_children.push(newChild);
		}

		for (let eventType in old_events) {
			new_events[eventType] = old_events[eventType];
		}

		if (old_model) {
			new_model = {};
			new_model.key = new_model.key;
		}

		return new El({
			tagName: new_tagName,
			attrs: new_attrs,
			children: new_children,
			events: new_events,
			model: new_model
		});
	}
	replaceKey(oldKey, newKey) {
		console.log(this, `replace key ${oldKey} to ${newKey}`);
		const attrs = this.attrs;
		const children = this.children;
		const events = this.events;
		const model = this.model;
		const regexp = /{{([^{}]*)}}/g;
		const replacer = (match, value) => {
			return match.replace(oldKey, newKey);
		};

		for (let key in attrs) {
			attrs[key] = attrs[key].replace(regexp, replacer);
		}

		for (let index in children) {
			const child = children[index];

			if (child instanceof El) {
				child.replaceKey(oldKey, newKey);
			} else {
				children[index] = child.replace(regexp, replacer);
			}
		}

		for (let eventType in events) {
			events[eventType] = events[eventType].replace(regexp, replacer);
		}

		if (model) {
			model.key = model.key.replace(regexp, replacer);
		}
	}
	addKeyContext(oldKey, newKey) {
		const context = this.keyContext = this.keyContext || [];

		context.push({oldKey, newKey});
	}
	addChildren(children) {
		super.addChildren(children);

		const keyContext = this.keyContext;
		console.log(keyContext);

		if (keyContext) {
			keyContext.forEach(({oldKey, newKey}) => {
				this.replaceKey(oldKey, newKey);
			});
		}
	}
}

export default El;