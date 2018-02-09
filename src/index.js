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
		}]
	},
	methods: {}
})