import el from './element';

function isEndTag(tag) {
	return tag && tag[0] === '/';
}

class Module {
	constructor({selector, template, data, methods}) {
		this.selector = selector;
		this.data = data;
		this.template = template;
		this.methods = methods;

		this._init();
	}
	_init() {
		const _this = this;
		const methods = _this.methods;

		// 方法重定向
		for (let key in methods) {
			methods[key] = methods[key].bind(_this);
		}

		_this.updateView();
	}
	tmpToElem() {
		const _this = this;
		const data = _this.data;
		const methods = _this.methods;
		const temp = _this.template
			.replace(/\n/g, '')
			.replace(/(\s*<)|(>\s*)/g, function(match) {
				return match.trim();
			});
		const tags = temp.match(/<(\S*?)[^>]*>.*?|<.*? \/>/g);
		const strings = temp.replace(/<(\S*?)[^>]*>.*?|<.*? \/>/g, ' ').split(" ");
		const elList = [];

		console.log(tags);
		console.log(strings);

		strings.pop();

		function closeTag() {
			const hasParent = elList.length > 1;

			if (hasParent) {
				const children = [elList.pop()];
				const parent = elList[elList.length - 1];

				parent.addChildren(children);
			}
		}

		// 循环处理标签
		for (let str of strings) {
			const isTag = str === '';

			// 文本内容
			if (!isTag) {
				const lastEl = elList[elList.length - 1];

				str = str.replace(/{{(.*)}}/g, function(match, value) {
					_this.listenData(value);
					return data[value];
				});

				lastEl.addChildren([str]);
			}

			const tag = tags.shift().replace(/<|>/g, '').split(' ');

			console.log(tag);

			if (isEndTag(tag[0])) {
				closeTag();
				continue;
			}

			const tagName = tag.shift();
			const props = {};
			const events = {};
			const hasEndTag = isEndTag(tag[tag.length - 1]);

			if (hasEndTag) {
				tag.pop();
			}

			// 创建 el 对象
			for (let item of tag) {
				const prop = item.split('=');
				const propName = prop[0];
				const propValue = prop[1];
				const isEvent = /^@/.test(propName);

				console.log(isEvent);
				console.log(props);

				// 事件或属性
				if (isEvent) {
					const eventType = propName.replace(/@/, '');
					const eventHandler = propValue.replace(/{|}|"|'/g, '');

					events[eventType] = eventHandler;
				} else {
					props[propName] = propValue;
				}
			}

			console.log(events);

			const newEl = new el(tagName, props);

			// 绑定事件
			for (let type in events) {
				const node = newEl.node;
				const value = events[type];

				if (type === "model") {
					let timer = null;

					node.value = data[value];
					node.addEventListener("keyup", function() {
						const newValue = this.value;
						timer && clearTimeout(timer);

						timer = setTimeout(function() {
							_this.setData(value, newValue);
						}, 20);
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

		_this.elem = elList.pop();
	}
	listenData(name) {
		const _this = this;
		const lib = _this.dataListenLib = _this.dataListenLib || [];

		lib.push(name);
	}
	setData(name, value) {
		const _this = this;

		_this.data[name] = value;

		if (_this.dataListenLib.includes(name)) {
			_this.updateView();
		}
	}
	updateView() {
		const _this = this;
		const parent = document.querySelector(_this.selector);
		const oldElem = _this.elem;
		const isFirstLoad = oldElem === void 0;

		// 模板转节点
		_this.tmpToElem();
		const newElem = _this.elem;

		console.log(oldElem, newElem, oldElem === newElem);

		if (isFirstLoad) {

			// 渲染到页面上
			parent.innerHTML = "";
			parent.appendChild(newElem.node);
			return;
		}
	}
}

export default function(options) {
	return new Module(options);
}