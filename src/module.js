import Element from './element';
import Watcher from './watcher';

class El extends Element {
	constructor({tagName, props={}, children=[], events=[], model}) {
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
}

class Module {
	constructor({selector, template, data, methods}) {
		this.selector = selector;
		this.data = data;
		this.template = template;
		this.methods = methods;
		this.watcher = new Watcher(data);

		this._init();
	}
	_init() {
		const _this = this;
		const data = _this.data;
		const methods = _this.methods;
		const watcher = _this.watcher;

		// 方法重定向
		for (let key in methods) {
			methods[key] = methods[key].bind(watcher.getData());
		}

		_this.updateView();
	}
	_tmpToElem() {
		const _this = this;
		const data = _this.data;
		const methods = _this.methods;
		const template = _this.template;
		const watcher = _this.watcher;
		const temp = template
			.replace(/\n/g, '')
			.replace(/(\s*<)|(>\s*)/g, function(match) {
				return match.trim();
			});
		const tags = temp.match(/<(\S*?)[^>]*>.*?|<.*? \/>/g);
		const strings = temp.replace(/<(\S*?)[^>]*>.*?|<.*? \/>/g, ' ').split(" ");
		const elList = [];

		const closeTag = () => {
			const hasParent = elList.length > 1;

			if (hasParent) {
				const children = [elList.pop()];
				const parentEl = elList[elList.length - 1];

				parentEl.addChildren(children);
			}
		}

		console.log(tags);
		console.log(strings);

		// 删除最后一个无意义空字符串
		strings.pop();

		// 循环处理标签
		for (let str of strings) {
			const isTag = str === '';

			// 文本内容
			if (!isTag) {
				const parentEl = elList[elList.length - 1];
				const index = parentEl.children.length;

				str = str.replace(/{{(.*)}}/g, function(match, value) {
					watcher.subscribe(value, () => {
						parentEl.node.childNodes[index].replaceWith(data[value]);
					});
					return data[value];
				});

				parentEl.addChildren([str]);
			}

			const tag = tags.shift().replace(/<|>/g, '').split(' ');

			console.log(tag);

			// 闭合标签，例如：</div>
			if (isEndTag(tag[0])) {
				closeTag();
				continue;
			}

			const tagName = tag.shift();
			const props = {};
			const events = {};
			const model = null;
			const hasEndTag = isEndTag(tag[tag.length - 1]);

			// 针对自闭和标签，例如：<input />
			if (hasEndTag) {
				tag.pop();
			}

			// 区分事件或属性
			for (let item of tag) {
				const prop = item.split('=');
				const propName = prop[0];
				const propValue = prop[1];
				const isEvent = /^@/.test(propName);

				console.log(isEvent);
				console.log(props);

				if (isEvent) {
					const eventType = propName.replace(/@/, '');
					const eventHandler = propValue.replace(/{|}|"|'/g, '');

					if (eventType === 'model') {
						model = {
							key: eventHandler,
							setter: function(node) {
								const modelKey = this.key;
								let handler = function(value) {
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
							}
						};
					} else {
						events[eventType] = methods[eventHandler];
					}
				} else {
					props[propName] = propValue;
				}
			}

			console.log(events);
			console.log(props);

			const newEl = new El({tagName, props, events, model});

			elList.push(newEl);

			if (hasEndTag) {
				closeTag();
			}
		}

		return elList.pop();
	}
	updateView() {
		const _this = this;
		const parent = document.querySelector(_this.selector);
		const oldElem = _this.elem;
		const isFirstLoad = oldElem === void 0;

		// 模板转节点
		const newElem =_this._tmpToElem();

		if (isFirstLoad) {
			// 渲染到页面上
			parent.innerHTML = "";
			parent.appendChild(newElem.render());
			_this.elem = newElem;
			return;
		}

		console.log(oldElem, newElem);
		const patches = El.diff(oldElem, newElem);
		El.update(patches);
	}
}

export default function(options) {
	return new Module(options);
}

function isEndTag(tag) {
	return tag && tag[0] === '/';
}