function render_stats(){
	var last_index = 0;
	divID_chk = "stats";

	abort_all_xhr();
	abort = "";
//	url_ = "http://safesquid.cfg/?handler=stats&loop=2";
	url_ = "/?handler=stats&loop=2";
	//url_ = $.ssquid.params.url + "/?" + $.ssquid.params.handler.stats;

	var xhr = new XMLHttpRequest()
	array_xhr.push(xhr);
	xhr.open("GET", url_, true)
	xhr.onprogress = function () {
	abort = "stat";
        status_log('Fetch Statistics');
		if (pause == false) {

		var curr_index = xhr.responseText.length;
		if (last_index == curr_index) return;
		var s = xhr.responseText.substring(last_index, curr_index);

		if(IsJsonString(s)){
			last_index = curr_index;
			render_stats_(JSON.parse(s));
		}

		}
	}
	xhr.send();
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function render_stats_($stat_json){

	s_len_l = STAT_LEFT.length;
	s_len_r = STAT_RIGHT.length;
	s_len_m = STAT_MIDDLE.length;
	s_len_ml = STAT_MIDDLE_L.length;
	s_len_mr = STAT_MIDDLE_R.length;

	put_log(s_len_l+"--"+s_len_r+"--"+s_len_m+"--"+s_len_ml+"--"+s_len_mr);

	//left
	TEMPLATE = "";

	for( m = 0 ;m < s_len_l;m++){
		Dcont = STAT_LEFT[m];

		if (typeof Dcont != "undefined"){
			container_data = $stat_json[Dcont];

			if (typeof container_data != "undefined"){

				content_stat = container_data;
				TEMPLATE += '<div class="report_unit">';
				TEMPLATE += '<div id="_usergroup_tables" class="_reportparams tabular">';
				TEMPLATE += '<table class="table table-striped margin_btm_0 stats_show">';
				TEMPLATE += '<thead>';
				TEMPLATE += '<tr><th colspan="2">'+Dcont+'</th></tr>'
				TEMPLATE += '</thead>';
				TEMPLATE += '<tbody>';
				for( z = 0 ; z < content_stat.length;z++){
					TEMPLATE += '<tr><td class="stat_heading">'+content_stat[z]["_i"]+'</td><td class="text_right">'+content_stat[z]["_v"].replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; })+'</td></tr>';
				}
				TEMPLATE += '</tbody>';
				TEMPLATE += '</table>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';
			}
		}
	}
	$('#stat_left_').html(TEMPLATE);

	//right
	TEMPLATE = "";

	for( m = 0 ;m < s_len_r;m++){
		Dcont = STAT_RIGHT[m];

		if (typeof Dcont != "undefined"){
			container_data = $stat_json[Dcont];
			if (typeof container_data != "undefined"){

				content_stat = container_data;
				TEMPLATE += '<div class="report_unit">';
				TEMPLATE += '<div id="_usergroup_tables" class="_reportparams tabular">';
				TEMPLATE += '<table class="table table-striped margin_btm_0 stats_show">';
				TEMPLATE += '<thead>';
				TEMPLATE += '<tr><th colspan="2">'+Dcont+'</th></tr>'
				TEMPLATE += '</thead>';
				TEMPLATE += '<tbody>';
				for( z = 0 ; z < content_stat.length;z++){
					TEMPLATE += '<tr><td class="stat_heading">'+content_stat[z]["_i"]+'</td><td class="text_right">'+content_stat[z]["_v"].replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; })+'</td></tr>';
				}
				TEMPLATE += '</tbody>';
				TEMPLATE += '</table>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';
			}
		}
	}
	$('#stat_right_').html(TEMPLATE);

	//middle
	TEMPLATE = "";

	for( m = 0 ;m < s_len_m;m++){
		Dcont = STAT_MIDDLE[m];
		//put_log(Dcont+"stage-1");
		if (typeof Dcont != "undefined"){
			container_data = $stat_json[Dcont];
			//put_log(Dcont+"stage-2");
			if (typeof container_data != "undefined"){

				//put_log(Dcont+"stage-3");
				content_stat = container_data;
				TEMPLATE += '<div class="report_unit flex_auto_width float_left">';
				//TEMPLATE += '<div class="report-chart">';
				TEMPLATE += '<div id="_usergroup_tables" class="_reportparams  tabular">';
				TEMPLATE += '<table class="table table-striped margin_btm_0 stats_show">';
				TEMPLATE += '<thead>';
				TEMPLATE += '<tr><th colspan="2">'+Dcont+'</th></tr>'
				TEMPLATE += '</thead>';
				TEMPLATE += '<tbody>';
				for( z = 0 ; z < content_stat.length;z++){
					TEMPLATE += '<tr><td class="stat_heading">'+content_stat[z]["_i"]+'</td><td class="text_right">'+content_stat[z]["_v"].replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; })+'</td></tr>';
				}
				TEMPLATE += '</tbody>';
				TEMPLATE += '</table>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';
				//TEMPLATE += '</div>';
			}
		}
	}
	$('#stat_middle_').html(TEMPLATE);


	//middle_l
	TEMPLATE = "";

	for( m = 0 ;m < s_len_ml;m++){
		Dcont = STAT_MIDDLE_L[m];

		if (typeof Dcont != "undefined"){
			container_data = $stat_json[Dcont];
			if (typeof container_data != "undefined"){
				content_stat = container_data;
				TEMPLATE += '<div class="report_unit flex_auto_width">';

				TEMPLATE += '<div class="report-chart">';
				TEMPLATE += '<div id="_usergroup_tables" class="_reportparams tabular">';
				TEMPLATE += '<table class="table table-striped margin_btm_0 stats_show">';
				TEMPLATE += '<thead>';
				TEMPLATE += '<tr><th colspan="2">'+Dcont+'</th></tr>'
				TEMPLATE += '</thead>';
				TEMPLATE += '<tbody class="table-body">';
				for( z = 0 ; z < content_stat.length;z++){
					TEMPLATE += '<tr class="full_content"><td class="stat_heading">'+content_stat[z]["_i"]+'</td><td class="text_right">'+content_stat[z]["_v"].replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; })+'</td></tr>';
				}
				TEMPLATE += '</tbody>';
				TEMPLATE += '</table>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';
			}
		}
	}
	$('#stat_middle_l_').html(TEMPLATE);

	//middle_r
	TEMPLATE = "";

	for( m = 0 ;m < s_len_mr;m++){
		Dcont = STAT_MIDDLE_R[m];

		if (typeof Dcont != "undefined"){
			container_data = $stat_json[Dcont];
			if (typeof container_data != "undefined"){
				content_stat = container_data;
				TEMPLATE += '<div class="report_unit flex_auto_width">';

				TEMPLATE += '<div class="report-chart">';
				TEMPLATE += '<div id="_usergroup_tables" class="_reportparams tabular">';
				TEMPLATE += '<table class="table table-striped margin_btm_0 stats_show">';
				TEMPLATE += '<thead>';
				TEMPLATE += '<tr><th colspan="2">'+Dcont+'</th></tr>'
				TEMPLATE += '</thead>';
				TEMPLATE += '<tbody class="table-body">';
				for( z = 0 ; z < content_stat.length;z++){
					TEMPLATE += '<tr class="full_content"><td class="stat_heading">'+content_stat[z]["_i"]+'</td><td class="text_right">'+content_stat[z]["_v"].replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; })+'</td></tr>';
				}
				TEMPLATE += '</tbody>';
				TEMPLATE += '</table>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';
				TEMPLATE += '</div>';

			}
		}
		$('#stat_middle_r_').html(TEMPLATE);
                status_log('Render Statistics');
	}


	$(document).ready(function () {
        $(".table-body").mouseover(function () {
            pause = true;
        });

        $(".table-body").mouseout(function () {
            pause = false;
        });
    });
}

$(document).ready(function() {
    render_stats();

});
