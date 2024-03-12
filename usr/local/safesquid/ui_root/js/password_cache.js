var magic_var = "";

function show_all_password() {
    magic_var = "";
    divID_chk = '';
    var password_array = [];
    status_log('Fetch Password Cache');
    var DATA = $.ssquid.params.handler.password_cache_list;
    
    jQuery.ajax({
        type: "POST",
        url: "",
        data: DATA,
        cache: false,
        dataType: "xml",
        success: function (response) {
            var $save_response1 = $(response);
            var $save_response2 = $save_response1.find('password_cache');
            $save_response2.children().each(function() {
                password_array = $(this).attr("password_cache_list").replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; }).split(',');
                if (password_array.length == 0) {
                    password_array = null;
                }
            });
            magic_var = $('#_password_cache').magicSuggest({
                resultAsString: true,
                maxSelection: null,
                toggleOnClick: true,
                noSuggestionText: ''
            });
            magic_var.setData(password_array);
        },
        error: function () {
            status_log('Fetch Failed');
        }
    });
}

function delete_password() {
    var result_cat = $("input[name='password_list[]']").map(function () {
        return $(this).val();
    }).get();
    if (result_cat != "") {
        var DATA = $.ssquid.params.handler.password_cache_delete_user + result_cat;
        status_log('Deleting User');
        jQuery.ajax({
            type: "POST",
            url: "",
            data: DATA,
            cache: false,
            dataType: "xml",
            success: function (response) {
                magic_var.clear();
                var $save_response1 = $(response);
                var $save_response2 = $save_response1.find('password_cache');
                $save_response2.children().each(function () {
                    $('#_password_cache_status').html("<span>" + $(this).attr("Selected") + "</span>");
                });
                $('#_password_cache_status').show();
                setTimeout(function () {
                    $('#_password_cache_status').hide();
                }, 3000);
                show_all_password();
            },
            error: function () {
                status_log('Deletion Failed');
            }
        });
    } else {
        alert("Please select any one user credentials");
    }
}
/*
 $(document).ready(function () {
 show_all_password();
 });
 */
