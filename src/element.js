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

class Element {
	constructor(tagName, props={}, children=[]) {
		this.tagName = tagName;
		this.props = props;
		this.children = children;

		this._init();
	}
	_init() {
		this.node = document.createElement(this.tagName);
		this.addChildren(this.children);
	}
	addChildren(children=[]) {
		let node = this.node;

		for (let child of children) {
			let childEl;

			if (child instanceof Element) {
				childEl = child.node;
			} else {
				childEl = document.createTextNode(child);
			}

			node.appendChild(childEl);
		}

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
					patch.oldEl.node.replaceWith(patch.newEl.node);
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
					const newNode = (typeof patch.child === 'string') ? document.createTextNode(patch.child) : patch.child.node;
					parent.insertBefore(newNode, referenceNode);
					break;
			}
		}
	}
}

export default Element;