import { isString } from './tools';

const updateElement = (patches) => {
	for (let patch of patches) {
		switch(patch.type) {
			case 'node.replace':
				patch.oldEl.replace(patch.newEl);
				break;
			case 'props.remove':
				patch.el.removeAttr(patch.propKey);
				break;
			case 'props.update':
				patch.el.setAttr(patch.propKey, patch.propValue);
				break;
			case 'child.update':
				patch.el.replaceChild(patch.child, patch.childIndex);
				break;
			case 'child.remove':
				patch.el.removeChild(patch.childIndex);
				break;
			case 'child.add':
				patch.el.addChild(patch.child, patch.childIndex);
				break;
		}
	}
}

export default updateElement;