function view_log(type) {
    divID_chk = "";
    abort_all_xhr();
    abort = "";
    if (type == "native") {
        url = $.ssquid.params.handler.view_log;
        //abot = "native";
        abot = "Native Logs";
        datatable_ = "#table_native";
		put_log("native log::url " + url);
        chunked_append(url, abot, datatable_);
    } else if (type == "extended") {
        //url = $.ssquid.params.handler.extended_logs;
        url = $.ssquid.params.handler.extended_logs;
        //abot = "extended";
        abot = "Detailed Logs";

        var headers = ['Time', 'Username', 'Client ID', 'Method', 'URL', 'Status', 'Size', 'Referer', 'Useragent', 'Mime', 'Filter Name', 'Filter Reason', 'Profiles', 'Request profiles', 'Response profiles', 'Categories', 'Applications', 'Upload content type', 'Download content type', 'Interface'];
        var HEAD = '<tr>';
        for (var i = 0; i < headers.length; i++)
        {
            HEAD += '<th>' + headers[i] + '</th>';
        }
        HEAD += '</tr>';
        $('#extended_head').html(HEAD);

        datatable_ = "#table_extended";
        /*$('#table_extended').parent().css({
            'overflow': 'auto',
            'width': '240ex'
        });*/
        chunk4(url, abot, datatable_);
    } else {
        url = $.ssquid.params.handler.config_log;
        //abot = "config";
        abot = "Config Logs";
        datatable_ = "#table_config";
        chunk4(url, abot, datatable_);
    }
}


