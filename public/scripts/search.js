const foundProducts = [];
const websites = [
	'amazon',
	'ebay',
	'bestbuy',
	'walmart'
];
const foundWebsites = {};
let websiteCount = 0;
let totalProducts = 0;
let container;
let primeOffered = false;

const isStringUPC = query => {
	return query && query.length === 12 && typeof(query) != 'boolean' && !isNaN(query);
};

const isRelated = (product, query) => {
	let count = 0;
	const queryLength = query.split(' ').length;
	if(queryLength === 1) {
		return true;
	}
	const title = product.title.toLowerCase().replace(/\s+[^ A-Za-z0-9]/g, '');

	for(let word of title.split(' ')) {
		if(query.toLowerCase().indexOf(word) >= 0 && ++count >= 2) {
			return true;
		}
	}

	return false;
};

const displayProducts = query => {
	foundProducts.sort((a, b) => a.price > b.price ? 1 : a.price < b.price ? -1 : 0);

	let html = `
		<div id='filter'>
		<h1>We found ${totalProducts} products on ${websiteCount} websites</h1>
		<div id='platform-filter'>
		<span class='filter-title'>Platform:</span>`;
		for(let website of Object.keys(foundWebsites)) {
			html += `<span class='filter'><input type='checkbox' id='${website}' checked='checked'><label for='${website}'>${website} (${foundWebsites[website]})</label></span>`;
		}
		html += `</div>`; // #platform-filter
		html += `
			<div id='price-filter'>
				<span class='filter-title'>Price:</span>
				<span class='filter'><label for='min-price'>Min Price: </label><input type='text' id='min-price' maxlength='8'></span>
				<span class='filter'><label for='max-price'>Max Price: </label><input type='text' id='max-price' maxlength='8'></span>
			</div>
			<div id='attributes-filter'>
				<span class='filter-title'>Attributes:</span>
				<span class='filter'>
					<input type='checkbox' id='shipping-filter'>
					<label for='shipping-filter'>2-3 Day Shipping Only</label>
				</span>
				<span class='filter'>
					<input type='checkbox' id='returns-filter'>
					<label for='returns-filter'>Returns Accepted</label>
				</span>
				<span class='filter'>
					<input type='checkbox' id='trackable-filter'>
					<label for='trackable-filter'>Price Trackable</label>
				</span>
			</div>
		</div>`; // #filter
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
		container = $('#inner-content');

		const isUPC = isStringUPC(query);
		totalProducts = 0;
		websiteCount = 0;

		for(let site of websites) {
			const url = `https://api.neverpayextra.com/v1/search/${site}?query=${query.replace(/ /g, '+')}`;

			$.get(url).done(data => {
				const products = data;

				if(products && products.errorMessage === undefined && products.length) {
					for(let product of products) {
						if(!isUPC && !isRelated(product, query)) {
							continue;
						}

						++totalProducts;

						if(foundWebsites[product.platformDisplay]) {
							++foundWebsites[product.platformDisplay];
						} else {
							foundWebsites[product.platformDisplay] = 1;
							++websiteCount;
						}

						// Force HTTPS on the product URL
						if(product.url) {
							if(product.url.indexOf('http://') === 0) {
								product.url = product.url.replace('http://', 'https://');
							}
							product.url = `${product.url}&never-pay-extra=true`;
						}

						// Remove duplicate image URLs
						product.images = product.images.filter((item, pos) => product.images.indexOf(item) === pos);

						// Force HTTPS on image URLs
						for(let a = 0; a < product.images.length; ++a) {
							const image = product.images[a];
							if(image && image.indexOf('http://') === 0) {
								product.images[a] = image.replace('http://', 'https://');
							}
						}

						const imageCount = product.images.length;
						const multiImage = imageCount > 1 ? ' multiple-images' : '';

						let iconCount = 0;
						let iconHtml = '';
						if(product.returnsAccepted) {
							iconHtml += `<div class='product-icon returns-accepted' title='Returns Accepted'>&#x1f4e6</div>`;
							++iconCount;
						}
						if(product.fewDayShipping) {
							iconHtml += `<div class='product-icon few-day-shipping' title='2-3 Day Shipping'>&#x1F69A</div>`;
							++iconCount;
						}
						if(product.inStore) {
							iconHtml += `<div class='product-icon in-store' title='Available in Store'>&#x1F3EC</div>`;
							++iconCount;
						}
						if(product.online) {
							iconHtml += `<div class='product-icon online' title='Available Online'>&#x1F4BB</div>`;
							++iconCount;
						}
						if(product.processing) {
							iconHtml += `<div class='product-icon processing' title='${product.processing}'>&#x23F3</div>`;
							++iconCount;
						}
						if(product.gift) {
							iconHtml += `<div class='product-icon gift' title='Gift Wrapping Available'>&#x1F381</div>`;
							++iconCount;
						}
						if(product.upc) {
							const name = product.name.replace(/ /g, '+');
							iconHtml += `
								<a href='/track?upc=${product.upc}&name=${name}' target='_blank' class='product-icon track' title='Track Product Price'>&#x1F4C8</a>
							`;
							++iconCount;
						}

						const noNums = /\B(?=(\d{3})+(?!\d))/g;

						const price = (+product.price).toFixed(2).replace(noNums, ',');
						const reviews = String(product.reviews).replace(noNums, ',');

						let html = `
							<div class='product' website='${product.platformDisplay}' price='${price}' fast-shipping='${product.fewDayShipping}' returns='${product.returnsAccepted}' trackable=${product.upc !== undefined}>
								<div class='product-image center${multiImage}' original-image='${product.images[0]}'>
									<a href='${product.url}' target='_blank' class='main-image center'>
										<img src='${product.images[0]}'>
									</a>`;
									if(imageCount > 1) {
										html += `<div class='mini-image-container center'>`;
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
										html += '</div>';
									}
								html += `</div>
								<a href='${product.url}' target='_blank' class='product-title'>
									${product.title}
								</a>
								<div class='product-platform'>
									on ${product.platformDisplay}
								</div>
								<div class='product-price'>
									<div>$${price}</div>
									<div class='shipping-included'>(Shipping Included)</div>
								</div>`;
								if(product.rating && product.reviews) {
									html += `
										<div class='product-rating'>
											<span>${Number(product.rating).toFixed(1)} <span>&#9733;</span></span>
											<span>${reviews} Reviews</span>
										</div>
									`;
								}
								html += `<a href='${product.url}' target='_blank' class='product-link center'>
									VIEW PRODUCT
								</a>
								<div class='product-icons' style='width: ${iconCount * 30 + 5}px'>${iconHtml}</div>
							</div>
						`;

						product.html = html;
						foundProducts.push(product);
						displayProducts(query);
					}
				}
			}).fail((xhr, text, error) => {
				console.log('Status: ' + xhr.status);
				console.log('Text: ' + text);
				console.log('Error: ' + error);
				displayProducts(query);
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

	$('#query').on('change paste keyup', function() {
		$('nav form').attr('action', '/search?q=' + $(this).val());
	});

	$('#inner-content').on('click', '#platform-filter input[type=checkbox]', event => {
		const container = $(event.target);
		const website = container.attr('id');
		const checked = container.prop('checked');

		$('.product').each(function() {
			if($(this).attr('website') === website) {
				const split = getSplit($(this));

				if(checked) {
					tryDisplay(split, 'bad-platform', $(this));
				} else {
          tryHide(split, 'bad-platform', $(this));
				}

				$(this).attr('hide-reasons', split.join(','));
			}
		});
	});

	$('#inner-content').on('change paste keyup', '#price-filter input', function() {
		let val = $(this).val();
		if(val === '$') {
			val = '';
			$(this).val(val);
		} else if(val.indexOf('$') === -1 && val.length > 0) {
			val = `$${val}`;
			$(this).val(val);
		}

		const minPrice = +(String($('#min-price').val()).replace(/[^0-9.]/g, ''));
		let maxPrice = +(String($('#max-price').val()).replace(/[^0-9.]/g, ''));
		if(maxPrice === 0) {
			maxPrice = 999999999;
		}

		$('.product').each(function() {
			const price = +($(this).attr('price'));
			const split = getSplit($(this));

			if(price >= minPrice && price <= maxPrice) {
				tryDisplay(split, 'bad-price', $(this));
			} else {
        tryHide(split, 'bad-price', $(this));
			}

			$(this).attr('hide-reasons', split.join(','));
		});
	});

	$('#inner-content').on('click', '#attributes-filter input[id=shipping-filter]', event => {
		if(!primeOffered) {
			// TODO: Use a Cookie to check if we've offered them Prime
			$('#prime-offering').css('width', '300px');
			$('#prime-offering').css('border', '1px solid #333');
		}

    tryFilter('fast-shipping', String($(event.target).prop('checked')), 'not-fast-shipping');
	});

	$('#inner-content').on('click', '#attributes-filter input[id=returns-filter]', event => {
		tryFilter('returns', String($(event.target).prop('checked')), 'returns-unavailable');
	});

	$('#inner-content').on('click', '#attributes-filter input[id=trackable-filter]', event => {
		tryFilter('trackable', String($(event.target).prop('checked')), 'not-trackable');
	});
});

const getSplit = container => {
  const reasons = container.attr('hide-reasons');
  return reasons ? reasons.split(',') : [];
};

const tryDisplay = (split, reason, container) => {
  const index = split.indexOf(reason);
  if(index > -1) {
    split.splice(index, 1);
  }
  if(split.length === 0) {
    container.css('display', 'grid');
  }
};

const tryHide = (split, reason, container) => {
  if(split.indexOf(reason) === -1) {
    split.push(reason);
  }
  container.css('display', 'none');
};

const tryFilter = (attribute, state, reason) => {
  $('.product').each(function() {
    const attr = $(this).attr(attribute);
    const split = getSplit($(this));

    if(state === 'false' || state === attr) {
      tryDisplay(split, reason, $(this));
    } else {
      tryHide(split, reason, $(this));
    }

    $(this).attr('hide-reasons', split.join(','));
  });
};

const closePrimeOffering = id => {
	$(`#${id}`).css('width', '0px');
	setTimeout(() => $(`#${id}`).css('border', 'none'), 250);
};

$('#prime-offering-yes').on('click', () => {
	closePrimeOffering('prime-offering');
	// TODO: Set a Cookie that says we've checked if they have prime
});

$('#prime-offering-no').on('click', () => {
	$('#prime-trial-offering').css('width', '300px');
	$('#prime-trial-offering').css('border', '1px solid #333');
	closePrimeOffering('prime-offering');
});

$('#prime-trial-offering-yes').on('click', () => closePrimeOffering('prime-trial-offering'));

$('#prime-trial-offering-no').on('click', () => closePrimeOffering('prime-trial-offering'));
