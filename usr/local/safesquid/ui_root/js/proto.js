var check = "";
//this will collect stringlist data
var STRING_LIST_STORAGE = [];
//this is for storing section xml
var $xmlsection = "";
//this is for storing conf xml
var $xmlconf = "";
//global storage
var DATASTORE = [];
var DATASTORE1 = {};
//breadgrums array
var $breadcrumb_details = [];
//for magic suggest data and data
var MAGIC_SUGGEST_DETAIL = [];
var RULE_DETAIL_DATA = [];
//Store paarent tags
var SECTIONS_PARAMS = [];
//Section Tags
var SECTIONS = [];
//reset rule
var RESET_DATA = [];

var record_link = [];
array_xhr = [];

var status_log_ = true;

var divID_chk = "";
var abort = "";
var pause = false;
var disableAutoPause = false;

function put_log(msg) {
    var date = new Date();
    console.log(date.toGMTString() + ":" + date.getMilliseconds() + ": " + msg);
    delete date;
}

function status_log(msg) {
    if (msg == '') {
        $('#filter_notation').html('');
    } else {
        var date = new Date();
        $data_msg = "<span class='reports_trans'>" + date + " : " + msg + "</span>";
        $('#filter_notation').html($data_msg);
        delete date;
    }
    //return;
}


function chunk(url_, abot_, datatable_) {

    var last_index = 0;

    var xhr = new XMLHttpRequest();
    array_xhr.push(xhr);
    url = $.ssquid.params.url;
    //url += "/?" + url_;

    //xhr.addEventListener("loadend", transferComplete);
    //xhr.addEventListener("error", transferFailed);
    //xhr.addEventListener("abort", transferCanceled);
    status_log('Fetch ' + abot_);
    xhr.open("POST", url, true);
    status_log('Fetch ' + abot_);
    xhr.onprogress = function () {
        abort = abot_;
        var curr_index = xhr.responseText.length;
        if (last_index == curr_index)
            return;
        var s = xhr.responseText.substring(last_index, curr_index);
        last_index = curr_index;
        //truncated = '[' + s.substring(0, s.length - 1) + ']';
        status_log('Process ' + abot_);
        truncated = '[' + s + ']';
        var final = JSON.parse(truncated);
        var table = $(datatable_).DataTable();
        table.clear();
        table.rows.add(final).order([0, "asc"]).page.len(25).draw();

        status_log($(datatable_ + '_info').text());
    }


    /*function transferComplete(evt) {
        status_log("Unable to reach Server");
    }*/

    /* function transferFailed(evt) {
     put_log("An error occurred while transferring the file.");
     }

     function transferCanceled(evt) {
     put_log("The transfer has been canceled by the user.");
     }
     */
    xhr.send(url_);



}



escape = function (str) {
	if(str)
    return str
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
	else
		return '';
};


function chunk4(url_, abot_, datatable_) {
    put_log(abot_ + ': Sending request to get fetch data');
    $extended_data = [];
    put_log(abot_ + ': obtaining data');
    status_log('Fetch: ' + abot_);
    var request = $.ajax({
        url: $.ssquid.params.url,
        data: url_,
        dataType: 'text',
        type: 'post',
        success: function (text) {
            put_log(abot_ + ': obtained data');

            put_log(abot_ + ': newline content processing');
            status_log('Process: ' + abot_);
            if (abot_ == 'Detailed Logs') {
                var text_ = text.replace(/\t+/g, ",").split(/\r?\n/).map(function (n) {
                    if (n) {
                        extended_log = JSON.parse('[' + n.replace(/[\\]/g, "\\\\").replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; }) + ']');
                        if (extended_log.length < 37) {
                            return null;
                        }
                        $extended_data = [];
                        return ('["' + escape(extended_log[3] )+ '","' + escape(extended_log[11]) + '","' + escape(extended_log[1]) + '","' + escape(extended_log[12]) + '","' + escape(extended_log[13]) + '","' + escape(extended_log[5]) + '","' + escape(extended_log[6]) + '","' + escape(extended_log[14]) + '","' + escape(extended_log[15]) + '","' + escape(extended_log[16]) + '","' + escape(extended_log[17]) + '","' + escape(extended_log[18]) + '","' + escape(extended_log[36]) + '","' + escape(extended_log[30]) + '","' + escape(extended_log[33]) + '","' + escape(extended_log[32]) + '","' + escape(extended_log[31]) + '","' + escape(extended_log[34]) + '","' + escape(extended_log[35]) + '","' + escape(extended_log[19]) + '"]');
                        //return('[' + n + ']');
                    }
                });

                put_log(abot_ + ': completed  newline content processing');

                truncated = '[' + text_.slice(0, -1) + ']';

                put_log(abot_ + ': making table content');

                //for checkboxes
                var check = '<div class="multiselect"><button type="button" class="btn btn-xs checkbox_menu btn-refresh" id ="checking" data-toggle="dropdown">Show/Hide Column</button>';
                check += '<ul id="checkboxes" style=" list-style-type: none;"  class="checkboxes">';
                var headers = ['Time', 'Username', 'Client ID', 'Method', 'URL', 'Status', 'Size', 'Referer', 'Useragent', 'Mime', 'Filter Name', 'Filter Reason', 'Profiles', 'Request profiles', 'Response profiles', 'Categories', 'Applications', 'Upload content type', 'Download content type', 'Interface'];


                for (var i = 0; i < headers.length; i++)
                {
                    check += '<li><label><input type="checkbox" class="showHideColumn" data-column="' + i + '"id="options" checked /><span class="checkboxName">' + headers[i] + '</span></label></li>';
                }

                check += '</ul></div>';

                //Add column search
                $(datatable_ + ' tr:first-child th').each(function () {
                    var title = $(this).text();
                    put_log(title);
                    $(this).html('<input type="text" id ="search" class="extended_search" placeholder="Search ' + title + '" />');
                });

                $(document).ready(function () {

                    //expand checkboxes
                    var expanded = false;
                    $(document).on('click', '#checking', function () {
                        var checkboxes = document.getElementById("checkboxes");
                        if (!expanded) {
                            checkboxes.style.display = "block";
                            expanded = true;
                        } else {
                            checkboxes.style.display = "none";
                            expanded = false;
                        }
                    });
                    var table = $(datatable_).DataTable({
                        destroy: true,
                        pageLength: 25,
                        "search": {
                            "regex": true
                        },
                        data: JSON.parse(truncated),
                        //scrollX: true,
                        //scrollY: "500px",
                        order: [[0, "desc"]]

                    });

                    //status_log($('#table_extended_info').text());

                    $("#_extended_log_div .dataTables_filter").append(check);
                    // Apply the search
                    table.columns().every(function () {
                        var that = this;

                        $('input', this.header()).on('keyup change', function () {
                            if (that.search() !== this.value) {
                                that.search(this.value).draw();
                                status_log($('#table_extended_info').text());
                            }
                        });
                    });

                    status_log($('#table_extended_info').text());

                    //status_log($('#table_extended_info').text());
                    $('#table_extended_info').addClass('hidden');




                    $('#table_extended').parent().css({
                        'overflow': 'auto',
                        'width': '240ex'
                    });
                    //showHideColumn
                    $(document).on('click', '.showHideColumn', function () {

                        var column = table.column($(this).attr('data-column'));
                        column.visible(!column.visible());
                    });

                    $(document).on('click', '.paginate_button', function () {
                        status_log($('#table_extended_info').text());
                    });
                });

            } else {

//                config_log = JSON.parse(text);
                config_log = JSON.parse(text.replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; }));
                $config_content_ = [];

                for (i = 0; i < config_log.length; i++) {
                    $config_content_.push('["' + escape(config_log[i][0]) + '","' + escape(config_log[i][1]) + '","' + escape(config_log[i][2]) + '","' + escape(config_log[i][4]) + '","' + escape(config_log[i][5]) + '","' + escape(config_log[i][9]) + '","' + escape(config_log[i][10]) + '"]');
                }


                //put_log($config_content_);

                put_log(abot_ + ': making table content');
                var table = $(datatable_).DataTable({
                    destroy: true,
                    pageLength: 25,
                    "search": {
                        "regex": true
                    },
                    data: JSON.parse('[' + $config_content_ + ']'),
                    order: [[0, "desc"]]
                });

            }

            put_log(abot_ + ': completed making table content');
            //status_log('Refreshed: ' + abot_);
            //status_log($('.dataTables_info').text());

        }
    });
    request.fail(function (jqXHR, textStatus, errorThrown) {
        status_log(abot_ + ": Request failed");
    });

    put_log(abot_ + ': completed request to get fetch data');
}


function chunked_append(url_, abot_, datatable_) {

    var last_index = 0;

    var LOG_LIMIT = 3000;
    var slice_me = 0;

    var xhr = new XMLHttpRequest()
    array_xhr.push(xhr);
    url = $.ssquid.params.url
    url += "/?" + url_;
//    xhr.open("POST", url, true)
    xhr.open("POST", url, true)
    xhr.onprogress = function () {
        abort = abot_;

        if (pause == false) {
            put_log("content range: " + xhr.getResponseHeader("Transfer-Encoding"));

            var text = xhr.responseText;
            if (abot_ == 'Native Logs') {

				var final = [];
                var text_ = _.escape(text).replace(/\r\n/g, '<br />').split(/\r?\n/).map(function (n) {
                    //var text_ = text.replace(/\r\n/, '<br/>').split(/\r?\n/).map(function (n) {
                    if (n) {
                        //n = escape(n);
						//put_log(n);
						var temp = [];
						temp.push(n);
						final.push(temp);
						temp = [];
                        //return '["' +  n + '"]';
                    } else{
						var temp = [];
						temp.push('-');
						final.push(temp);
						temp = [];
                        //return '["-"]';
					}
                });

            } else if (abot_ == 'extended') {
                var text_ = text.replace(/\t+/g, ",").split(/\r?\n/).map(function (n) {
                    if (n) {

                        extended_log = JSON.parse('[' + n + ']');

                        $extended_data = [];

                        return ('["' + extended_log[3] + '","' + extended_log[11] + '","' + extended_log[1] + '","' + extended_log[12] + '","' + extended_log[13] + '","' + extended_log[5] + '","' + extended_log[6] + '","' + extended_log[14] + '","' + extended_log[15] + '","' + extended_log[16] + '","' + extended_log[17] + '","' + extended_log[18] + '","' + extended_log[36] + '","' + extended_log[30] + '","' + extended_log[33] + '","' + extended_log[32] + '","' + extended_log[31] + '","' + extended_log[34] + '","' + extended_log[35] + '","' + extended_log[19] + '"]');
                        //return('[' + n + ']');
                    }
                });
				truncated = '[' + text_.slice(0, -1) + ']';



			//put_log(truncated);
            var final = JSON.parse(truncated);
			//var final = truncated;
            }


            curr_index = final.length;

            put_log(curr_index);

            if (curr_index > LOG_LIMIT) {
                if (last_index == curr_index)
                    return;

                slice_me = curr_index - LOG_LIMIT;
                last_index = curr_index;

                final = final.slice(slice_me, curr_index);
            }


            if (abot_ == 'Native Logs') {
                /*var table = $(datatable_).DataTable();
                 table.clear();
                 table.rows.add(final).columns('.nosort').order([0, 'desc']).page.len(25).draw();
                 */

                var table = $(datatable_).DataTable({
                    destroy: true,
                    data: final,
                    orderClasses: false,
                    deferRender: true,
                    Processing: false,
                    Sortable: false,
                    ordering: false,
                    paging: false,
                    responsive: true,
                    searching: true,
                    scrollY: "93%"
                            //scrollCollapse: true
                            /*drawCallback: function (settings) {
                             $('#table_native_filter').addClass('hidden');
                             $('#table_native_length').addClass('hidden');

                             //alert(JSON.stringify(settings));
                             search_val = $('#native_search').val();
                             if (search_val)
                             search_here(search_val);

                             }*/
                });

                /*$('#native_search').on('keyup change', function () {
                 table.search(this.value).draw();
                 });*/

                function search_here(search_val) {
                    $('#table_native').DataTable().search(search_val).draw();
                }

                /*$('#table_native').on('draw.dt', function() {
                 $('#table_native_filter').addClass('hidden');
                 $('#table_native_length').addClass('hidden');
                 search_val = $('#native_search').val();
                 if(search_val)
                 table.search(search_val).draw();
                 });*/

                /*$('#table_native').on('draw.dt', function() {
                 $('#table_native_filter').addClass('hidden');
                 $('#table_native_length').addClass('hidden');
                 search_val = $('#native_search').val();
                 if(search_val)
                 table.search(search_val).draw();
                 });*/

                $(document).ready(function () {

                    $('#disableAutoPause').change(function() {
                        disableAutoPause = this.checked
                            ? true
                            : false;
                        put_log(disableAutoPause);
                        if (disableAutoPause) {
                            resume_refresh();
                            hide_div_id('native_controller');
                        } else {
                            show_div_id('native_controller');
                        }

                    });

                    $('#table_native_filter').addClass('hidden');
                    $('#table_native_length').addClass('hidden');
                    $('#table_native_info').addClass('hidden');
                    status_log($('#table_native_info').text());

                    $('#filter_notation').trigger('contentchanged');
                    $('#filter_notation').bind('contentchanged', function () {
                        put_log('changed');

                        validate = $('#native_search').attr('data-id');
                        put_log(validate);
                        if (validate === '1') {
                            search_val = $('#native_search').val();
                            table.search(search_val).draw();
                        }
                    });


                    $("#native_search").keypress(function (event) {
                        search_val = $('#native_search').val();
                        if (event.which == 13) {
                            if (search_val) {
                                table.search(search_val).draw();
                                $('#native_search').attr('data-id', '1');
                            } else {
                                $('#native_search').attr('data-id', '0');
                            }
                        }

                    });


                    //scroll to bottom
                    var height = 0;
                    $('.dataTables_scrollBody td').each(function (i, value) {
                        height += parseInt($(this).height());
                    });
                    height += '';
                    $('.dataTables_scrollBody').animate({scrollTop: height});

                    //pause on hover
                    $("#table_native").mouseover(function () {
                        if(!disableAutoPause){
                            $('#pause_refresh').addClass('hidden');
                            $('#resume_refresh').removeClass('hidden');
                            pause = true;
                        }

                    });
                    //resume on hover remove
                    /*$("#_log_div").mouseout(function () {

                     $('#resume_refresh').addClass('hidden');
                     $('#pause_refresh').removeClass('hidden');
                     pause = false;
                     //if (!$('#pause_refresh').hasClass('hidden')) {}
                     });*/

                });
                final=[];
            } else if (abot_ == 'extended') {
                put_log(final);
                var table = $(datatable_).DataTable();
                table.clear();
                table.rows.add(final).columns().order([0, 'desc']).page.len(25).draw();
            }

        }
    }

    xhr.send(url_);
}
//To stop chunked transfer
function abort_all_xhr() {
    if (abort) {
        put_log("Aborting:::" + abort);
        if (array_xhr.length > 0) {
            for (var i = 0; i < array_xhr.length; i++) {
                array_xhr[i].abort();
            }
            array_xhr.length = 0;
        }
        ;
    }
    pause = false;
}

//To pause chunked transfer
function pause_refresh() {
    pause = true;
    $('#pause_refresh').addClass('hidden');
    $('#resume_refresh').removeClass('hidden');
}

function resume_refresh() {
    pause = false;
    $('#resume_refresh').addClass('hidden');
    $('#pause_refresh').removeClass('hidden');
}


function url_execute() {
    $url_cmd = $('#url_command_website').val();
    $url_ftc = $("#url_command_select option:selected").val();

    if ($url_ftc === "") {
        alert('Please Select URL options');
        document.getElementById('url_command_select').style.borderColor = "red";
        return false;
    }

    if ($url_cmd === "") {
        alert('Please Enter URL');
        document.getElementById('url_command_website').style.borderColor = "red";
        return false;
    }

    $url_cmd = $url_cmd.replace(/(^\w+:|^)\/\//, '');
    $url_fetch = "http://" + $url_ftc + "." + $url_cmd;

    window.open($url_fetch);
}

//Used to hide div's
function hide_div_id(id_div) {
	/*
	id_div is the div id whose class should be assigned with
	'hidden' class
	 */
	if (!$('#' + id_div).hasClass("hidden"))
		$('#' + id_div).addClass('hidden');
}

function show_div_id(id_div) {
    if ($('#' + id_div).hasClass("hidden")) {
        $('#' + id_div).removeClass('hidden');
    }
}

function handle(e, key_name) {
    if (e.keyCode === 13) {
        auth_submit();
    }
    return false;
}

jQuery.extend({
    getValues: function (url, caller = '') {
        var result = null;
        //status_log('Fetch ' + caller);
        $.ajax({
            url: $.ssquid.params.url,
            type: 'POST',
            data: url,
            dataType: 'xml',
            async: false,
            ifModified: false,
            success: function (data, textstatus, xhr) {
                result = data;
            },
            error: function () {
                status_log('Fetch Failed');
                put_log("error: load handler failed: " + url);
                result = "null";
            }
        });
        return result;
    },

    getText: function (url) {
        var result = null;
        $.ajax({
            url: $.ssquid.params.url,
            type: 'POST',
            data: url,
            async: false,
            ifModified: false,
            success: function (data, textstatus, xhr) {
                result = data;
            },
            error: function () {
                status_log('Unable to reach server');
                put_log("error: load handler failed: " + url);
                result = "null";
            }
        });
        return result;
    },

    getJSON: function (url) {
        var result = null;
        $.ajax({
            url: $.ssquid.params.url,
            type: 'POST',
            data: url,
            dataType: 'JSON',
            async: false,
            ifModified: false,
            success: function (data, textstatus, xhr) {
                result = data;
            },
            error: function () {
                status_log('Unable to reach server');
                put_log("error: load handler failed: " + url);
                result = "null";
            }
        });
        return result;
    },
    getValues_get: function (url, sync) {
        var result = null;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            async: false,
            ifModified: false,
            success: function (data, textstatus, xhr) {
                result = data;
            },
            error: function () {
                status_log('Unable to reach server');
                put_log("error: load handler failed: " + url);
                result = "null";
            }
        });
        return result;
    },
    get_structure: function (url, modified) {
        var result = null;
        $.ajax({
            url: $.ssquid.params.url,
            type: 'POST',
            data: url,
            dataType: 'xml',
            async: false,
            cache: true,
            ifModified: false,
            success: function (data, textstatus, xhr) {
                if (xhr.status === "304" && url === "handler=conf_xml") {
                    result = $xmlconf;
                } else if (xhr.status === "304" && url === "handler=structured_xml")
                    result = $xmlsection;
                else
                    result = data;
            },
            error: function () {
                status_log('Unable to reach server');
                put_log("error: load handler failed: " + url);
                result = "null";
            }
        });
        return result;
    },
    conf_check: function () {
        var result = null;
        $.ajax({
            url: $.ssquid.params.url,
            type: 'POST',
            data: 'handler=conf_xml',
            dataType: 'xml',
            async: false,
            cache: true,
            ifModified: true,
            success: function (data, textstatus, xhr) {
                status_log_ = true;
                //status_log('Fetch Configurations');
                if (xhr.status == 200) {
                    result = 1;
                    $xmlconf = $($.get_structure($.ssquid.params.handler.config_xml, false));
                } else {
                    result = 0;
                }
            },
            error: function () {
                status_log('Failed to Fetch Configurations');
                status_log_ = false;

                result = null;
            }
        });
        return result;
    },
    getreports: function (url) {
        var result = null;
        $.ajax({
            url: $.ssquid.params.url,
            type: 'POST',
            data: url,
            dataType: $.ssquid.params.report.result,
            async: true,
            success: function (data) {
                status_log('Fetch Reports');
                $query_request_find = data;
                RENDER_REPORT(data);
                return 0;
            },
            error: function () {
                status_log('Unable to reach server');
                put_log("error: load handler failed: " + url);
                result = "null";
            }/*,
             beforeSend : function () {
             SET_LOAD_ICON();
             }*/
        });
        return result;
    }
});

function seconds_conv(duration) {

	var milliseconds = frac((duration / 1000)),
	seconds = parseInt((duration / 1000) % 60),
	minutes = parseInt((duration / (1000 * 60)) % 60),
	hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;

}

function frac(f) {
	$decibel = f.toFixed(3).split(".");
	return $decibel[1];
}

function epoch_date(epoch_time) {
	var date = new Date(epoch_time);
	var convert = date;
	delete date;
	return convert;

}

function EDIT_ZONE(view, edit, id) {
	$('#' + view).toggleClass('unhide hidden');
	$('#' + edit).toggleClass('hidden unhide');
	$("." + id).each(function () {
		$(this).toggleClass('unhide hidden');
	});

	if ($('.new_policy').hasClass("hidden")) {
		$('.new_policy').removeClass("hidden");
	} else {
		$('.new_policy').addClass("hidden");
		// $('._new_policy').removeClass("new_policy_overflow");
	}

}
var DATA_ENTRY_SUBSCRIPTION = "";

function agree_eula () {
	
	$('#_eula').addClass('hidden');
	$('#activation_dialog').removeClass('hidden');
	
}

function display_eula() {
    var myWindow = window.open("eula/eula.pdf", "eula", "width=400,height=400");
	$('#agree_eula').removeClass('hidden');
}




function show_eula () {
	var eula = "";
	eula += '<div id="_eula" class= "eula">';
	
	eula += '<div class="_form-group">' ;
	eula += '<input type="submit"  onclick="display_eula()" class="btn bg-grey btn-xs " value="View End User License Agreement"/>'
	eula += '<input id="agree_eula" type="submit"  onclick="agree_eula()" class="btn bg-purple btn-xs hidden" value="agree"/>';
	eula += '</div>';
	
	eula += '</div>';

	return eula;		
}

function activation_dialog() {
	
	var bb = "";
		bb += '<div id="activation_dialog" class="hidden">'
		bb += '<div class="activation_notify">' + '</div>';
		bb += '<div class="_form-group"><label for="upload">Upload Your Activation Key</label></div>';
		bb += '<div><input  type="file" multiple></div>';
		bb += '<div class="box-footer"><input type="submit"  onclick="upload_file(\'activation_key\')" class="btn bg-purple btn-xs" value="upload"/>';
		bb += '</div>';
		bb += '</div>';	
		
		return bb;
}


function activation_refresh(refresh_requrired) {
	DATA_ENTRY_SUBSCRIPTION = "";
	var $subscriptionxml = $($.getValues($.ssquid.params.handler.subscription + refresh_requrired));
	$xml_subsrciption = $subscriptionxml.find('subscription_details').find('information');

	DATA_ENTRY_SUBSCRIPTION += '<ul class="list-group">';
	$($subscriptionxml).find('subscription_details').find('information').each(function () {
		$.each(this.attributes, function (i, attrib) {
			var val = attrib.value
				if (val.length > 20)
					val = val.substring(0, 20) + "...";
				DATA_ENTRY_SUBSCRIPTION += '<li class="list-group-item"><span class="badge" data-placement="right" data-toggle="tooltip" data-original-title="' + attrib.value + '">' + val + '</span>' + attrib.name.replace(/_/g, " ") + '</li>';

		});
	});

	DATA_ENTRY_SUBSCRIPTION += '<li class="list-group-item"><span class="badge"  style="cursor:pointer" onclick="activation_refresh(\'true\')">Refresh</span>Refresh Details</li>';
	DATA_ENTRY_SUBSCRIPTION += '<li class="list-group-item"><span class="badge" style="cursor:pointer"  data-toggle="modal"  data-target="#_activation_key_upload_modal">Click Here</span>Upload Your Activation Key</li></ui>';

	if (refresh_requrired == "true") {
		$("#_subscription").html(DATA_ENTRY_SUBSCRIPTION);
	}

	$('#version').html($xml_subsrciption.attr('Version'));

	var NOTIFICATION = $xml_subsrciption.attr('Remarks');

	if (NOTIFICATION == "Failed to set Subscription details") {
		var key = '<div id="activation_key_upload">';
		key += show_eula();
		key += activation_dialog();
		key += '</div>';
		
		$('#modal_data').html(key);
		$('._modal_container').removeAttr("style");
		$('#_popups').modal('show');
		$('#_popups ._modal_container').css("width", "30%", "height:30%");
	}
}


function unhide(divID, type, modal) {
	var MAKE_SHOW = "_details";

	divID_chk = divID;
  abort_all_xhr();
  abort = "";

	if (type !== "section")
		$("#_icons").addClass("hidden");

	if (type === "menu") {
		RENDER = "_menulist";
	} else {
		if (modal !== "modal")
			RENDER = "_details";
		else
			RENDER = "modal_data";
		SHOW_DESC_DETAILS('section_header');

	}

	if (!$('#_search_details').hasClass('hidden'))
		$('#_search_details').addClass('hidden');

	$('#' + RENDER + ' .unhide').each(function () {
		$(this).toggleClass('unhide hidden');
	});

	var item = document.getElementById(divID);

	if (item) {
		$('#' + RENDER + ' #' + divID).toggleClass('hidden unhide');
	}

    if (divID === "configure") {
        divID = 'profiles';
        divID_chk = 'profiles';
        status_log('Started Rendering Configure');
        $xmlconf = $($.get_structure($.ssquid.params.handler.config_xml, true));
        //$xmlconf = $($.get_structure($.ssquid.params.handler.config_xml, false));

        $breadcrumb_details = [];

        $("#_breadcrumb_details").addClass("hidden");
        //$("#filter_notation").addClass("hidden");
        $("#_icons").removeClass("hidden");
        SHOW_DESC_DETAILS('section_header');

    } else if (divID === "utilities") {
        $('#_reporting_footer').addClass('hidden');
        $("#_breadcrumb_details").addClass("hidden");
        //$("#filter_notation").addClass("hidden");

        load_scripts('support');
    } else if (divID === "reporting") {
        $("#_breadcrumb_details").addClass("hidden");
        $("#filter_notation").removeClass("hidden");
        $("#_reporting_footer").removeClass("hidden");
    }

    if (modal == "modal") {
        MAKE_SHOW = "modal_data";
        if ($('#_details ._section_content').hasClass("hidden"))
            $('#_details ._section_content').toggleClass('hidden unhide');
    }

    //If details is already hidden then make it unhide
    if ($('#_details').hasClass('hidden'))
        $('#_details').toggleClass('hidden unhide');

    //If search is unhide make it hidden
    if ($('#search_details').hasClass('unhide'))
        $('#search_details').toggleClass('unhide hidden');

    $("._quick_icon").click(function () {
        $("._quick_icon").removeClass("active");
        $(this).addClass("active");
    });

    MAKE_PAGE(divID, MAKE_SHOW);
}
;

function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else
		var expires = "";
	document.cookie = name + "=" + value + expires + "; path=/";
	delete date;
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}

function SWITCH_DISPLAY(type_check) {

	if (!$('#_pageRight').hasClass("hidden"))
		$('#_pageRight').addClass('hidden');
	if (!$('#_pageLeft').hasClass("hidden"))
		$('#_pageLeft').addClass('hidden');

	switch (type_check) {
	case "1":
		if ($('#_pageLeft').hasClass("hidden"))
			$('#_pageLeft').removeClass('hidden');
		break;
	case "2":
		if ($('#_pageRight').hasClass("hidden"))
			$('#_pageRight').removeClass('hidden');
		break;
	case "3":
		if ($('#_pageLeft').hasClass("hidden"))
			$('#_pageLeft').removeClass('hidden');
		if ($('#_pageRight').hasClass("hidden"))
			$('#_pageRight').removeClass('hidden');
		break;
	}
};

function GET_ATTR($xml, attr_name) {
	$value = $xml.attr(attr_name);
	if ($value === undefined)
		return "";
	else
		return $value;
};

function get_tag_attr($xml, $tag, $attr_name) {
	$value = $xml.find($tag).attr($attr_name);
	if ($value === undefined)
		return null;
	else
		return $value;
}

function disableSelection(info) {
	var DATA_ID = info.toString().split(',');
	for (i = 0; i < DATA_ID.length; i++) {
		$('[id="' + DATA_ID[i] + '"]').prop("disabled", true);
		$('#' + DATA_ID[i] + ' input').prop("disabled", true);
	}
	//check for rule edited
};

function enableSelection(info, id_name) {
	var DATA_ID = info.toString().split(',');
	for (i = 0; i < DATA_ID.length; i++) {
		$('[id="' + DATA_ID[i] + '"]').prop("disabled", false);
		$('#' + DATA_ID[i] + ' input').prop("disabled", false);
	}
};
var getKeyValueById = function (array, key, id) {
	var testArray = array.slice(),
	test;
	while (test = testArray.pop()) {
		if (test.FIELD_SOURCE === id)
			return test[key]
	}
	// return undefined if no matching id is found in array
	return;
}

function check_null(input_array) {
	if (input_array == "[]" || input_array == "null" || input_array == "[" || input_array == "") {
		return null;
	} else {
		return input_array;
	}
}

function workflow(current_section, current_section_subsection, next_section) {
	var SHOW_CRUMB = "";
	var search = $.grep($breadcrumb_details, function (e) {
			return e.parent_section == current_section;
		});

	var index = $breadcrumb_details.map(function (d) {
			return d['parent_section'];
		}).indexOf(current_section);
	//console.log(JSON.stringify(search) + ' -- ' + search + '--' + index);
	if (search.length == 0) {
		$breadcrumb_details.push({
			"parent_section" : current_section,
			"parent_section_subsection" : current_section_subsection,
			"trace_section" : next_section
		});
	} else {
		index == 0 ? $breadcrumb_details = [] : $breadcrumb_details.length = index;
	}


	for (i = 0; i < $breadcrumb_details.length; i++) {



		//SHOW_CRUMB += '<li><a href="#" onclick="workflow(\'' + $breadcrumb_details[i].parent_section + '\',\'\',\'\');unhide(\'' + $breadcrumb_details[i].parent_section + '\',\'section\');$(\'#option_section_' + $breadcrumb_details[i].parent_section + '_' + $breadcrumb_details[i].parent_section_subsection + '\').trigger(\'click\');">' + $breadcrumb_details[i].parent_section + '</a></li>'
		SHOW_CRUMB += '<li><a href="#" onclick="workflow(\'' + $breadcrumb_details[i].parent_section + '\',\'\',\'\');unhide(\'' + $breadcrumb_details[i].parent_section + '\',\'section\');$(\'#option_section_' + $breadcrumb_details[i].parent_section + '_' + $breadcrumb_details[i].parent_section_subsection + '\').trigger(\'click\');">' + _.find(SECTIONS_PARAMS, function(item) {return item.section_tag == $breadcrumb_details[i].parent_section; })['display_name'] + '</a></li>'
		if (i == ($breadcrumb_details.length - 1)) {
			//SHOW_CRUMB += '<li class="active"><a href="#" onclick="workflow(\'' + $breadcrumb_details[i].trace_section + '\',\'\',\'\');unhide(\'' + $breadcrumb_details[i].trace_section + '\',\'section\');">' + $breadcrumb_details[i].trace_section + '</a></li>'
			SHOW_CRUMB += '<li class="active"><a href="#" onclick="workflow(\'' + $breadcrumb_details[i].trace_section + '\',\'\',\'\');unhide(\'' + $breadcrumb_details[i].trace_section + '\',\'section\');">' + _.find(SECTIONS_PARAMS, function(item) {return item.section_tag == $breadcrumb_details[i].trace_section })['display_name'] + '</a></li>'
		}
	}

	if ($breadcrumb_details.length == 0) {
		$("#_breadcrumb_details").addClass("hidden");
	} else {
		$("#_breadcrumb_details").removeClass("hidden");
	}

	$('#_breadcrumb_details #_breadcrumb_info').html(SHOW_CRUMB);
}

function findAndRemove(array, property, value) {
	array.forEach(function (result, index) {
		if (result[property] === value) {
			//Remove from array
			array.splice(index, 1);
		}
	});
}

function reset_policy(id) {
	$("#config_" + id).html(RESET_DATA[id]);
}
jQuery.loadScript = function (url, callback) {
	jQuery.ajax({
		url : "js/" + url,
		dataType : 'script',
		//success: callback,
		async : false,
		//ifModified:true,
		cache : true
	});
}

function load_scripts(js_file) {
	getNames($.ssquid.params.js_files, js_file)
	var list = getNames($.ssquid.params.js_files, js_file);
	list = list.toString().split(",");
	var length = list.length;
	for (i = 0; i < length; i++) {
		$.loadScript(list[i]);
	}
}
$(document).ready(function () {
	$(".ms-sel-ctn > input").css('width', 'auto');
	$("input").removeAttr("style");

});
