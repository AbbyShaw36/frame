import module from "./frame/module";

let newCmp = new module({
	selector: '#app',
	template: `
		<div>
			<div>my module content: {{str1}}, {{str2}}</div>
			<div><input type="text" @model="{{str1}}" /></div>
			<div><input type="text" @model="{{str2}}" /></div>
			<button @click="{{updateText}}">test</button>
			<ul>
				<li @for="item in list">{{item.name}}</li>
			</ul>
		</div>
	`,
	data: {
		str1: 'abc',
		str2: 'test',
		list: [{
			name: "aaa"
		}, {
			name: "bbb"
		}]
	},
	methods: {
		updateText: function() {
			this.list[0] = {
				name: "abc"
			};
			console.log(this);
		}
	}
});