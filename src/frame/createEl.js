import F from './index';
import El from './el';
import Dep from './dependency';
import Watcher from './watcher';
import Component from './component';

const modelRegexp = /{{([^{}]*)}}/g;

const isComponent = (name) => {
	return F.componentList[name] !== undefined;
}

const getComponent = (name) => {
	return F.componentList[name];
}

const replaceMatchWithContext = (context, match) => {
	context.forEach((contextItem) => {
		match = match.replace(contextItem.old, () => contextItem.new);
	});
	return match;
}

const create = (options, vm, addWatcher, ...context) => {
	const {tagName, attrs, children, events, model, cycle} = options;
	const isCpn = isComponent(tagName);
	const props = {};
	let el;

	Object.keys(attrs).forEach((attrKey) => {
		let attrValue = attrs[attrKey];

		attrValue = attrValue.replace(modelRegexp, (match, $1) => {
			$1 = replaceMatchWithContext(context, $1);

			if (addWatcher) {
				Dep.target = new Watcher(vm, $1, () => {
					vm.update();
				});
			}

			return $1;
		});

		if (isCpn) {
			props[attrKey] = vm.getter(attrValue);
			delete attrs[attrKey];
		} else {
			attrs[attrKey] = attrValue;
		}
	});

	Object.keys(events).forEach((eventType) => {
		const eventValue = events[eventType];
		const eventHandler = vm.getter(eventValue.replace(modelRegexp, (match, $1) => {
			$1 = replaceMatchWithContext(context, $1);

			return $1;
		}));

		events[eventType] = eventHandler;
	});

	for (let index=0, len = children.length; index < len; index++) {
		const child = children[index];

		if (typeof child === 'string') {
			children[index] = child.replace(modelRegexp, (match, $1) => {
				$1 = replaceMatchWithContext(context, $1);

				if (addWatcher) {
					Dep.target = new Watcher(vm, $1, () => {
						vm.update();
					});
				}

				return vm.getter($1);
			});

			continue;
		}

		const childEl = createEl(child, vm, addWatcher, ...context);

		if (Array.isArray(childEl)) {
			children.splice(index, 1, ...childEl);
			index += childEl.length - 1;
		} else {
			children.splice(index, 1, childEl);
		}
	}

	if (model && addWatcher) {
		const key = model.key.replace(modelRegexp, (match, $1) => {
			$1 = replaceMatchWithContext(context, $1);

			return $1;
		});

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
		const cpn = getComponent(tagName);
		el = cpn.render(props, addWatcher);
	} else {
		el = new El({tagName, attrs, events, model, children});
	}

	return el;
}

const cloneOptions = (options) => {
	return JSON.parse(JSON.stringify(options));
}

const createEl = (options, vm, addWatcher, ...context) => {
	const newOptions = cloneOptions(options);
	const {tagName, cycle} = newOptions;

	if (cycle) {
		const list = vm.getter(cycle.listName);
		const elList = [];

		for (let item in list) {
			const value = cycle.listName + '.' + item
			const el = create(cloneOptions(options), vm, addWatcher, ...context, {
				old: cycle.itemName,
				new: value
			});

			elList.push(el);
		}

		return elList;
	}

	console.log("[to create element]", newOptions);
	return create(newOptions, vm, addWatcher, ...context);
}

export default createEl;