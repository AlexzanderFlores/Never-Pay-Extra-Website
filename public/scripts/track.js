$(document).ready(() => {
	const url = new URL(window.location.href);
	const upc = url.searchParams.get('upc');

	if(!upc && $('#message-result').html().indexOf('tracked') === -1) {
		window.location = '/';
	}

	$('input[name="upc"]').val(upc);

	$('input[name="phone"]').on('change paste keyup', function() {
		let val = $(this).val();
		if(val === '+') {
			val = '';
			$(this).val(val);
		} else if(val.indexOf('+') === -1 && val.length > 0) {
			val = `+${val}`;
			$(this).val(val);
		}
	});

	$('input[name="target"]').on('change paste keyup', function() {
		let val = $(this).val();
		if(val === '$') {
			val = '';
			$(this).val(val);
		} else if(val.indexOf('$') === -1 && val.length > 0) {
			val = `$${val}`;
			$(this).val(val);
		}
	});
});
