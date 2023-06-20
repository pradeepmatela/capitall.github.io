(
	function( $, window, document ) {
		//Set Variables.
		let html_el = $( 'html' );
		let body_el = $( 'body' );
		let main_header = $( '[data-elementor-type="header"]' );
		let site_main = $( '.site-main' );
		let documentScrollPos = $( document ).scrollTop();
		let menu_doing_animation = false;
		let viewport_width = window.innerWidth;
		let doc_scroll_pos_before_menu_opened = 0;
		let lastScrollTop = 0;
		let prev_viewport_width = viewport_width;

		//Set Hero section top padding, depending on header height to prevent overlapping of the content.
		function hero_dynamic_top_padding() {
			if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
				let header_height = main_header.outerHeight();

				if ( typeof header_height !== 'undefined' && header_height > 0 ) {
					let top_padding = header_height + 40;

					$( '.hero-dynamic-padding' ).css('padding-top', top_padding );
				}
			}
		}

		//Set Cookie
		function setCookie( cname, cvalue, exdays ) {
			const d = new Date();
			d.setTime( d.getTime() + (
				exdays * 24 * 60 * 60 * 1000
			) );
			let expires = 'expires=' + d.toUTCString();
			document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
		}

		//Get Cookie
		function getCookie( cname ) {
			let name = cname + '=';
			let decodedCookie = decodeURIComponent( document.cookie );
			let ca = decodedCookie.split( ';' );
			for ( let i = 0; i < ca.length; i ++ ) {
				let c = ca[i];
				while ( c.charAt( 0 ) == ' ' ) {
					c = c.substring( 1 );
				}
				if ( c.indexOf( name ) == 0 ) {
					return c.substring( name.length, c.length );
				}
			}
			return '';
		}

		//Animate Dropdown
		function animate_submenu_dropdown( dropdown ) {
			if ( typeof dropdown !== 'undefined' && dropdown.length > 0 ) {

				//Set variable value that animation is in progress for submenu.
				menu_doing_animation = true;

				if ( !dropdown.hasClass( 'active' ) ) {
					//Remove active states from other submenus.
					$( '.header-nav>.menu-item>.dropdown-menu' ).removeClass( 'active' );

					//Add header menu mask active state.
					$( '.header-menu-mask' ).addClass( 'menu-active' );

					//Slide down (open) submenu.
					dropdown.addClass( 'active' );
					if ( viewport_width <= 1200 ) {
						dropdown.slideDown();
					}

				} else {

					//Remove header menu mask active state.
					$( '.header-menu-mask' ).removeClass( 'menu-active' );

					//Slide up (close) submenu.
					dropdown.removeClass( 'active' );
					if ( viewport_width <= 1200 ) {
						dropdown.slideUp();
					}
				}

				//Animate Page when submenu is opened.
				if ( viewport_width > 1200 ) {
					animate_page( dropdown );
				}

				//Set variable value that animation is finished for submenu.
				setTimeout( function() {
					menu_doing_animation = false;
				}, 300 );
			}
		}

		//Animate Page Down
		function animate_page_down( dropdown ) {
			let dropdown_height = dropdown.outerHeight();

			if ( body_el.hasClass( 'menu-active' ) ) {
				doc_scroll_pos_before_menu_opened = body_el.scrollTop();
			} else {
				doc_scroll_pos_before_menu_opened = $( document ).scrollTop();
			}

			//Add class to body when menu submenu is active.
			html_el.addClass( 'menu-active' );
			body_el.addClass( 'menu-active' ).scrollTop( doc_scroll_pos_before_menu_opened );

			//Animate down the main header.
			if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
				main_header.css( 'margin-top', dropdown_height ).addClass( 'menu-opened' ).addClass( 'header-mobile-opened' );
				main_header.find( '.header-nav' ).addClass( 'active' );
			}

			//Animate content position.
			if ( typeof site_main !== 'undefined' && site_main.length > 0 ) {
				site_main.css( 'transform', 'translateY(' + dropdown_height + 'px)' );
			}

			$( '.us-mobile-menu-toggle' ).addClass( 'open' );
		}

		//Animate Page Up
		function animate_page_up() {
			//Remove class from body when menu submenu is active.
			body_el.removeClass( 'menu-active' );

			//Set scroll top position to html after submenu is closed.
			html_el.scrollTop( doc_scroll_pos_before_menu_opened );

			//Animate up the main header.
			if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
				main_header.css( 'margin-top', '' ).removeClass( 'menu-opened' );
				setTimeout( function() {
					main_header.removeClass( 'menu-opened' ).removeClass( 'header-mobile-opened' );
				}, 300 );

				main_header.find( '.header-nav' ).removeClass( 'active' );
			}

			//Animate content position.
			if ( typeof site_main !== 'undefined' && site_main.length > 0 ) {
				site_main.css( 'transform', '' );
			}

			$( '.us-mobile-menu-toggle' ).removeClass( 'open' );
		}

		//Animate Page on dropdown trigger
		function animate_page( dropdown ) {
			if ( dropdown.hasClass( 'active' ) ) {
				animate_page_down( dropdown );
			} else {
				animate_page_up();
			}
		}

		//js add params to url
		function setQueryStringParameter( name, value ) {
			const params = new URLSearchParams( window.location.search );
			params.append( name, value );
			window.history.replaceState( {}, '', decodeURIComponent( window.location.pathname + '?' + params ) );
		}

		//js clean params to url
		function deleteQueryStringParameters() {
			window.history.replaceState( {}, '', decodeURIComponent( window.location.pathname ) );
		}

		//Ajax Resources Hub Filter results
		function us_resources_filters( form, maybe_filters = false, load_more = false ) {
			let data = {},
				filters = {},
				fields = {},
				ajax_loader = form.closest( '.resources-holder' ).find( '.us-ajax-overlay' ),
				page_num = form.attr( 'data-page' ),
				load_more_wrp = form.closest( '.resources-holder' ).find( '.us-ajax-load-more-wrapper' );

			data['action'] = 'us_resources_content_load';
			data['query_obj'] = ajax_object.query_obj;

			if ( typeof page_num !== 'undefined' && page_num ) {
				data['page_num'] = parseInt( page_num ) + 1;
			}

			if ( load_more === false ) {
				data['page_num'] = 1;
				form.attr( 'data-page', 1 );
			}

			if ( maybe_filters ) {
				let filter_i = 0,
					field_i = 0;
				form.find( '[name]' ).each( function( e ) {
					if ( $( this ).attr( 'type' ) === 'checkbox' || $( this ).attr( 'type' ) === 'radio' ) {
						if ( $( this ).prop( 'checked' ) ) {
							filters[filter_i] = {[$( this ).attr( 'name' )]: $( this ).val()};
							filter_i ++;
						}
					} else {
						fields[field_i] = {[$( this ).attr( 'name' )]: $( this ).val()};
						field_i ++;
					}
				} );
				data['filters'] = filters;
				data['fields'] = fields;
			}

			ajax_loader.addClass( 'active' );

			$.post(
				ajax_object.ajax_url,
				data,
				function( response ) {
					if ( typeof response.success !== 'undefined' && response.success === true ) {
						if ( typeof response.data !== 'undefined' && response.data.html !== 'undefined' ) {
							if ( load_more === true ) {
								$( '.us-ajax-posts-wrapper .resources-section' ).append( response.data.html );
								form.attr( 'data-page', parseInt( page_num ) + 1 );
							} else {
								$( '.us-ajax-posts-wrapper' ).html( response.data.html );
								$( 'html, body' ).animate( {
									scrollTop: form.offset().top - 140,
								}, 500 );
							}
							if ( typeof response.data.show_load_more !== 'undefined' && response.data.show_load_more === true ) {
								load_more_wrp.show();
							} else {
								load_more_wrp.hide();
							}
						} else {
							$( '.us-ajax-posts-wrapper' ).html( '' );
							load_more_wrp.hide();
						}
					} else {
						load_more_wrp.hide();
					}

					deleteQueryStringParameters();

					$.each( data['filters'], function( obj_key, obj ) {
						$.each( obj, function( element_key, element ) {
							setQueryStringParameter( element_key + '[]', element );
						} );
					} );

					ajax_loader.removeClass( 'active' );
				},
			);
		}

		//Match height.
		$('.match-height-item').matchHeight();
		$('.match-height-image-box .elementor-image-box-img').matchHeight();

		//Slider Logos
		new Swiper( '.us-logos-wrapper', {
			// Optional parameters
			loop: true,
			speed: 2000,
			autoplay: {
				delay: 1,
				disableOnInteraction: false,
			},
			slidesPerView: 1,
			spaceBetween: 0,
			breakpoints: {
				768: {
					slidesPerView: 4,
				},
			},
			grabCursor: true,
			mousewheelControl: true,
			keyboardControl: true,
		} );

		//Slider Home Info Praphic
		new Swiper( '.us-home-slider-wrapper', {
			spaceBetween: 0,
			effect: 'fade',
			speed: 1000,
			loop: true,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false,
			},
			slidesPerView: 1,
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		} );

		//Slider Why Unsupervised
		new Swiper( '.us-why-us-slider-wrapper', {
			spaceBetween: 0,
			effect: 'fade',
			speed: 1000,
			loop: true,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false,
			},
			slidesPerView: 1,
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		} );

		//Slider Resources Archive Posts
		new Swiper( '.resource-section-video .resources-section-slider-holder', {
			slidesPerView: 'auto',
			spaceBetween: 0,
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		} );

		new Swiper( '.resource-section-regular .resources-section-slider-holder', {
			slidesPerView: 'auto',
			spaceBetween: 0,
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		} );

		$( document ).on( 'change', '.resources-filters-container', function() {
			us_resources_filters( $( this ), true, false );
		} );

		$( document ).on( 'click', '.us-ajax-load-more-wrapper .us-ajax-load-more', function() {
			let form = $( this ).closest( '.resources-holder' ).find( '.resources-filters-container' );
			us_resources_filters( form, true, true );
		} );


		$( document ).on( 'click', '.resources-reset-filters', function() {
			let form = $( this ).closest( '.resources-filters-container' );
			form.attr( 'data-page', 1 );
			deleteQueryStringParameters();
			us_resources_filters( form );
			form.find( 'input' ).prop( 'checked', false );
		} );


		//Open the menu whe mouse is in top.
		$( window ).on( 'mousemove', function( e ) {
			if ( e.clientY < 50 ) {
				if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
					if ( main_header.hasClass( 'hide-on-scroll-down' ) ) {
						main_header.removeClass( 'hide-on-scroll-down' );
					}
				}
			}
		} );

		//Close the menu whe mouse leaves.
		if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
			main_header.on( 'mouseleave', function() {
				if ( viewport_width >= 1200 && !menu_doing_animation && documentScrollPos > 80 ) {
					main_header.addClass( 'hide-on-scroll-down' );
				}
			} );
		}

		//Dropdown Menu
		$( document ).on( 'click', '.header-nav>.menu-item-has-children>a', function( e ) {
			e.preventDefault();

			let current_el = $( this ),
				next_dropdown = current_el.siblings( '.dropdown-menu' );

			animate_submenu_dropdown( next_dropdown );
		} );

		//Close Menu if clicked outside of the menu.
		$( document ).on( 'click', '.header-menu-mask, .menu-item-back', function() {
			$( '.header-menu-mask' ).removeClass( 'menu-active' );
			$( '.us-mobile-menu-toggle' ).removeClass( 'open' );
			$( '.header-nav>.menu-item>.dropdown-menu' ).removeClass( 'active' );
			$( '.site-main' ).css( 'transform', '' );
			$( '#info-bar' ).slideDown();
			body_el.removeClass( 'menu-active' );
			html_el.scrollTop( doc_scroll_pos_before_menu_opened );
			$( '.mobile-header-buttons-wrapper' ).removeClass( 'active' );

			if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
				main_header.css( 'margin-top', '' ).removeClass( 'header-mobile-opened' );
				setTimeout( function() {
					main_header.removeClass( 'menu-opened' );
				}, 300 );
			}

			menu_doing_animation = true;
			setTimeout( function() {
				menu_doing_animation = false;
			}, 300 );
		} );

		//Make menu with scrolled styles on page load.
		if ( documentScrollPos > 20 ) {
			if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
				main_header.addClass( 'scrolled' );
			}
		}

		//Handle mobile menu open/close action.
		$( '.us-mobile-menu-toggle' ).click( function() {
			$( this ).toggleClass( 'open' );

			//Show or hide header buttons on mobile menu toogle.
			$( '.mobile-header-buttons-wrapper' ).toggleClass( 'active' );

			//Handle menu display type on mobile menu open or close.
			if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
				main_header.toggleClass( 'header-mobile-opened' ).removeClass( 'hide-on-scroll-down' );
				main_header.find( '.header-nav' ).toggleClass( 'active' );
			}

			//Hide Infobar when menu is opened.
			$( '#info-bar' ).slideToggle();
		} );

		//Close Info-bar
		$( document ).on( 'click', '#info-bar-close', function() {
			$( '#info-bar' ).slideUp().remove();
			setCookie( 'info-bar-closed', 'yes', 2147483647 );
		} );

		//Do not show infobar if it was closed.
		if ( getCookie( 'info-bar-closed' ) ) {
			$( '#info-bar' ).remove();
		}

		//Resources Filters
		$( document ).on( 'click', '.resources-filter-drop-name', function() {
			let current_el = $( this ),
				dropdown_list = current_el.siblings( '.resources-filter-list' );

			if ( typeof dropdown_list !== 'undefined' && dropdown_list.length > 0 ) {
				dropdown_list.slideToggle( 300 );
			}
		} );

		//Hide Resources Filter
		$( document ).on( 'click', function( e ) {
			if ( $( e.target ).closest( '.resources-filter-drop-name' ).length === 0 ) {
				$( '.resources-filter-list' ).slideUp( 300 );
			}
		} );

		//Filter results on view more.
		$( document ).on( 'click', '.resources-view-all', function() {
			let filter_key_name = $( this ).attr( 'data-name' );

			$( '#resource-filter-' + filter_key_name ).prop( 'checked', true ).attr( 'checked', true ).trigger( 'change' );
		} );

		//
		// Resources Title and Image hovering Start.
		//
		$( document ).on( 'mouseenter', '.resource-post .resource-img, .resource-post .resource-title, .resource-post .resource-read-more', function() {
			let current_post = $( this ).closest( '.resource-post' ),
				current_img = current_post.find( '.resource-img' ),
				current_title = current_post.find( '.resource-title' ),
				current_more = current_post.find( '.resource-read-more' );

			current_img.addClass( 'hovered' );
			current_title.addClass( 'hovered' );
			current_more.addClass( 'hovered' );
		} );
		$( document ).on( 'mouseleave', '.resource-post .resource-img, .resource-post .resource-title, .resource-post .resource-read-more', function() {
			let current_post = $( this ).closest( '.resource-post' ),
				current_img = current_post.find( '.resource-img' ),
				current_title = current_post.find( '.resource-title' ),
				current_more = current_post.find( '.resource-read-more' );

			current_img.removeClass( 'hovered' );
			current_title.removeClass( 'hovered' );
			current_more.removeClass( 'hovered' );
		} );
		$( document ).on( 'ontouchstart', '.resource-post .resource-img, .resource-post .resource-title, .resource-post .resource-read-more', function() {
			let current_post = $( this ).closest( '.resource-post' ),
				current_img = current_post.find( '.resource-img' ),
				current_title = current_post.find( '.resource-title' ),
				current_more = current_post.find( '.resource-read-more' );

			current_img.addClass( 'hovered' );
			current_title.addClass( 'hovered' );
			current_more.addClass( 'hovered' );
		} );
		//
		//Resources Title and Image hovering End.


		//MK TO FORM label higlight on focus of input.
		$( document ).on( 'focus', '.mktoField', function() {
			$( this ).siblings( '.mktoLabel' ).addClass( 'mk-label-focused' );

			if ( $( this ).hasClass( 'mktoInvalid' ) ) {
				$( this ).siblings( '.mktoLabel' ).addClass( 'mk-label-invalid' );
			} else {
				$( this ).siblings( '.mktoLabel' ).removeClass( 'mk-label-invalid' );
			}
		} );

		$( document ).on( 'focusout', '.mktoField', function() {
			$( this ).siblings( '.mktoLabel' ).removeClass( 'mk-label-focused' );

			if ( $( this ).hasClass( 'mktoInvalid' ) ) {
				$( this ).siblings( '.mktoLabel' ).addClass( 'mk-label-invalid' );
			} else {
				$( this ).siblings( '.mktoLabel' ).removeClass( 'mk-label-invalid' );
			}
		} );


		$( window ).load( function() {
			//Set Hero sections dynamic top padding.
			hero_dynamic_top_padding();
		} );


		//
		// On Scroll.
		//
		$( window ).scroll( function() {
			// Sticky Header
			let stickyNavTop = 70;
			let stickyNav = function() {
				if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
					if ( !menu_doing_animation ) {
						let scrollTop = $( window ).scrollTop();
						if ( scrollTop > stickyNavTop ) {
							main_header.addClass( 'hide-on-scroll-down' ).addClass( 'scrolled' );
						} else {
							main_header.removeClass( 'hide-on-scroll-down' ).removeClass( 'scrolled' );
						}
						if ( scrollTop < lastScrollTop ) {
							main_header.removeClass( 'hide-on-scroll-down' );
						}
						lastScrollTop = scrollTop;
					}
				}
			};

			documentScrollPos = $( document ).scrollTop();

			stickyNav();
		} );

		//
		// On Resize.
		//
		let resize_scroll_calc_done = false;
		$( window ).resize( function() {
			//Set Hero sections dynamic top padding.
			hero_dynamic_top_padding();

			//Define variables on resize.

			viewport_width = window.innerWidth;

			//Hide Menu when resize from mobile to desktop happens.
			let active_sub_menu = $( '.dropdown-menu.active' );
			if ( ( viewport_width <= 1200 && prev_viewport_width > 1200 ) || ( viewport_width > 1200 && prev_viewport_width <= 1200 ) ) {
				$( '.header-nav' ).removeClass( 'active' );
				$( '.us-mobile-menu-toggle' ).removeClass( 'open' );
				$( '.header-menu-mask' ).removeClass( 'menu-active' );
				$( '.mobile-header-buttons-wrapper' ).removeClass( 'active' );

				body_el.removeClass( 'menu-active' );

				if ( !doc_scroll_pos_before_menu_opened ) {
					doc_scroll_pos_before_menu_opened = documentScrollPos;
					html_el.removeClass( 'menu-active' ).scrollTop( doc_scroll_pos_before_menu_opened );
				}

				html_el.removeClass( 'menu-active' ).scrollTop( doc_scroll_pos_before_menu_opened );

				if ( typeof active_sub_menu !== 'undefined' && active_sub_menu.length > 0 ) {
					active_sub_menu.removeClass( 'active' ).removeAttr( 'style' );
				}

				if ( typeof main_header !== 'undefined' && main_header.length > 0 ) {
					main_header.removeAttr( 'style' ).removeClass( 'menu-opened' ).removeClass( 'header-mobile-opened' );
				}

				if ( typeof site_main !== 'undefined' && site_main.length > 0 ) {
					site_main.css( 'transform', '' );
				}

				$( '#info-bar' ).slideDown();

				prev_viewport_width = viewport_width;

				console.log('resize');
			}

		} );

	}
)( window.jQuery, window, document );
