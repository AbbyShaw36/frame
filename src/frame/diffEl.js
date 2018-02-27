import { isEl, isUndefined } from "./tools";

const dfsWalk = (oldEl, newEl, patches) => {
	if (diffTagName(oldEl, newEl, patches)) {
		return true;
	}

	const attrsRes = diffAttrs(oldEl, newEl, patches);
	const childrenRes = diffChildren(oldEl, newEl, patches);

	if (attrsRes || childrenRes) {
		return true;
	}

	return false;
}

const diffTagName = (oldEl, newEl, patches) => {
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

const diffAttrs = (oldEl, newEl, patches) => {
	const oldAttrs = oldEl.attrs;
	const newAttrs = newEl.attrs;
	const diffAttrs = Object.assign({}, oldAttrs, newAttrs);
	let res = false;

	for (let key in diffAttrs) {
		const isSame = oldAttrs[key] === newAttrs[key];
		const isRemove = isUndefined(newAttrs[key]);

		if (isSame) {
			continue;
		}

		res = true;

		if (isRemove) {
			patches.push({
				type: "attrs.remove",
				el: oldEl,
				propKey: key
			});
			res = true;
			continue;
		}
		
		patches.push({
			type: "attrs.update",
			el: oldEl,
			propKey: key,
			propValue: diffAttrs[key]
		});
	}

	return res;
}

const diffChildren = (oldEl, newEl, patches) => {
	const oldChildren = [...oldEl.children];
	const newChildren = [...newEl.children];
	let res = false;
	let index = -1;

	while(oldChildren.length || newChildren.length) {
		const oldChild = oldChildren.shift();
		const newChild = newChildren.shift();
		const isSame = oldChild === newChild;
		const isRemove = isUndefined(newChild);
		const isAdd = isUndefined(oldChild);
		const isAllEl = isEl(oldChild) && isEl(newChild);

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

const diffElement = (oldEl, newEl) => {
	const patches = [];
	dfsWalk(oldEl, newEl, patches);
	return patches;
}

export default diffElement;