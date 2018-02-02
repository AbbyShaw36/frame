import Element from './element';
import Watcher from './watcher';
import Dep from './dependency';

class El extends Element {
	constructor({tagName, attrs={}, children=[], events={}, model, cycle}) {
		super({tagName, attrs, children, events});
		this.model = model;
		this.cycle = cycle;
	}
	render() {
		const node = super.render();
		const model = this.model;

		if (model) {
			model.setter(node);
		}

		return node;
	}
	compiler(vm, isClone) {
		const el = this;
		const attrs = this.attrs;
		const children = this.children;
		const events = this.events;
		const model = this.model;
		const regexp = /{{([^{}]*)}}/g;

		for (let attrKey in attrs) {
			attrs[attrKey] = attrs[attrKey].replace(regexp, (match, value, offset, string) => {
				if (!isClone) {
					Dep.target = new Watcher(vm, value, function(newValue) {
						vm.update();
					});
				}
				return vm.getter(value);
			});
		}

		for (let eventType in events) {
			const eventHandlerName = events[eventType].replace(regexp, (match, value) => value);
			events[eventType] = vm.getter(eventHandlerName);
		}

		if (model) {
			model.setter = function(node) {
				const modelKey = this.key.replace(regexp, (match, value) => value);

				if (!isClone) {
					Dep.target = new Watcher(vm, modelKey, function(newValue) {
						vm.update();
						node.value = vm.getter(modelKey);
					});
				}
				node.value = vm.getter(modelKey);
				node.addEventListener("input", function(event) {
					vm.setter(modelKey, event.target.value);
				});
				console.log(node.value);
			}
		}

		for (let i=0, len=children.length; i < len; i++) {
			const child = children[i];

			console.log(child);

			if (child instanceof El) {
				if (child.cycle) {
					const key = child.cycle.split(" in ")[0];
					const list = child.cycle.split(" in ")[1];
					const fnStr = `
						const arr = [];

						for(let ${child.cycle}) {
							const newEl = el.clone();

							newEl.replaceKey('${key}', '${list}.'+item);
							arr.push(newEl);
						}

						return arr;
					`;
					console.log(fnStr);

					const fn = new Function('el', 'list', fnStr);

					const childList = fn(child, vm.getter(list));

					childList.forEach((child) => {
						child.compiler(vm, isClone);
					});

					children.splice(i, 1, ...childList);
					children[i].compiler(vm, isClone);
				} else {
					child.compiler(vm, isClone);
				}
			} else {
				children[i] = child.replace(regexp, (match, value, offset, string) => {
					if (!isClone) {
						Dep.target = new Watcher(vm, value, function(newValue) {
							vm.update();
						});
					}
					return vm.getter(value);
				});
			}
		}

		this.vm = vm;
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
}

export default El;