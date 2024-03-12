function prefetch() {
	var name = $('#save_prefetch').val();
	var url = "handler=prefetch&queue=http://" + name;
	
	jQuery.ajax({
		url : 'http://safesquid.cfg',
		data : url,
		cache : false,
		contentType : false,
		processData : false,
		type : 'POST',
		success : function (response) {
			var $save_response1 = $(response);
			var $save_response2 = $save_response1.find('prefetch');
		
			$save_response2.children().each(function () {
				var result = $(this).attr("url");
				$('#result_prefetch').html(" <br /> <label for='save'>Current Prefetch Queue</label> <br /> <p>" + result + "</p>");
			});
			
		}
	});
}
