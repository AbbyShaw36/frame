import { isString } from './tools';

const updateElement = (patches) => {
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
				const childNode = isString(patch.child) ? patch.child : patch.child.node;
				patch.el.node.childNodes[patch.childIndex].replaceWith(childNode);
				break;
			case 'child.remove':
				patch.el.node.childNodes[patch.childIndex].remove();
				break;
			case 'child.add':
				const parent = patch.el.node;
				const referenceNode = parent.childNodes[patch.childIndex];
				const newNode = isString(patch.child) ? document.createTextNode(patch.child) : patch.child.render();
				parent.insertBefore(newNode, referenceNode);
				break;
		}
	}
}

export default updateElement;