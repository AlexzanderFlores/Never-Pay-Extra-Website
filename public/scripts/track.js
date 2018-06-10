$(document).ready(() => {
	let callingCode = '1';
	const url = new URL(window.location.href);
	const upc = url.searchParams.get('upc');
	let name = url.searchParams.get('name');
	if(name) {
		name = name.replace('+', ' ');
	}

	if(!upc && $('#message-result').html().indexOf('track') === -1) {
		window.location = '/';
	}

	$('input[name="upc"]').val(upc);
	$('input[name="name"]').val(name);

	$('input[name="phone"]').on('change paste keyup', function() {
		let val = $(this).val();
		if(val === '+') {
			val = '';
			$(this).val(val);
		} else if(val.indexOf('+') === -1 && val.length > 0) {
			val = `+${callingCode}${val}`;
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

	$('input[type="submit"]').on('click', function(event) {
		const emailContainer = $('input[name="email"]');
		const email = emailContainer.val();
		const phone = $('input[name="phone"]').val();
		if(email === '' && phone === '') {
			emailContainer.focus();
			event.preventDefault();
		}
	});

	$.get(`http://api.ipify.org/?format=json`).then(data => {
		const uriBase = 'https://api.neverpayextra.com/v1/data-from-ip';
		$.get(`${uriBase}?address=${data.ip}`).then(data => callingCode = data);
	});
});
