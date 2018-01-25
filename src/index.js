import module from './module';

let myApp = module({
	selector: '#app',
	template: `
		<div>
			<h1>Title</h1>
			<p>{{string}}</p>
			<input type="text" @model="{{string}}" />
			<br />
			<button @click="{{changeStr}}">test</button>
		</div>
	`,
	data: {
		string: 'test string',
	},
	methods: {
		changeStr: function() {
			this.string = "new string";
		},
	}
})