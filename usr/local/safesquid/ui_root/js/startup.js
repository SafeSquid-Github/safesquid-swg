function edit_startup() {
    $('#_edit-startup').addClass('hidden');
    $('#_save-startup').removeClass('hidden');
    $("#_startup_form :input").prop("disabled", false);
}

function cacel_startup() {
    $('#_save-startup').addClass('hidden');
    $('#_edit-startup').removeClass('hidden');
    $("#_startup_form :input").prop("disabled", true);
    get_startup();
}
var array = [];

function save_startup() {
    var DATA = "";
    DATA = $.ssquid.params.handler.startup + "&no_of_params=" + array.length;
    for (i = 0; i < array.length; i++) {
        DATA += "&param" + i + "=" + array[i] + "&value" + i + "=" + encodeURIComponent($("#" + array[i]).val()) + "&desc" + i + "=" + $("#" + array[i] + "_desc").text().split(":").pop();
    }
    jQuery.ajax({
        type: "POST",
        url: "",
        data: DATA,
        cache: false,
        dataType: "xml",
        success: function(response) {
            $('#_save-startup').addClass('hidden');
            $('#_edit-startup').removeClass('hidden');
            $("#_startup_form :input").prop("disabled", true);
            var data = '<div class="activation_notify unhide _restart" ><span>Please Restart SafeSquid Service to Apply Changes. <span>';
            data += '<div class="restart_button close_button unhide"  onclick="restart(\'yes\');close_modal(\'startup\');">Restart</div></div>';
            $('#_startup_description').html(data);
            get_startup();
        }
    });
}

function SHOW_START_DESC_DETAILS(desc_view) {
    $('#_startup_description span').addClass('hidden');
    $("#" + desc_view).toggleClass('hidden unhide');
}

function get_startup() {
    $('#_modal_startup_modal ._modal_container').css("width", "70%");
    var DATA = $.ssquid.params.handler.startup;
    
 var result = jQuery.ajax({
			type : "POST",
			url : "",
			data : DATA,
			cache : false,
			dataType : "xml",
			success : function (response) {
				array = [];
				var $save_response1 = $(response);
				var $save_response2 = $save_response1.find('startup');
				var NAME = "";
				var VALUE = "";
				var start_div = "<div class=\"entry\">";
				$save_response1.find('startup').each(function () {
					$(this).find('param').each(function (i) {
						NAME = $(this).attr("name");
						VALUE = $(this).attr("value").replace(/\"/g, "");
						array.push(NAME);                       
						start_div += '<div><div class="col-lg-3 col-md-3 col-xs-3 startup_option">' + NAME + '<span class="fa fa-info-circle show_desc" onclick="SHOW_START_DESC_DETAILS(\'' + NAME + '_desc\')"></span></div>';
						start_div += '<div class="col-lg-3 col-md-3 col-xs-3 startup_value" ><input class="form-control" id="' + NAME + '" placeholder="' + NAME + '" value="' + VALUE + '" type="text" disabled/></div></div>';
						$('#_startup_form').html(start_div);
						$('#_startup_description').append("<span id='" + $(this).attr("name") + "_desc' class='hidden' ><b>" + $(this).attr("name") + ": </b>" + $(this).attr("desc") + "</span>");
					});
				});
			}
		});
}
