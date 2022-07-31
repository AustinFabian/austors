const nav = document.getElementsByClassName("bar")[0];
const show = document.getElementsByClassName("hidden")[0];

$(document).ready(function () {
	$(nav).click(function () {
		$(show).toggleClass("activee");
	});
});
