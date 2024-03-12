function RESPONSE_HANDLER_TAR_LIST(RESPONSE, WHICH, TAG) {
    var support_response;
    log_entries = [],
        support_response = RESPONSE.responseXML;
    console.log(support_response);
    var support_response_doc = $(support_response);
    $xmlsetconnection = support_response_doc.find(TAG);
    if ($xmlsetconnection != null) {
        $xmlsetconnection.children().each(function() {
            log_entries.push($(this).attr("filename"));
        });
        if (WHICH == "tar_list") {
            var TABLE = '<table  id="_table_support"  class = "table table-striped table-bordered sorting_desc">';
            TABLE += '<thead ><tr><th class="sort_me" style="width: 100%;" >Tarball</th></thead>';
            TABLE += '<tbody>';
            console.log("tar ball length" + log_entries.length);
            for (i = 0; i < log_entries.length; i++) {
                TABLE += "<tr>";
                TABLE += "<td><a href='?handler=support_tarball&filename=" + log_entries[i] + "' >" + log_entries[i] + "</a></td>";
                TABLE += "</tr>";
            }
            TABLE += "</tbody></table></fieldset>";
            $('#_support_tar_div').html(TABLE);
            $('#_table_support').DataTable();
            $('.sort_me').trigger('click'); //TO get descending order
        } else {
            var TABLE = '<table  id="_table_config"  class = "table table-striped table-bordered">';
            TABLE += '<thead ><tr><th class="sort_me" style="width: 100%;" >Config files</th></thead>';
            TABLE += '<tbody>';
            for (i = 0; i < log_entries.length; i++) {
                TABLE += "<tr>";
                //TABLE += "<td><a style='color:#ff6a26; cursor:pointer' href='?handler=config_xml&filename=" + log_entries[i] + "' >" + log_entries[i] + "</a></td>";
				TABLE += "<td><a href='?handler=config_xml&filename=" + log_entries[i] + "' >" + log_entries[i] + "</a></td>";
                TABLE += "</tr>";
            }
            TABLE += "</tbody></table></fieldset>";
            $('#_config_download').html(TABLE);
            $('#_table_config').DataTable();
        }
        $('.dataTables_wrapper').css('margin', '1em');
    }
}

function SEND_TO_SERVER(QUERY_METHOD, QUERY, REQ, TAG) {
    var GENERATE_REQUEST = new XMLHttpRequest();
    GENERATE_REQUEST.onreadystatechange = function() {
        if (GENERATE_REQUEST.readyState == 4 && GENERATE_REQUEST.status == 200) {
            if (REQ == "download") {
                get_tar_list('tar_list');
            } else {
                RESPONSE_HANDLER_TAR_LIST(GENERATE_REQUEST, REQ, TAG);
            }
        }
    };
    if (QUERY_METHOD == "POST") {
//        GENERATE_REQUEST.open("POST", "http://safesquid.cfg/", true);
        GENERATE_REQUEST.open("POST", "", true);
        GENERATE_REQUEST.setRequestHeader('Access-Control-Allow-Headers', '*');
        GENERATE_REQUEST.setRequestHeader('Access-Control-Allow-Methods', 'POST');
        GENERATE_REQUEST.send(QUERY);
    } else {
        QUERY_REQ = "safesquid.cfg/?" + QUERY
        GENERATE_REQUEST.open("GET", QUERY_REQ, true);
        GENERATE_REQUEST.setRequestHeader('Access-Control-Allow-Headers', '*');
        GENERATE_REQUEST.setRequestHeader('Access-Control-Allow-Methods', 'GET');
        GENERATE_REQUEST.send();
    }
}

function get_tar_list(req) {
    $('#_modal_support_modal ._modal_container').css("width", "50%");
    switch (req) {
        case "tar_list":
            var data = $.ssquid.params.handler.support_list;
            var tag = "support_tarball";
            break;
        case "config_list":
            $('#_modal_config_modal ._modal_container').css("width", "50%");
            var data = $.ssquid.params.handler.config_list;
            var tag = "config_file";
            break;
    }
    SEND_TO_SERVER("POST", data, req, tag);
}

function generate(down) {
    $('#_support_tar_div').html('<img style="margin-left:45ex;max-width:80ex;max-height:30ex;" src="img/loader1.gif">');
    var data = "handler=support_tarball&generate=true";
    SEND_TO_SERVER("POST", data, "download");
}

function downloads(QUERY) {
    console.log(QUERY);
    var GENERATE_REQUEST1 = new XMLHttpRequest();
    QUERY_REQ = "?" + QUERY
    GENERATE_REQUEST1.open("GET", QUERY_REQ, true);
    GENERATE_REQUEST1.setRequestHeader('Access-Control-Allow-Headers', '*');
    GENERATE_REQUEST1.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    GENERATE_REQUEST1.send();
}
