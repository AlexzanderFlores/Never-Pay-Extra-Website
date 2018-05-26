const foundProducts = [];
const websites = [
	'amazon',
	'ebay',
	'bestbuy',
	'walmart'
];
let container;

const isStringUPC = query => {
	return query && query.length === 12 && typeof(query) != 'boolean' && !isNaN(query);
};

const isRelated = (product, query) => {
	let count = 0;
	const queryLength = query.split(' ').length;

	for(let word of product.title.toLowerCase().split(' ')) {
		if(query.toLowerCase().indexOf(word) >= 0 && (++count >= 3 || count >= queryLength)) {
			return true;
		}
	}

	return false;
};

const displayProducts = () => {
	foundProducts.sort((a, b) => a.price > b.price ? 1 : a.price < b.price ? -1 : 0);

	let html = '';
	for(let product of foundProducts) {
		html += product.html;
	}
	container.html(html);
};

$(document).ready(() => {
	const url = new URL(window.location.href);
	const query = url.searchParams.get('q');

	if(query) {
		$('#query').val(query);
		container = $('#inner_content');

		const isUPC = isStringUPC(query);

		for(let site of websites) {
			const url = `https://api.neverpayextra.com/v1/search/${site}?query=${query.replace(/ /g, '+')}`;

			$.get(url).done(data => {
				const products = data;

				if(products && products.errorMessage === undefined && products.length) {
					for(let product of products) {
						if(!isUPC && !isRelated(product, query)) {
							continue;
						}

						let savings = product.comparePrice - product.price;
						if(savings < 0) {
							savings = 0;
						}

						if(product.url && product.url.indexOf('http://') === 0) {
							product.url = product.url.replace('http://', 'https://');
						}

						for(let a = 0; a < product.images.length; ++a) {
							const image = product.images[a];
							if(image && image.indexOf('http://') === 0) {
								product.images[a] = image.replace('http://', 'https://');
							}
						}

						let html = `
							<div class='product'>
								<div class='product-image center' original-image='${product.images[0]}'>
									<a href='${product.url}' target='_blank' class='main-image center'>
										<img src='${product.images[0]}'>
									</a>
									<div class='mini-image-container center'>`;
									for(let a = 0; a < product.images.length; ++a) {
										let selected = '';
										if(a === 0) {
											selected = ' selected';
										}

										html += `
											<div class='mini-image center${selected}'>
												<img src=${product.images[a]}>
											</div>
										`;
									}
								html += `
									</div>
								</div>
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
			}).fail((xhr, text, error) => {
				console.log('Status: ' + xhr.status);
				console.log('Text: ' + text);
				console.log('Error: ' + error);
				displayProducts();
			});
		}
	}

	$(document).on('mouseover', '.mini-image img', event => {
		const target = $(event.target);
		const container = target.closest('.product-image');
		const image = container.find('.main-image img');
		$(image).attr('src', target.attr('src'));
	});

	$(document).on('mouseleave', '.mini-image:not(.selected) img', event => {
		const target = $(event.target);
		const container = target.closest('.product-image');
		const image = container.find('.main-image img');
		$(image).attr('src', container.attr('original-image'));
	});

	$(document).on('click', '.mini-image img', event => {
		const target = $(event.target);
		const container = target.closest('.product-image');
		container.find('.mini-image').removeClass('selected');
		target.closest('.mini-image').addClass('selected');
		container.attr('original-image', target.attr('src'));
	});

	$('#query').on('change paste keyup', () => {
		$('nav form').attr('action', '/search?q=' + $(this).val());
	});
});
