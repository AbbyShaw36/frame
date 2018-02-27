import F from './frame';

F.component('myList', {
	template: `
		<ul>
			<li @for="item in list">{{item.value}}</li>
		</ul>
	`,
	data: {},
	methods: {},
	props: []
});

const myApp = new F({
	selector: '#app',
	template: `
		<div>
			<div>
				<input type="text" @model="newItem" />
				<button @click="addItem">add item</button>
			</div>
			<div>new item value: {{newItem}}</div>
			<myList list="{{list}}"></myList>
		</div>
	`,
	data: {
		list: [{
			value: 1
		}, {
			value: 2
		}, {
			value: 3
		}],
		newItem: ""
	},
	methods: {
		addItem() {
			this.list.push({
				value: this.newItem
			});

			this.newItem = "";
		}
	}
});