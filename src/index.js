import module from "./frame/module";

let newCmp = new module({
	selector: '#app',
	template: `
		<div>
			<div>my module content: {{str1}}, {{str2}}</div>
			<div><input type="text" @model="{{str1}}" /></div>
			<div><input type="text" @model="{{str2}}" /></div>
			<button @click="{{updateText}}">test</button>
		</div>
	`,
	data: {
		str1: 'abc',
		str2: 'test'
	},
	methods: {
		updateText: function() {
			this.str1 = 'aaa';
			console.log(this);
		}
	}
});