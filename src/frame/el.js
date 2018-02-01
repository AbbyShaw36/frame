import Element from './element';
import Watcher from './watcher';
import Dep from './dependency';

class El extends Element {
	constructor({tagName, attrs={}, children=[], events={}, model}) {
		super({tagName, attrs, children, events});
		this.model = model;
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
				return vm[value];
			});
		}

		for (let eventType in events) {
			const eventHandlerName = events[eventType].replace(regexp, (match, value) => value);
			events[eventType] = vm[eventHandlerName];
		}

		if (model) {
			model.setter = function(node) {
				const modelKey = this.key.replace(regexp, (match, value) => value);

				if (!isClone) {
					Dep.target = new Watcher(vm, modelKey, function(newValue) {
						vm.update();
					});
				}
				node.value = vm[modelKey];
				node.addEventListener("input", function() {
					vm[modelKey] = this.value;
				});
				console.log(node.value);
			}
		}

		for (let i=0, len=children.length; i < len; i++) {
			const child = children[i];

			console.log(child);

			if (child instanceof El) {
				child.compiler(vm, isClone);
			} else {
				children[i] = child.replace(regexp, (match, value, offset, string) => {
					if (!isClone) {
						Dep.target = new Watcher(vm, value, function(newValue) {
							vm.update();
						});
					}
					return vm[value];
				});
			}
		}

		this.vm = vm;
	}
}

export default El;