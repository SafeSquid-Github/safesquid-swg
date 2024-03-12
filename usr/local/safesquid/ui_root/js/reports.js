var filter_query = [];
var filter_search = [];
var $query_request_find = "";
var $total_div_to_build = "";
var $drop_down = {};
var $selected_down = {};
/*to store query number with query name*/
var record_link = [];
var PDF_DATA = "";
var report_check = "start";

function BUILD_QUERY($SELECT_, $FROM_, $ORDER_, $where_clause_, $WHERE_) {
    var $FINAL_QRY = "";
    if (!$SELECT_) {
        $SELECT = "";
    } else {
        $SELECT = $SELECT_;
    }
    if (!$FROM_) {
        $FROM = "";
    } else {
        $FROM = $FROM_;
    }
    if (!$WHERE_) {
        $WHERE = "";
    } else {
        $WHERE = $WHERE_;
    }
    if (!$where_clause_) {
        $where_clause = "";
    } else {
        $where_clause = $where_clause_;
    }
    $FINAL_QRY = $SELECT_ + " " + $FROM_ + " " + $ORDER_ + " " + $where_clause_ + " " + $WHERE_;

	put_log($FINAL_QRY);
	
    return encodeURIComponent($FINAL_QRY);
}

function formatBytes(bytes, decimals) {
    if (bytes == 0)
        return '0 B';
    var k = 1000; // or 1024 for binary
    var dm = decimals + 1 || 3;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function form_values(fetch_type, report_type, params = "") {
    /*
     fetch_type : this will give information of query method
     fresh: Latest Query
     none: Show already rendered data
     single: refresh any one wizard
     filter: applied filter
     report_type : fetch report from data base
     line : default last 1000 lines
     date : date range set through interface
     params: values to be assigned real time default empty
     */
	 
	report_check = "stop"; 
	 
    if (fetch_type === 'fresh') {
        $query_request_find = "";
        $drop_down = {};
    }

    /* check was it just reload */
    if (fetch_type === "none") {
        return;
    }

    /* search custom value */
    if (params)
        var $defn_params = params;
    else
        var $defn_params = "";

    //filter options
    FILTER = [];
    FILTER_JOIN = [];

    /* fetch data based last lines */
    if (report_type === "line") {
        //fetch number of lines from log
        var $query_lines = "";
        if (!$defn_params) {
            $query_lines_ = $.ssquid.params.report.line;
            $stored_value = $('#report_lines_data').val();
            $query_lines = ($query_lines_ != $stored_value) ? ($stored_value) ? $stored_value : $query_lines_ : $query_lines_;
        } else
            $query_lines = $defn_params;

        $DATA_QUERY = $.ssquid.params.report.query_builder.data_base.order + " " + $query_lines + " " + $.ssquid.params.report.query_builder.data_base.end_syn;

       // $('#filter_notation').html("<span class='reports_trans'>Reports based on last " + $query_lines + " transaction</span>");
    } else if (report_type === "date") {
        //fetch start and end date
        var $query_to = "";

        var $query_from = "";

        if (!$defn_params) {
            $query_to = moment().unix();
            $query_from = parseInt($query_to, "10") - $.ssquid.params.report.hour_diff;
        } else {
            var $date_query = $defn_params.split('|');
            $query_from = $date_query[0];
            $query_to = $date_query[1];
        }

        $data_query_ = $.ssquid.params.report.query_builder.data_base.date_range;
        $DATA_QUERY = $data_query_ + " " + $query_from + " AND  " + $query_to + " " + $.ssquid.params.report.query_builder.data_base.end_syn;

        //$('#filter_notation').html("<span class='label label-info margin_1'>Reports from " + moment.unix($query_from).format('YYYY-MM-DD HH:mm') + " to " + moment.unix($query_to).format('YYYY-MM-DD HH:mm') + "</span>");
    } else {
        return 0;
    }

    /*check filter*/
    status_log('Check Filter');
    var _username_ = $("input[name='report_option_username[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_username_).length != 0) {
        FILTER[0] = (_username_ != "''") ? "L IN (select B from users_master where users_master.A IN (" + _username_ + "))" : "";
        FILTER_JOIN[0] = "";
    }

    var _usergroup_ = $("input[name='report_option_usergroup[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_usergroup_).length != 0) {
	
        FILTER[1] = (_usergroup_ != "''") ? "user_groups.A IN (select B from user_groups_master WHERE A IN (" + _usergroup_ + "))" : "";
        FILTER_JOIN[1] = "JOIN user_groups ON id=user_groups.B";
    }

    var _ipaddress_ = $("input[name='report_option_ipaddress[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_ipaddress_).length != 0) {
        FILTER[2] = (_ipaddress_ != "''" && (_ipaddress_)) ? "K IN (select B from ip_address_master where ip_address_master.A IN (" + _ipaddress_ + "))" : "";
        FILTER_JOIN[2] = "";
    }

    var _url_ = $("input[name='report_option_url[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_url_).length != 0) {
        FILTER[3] = (_url_ != "''" && (_url_)) ? "X IN (select B from hosts_master WHERE hosts_master.A IN (" + _url_ + "))" : "";
        FILTER_JOIN[3] = "";
    }

    var _domain_ = $("input[name='report_option_domain[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_domain_).length != 0) {
        FILTER[4] = (_domain_ != "''" && (_domain_)) ? "Y IN (select B from hosts_master WHERE hosts_master.A IN (" + _domain_ + "))" : "";
        FILTER_JOIN[4] = "";
    }

    var _profile_ = $("input[name='report_option_profile[]']").map(function () {
     return "'" + $(this).val() + "'";
     }).get();
     
     if ($.trim(_profile_).length != 0) {
     FILTER[5] = (_profile_ != "''" && (_profile_)) ? "profiles.A IN (select B from profiles_master WHERE A IN (" + _profile_ + "))" : "";
     FILTER_JOIN[5] = "JOIN profiles ON id=profiles.B";
     }
     
     var _application_ = $("input[name='report_option_application[]']").map(function () {
     return "'" + $(this).val() + "'";
     }).get();
     
     if ($.trim(_application_).length != 0) {
     FILTER[6] = (_application_ != "''" && (_application_)) ? "app_sig.A IN (select B from app_sig_master WHERE A IN (" + _application_ + "))" : "";
     FILTER_JOIN[6] = "JOIN app_sig ON id=app_sig.B";
     }
     
     var _category_ = $("input[name='report_option_category[]']").map(function () {
     return "'" + $(this).val() + "'";
     }).get();
     
     if ($.trim(_category_).length != 0) {
     FILTER[7] = (_category_ != "''" && (_category_)) ? "categories.A IN (select B from categories_master WHERE A IN (" + _category_ + "))" : "";
     FILTER_JOIN[7] = "JOIN categories ON id=categories.B";
     }
     
     var _upload_ = $("input[name='report_option_upload[]']").map(function () {
     return "'" + $(this).val() + "'";
     }).get();
     
     if ($.trim(_upload_).length != 0) {
     FILTER[8] = (_upload_ != "''" && (_upload_)) ? "uc_types.A IN (select B from uc_types_master WHERE A IN (" + _upload_ + "))" : "";
     FILTER_JOIN[8] = "JOIN uc_types ON id=uc_types.B";
     }
     
     var _download_ = $("input[name='report_option_download[]']").map(function () {
     return "'" + $(this).val() + "'";
     }).get();
     
     if ($.trim(_download_).length != 0) {
     FILTER[9] = (_download_ != "''" && (_download_)) ? "dc_types.A IN (select B from dc_types_master WHERE A IN (" + _download_ + "))" : "";
     FILTER_JOIN[9] = "JOIN dc_types ON id=dc_types.B";
     }

    var _filter_ = $("input[name='report_option_filter[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_filter_).length != 0) {
        FILTER[5] = (_filter_ != "''" && (_filter_)) ? "R IN (select B from filter_name_master  WHERE filter_name_master.A IN (" + _filter_ + "))" : "";
        FILTER_JOIN[5] = "";
    }

    var _blocked_ = $("input[name='report_option_Blocked[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_blocked_).length != 0) {
        FILTER[6] = (_blocked_ != "''" && (_blocked_)) ? "X IN (select B from hosts_master WHERE hosts_master.A IN (" + _blocked_ + ")) and F=403" : "";
        FILTER_JOIN[6] = "";
    }

    var _connection_ = $("input[name='report_option_Connection[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_connection_).length != 0) {
        FILTER[7] = (_connection_ != "''" && (_connection_)) ? "U=(select B from cachecode_master WHERE A='TCP_CONNECTION_FAILED') and X IN (select B from hosts_master WHERE hosts_master.A IN (" + _connection_ + "))" : "";
        FILTER_JOIN[7] = "";
    }

    var _dns_ = $("input[name='report_option_DNS[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_dns_).length != 0) {
        FILTER[8] = (_dns_ != "''" && (_dns_)) ? "X IN (select B from hosts_master WHERE hosts_master.A IN (" + _dns_ + ")) and U=(select B from cachecode_master WHERE A='TCP_DNS_FAILED')" : "";
        FILTER_JOIN[8] = "";
    }

    var _bypass_ = $("input[name='report_option_Bypass[]']").map(function () {
        return "'" + $(this).val() + "'";
    }).get();

    if ($.trim(_bypass_).length != 0) {
        FILTER[9] = (_bypass_ != "''" && (_bypass_)) ? "R=(select B from filter_name_master WHERE A='bypass') and Y IN (select B from hosts_master WHERE hosts_master.A IN (" + _dns_ + "))" : "";
        FILTER_JOIN[9] = "";
    }

    var $BUILD_WHERE = "";
    $BUILD_WHERE_ = BUILD_WHERE_FILTER(FILTER, 'yes');
    $BUILD_JOINS = BUILD_WHERE_FILTER(FILTER_JOIN);

    //get total fields to be computed
    $total_div_to_build = Object.keys($.ssquid.params.report.div_id).length;
    
    status_log('Build Query for Reports');
    var Query_Request = $.ssquid.params.handler.reporting + "&queries=1&Q0=BEGIN;";

    for ($count = 0; $count < $total_div_to_build; $count++) {
        var $params_locator = Object.keys($.ssquid.params.report.div_id)[$count];
        record_link["Q" + $count] = $params_locator;

        $build_where = "";

        $SELECT = $.ssquid.params.report.query_builder.select[$params_locator];
        $FROM = $.ssquid.params.report.query_builder.source[$params_locator];
        $WHERE = $.ssquid.params.report.query_builder.group_clause[$params_locator];
        $where_me = $.ssquid.params.report.query_builder.where_clause[$params_locator];

        AND = "";
        WHERE = "";
        if (($where_me) || ($BUILD_WHERE_)) {
            if (($where_me) && ($BUILD_WHERE_))
                AND = "and";
            WHERE = "where";
        }

        $BUILD_WHERE = $BUILD_JOINS + " " + WHERE + " " + $where_me + " " + AND + " " + $BUILD_WHERE_;

        Query_Request += encodeURIComponent("select \"<Q" + $count + ">\";");
        Query_Request += BUILD_QUERY($SELECT, $FROM, $DATA_QUERY, $BUILD_WHERE, $WHERE);
        Query_Request += encodeURIComponent("select \"</Q" + $count + ">\";");
    }

    Query_Request += "END;";
    //fetch xml response from server
    $query_request_find = $($.getreports(Query_Request));
	
	report_check = "start";
}

function BUILD_WHERE_FILTER(filter, and_write) {
    put_log(filter.length + " " + JSON.stringify(filter));
    var Source = "";
    for (i = 0; i < filter.length; i++) {
        $soooo = filter[i]
        if ($soooo) {
            Source += $soooo;
            if (and_write == "yes") {
                if (i != (filter.length - 1))
                    Source += " AND ";
            }
        }
    }
    put_log(Source);
    return Source;
	
}

function RENDER_REPORT(content) {
    //put_log('started rendering data in table and chart');
    $result_formatte = $.ssquid.params.report.result;
    var $content = $(content);
    put_log(JSON.stringify($content));

    PDF_DATA = "";

    for ($count = 0; $count < $total_div_to_build; $count++) {
        params_locator = record_link["Q" + $count];
        $div_id = $.ssquid.params.report.div_id[params_locator];
        $heading = $.ssquid.params.report.heading[params_locator];

        $JSON_data = "";
        put_log('started rendering data for ' + $div_id);
        var $content_render = "";
        $content_render = ($result_formatte == "xml") ? $content.find('reporting').children('Q' + $count).find('r') : "";
        if ($content_render.length <= 0) {


            $Table_data = "<div><table class='table'>";
            //$Table_data += "<thead><tr><th class='content_width'>" + $heading + "</th><th class='value_width right_align'>Requests</th><th class='value_width right_align'>Bandwidth</th></tr></thead><tbody>";
            $Table_data += "<thead class='hidden'><tr><th class='content_width'>" + $heading + "</th><th class='value_width right_align'>Requests</th><th class='value_width right_align'>Bandwidth</th></tr></thead><tbody class='table-body'>";
            $Table_data += '<tr><td rowspan="2" colspan="3"><h4>Nothing to display in ' + $heading + '</h4></td></tr></tbody></table>';
            
            $('#' + $div_id + '_tables').html($Table_data);
            $('#' + $div_id + '_graphs').html('<h4>Nothing to display in ' + $heading + '</h4>');
            $collector_data = null;
            // $('#' + $div_id).addClass('hidden');


        } else {
            status_log('Render Reports');
            //put_log('start rendering table for '+$div_id );
            $Table_data = "<div><table class='table table-striped'>";
            //$Table_data += "<thead><tr><th class='content_width'>" + $heading + "</th><th class='value_width right_align'>Requests</th><th class='value_width right_align'>Bandwidth</th></tr></thead><tbody>";
            $Table_data += "<thead><tr><th class='content_width'>" + $heading + "</th><th class='value_width right_align'>Requests</th><th class='value_width right_align'>Bandwidth</th></tr></thead><tbody class='table-body'>";
            if ($result_formatte == "xml") {
                $collector_data = [];
                $content_render.each(function () {
                    $collector = $(this).attr('A0').replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; });
                    $request = $(this).attr('A1');
                    $bandwidth = $(this).attr('A2');
                    if (($collector) && ($collector != '-') && ($collector != "undefined")) {
                        $Table_data += "<tr class='full_content'><td class='content_width'><span class='cursor' onclick='search(\"" + $collector + "\",\"" + params_locator + "\")'>" + $collector + "</span></td><td class='value_width right_align'>" + $request + "</td><td class='value_width right_align'>" + formatBytes($bandwidth) + "</td></tr>";
                        $collector_data.push($collector);
                    }
                });

            } else if ($result_formatte == "json") {
                for (i in $content_render) {
                    $collector = $content_render[i][params_locator];
                    $request = $content_render[i]['requests'];
                    $bandwidth = $content_render[i]['bandwidth'];
                    if (($container) && ($container != '-') && ($container != "undefined")) {
                        $Table_data += "<tr><td class='content_width'><span class='cursor' onclick='search(\"" + $container + "\",\"" + params_locator + "\")'>" + $container + "</span></td><td class='value_width right_align'>" + $data_table[i].hits + "</td><td class='value_width right_align'>" + formatBytes($data_table[i].bandwidth) + "</td></tr>";
                    }
                }
            } else {
                $Table_data += "<tr><td><h3>Wrong output formatte</h3></td></tr>";
            }
            $Table_data += "</tbody></table>";

            PDF_DATA += '<h4>' + $heading + '</h4>';
            PDF_DATA += $Table_data;

            //put content into respective table
            $('#' + $div_id + '_tables').html($Table_data);
            //put_log('completed rendering table for '+$div_id );
            //Generate Graphs
            //put_log('started rendering charts for '+$div_id );
            //BUILD_CHART($div_id, $graph_type, JSON.stringify($bandwidth_req_graph));
            //put_log('completed rendering charts for '+$div_id );
        }

        $drop_down[params_locator] = $collector_data;

        //put_log('completed rendering data for '+$div_id );
    }
    put_log(JSON.stringify($drop_down));
    //put_log('completed rendering data in table and chart');
}

function removeLastComma(str) {
    return str.replace(/,(\s+)?$/, '');
}

function setting(report_id, section) {
    /*
     report_id is the div id whose class should be assigned with
     'hidden' class.
     section is which you want to show
     */
    $('#' + report_id + ' ._reportparams').addClass('hidden');
    if ($('#' + report_id + '_' + section).hasClass("hidden"))
        $('#' + report_id + '_' + section).removeClass('hidden');
}

function search(section, option) {
    //show modal
    $('#modal_report').modal({
        keyboard: false,
        show: true,
        refresh: true
    });

    // Jquery draggable
    $('#modal_report .modal-dialog').draggable({
        handle: ".modal-header",
    });

    $('#modal_report').on('hidden.bs.modal', function () {
        $("#modal_report .ui-draggable").css({
            top: 300,
            left: 0
        });
    });

    if (!option)
        option = 'section';
    else {
        $selected_down['users_'] = (option == "users") ? section.split(",") : null;
        $selected_down['user_group_'] = (option == "user_group") ? section.split(",") : null;
        $selected_down['ip_'] = (option == "ip") ? section.split(",") : null;
        $selected_down['website_'] = (option == "website") ? section.split(",") : null;
        $selected_down['sub_domain_'] = (option == "sub_domain") ? section.split(",") : null;

        $selected_down['security_breaches_'] = (option == "security_breaches") ? section.split(",") : null;
        $selected_down['blocked_website_'] = (option == "blocked_website") ? section.split(",") : null;
        $selected_down['connection_failed_'] = (option == "connection_failed") ? section.split(",") : null;
        $selected_down['dns_failed_'] = (option == "dns_failed") ? section.split(",") : null;
        $selected_down['bypass_website_'] = (option == "bypass_website") ? section.split(",") : null;

		 $selected_down['profiles_'] = (option == "profiles") ? section.split(",") : null;
         $selected_down['application_'] = (option == "application") ? section.split(",") : null;
         $selected_down['time_profile_'] = (option == "time_profile") ? section.split(",") : null;
         $selected_down['categories_'] = (option == "categories") ? section.split(",") : null;
         $selected_down['upload_content_'] = (option == "upload_content") ? section.split(",") : null;
         $selected_down['download_content_'] = (option == "download_content") ? section.split(",") : null;

    }

    load_magic();

    var ms = $("#report_option_profile").magicSuggest({
     data : $drop_down['profiles'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['profiles_']
     });
     var ms = $("#report_option_request").magicSuggest({
     data : $drop_down['application'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['application_']
     });
     var ms = $("#report_option_response").magicSuggest({
     data : $drop_down['application'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['application_']
     });
     var ms = $("#report_option_application").magicSuggest({
     data : $drop_down['application'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['application_']
     });
     var ms = $("#report_option_category").magicSuggest({
     data : $drop_down['categories'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['categories_']
     });
     var ms = $("#report_option_upload").magicSuggest({
     data : $drop_down['upload_content'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['upload_content_']
     });
     var ms = $("#report_option_download").magicSuggest({
     data : $drop_down['download_content'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['download_content_']
     });
     var ms = $("#report_option_time").magicSuggest({
     data : $drop_down['time_profile'],
     expandOnFocus : true,
     hideTrigger : true,
     cls : 'mContainer',
     infoMsgCls : 'mInfoMsgCls',
     invalidCls : 'mInvalidCls',
     selectionCls : 'mSelectionCls',
     resultAsString : true,
     editable : true,
     allowDuplicates : false,
     maxSuggestions : 50,
     maxSelection : null,
     value : $selected_down['time_profile_']
     });

}

function SET_LOAD_ICON() {
    for ($count = 0; $count < $total_div_to_build; $count++) {
        params_locator = record_link["Q" + $count];
        $div_id = $.ssquid.params.report.div_id[params_locator];
        $('#' + $div_id + '_tables').html('<div class="loader"></div>');
    }
}

function flush() {
    divID_chk = "reporting";
    filter_search = [];
    $('#modal_report .modal-body #section_option').html('');
    $('#modal_report .modal-body #source_option').html('');
    SET_LOAD_ICON();

    $("#report_option_username").magicSuggest({}).clear();
    $("#report_option_usergroup").magicSuggest({}).clear();
    $("#report_option_ipaddress").magicSuggest({}).clear();
    $("#report_option_url").magicSuggest({}).clear();
    $("#report_option_domain").magicSuggest({}).clear();
    $("#report_option_filter").magicSuggest({}).clear();
    $("#report_option_Blocked").magicSuggest({}).clear();
    $("#report_option_Connection").magicSuggest({}).clear();
    $("#report_option_DNS").magicSuggest({}).clear();
    $("#report_option_Bypass").magicSuggest({}).clear();

	$("#report_option_profile").magicSuggest({}).clear();     
    $("#report_option_request").magicSuggest({}).clear();     
    $("#report_option_response").magicSuggest({}).clear();     
    $("#report_option_application").magicSuggest({}).clear();     
    $("#report_option_category").magicSuggest({}).clear();     
    $("#report_option_upload").magicSuggest({}).clear();     
    $("#report_option_download").magicSuggest({}).clear();    
    $("#report_option_time").magicSuggest({}).clear();
    
    $("#report_option_username").magicSuggest({}).collapse();
    $("#report_option_usergroup").magicSuggest({}).collapse();
    $("#report_option_ipaddress").magicSuggest({}).collapse();
    $("#report_option_url").magicSuggest({}).collapse();
    $("#report_option_domain").magicSuggest({}).collapse();
    $("#report_option_filter").magicSuggest({}).collapse();
    $("#report_option_Blocked").magicSuggest({}).collapse();
    $("#report_option_Connection").magicSuggest({}).collapse();
    $("#report_option_DNS").magicSuggest({}).collapse();
    $("#report_option_Bypass").magicSuggest({}).collapse();
	
	$("#report_option_profile").magicSuggest({}).collapse();
    $("#report_option_request").magicSuggest({}).collapse();
    $("#report_option_response").magicSuggest({}).collapse();
    $("#report_option_application").magicSuggest({}).collapse();
    $("#report_option_category").magicSuggest({}).collapse();
    $("#report_option_upload").magicSuggest({}).collapse();
    $("#report_option_download").magicSuggest({}).collapse();
    $("#report_option_time").magicSuggest({}).collapse();
	


    form_values('fresh', 'line');
}

function filter() {
    divID_chk = "";
    SET_LOAD_ICON();
    $search_opt = $('input[name=report_opt]:checked', '#report_content').val();
    if ($search_opt == "date") {
        $query_start = $('#_date_select_start').val();
        $query_end = $('#_date_select_end').val();
        if (!$query_start)
            unix_start = moment().unix() - $.ssquid.params.report.hour_diff;
        else
            unix_start = moment($query_start, "YYYY/MM/DD HH:mm").unix();
        if (!$query_end)
            unix_end = moment().unix();
        else
            unix_end = moment($query_end, "YYYY/MM/DD HH:mm").unix();
        $date_fetch = unix_start + '|' + unix_end;
        form_values('fresh', 'date', $date_fetch);
    } else {
        $already_fetched = readCookie('lines_fetch');
        $line_consider = $('#report_lines_data').val();
        form_values('fresh', 'line', $line_consider);
    }

}

function build_filter() {
    var filter_apply = "";
    var filter_display = "";
    var search_map = [];
    var _AND_ = "&&";
    var _OR_ = "||";
    var $count = 1;
    var OPTION = "";
    /* this was used table based search*/
    $('#source_option tr').each(function () {
        $(this).find('td').each(function () {
            $field_search = $(this).attr('field');
            $string_search = $(this).attr('string');
            if ($(this).find(":checkbox:checked").length > 0) {
                //filter_apply += '$content["' + $field_search + '"] === "' + $string_search + '" ||';
                search_map.push({
                    "table": $field_search,
                    "value": $string_search
                });
            }
        })
    })
    //return filter_apply.substr(0, filter_apply.lastIndexOf('||'));
    filter_apply_ = _(search_map).sortBy(function (search_map) {
        return search_map.table;
    });
    $data_table_free_ = _.countBy(filter_apply_, function (filter_apply_) {
        return filter_apply_['table'];
    });
    for (roq = 0; roq < filter_apply_.length; roq++) {
        $field_search_ = filter_apply_[roq].table;
        count_ava = $data_table_free_[$field_search_];
        $string_search_ = filter_apply_[roq].value;
        FIRST_BRACKET = "";
        LAST_BRACKET = "";
        if ((roq != filter_apply_.length - 1)) {
            if (count_ava == $count) {
                OPTION = _AND_;
                FIRST_BRACKET = ($count == 1) ? "(" : "";
                LAST_BRACKET = ")";
                $count = 1;
                //put_log('im here to flush');
            } else {
                OPTION = _OR_;
                FIRST_BRACKET = ($count == 1) ? "(" : "";
                //put_log('im here to count');
                $count = $count + 1;
            }
        } else {
            FIRST_BRACKET = (OPTION == "||") ? "" : "(";
            LAST_BRACKET = ")";
            //put_log('im here to die');
            OPTION = "";
        }
        filter_apply += FIRST_BRACKET + ' $content["' + $field_search_ + '"] === "' + $string_search_ + '" ' + LAST_BRACKET + ' ' + OPTION + ' ';
        filter_display += "<span class='label label-info margin_1'>" + $field_search_ + " : " + $string_search_ + "</span>"
    }
    if (filter_display)
        $('#filter_notation').html(filter_display);
    //put_log(filter_apply);
    return filter_apply;
}

function load_magic() {

    var ms = $("#report_option_username").magicSuggest({
        data: $drop_down['users'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['users_']
    });


    $("#report_option_username").magicSuggest({}).setData($drop_down['users']);

    if ($selected_down['users_'])
        $("#report_option_username").magicSuggest({}).setValue([$selected_down['users_']]);

    var ms = $("#report_option_usergroup").magicSuggest({
        data: $drop_down['user_group'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['user_group_']
    });
    $("#report_option_usergroup").magicSuggest({}).setData($drop_down['user_group']);

    if ($selected_down['user_group_'])
        $("#report_option_usergroup").magicSuggest({}).setValue([$selected_down['user_group_']]);

    var ms = $("#report_option_ipaddress").magicSuggest({
        data: $drop_down['ip'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['ip_']
    });
    $("#report_option_ipaddress").magicSuggest({}).setData($drop_down['ip']);

    if ($selected_down['ip_'])
        $("#report_option_ipaddress").magicSuggest({}).setValue([$selected_down['ip_']]);

    var ms = $("#report_option_url").magicSuggest({
        data: $drop_down['website'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['website_']
    });

    $("#report_option_url").magicSuggest({}).setData($drop_down['website']);

    if ($selected_down['website_'])
        $("#report_option_url").magicSuggest({}).setValue([$selected_down['website_']]);

    var ms = $("#report_option_domain").magicSuggest({
        data: $drop_down['sub_domain'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['sub_domain_']
    });

    $("#report_option_domain").magicSuggest({}).setData($drop_down['sub_domain']);

    if ($selected_down['sub_domain_'])
        $("#report_option_domain").magicSuggest({}).setValue([$selected_down['sub_domain_']]);

    var ms = $("#report_option_filter").magicSuggest({
        data: $drop_down['security_breaches'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['security_breaches_']
    });
    $("#report_option_filter").magicSuggest({}).setData($drop_down['security_breaches']);

    if ($selected_down['security_breaches_'])
        $("#report_option_filter").magicSuggest({}).setValue([$selected_down['security_breaches_']]);


    var ms = $("#report_option_Blocked").magicSuggest({
        data: $drop_down['blocked_website'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['blocked_website_']
    });
    $("#report_option_Blocked").magicSuggest({}).setData($drop_down['blocked_website']);

    if ($selected_down['blocked_website_'])
        $("#report_option_Blocked").magicSuggest({}).setValue([$selected_down['blocked_website_']]);

    var ms = $("#report_option_Connection").magicSuggest({
        data: $drop_down['connection_failed'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['connection_failed_']
    });
    $("#report_option_Connection").magicSuggest({}).setData($drop_down['connection_failed']);

    if ($selected_down['connection_failed_'])
        $("#report_option_Connection").magicSuggest({}).setValue([$selected_down['connection_failed_']]);

    var ms = $("#report_option_DNS").magicSuggest({
        data: $drop_down['dns_failed'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['dns_failed_']
    });
    $("#report_option_DNS").magicSuggest({}).setData($drop_down['dns_failed']);

    if ($selected_down['dns_failed_'])
        $("#report_option_DNS").magicSuggest({}).setValue([$selected_down['dns_failed_']]);

    var ms = $("#report_option_Bypass").magicSuggest({
        data: $drop_down['bypass_website'],
        expandOnFocus: true,
        hideTrigger: true,
        cls: 'mContainer',
        infoMsgCls: 'mInfoMsgCls',
        invalidCls: 'mInvalidCls',
        selectionCls: 'mSelectionCls',
        resultAsString: true,
        editable: true,
        allowDuplicates: false,
        maxSuggestions: 50,
        maxSelection: null,
        value: $selected_down['bypass_website_']
    });
    $("#report_option_Bypass").magicSuggest({}).setData($drop_down['bypass_website']);

    if ($selected_down['report_option_Bypass_'])
        $("#report_option_Bypass").magicSuggest({}).setValue([$selected_down['bypass_website_']]);

}

$(document).ready(function () {
    form_values('fresh', 'line');
    $('[data-toggle="popover"]').popover();
    var today_date1 = moment().format('YYYY/MM/DD HH:mm');
    $('#_datetimepicker1').datetimepicker({
        format: 'yyyy/mm/dd hh:ii',
        today: "Today",
        todayBtn: "linked",
        minView: 'hour',
        showMeridian: true,
        locale: {
            format: 'yyyy/mm/dd hh:ii'
        },
        minuteStep: 15,
        autoclose: true,
        calendarWeeks: true,
        todayHighlight: true,
        showClear: true
    });
    $('#_datetimepicker2').datetimepicker({
        format: 'yyyy/mm/dd hh:ii',
        today: "Today",
        todayBtn: "linked",
        minView: 'hour',
        showMeridian: true,
        locale: {
            format: 'yyyy/mm/dd hh:ii'
        },
        endDate: today_date1,
        minuteStep: 15,
        autoclose: true,
        calendarWeeks: true,
        todayHighlight: true,
        showClear: true
    });

});
