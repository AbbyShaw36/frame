import El from './element';

class Module {
	constructor({selector, template, data, methods}) {
		this.selector = selector;
		this.data = data;
		this.template = template;
		this.methods = methods;
		this._context = {};
		this._dataListener = {};

		this._init();
	}
	_init() {
		const _this = this;
		const data = _this.data;
		const methods = _this.methods;
		const context = _this._context;

		for (let key in data) {
			Object.defineProperty(context, key, {
				set: function(value) {
					const handlerArr = _this._dataListener[key];

					data[key] = value;

					if (handlerArr) {
						handlerArr.forEach(function(handler) {
							handler();
						});
					}
				},
				get: function() {
					return data[key];
				}
			})
		}

		// 方法重定向
		for (let key in methods) {
			methods[key] = methods[key].bind(context);
		}

		_this.updateView();
	}
	_tmpToElem() {
		const _this = this;
		const data = _this.data;
		const methods = _this.methods;
		const template = _this.template;
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
				const index = parentEl.node.childNodes.length;

				str = str.replace(/{{(.*)}}/g, function(match, value) {
					_this.watchData(value, () => {
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

					events[eventType] = eventHandler;
				} else {
					props[propName] = propValue;
				}
			}

			console.log(events);
			console.log(props);

			const newEl = new El(tagName, props);

			// 绑定事件
			for (let type in events) {
				const node = newEl.node;
				const value = events[type];

				if (type === "model") {
					node.value = data[value];
					node.addEventListener("input", function() {
						_this.setData(value, this.value);
					});
					_this.watchData(value, () => {
						node.value = data[value];
					});
				} else {
					node.addEventListener(type, methods[value]);
				}
			}

			elList.push(newEl);

			if (hasEndTag) {
				closeTag();
			}
		}

		return elList.pop();
	}
	watchData(dataKey, handler) {
		const _this = this;
		const lib = _this._dataListener;
		const handlerArr = lib[dataKey];

		if (handlerArr) {
			handlerArr.push(handler);
		} else {
			lib[dataKey] = [handler];
		}
	}
	setData(dataKey, newValue) {
		const _this = this;
		const context = _this._context;

		context[dataKey] = newValue;
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
			parent.appendChild(newElem.node);
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