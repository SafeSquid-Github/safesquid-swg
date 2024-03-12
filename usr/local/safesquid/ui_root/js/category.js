var magic_var = "";
var search_result = [];
var username = "";
var update_time = "";
var input_website = "";
var category_list = [];
var modified_cat = "";
var magic_var1 = "";
//Ask for categories
function get_category_list() {
    return $($.getValues($.ssquid.params.handler.category_manager + "&action=category_list"));
}

function search() {
    input_website = $('#search_cat').val();
    var QUERY = $.ssquid.params.handler.category_manager + "&website=" + encodeURIComponent(input_website) + "&action=search";
    if (input_website != "") {
        $('#categories_main_div').removeClass("hidden");
        var $response = $($.getValues($.ssquid.params.handler.category_manager + "&website=" + encodeURIComponent(input_website) + "&action=search"));
        $response = $response.find('category_manager');
        search_result = $response.find('category_info').attr("category_list").split(',');
        if (search_result == "") {
            search_result = null;
        }
        magic_show(search_result);
    }
}

function modify() {
    modified_cat = $("input[name='cats[]']").map(function () {
        return $(this).val();
    }).get();
    if (input_website != "") {
        var $modify_response = $($.getValues($.ssquid.params.handler.category_manager + "&website=" + encodeURIComponent(input_website) + "&action=modify&category_list=" + encodeURIComponent(modified_cat)));
        $xmlsetconnection1 = $modify_response.find('category_manager');
        $xmlsetconnection1.find('category_info').each(function () {
            $('#modify_success').html(input_website + " : " + $(this).attr("status"));
        });
        $(magic_var).empty();
        $('#modify_success').removeClass('hidden');
        $('#modify_success').show();
        setTimeout(function () {
            $('#modify_success').hide();
            magic_show(modified_cat);
        }, 2000);
    }
}

function magic_show(cats) {
    $('#modify_div').html('<input type="text" class="form-control" placeholder="choose categories" name="cats[]" id="modify_show" />');
    if (cats == null || cats == "") {
        $('#error_message').css('display', 'block');
        $('#error_message').html('<p class="error_message"> This website has not been categorized!</p>');
        cats = [];
    } else {
        $('#error_message').css('display', 'none');
    }
    response = get_category_list();
    var $save_response1 = $(response);
    var $save_response2 = $save_response1.find('category_manager');
    $save_response2.children().each(function () {
        category_list = $(this).attr("category_list");
        username = $(this).attr("last_changed_by");
        update_time = $(this).attr("last_updated_time");
    });
    $('#modified_user').html(username);
    $('#modified_time').html(update_time);
	
    if (category_list == "" || category_list == "null" || category_list == null) {
        category_list = "WHITELIST,BLACKLIST";
    } 
	
	category_list = category_list.toString().split(',');
	$('#cat_count').html(category_list.length);
	//magic suggest  drapdown category list
	magic_var = $('#modify_show').magicSuggest({
		data: category_list,
		value: cats,
		expandOnFocus: false,
		toggleOnClick: true,
		maxSelection: null,
		placeholder: 'Classify your websites',
		maxSelectionRenderer: function () {
			return '';
		},
		noSuggestionText: ''
	});
	magic_var1 = $('#websites_show').magicSuggest({
		data: category_list,
		value: cats,
		expandOnFocus: false,
		toggleOnClick: true,
		maxSelection: null,
		placeholder: 'Classify your websites',
		maxSelectionRenderer: function () {
			return '';
		},
		noSuggestionText: ''
	});
	$('#modify_show .ms-sel-ctn').click(function () {
		magic_var.expand();
	});
	$('#websites_show .ms-sel-ctn').click(function () {
		magic_var1.expand();
	});

}

function update_cats() {
    var DATA = $.getValues($.ssquid.params.handler.category_manager + "&action=update");
    $('#cat_refresh').html("updated!!")
    $("#cat_refresh").show().delay(1000).fadeOut();
    $('#categories_main_div').addClass("hidden");
    $('#modify_show').val("");
    $('#search_cat').val("");
    setTimeout(function () {
        magic_show(null);
    }, 2000);
}
var cat = [];

function upload_websites_file(section) {
    var result_cat = $("input[name='website_cats[]']").map(function () {
        return $(this).val();
    }).get();
    var input_type = section + "&list=" + result_cat;
    var data, type;
    data = new FormData();
    $.each($("input[type=file]"), function (i, obj) {
        $.each(obj.files, function (i, file) {
            type = file.type;
            data.append(input_type, file);
        })
    });
    if (result_cat.length > 0) {
        if (type == "text/plain") {
            $('#loading_file').html('<img style="max-width:10ex;max-height:10ex;" src="img/loading.gif">');
            jQuery.ajax({
                url: '?handler=upload&type=' + input_type,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function (response) {
                    magic_var1.clear();
                    $("#upload").val("");
                    $('#loading_file').html('');
                    $('#modify_success').removeClass('hidden');
                    $('#modify_success').html("Successfully uploaded your file!!");
                    $('#modify_success').show();
                    setTimeout(function () {
                        $('#modify_success').hide();
                    }, 2000);
                }
            });
        } else {
            alert("Please upload plain text file");
        }
    } else {
        alert("Please fill all the fields!");
    }
}
$(document).ready(function () {
    // $('#policy_setup_options  ul').append('<li class="pull-right"><div style="display:inline-block" id="cat_refresh"></div><button class="category_update bg-green fa fa-refresh" onclick="update_cats()"></button></li>');
    magic_show(null);
});
