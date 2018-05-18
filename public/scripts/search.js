$(document).ready(function() {
	// const href = window.location.href;
	// const url = new URL(href);
	// const query = url.searchParams.get('q');
	// const ref = url.searchParams.get('ref');

	$('#query').on('change paste keyup', function() {
		$('nav form').attr('action', '/search?q=' + $(this).val());
	});
});
