$('#_enc_cnf_pass ').bind('input propertychange', function() {
    var pass = $('#_enc_pass').val();
    var cnf_pass = $('#_enc_cnf_pass').val();
    var val = $(this).val(); 
    if (pass != cnf_pass && val != "") {
        $('#_encrypt_botton').addClass("hidden");
       $('#check').html("<p class='encrypt_failed'><b>not matched</b></p>");
    } else if (pass == cnf_pass && val != "") {
        $('#_encrypt_botton').removeClass("hidden");
        $('#check').html("<p class='encrypt_success'><b>matched</b></p>");
    } else {
        $('#_encrypt_botton').addClass("hidden");
        $('#check').html("<p class='encrypt_failed'><b>not matched</b></p>");
    }
});

function encrypt() {
    var pass = "";
    var cnf_pass = "";
    var field_id = "";
    pass = $('#_enc_pass').val();
    cnf_pass = $('#_enc_cnf_pass').val();
    field_id = readCookie("fieldname");
    if (pass == cnf_pass) {
		let encodedPass = encodeURIComponent(pass);
        jQuery.ajax({
            url: '',
            data: "handler=password&password=" + encodedPass,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(ret) {
                $(ret).find('results').each(function(i, j) {
                    $('#' + field_id).val($(j).attr("result"));
                });
            }
        });
    } else {
        alert("Password mismatch.. Please check again");
    }
}