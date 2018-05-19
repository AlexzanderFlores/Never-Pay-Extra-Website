$(document).ready(function() {
	const url = new URL(window.location.href);
	const query = url.searchParams.get('q');
	const cp = url.searchParams.get('cp');

	if(query) {
		// const url = `https://api.neverpayextra.com/v1/search?query=${query.replace(/ /g, '+')}`;

		const product = {
			comparePrice: 0,
			foundProducts : true,
			platform: "ebay",
			platformDisplay: "eBay",
			price: 7.99,
			productImage: "http://thumbs1.ebaystatic.com/m/mBJHg-8KNZeitax9ta6bcgg/140.jpg",
			title: "Deluxe Travel Edition Scratch Off World Map Poster Personalized Journal Log ",
			url: "http://www.ebay.com/itm/Deluxe-Travel-Edition-Scratch-Off-World-Map-Poster-Personalized-Journal-Log-/112733738664",
			rating: 4.5,
			reviews: 43
		};

		// $.get(url).done(function(data) {
		// 	console.log(data);
			const products = [product];

			let html = '';
			for(let product of products) {
				if(cp) {
					product.comparePrice = cp;
				}
				let savings = product.comparePrice - product.price;
				if(savings < 0) {
					savings = 0;
				}

				html += `
					<div class='product'>
						<div class='product-image center'>
							<img src='${product.productImage}'>
						</div>
						<div class='product-title'>
							${product.title}
						</div>
						<div class='product-platform'>
							on ${product.platformDisplay}
						</div>
						<div class='product-price'>
							$${(product.price).toFixed(2)}
						</div>
						<div class='product-savings center'>
							Save $${(savings).toFixed(2)}
						</div>`
						if(product.rating && product.reviews) {
							html += `
								<div class='product-rating'>
									<span>${product.rating} <span>&#9733;</span></span>
									${product.reviews} Reviews
								</div>
							`;
						}
						html += `<a href='${product.url}' target='_blank' class='product-link center'>
							VIEW PRODUCT
						</a>
					</div>
				`;
			}

			$('#inner_content').html(html);
		// }).fail(function(xhr, text, error) {
		// 	console.log('Status: ' + xhr.status);
		// 	console.log('Text: ' + text);
		// 	console.log('Error: ' + error);
		// });
	}

	$('#query').on('change paste keyup', function() {
		$('nav form').attr('action', '/search?q=' + $(this).val());
	});
});
