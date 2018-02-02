import El from './el';

const closeTag = (elList) => {
	const hasParent = elList.length > 1;

	if (hasParent) {
		const children = [elList.pop()];
		const parentEl = elList[elList.length - 1];

		parentEl.addChildren(children);
	}
};

const isEndTag = (tag) => {
	// console.log("is end tag ", tag);
	return tag && tag[0] === '/';
}

const templateCompiler = (template) => {
	const temp = template
		.replace(/\n/g, '')
		.replace(/(\s*<)|(>\s*)/g, function(match) {
			return match.trim();
		});
	const tags = temp.match(/<(\S*?)[^>]*>.*?|<.*? \/>/g);
	const strings = temp.replace(/<(\S*?)[^>]*>.*?|<.*? \/>/g, '<tag>').split("<tag>");
	const elList = [];

	// 删除最后一个无意义空字符串
	strings.pop();
	console.log(tags);
	console.log(strings);

	// 循环处理标签
	for (let str of strings) {
		const isText = str !== '';
		const tag = tags.shift().replace(/<|>/g, '');
		const tagAttrs = (tag.match(/\s+([^"]+)="([^"]+)"/g) || []).map((value) => value.trim());
		const tagName = tag.split(' ')[0];
		const hasEndTag = isEndTag(tag.split(' ').pop());
		const attrs = {};
		const events = {};
		const model = null;
		let cycle;

		if (isText) {
			const parentEl = elList[elList.length - 1];
			parentEl.addChildren([str]);
		}

		// 闭合标签，例如：</div>
		if (isEndTag(tagName)) {
			// console.log(tagName);
			closeTag(elList);
			continue;
		}

		// 针对自闭和标签，例如：<input />
		if (hasEndTag) {
			tagAttrs.pop();
		}

		// 区分事件或属性
		for (let item of tagAttrs) {
			const attr = item.split('=');
			const attrName = attr[0];
			const attrValue = attr[1];
			const isEvent = /^@/.test(attrName);

			if (isEvent) {
				const type = attrName.replace(/@/, '');
				const value = attrValue.replace(/"|'/g, '');

				switch(type) {
					case 'model':
						model = { key: value };
						break;
					case 'for':
						cycle = value;
						break;
					default:
						events[type] = value;
						break;
				}
			} else {
				attrs[attrName] = attrValue;
			}
		}

		const newEl = new El({tagName, attrs, events, model, cycle});

		console.log(tagName, attrs, events, model);
		elList.push(newEl);

		if (hasEndTag) {
			closeTag(elList);
		}
	}

	return elList.pop();
}

export default templateCompiler;