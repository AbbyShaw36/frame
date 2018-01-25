class Watcher {
	constructor(data) {
		this.lib = {};
		this.subscriptionList = {};

		this._init(data);
	}
	_init(data) {
		const lib = this.lib;
		const list = this.subscriptionList;

		for (let key in data) {
			Object.defineProperty(lib, key, {
				set: function(value) {
					const handlerList = list[key];

					data[key] = value;

					if (handlerList) {
						handlerList.forEach((handler) => {
							handler();
						});
					}
				},
				get: function() {
					return data[key];
				}
			});
		}
	}
	subscribe(key, handler) {
		const list = this.subscriptionList;
		const handlerList = list[key];

		if (handlerList) {
			handlerList.push(handler);
			return;
		}

		list[key] = [handler];
	}
	getData() {
		return this.lib;
	}
}

export default Watcher;