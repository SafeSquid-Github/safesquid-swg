function restart( yes, cloud_bkp = "yescloud" ) {
 
	if (yes == "yes") {
		if( cloud_bkp == "nocloud" )	
			save_config('nocloud','restart');		
		else
			save_config('yes','restart');
		
		var DATA = '<div style="white-spane:wrap" >';
            DATA += '<span> Confirm cloud backup before restart!</span></div>';
			$("._restart").html(DATA);
		
		} else {		
		console.log("not saved");
	}
	
	restart_now()
	
	
}

function restart_now(){
	var DATA = $.ssquid.params.handler.restart;
	jQuery.ajax({
		type : "POST",
		url : "",
		data : DATA,
		cache : false,
		dataType : "xml",
		success : function (response) {
			var $save_response1 = $(response);
			var $save_response2 = $save_response1.find('restart_info');
			var DATA = '<div style="white-spane:wrap" ><p>' + $save_response2.attr("status")+'</p>';
                DATA += '<span> Please wait for a while.. then do page refresh!</span></div>';
			$("._restart").html(DATA);
			$("#_restart_div").show().delay(9000).fadeOut();
            
			setTimeout(function () {
				$(".close").trigger("click");
                location.reload();
			}, 9000);
			
		}
	});	
	
}

function restore(){
	var disp = "";
	$restore = $.getValues($.ssquid.params.handler.cloud_restore);
	$save = $($restore);
	
	disp = $save.find('cloud_restore').find('results').attr('result');
	
	if (disp == "" )	
		disp = "Nothing to Restore\n";
		
	$xml_subsrciption = disp.split("\n").join("<br>");
	
	$("#_restore_div").html($xml_subsrciption);
	$("#_restore_div").removeClass("support_align_center").addClass("text-left");
}