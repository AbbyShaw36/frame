export default (string, data) => {
	function render(strings, ...interpolatedValues) {
		return strings.reduce((res, str, index) => {
			res += str;

			if (interpolatedValues.hasOwnProperty(index)) {
				res += data[interpolatedValues[index]];
			}

			return res;
		}, '');
	}

	return render`${string}`;
};

