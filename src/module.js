import Watcher from './watcher';
import templateCompiler from './template';

class Module {
	constructor({selector, template, data, methods}) {
		this.selector = selector;
		this.data = data;
		this.template = templateCompiler(template);
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
			methods[key] = methods[key].bind(Object.assign(watcher.getData(), methods));
		}

		_this.updateView();
	}
	updateView() {
		const _this = this;
		const parent = document.querySelector(_this.selector);
		const oldElTree = _this.elTree;
		const template = _this.template;
		const data = _this.data;
		const methods = _this.methods;
		const watcher = _this.watcher;
		const isFirstLoad = oldElTree === void 0;

		// 模板转节点
		const newElTree = _this.template({data, methods, watcher});
		console.log(newElTree);

		if (isFirstLoad) {
			// 渲染到页面上
			parent.innerHTML = "";
			parent.appendChild(newElTree.render());
			_this.elTree = newElTree;
			return;
		}

		console.log(oldElTree, newElTree);
		const patches = El.diff(oldElTree, newElTree);
		El.update(patches);
	}
}

export default function(options) {
	return new Module(options);
}