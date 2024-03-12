
function get_file() {

    var input_type = $("input[name='upload_type[]']").map(function () {
        return $(this).val();
    }).get();
    var name = $("#upload").val();
    var data;
    data = new FormData();
//data.append('file', $( '#upload' )[0].files[0] );
    data.append('file', "?handler=upload&format=xml&file_path=&input_type=" + input_type + "\n");
    $.each($("input[type=file]"), function (i, obj) {
        $.each(obj.files, function (i, file) {
            // data.append('file',"?handler=upload&format=xml&name="+name+"&file_path=&input_type="+input_type+"\n" );
            data.append('file', file);
        })
    });

    if (input_type != "" && name != "") {
        jQuery.ajax({
            url: 'upload',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {
                console.log('file upload is done');
            }
        });
    } else {
        alert("Please fill all the fields!");
    }

}


var ms = $('#upload_type').magicSuggest({
    data: ["activation_key"],
    toggleOnClick: true,
    maxSelection: 1
});