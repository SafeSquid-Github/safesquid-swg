function upload_file(section) {
    var input_type = section;
    var data, file_name, post_url;
    data = new FormData();
    $.each($("input[type=file]"), function(i, obj) {
        $.each(obj.files, function(i, file) {
            data.append(input_type, file);
            file_name = file.name;
        });
    });
    	
    if (input_type != "" && file_name != undefined) {
        if (input_type == "config") {
            var overwrite = $("input[name=_overwrite]:checked").val();
            post_url = "?handler=upload&type=config&overwrite=" + overwrite;
        } else {
            post_url = "?handler=upload&type=" + input_type;
            $('.loading_image').html('<img style="max-width:10ex;max-height:10ex;" src="img/loading.gif">');
        }
        jQuery.ajax({
            url: post_url,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'xml',
            async: false,
            type: 'POST',
            success: function(response) {
                var $save_response1 = $(response);
                var $save_response2 = $save_response1.find('upload_info');
                if ($save_response2.attr("upload") == "Successful upload") {
                    $('.loading_image').html('');
                    if (input_type == "activation_key" || input_type == "upgrade" || input_type == "template" || input_type == "ssl_certificate") {
                        var data = '<div class="activation_notify" >Please Restart SafeSquid Service.';                        
                        switch (input_type) {
                            case "activation_key":
								data += '<div class="restart_button  btn-remove" onclick="close_modal(\'' + input_type + '\');restart(\'yes\',\'nocloud\');">Restart</div></div>';
                                $('.activation_notify').html(data);
                                break;
                            case "upgrade":
							data = '<span> Page will reload after successful upgradation</span>';
							$('#_modal_upgrade_upload  ._modal_body').html(data);
							setTimeout(function () {
								location.reload(true);
							}, 6000);
							break;
                            case "template":
                                $('#upload_xml').html("<p>successfully uploaded!<p>")
                                break;
							case "ssl_certificate":
								$('#upload_modal1 .modal-body').html('<span class="alert col-xs-offset-3">Successfully uploaded your certificates</span>');
								setTimeout(function() {
									$(".close").trigger("click");
								}, 1000);
								break;
                        }
                    } else {
                        $(".close").trigger("click");
						alert($save_response2.attr("upload"));
                    }
                } else {
                    alert($save_response2.attr("upload") + ". Please upload valid file!");
                }
            }
        });
    } else {
        alert("Please select a file to upload!");
    }
}

function close_modal(input_type) {
    if (input_type == "activation_key") {
        $('#activation_key_upload').html('<span> Please wait for a while.. then do page refresh!</span>');
    } else if (input_type == "upgrade") {
        $('#modal_upgrade_upload .support_modal_body').html('<span> Please wait for a while.. then do page refresh!</span>');
    } else if (input_type == "startup") {
        $('#description').html('<span> Please wait for a while.. then do page refresh!</span>');
    }else if (input_type == "ssl_certificate") {
        $('#upload_modal1 .modal-body').html('<span class="alert col-xs-offset-3">Successfully uploaded your certificates</span>');
    }    
     else {}
    setTimeout(function() {
        $(".close").trigger("click");
        location.reload();
  }, 10000);
}