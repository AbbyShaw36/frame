import F from './index';
import El from './el';
import Dep from './dependency';
import Watcher from './watcher';
import Component from './component';

const modelRegexp = /{{([^{}]*)}}/g;

const isComponent = (tagName) => {
	return F.components[tagName] !== undefined;
}

const getComponentOptions = (tagName) => {
	return F.components[tagName];
}

const createEl = ({ tagName, attrs, children, events, model, cycle }, vm, addWatcher) => {
	console.log('create element', tagName);
	const isCpn = isComponent(tagName);
	const props = {};
	let el;

	Object.keys(attrs).forEach((attrKey) => {
		let attrValue = attrs[attrKey];

		attrValue = attrValue.replace(modelRegexp, (match, $1) => {
			if (addWatcher) {
				Dep.target = new Watcher(vm, $1, () => {
					vm.update();
				});
			}
			return $1;
		});

		if (isCpn) {
			console.log(vm);
			props[attrKey] = vm.getter(attrValue);
			delete attrs[attrKey];
		} else {
			attrs[attrKey] = attrValue;
		}
	});

	Object.keys(events).forEach((eventType) => {
		const eventValue = events[eventType];
		const eventHandler = vm.getter(eventValue.replace(modelRegexp, (match, $1) => $1));

		events[eventType] = eventHandler;
	});

	for (let index=0, len = children.length; index < len; index++) {
		const child = children[index];

		if (typeof child === 'string') {
			children[index] = child.replace(modelRegexp, (match, $1) => {
				if (addWatcher) {
					Dep.target = new Watcher(vm, $1, () => {
						vm.update();
					});
				}
				return $1;
			});

			continue;
		}

		const childEl = createEl(child, vm, addWatcher);

		children.splice(index, 1, childEl);

		if (Array.isArray(childEl)) {
			index += childEl.length - 1;
		}
	}

	if (model) {
		const key = model.key.replace(modelRegexp, (match, $1) => $1);

		model.setter = (node) => {
			Dep.target = new Watcher(vm, key, (newValue) => {
				node.value = newValue;
			});

			node.value = vm.getter(key);
			node.addEventListener('input', (e) => {
				vm.setter(key, e.target.value);
			});
		}
	}

	if (isCpn) {
		const cpnOptions = getComponentOptions(tagName);

		cpnOptions.props = props;
		el = new Component(cpnOptions);
	} else {
		el = new El({tagName, attrs, events, model, children});
	}

	// if (cycle) {

	// }
	
	console.log('create element result', el);
	
	return el;
}

export default createEl;