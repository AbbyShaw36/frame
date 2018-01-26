class Element {
	constructor({tagName, props={}, children=[], events=[]}) {
		this.tagName = tagName;
		this.props = props;
		this.children = children;
		this.events = events;
	}
	render() {
		this.node = document.createElement(this.tagName);
		this._setProps();
		this._setChildren();
		this._setEvents();

		return this.node;
	}
	_setProps() {
		let node = this.node;
		let props = this.props;

		for (let propKey in props) {
			const propValue = props[propKey];
			node.setAttribute(propKey, propValue);
		}
	}
	_setChildren() {
		let node = this.node;
		let children = this.children;

		for (let child of children) {
			let childEl;

			if (child instanceof Element) {
				childEl = child.render();
			} else {
				childEl = document.createTextNode(child);
			}

			node.appendChild(childEl);
		}

		this.children = this.children.concat(children);
	}
	_setEvents() {
		let node = this.node;
		let events = this.events;

		for (let type in events) {
			const handler = events[type];

			node.addEventListener(type, handler);
		}
	}
	addProps(props) {
		Object.assign(this.props, props);
	}
	addChildren(children) {
		this.children = this.children.concat(children);
	}
	static diff(oldEl, newEl) {
		const patches = [];
		dfsWalk(oldEl, newEl, patches);
		console.log(patches);
		return patches;
	}
	static update(patches) {
		for (let patch of patches) {
			switch(patch.type) {
				case 'node.replace':
					patch.oldEl.node.replaceWith(patch.newEl.render());
					break;
				case 'props.remove':
					patch.el.node.removeAttribute(patch.propKey);
					break;
				case 'props.update':
					patch.el.node.setAttribute(patch.propKey, patch.propValue);
					break;
				case 'child.update':
					const childNode = (typeof patch.child === 'string') ? patch.child : patch.child.node;
					patch.el.node.childNodes[patch.childIndex].replaceWith(childNode);
					break;
				case 'child.remove':
					patch.el.node.childNodes[patch.childIndex].remove();
					break;
				case 'child.add':
					const parent = patch.el.node;
					const referenceNode = parent.childNodes[patch.childIndex];
					const newNode = (typeof patch.child === 'string') ? document.createTextNode(patch.child) : patch.child.render();
					parent.insertBefore(newNode, referenceNode);
					break;
			}
		}
	}
}

export default Element;

function dfsWalk(oldEl, newEl, patches) {
	if (diffTagName(oldEl, newEl, patches)) {
		return true;
	}

	const propsRes = diffProps(oldEl, newEl, patches);
	const childrenRes = diffChildren(oldEl, newEl, patches);

	if (propsRes || childrenRes) {
		return true;
	}

	return false;
}

function diffTagName(oldEl, newEl, patches) {
	const isSameTag = oldEl.tagName === newEl.tagName;

	if (!isSameTag) {
		patches.push({
			type: "node.replace",
			oldEl: oldEl,
			newEl: newEl
		});

		return true;
	}

	return false;
}

function diffProps(oldEl, newEl, patches) {
	const oldProps = oldEl.props;
	const newProps = newEl.props;
	const diffProps = Object.assign({}, oldProps, newProps);
	let res = false;

	for (let key in diffProps) {
		const isSame = oldProps[key] === newProps[key];
		const isRemove = newProps[key] === void 0;

		if (isSame) {
			continue;
		}

		res = true;

		if (isRemove) {
			patches.push({
				type: "props.remove",
				el: oldEl,
				propKey: key
			});
			res = true;
			continue;
		}
		
		patches.push({
			type: "props.update",
			el: oldEl,
			propKey: key,
			propValue: diffProps[key]
		});
	}

	return res;
}

function diffChildren(oldEl, newEl, patches) {
	const oldChildren = [...oldEl.children];
	const newChildren = [...newEl.children];
	let res = false;
	let index = -1;

	while(oldChildren.length || newChildren.length) {
		const oldChild = oldChildren.shift();
		const newChild = newChildren.shift();
		const isSame = oldChild === newChild;
		const isRemove = newChild === void 0;
		const isAdd = oldChild === void 0;
		const isAllEl = (oldChild instanceof Element) && (newChild instanceof Element);

		index++;

		if (isSame) {
			continue;
		}

		res = true;

		if (isRemove) {
			patches.push({
				type: 'child.remove',
				el: oldEl,
				childIndex: index
			});
			continue;
		}

		if (isAdd) {
			patches.push({
				type: 'child.add',
				el: oldEl,
				childIndex: index,
				child: newChild
			});
			continue;
		}

		if (isAllEl) {
			res = dfsWalk(oldChild, newChild, patches);
			continue;
		}

		patches.push({
			type: 'child.update',
			el: oldEl,
			childIndex: index,
			child: newChild
		});
	}

	return res;
}