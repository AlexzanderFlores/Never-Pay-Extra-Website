const foundProducts = [];
const websites = [
	'amazon',
	'ebay',
	'bestbuy',
	'walmart'
];
let container;

function isStringUPC(query) {
	return query && query.length === 12 && typeof(query) != 'boolean' && !isNaN(query);
}

function isRelated(product, query) {
	let count = 0;
	const queryLength = query.split(' ').length;

	for(let word of product.title.toLowerCase().split(' ')) {
		if(query.toLowerCase().indexOf(word) >= 0 && (++count >= 3 || count >= queryLength)) {
			return true;
		}
	}

	return false;
}

function displayProducts() {
	foundProducts.sort(function(a, b) {
		return a.price > b.price ? 1 : a.price < b.price ? -1 : 0;
	});

	let html = '';
	for(let product of foundProducts) {
		html += product.html;
	}
	container.html(html);
}

$(document).ready(function() {
	const url = new URL(window.location.href);
	const query = url.searchParams.get('q');

	if(query) {
		$('#query').val(query);
		container = $('#inner_content');

		const isUPC = isStringUPC(query);

		for(let site of websites) {
			const url = `https://api.neverpayextra.com/v1/search/${site}?query=${query.replace(/ /g, '+')}`;

			$.get(url).done(function(data) {
				const products = data;

				if(products.errorMessage === undefined && products.length) {
					for(let product of products) {
						if(!isUPC && !isRelated(product, query)) {
							continue;
						}

						let savings = product.comparePrice - product.price;
						if(savings < 0) {
							savings = 0;
						}

						if(product.image && product.image.indexOf('http://') === 0) {
							product.image = product.image.replace('http://', 'https://');
						}

						if(product.url && product.url.indexOf('http://') === 0) {
							product.url = product.url.replace('http://', 'https://');
						}

						let html = `
							<div class='product'>
								<a href='${product.url}' target='_blank' class='product-image center'>
									<img src='${product.image}'>
								</a>
								<a href='${product.url}' target='_blank' class='product-title'>
									${product.title}
								</a>
								<div class='product-platform'>
									on ${product.platformDisplay}
								</div>
								<div class='product-price'>
									<strong>$${(product.price).toFixed(2)}</strong>
								</div>`;
								if(savings > 0) {
									html += `<a href='${product.url}' target='_blank' class='product-savings center'>
										Save $${(savings).toFixed(2)}
									</a>`;
								}
								if(product.rating && product.reviews) {
									html += `
										<div class='product-rating'>
											<span>${product.rating} <span>&#9733;</span></span>
											<span>${product.reviews} Reviews</span>
										</div>
									`;
								}
								html += `<a href='${product.url}' target='_blank' class='product-link center'>
									VIEW PRODUCT
								</a>
							</div>
						`;

						product.html = html;
						foundProducts.push(product);
						displayProducts();
					}
				}
			}).fail(function(xhr, text, error) {
				console.log('Status: ' + xhr.status);
				console.log('Text: ' + text);
				console.log('Error: ' + error);
				displayProducts();
			});
		}
	}

	$('#query').on('change paste keyup', function() {
		$('nav form').attr('action', '/search?q=' + $(this).val());
	});
});
