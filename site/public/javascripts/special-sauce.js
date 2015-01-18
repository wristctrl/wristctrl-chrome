$(document).ready(function() {
	$('.person .pic').each(function(index, el) {
		$(this).height($(this).width());
	});

	$(window).resize(function(event) {
		$('.person .pic').each(function(index, el) {
			$(this).height($(this).width());
		});
	});
});