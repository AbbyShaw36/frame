const tagRegexp = /<(\S*?)[^>]*>.*?|<.*? \/>/g;
const attrRegexp = /\s+([^"]+)="([^"]+)"/g;

const isEndTag = (tag) => {
	return tag && tag[0] === '/';
}

const getTemplateElement = (template) => {
	const tpl = template
		.replace(/\n/g, '')
		.replace(/(\s*<)|(>\s*)/g, function(match) {
			return match.trim();
		});
	const tags = tpl.match(tagRegexp);
	const strings = tpl.replace(tagRegexp, '<tag>').split("<tag>");

	// 删除最后一个无意义空字符串
	strings.pop();
	console.log(tags);
	console.log(strings);

	return {tags, strings};
}

class ElStack {
	constructor() {
		this.stack = [];
	}
	push(el) {
		this.stack.push(el);
		console.log('push', el);
	}
	pop() {
		console.log('pop', this.top());
		return this.stack.pop();
	}
	top() {
		const stack = this.stack;
		return stack[stack.length - 1];
	}
}

const elAddChild = (elStack, child) => {
	const parentEl = elStack.top();

	if (!parentEl) {
		elStack.push(child);
		return;
	}

	if (Array.isArray(parentEl)) {
		parentEl.forEach((parent) => {
			parent.children.push(child);
		});
	} else {
		parentEl.children.push(child);
	}
};

const closeTag = (elStack) => {
	elAddChild(elStack, elStack.pop());
};

const templateCompiler = (template) => {
	const tpl = getTemplateElement(template);
	const tags = tpl.tags;
	const strings = tpl.strings;
	const elStack = new ElStack();

	// 循环处理标签
	for (let str of strings) {
		const isText = str !== '';
		const tag = tags.shift().replace(/<|>/g, '');
		const tagAttrs = (tag.match(attrRegexp) || []).map((value) => value.trim());
		const tagName = tag.split(' ')[0];
		const hasEndTag = isEndTag(tag.split(' ').pop());
		const attrs = {};
		const events = {};

		let model = null;
		let cycle = null;

		if (isText) {
			console.log('is text', str);
			elAddChild(elStack, str);
		}

		// 闭合标签，例如：</div>
		if (isEndTag(tagName)) {
			console.log("is end tag", tagName);
			closeTag(elStack);
			continue;
		}

		// 针对自闭和标签，例如：<input />
		if (hasEndTag) {
			console.log("has end tag");
			tagAttrs.pop();
		}

		// 区分事件或属性
		for (let item of tagAttrs) {
			const attr = item.split('=');
			const attrName = attr[0];
			const attrValue = attr[1].replace(/"|'/g, '');
			const isEvent = /^@/.test(attrName);

			console.log(attrName, attrValue);

			if (isEvent) {
				const eventType = attrName.replace(/@/, '');
				const eventValue = attrValue;

				switch(eventType) {
					// model 双向数据绑定
					case 'model':
						model = {
							key: eventValue
						};
						break;
					// for 循环
					case 'for':
						const itemName = eventValue.split(" in ")[0];
						const listName = eventValue.split(" in ")[1];
						cycle = { itemName, listName };
						break;
					// DOM 事件
					default:
						events[eventType] = eventValue;
						break;
				}
			} else {
				attrs[attrName] = attrValue;
			}
		}

		elStack.push({tagName, attrs, events, model, cycle, children:[]});

		if (hasEndTag) {
			closeTag(elStack);
		}
	}

	return elStack.pop();
}

export default templateCompiler;