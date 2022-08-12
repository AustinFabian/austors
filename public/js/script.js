const nav = document.getElementsByClassName("bar")[0];
const show = document.getElementsByClassName("hidden")[0];
const review = document.getElementById("tourReview")
const formReview = document.getElementById("formReview")
const contain = document.getElementsByClassName("containment")[0]

$(document).ready(function () {
	$(nav).click(function () {
		$(show).toggleClass("activee");
	});

	$(contain).click(function () {
		$(show).removeClass("activee");
	});

	$(review).click(function(){
		$(formReview).slideToggle("slow");
	})

	// for owl carousel
	$('.carousel').owlCarousel({
		loop: true,
		margin: 20,
		padding: 20,
		autoplayTimeOut: 2000,
		autoplayHoverPause: true,
		responsive:{
		  0:{
			items: 1,
			nav: false,
		  },
		  700:{
			items: 2,
			nav: false
		  },
		  1101:{
			items: 3,
			nav: false
		  },
		  1400:{
			items: 4,
			nav: false
		  }
		}
	  });
});


	// for map temporarilly

	mapboxgl.accessToken = 'pk.eyJ1IjoiYXVzdGluZmFiaWFuIiwiYSI6ImNsNTN4Mjl1MDB0amQzZXJ4cmoxbTU1aXAifQ.2CyD3OaN_rJoaE7MEZ9z3Q';
	const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 9, // starting zoom
	scrollZoom:false,
	projection: 'globe' // display the map as a 3D globe
	});
	
	map.on('style.load', () => {
	map.setFog({}); // Set the default atmosphere style
	});

	const bounds = new mapboxgl.LngLatBounds();
