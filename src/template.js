import Element from './element';

class El extends Element {
	constructor({tagName, props={}, children=[], events={}, model}) {
		super({tagName, props, children, events});
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
	compiler({data={}, methods={}, watcher}) {
		const el = this;
		const props = this.props;
		const children = this.children;
		const events = this.events;
		const model = this.model;
		const regexp = /{{(.*)}}/g;

		for (let propKey in props) {
			props[propKey] = props[propKey].replace(regexp, (match, value) => {
				watcher.subscribe(value, () => {
					El.update([{
						type: 'props.update',
						el: el,
						propKey: propKey,
						propValue: data[value]
					}])
				});
				return data[value];
			});
		}

		for (let eventType in events) {
			const eventHandlerName = events[eventType].replace(regexp, (match, value) => value);
			events[eventType] = methods[eventHandlerName];
		}

		if (model) {
			model.setter = function(node) {
				const modelKey = this.key.replace(regexp, (match, value) => value);
				const handler = function(value) {
					const data = this;
					data[modelKey] = value;
				}.bind(watcher.getData());

				node.value = data[modelKey];
				node.addEventListener("input", function() {
					const newValue = this.value;
					handler(newValue);
				});
				watcher.subscribe(modelKey, () => {
					node.value = data[modelKey];
				});
				console.log(node.value);
			}
		}

		for (let i=0, len=children.length; i < len; i++) {
			const child = children[i];

			if (child instanceof El) {
				child.compiler({data, methods, watcher});
			} else {
				children[i] = child.replace(regexp, (match, value) => {
					watcher.subscribe(value, () => {
						el.node.childNodes[i].replaceWith(data[value]);
					});
					return data[value];
				});
			}
		}
	}
}

const closeTag = (elList) => {
	const hasParent = elList.length > 1;

	if (hasParent) {
		const children = [elList.pop()];
		const parentEl = elList[elList.length - 1];

		parentEl.addChildren(children);
	}
};

const isEndTag = (tag) => {
	return tag && tag[0] === '/';
}

const templateCompiler = (template) => {
	const temp = template
		.replace(/\n/g, '')
		.replace(/(\s*<)|(>\s*)/g, function(match) {
			return match.trim();
		});
	const tags = temp.match(/<(\S*?)[^>]*>.*?|<.*? \/>/g);
	const strings = temp.replace(/<(\S*?)[^>]*>.*?|<.*? \/>/g, ' ').split(" ");
	const elList = [];

	// 删除最后一个无意义空字符串
	strings.pop();
	console.log(tags);
	console.log(strings);

	// 循环处理标签
	for (let str of strings) {
		const isText = str !== '';
		const tagProps = tags.shift().replace(/<|>/g, '').split(' ');
		const tagName = tagProps.shift();
		const hasEndTag = isEndTag(tagProps[tagProps.length - 1]);
		const props = {};
		const events = {};
		const model = null;

		if (isText) {
			const parentEl = elList[elList.length - 1];
			parentEl.addChildren([str]);
		}

		// 闭合标签，例如：</div>
		if (isEndTag(tagName)) {
			closeTag(elList);
			continue;
		}

		// 针对自闭和标签，例如：<input />
		if (hasEndTag) {
			tagProps.pop();
		}

		// 区分事件或属性
		for (let item of tagProps) {
			const prop = item.split('=');
			const propName = prop[0];
			const propValue = prop[1];
			const isEvent = /^@/.test(propName);

			if (isEvent) {
				const type = propName.replace(/@/, '');
				const value = propValue.replace(/"|'/g, '');

				if (type === 'model') {
					model = {
						key: value
					};
				} else {
					events[type] = value;
				}
			} else {
				props[propName] = propValue;
			}
		}

		const newEl = new El({tagName, props, events, model});

		console.log(tagName, props, events, model);
		elList.push(newEl);

		if (hasEndTag) {
			closeTag(elList);
		}
	}

	return elList.pop();
}

export default (template) => {
	const rootEl = templateCompiler(template);

	return (options) => {
		rootEl.compiler(options);
		return rootEl;
	}
}