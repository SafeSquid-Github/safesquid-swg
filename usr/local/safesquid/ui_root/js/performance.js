// Error message to display when plot generation fails
var ErrorMessage = "Failed to Generate the Performance Plot";
var _t_form = "YYYYMMDDHHmmss";
var _h_form = "YYYYMMDD000000";
var _c_form = "YYYY/MM/DD HH:mm";
var _p_form = "MMMM-YYYY-DD HH:mm";

// - Do not Edit Below This Line- //

function SEND_TO_SERVER_per(QUERY_METHOD, QUERY) {
    var GENERATE_REQUEST = new XMLHttpRequest();
    GENERATE_REQUEST.onreadystatechange = function() {
        if (GENERATE_REQUEST.readyState == 4 && GENERATE_REQUEST.status == 200) {	
            $('#_performance_tabs').removeClass("hidden");
            $('#_main_plot').html('<img class="_plot_display" id="per_png" src="data:image/png;base64,' + GENERATE_REQUEST.responseText + '" />');
        } 
    };
    if (QUERY_METHOD == "POST") {
//        GENERATE_REQUEST.open("POST", "http://safesquid.cfg", true);
        GENERATE_REQUEST.open("POST", "", true);
        GENERATE_REQUEST.setRequestHeader('Access-Control-Allow-Headers', '*');
        GENERATE_REQUEST.overrideMimeType('text/plain; charset=x-user-defined');
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

function generate_perf(option, from, to) {
    var current = "";
    var start = "";
    var end = "";
	var _t = "";

	
//    current = moment().format('YYYY/M/DD:HH:SS');
    current = moment().format(_t_form);
	end = current;

	
// last1hour
	put_log("lasthour:" );	
	start = moment().subtract(1, 'hour').format(_t_form);
	end = moment().format(_t_form);
	put_log("start: " + start);	
	put_log("end: " + end);

// today	
	put_log("today:" );	
	start = moment().format(_h_form);
	end = moment().format(_t_form);
	put_log("start: " + start);	
	put_log("end: " + end);

// yesterday	
	put_log("yesterday:" );	
	start = moment().subtract(1, 'day').format(_h_form);
	end = moment().format(_h_form);
	put_log("start: " + start);	
	put_log("end: " + end);
	

// last7days	
	put_log("last7days:" );	
	start = moment().subtract(7, 'day').format(_h_form);
	end = moment().format(_t_form);
	put_log("start: " + start);	
	put_log("end: " + end);

// month	
	put_log("month:" );	
	start = moment().subtract(1, 'month').format(_h_form);
	end = moment().format(_t_form);
	put_log("start: " + start);	
	put_log("end: " + end);
	
	
// custom // 2018/03/21 07:30	
	_t = "2018/03/21 07:30";
	start = moment(_t, "YYYY/MM/DD HH:mm");
	
    switch (option) {
        case "last1hour":
			start = moment().subtract(1, 'hour').format(_t_form);
			end = moment().format(_t_form);			

            $('#_panel-header').html("<h4 style='text-align:center'>Last 1 Hour [ " + moment(start, _t_form).format(_p_form) + " to " + moment(end, _t_form).format(_p_form) + " ] </h4>");
            break;
        case "today":
			start = moment().format(_h_form);
			end = moment().format(_t_form);
            $('#_panel-header').html("<h4 style='text-align:center;'>Today [ " + moment(start, _t_form).format(_p_form) + " to " + moment(end, _t_form).format(_p_form) + " ] </h4>");
            break;
        case "yesterday":
			start = moment().subtract(1, 'day').format(_h_form);
			end = moment().format(_h_form);
            $('#_panel-header').html("<h4 style='text-align:center'>Yesterday [ " + moment(start, _t_form).format(_p_form) + " to " + moment(end, _t_form).format(_p_form) + " ] </h4>");
            break;
        case "last7days":
			start = moment().subtract(7, 'day').format(_h_form);
			end = moment().format(_t_form);
            $('#_panel-header').html("<h4 style='text-align:center'>Last 7 Days [ " + moment(start, _t_form).format(_p_form) + " to: " + moment(end, _t_form).format(_p_form) + " ] </h4>");
            break;
        case "month":
			start = moment().subtract(1, 'month').format(_h_form);
			end = moment().format(_t_form);
            $('#_panel-header').html("<h4 style='text-align:center'>Last Month [ " + moment(start, _t_form).format(_p_form) + " to " + moment(end, _t_form).format(_p_form) + " ]</h4>");
            break;
        default:
            start = from;
            end = to;
			put_log("custom date:");	
			put_log("from: " + from);	
			put_log("to: " + to);	
			
			start = moment(from, _c_form).format(_t_form);
			end = moment(to, _c_form).format(_t_form);

			put_log("custom date transformed:");	
			put_log("start: " + start);	
			put_log("end: " + end);	

			
            if (end != "") {
                $('#_panel-header').html("<h4 style='text-align:center'>From " + moment(start, _t_form).format(_p_form) + " to " + moment(end, _t_form).format(_p_form) + "</h4>");
            } else {
                $('#_panel-header').html("<h4 style='text-align:center'>From " + moment(start, _t_form).format(_p_form) + " to " + moment(end, _t_form).format(_p_form) + "</h4>");
            }
            break;
    }
    
    if (start != "") {
        var QUERY = "&args=1&arg_1=START_TIME&val_1=" + start ;
        if (end != "") {
            if (start > end) {
                var QUERY = "&args=2&arg_1=START_TIME&val_1=" + end + "&arg_2=END_TIME&val_2=" + start;
            } else {
                var QUERY = "&args=2&arg_1=START_TIME&val_1=" + start + "&arg_2=END_TIME&val_2=" + end;
            }
        }
        //script_to_execute=modify_for_log-plot.sh&args=2&arg_1=START_TIME&val_1=20160202125218&arg_2=END_TIME&val_2=20160203125250  
        QUERY = $.ssquid.params.handler.performance + QUERY;
        $('#_performance_tabs').addClass("hidden");
        $('#_modal_performance_modal ._modal_container').css("width", "900px");
        $('#_main_plot').html('<img class="_loading_display" src="img/loader1.gif">');
        SEND_TO_SERVER_per("POST", QUERY);
    } else {
        alert("Please choose start time");
    }
}

$(document).ready(function() {
    var today_date1 = moment().format(_c_form);
    $('._calendar').datetimepicker({
        format: _c_form,
        today: "Today",
        todayBtn: "linked",
        minView: 'day',
        showMeridian: true,
        locale: {
            format: _c_form
        },
        endDate: today_date1,
        autoclose: true,
        calendarWeeks: true,
        todayHighlight: true,
        showClear: true
    });
});


