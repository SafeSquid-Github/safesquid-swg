//this function is called by interface authentication on submit click
function auth_submit() {
    //this is for validating interface authentication [success|failed]
    var $authentication_validity = $($.getValues($.ssquid.params.handler.authentication + "&username=" + $('#inter_username').val() + '&password=' + $('#inter_password').val())).find('authentication').attr("value");
    if ($authentication_validity === "success") {
        $('#_authentication').addClass('hidden');
        $('#_details').removeClass('hidden');
        LOAD_RENDER();
	} else {
        $('#_auth_error').removeClass('hidden');
	}
    delete $authentication_validity;
}
//this is called by body while loading html
function LOAD_RENDER() {
    SWITCH_DISPLAY('0');
	
    //this is for checking interface authentication [true|false]
    var $interface_authentication = $($.getValues($.ssquid.params.handler.authentication)).find('authentication').attr("value");
    if ($interface_authentication === "true") {
        $('#_details').addClass('hidden');
		$('.control_button').addClass('hidden');
        $('#_authentication').removeClass('hidden');
	} else {
        delete $interface_authentication;
        if (!$xmlsection)
			$xmlsection = $($.get_structure($.ssquid.params.handler.section_xml, false));
        else
			$xmlsection = $($.get_structure($.ssquid.params.handler.section_xml, true));
        RENDER_MENU();
        unhide('reporting', 'menu');
	}
}
//this is for building quick icon on header which is called by RENDER_MENU function
function RENDER_QUICK_ICON(DISPLAY_NAME, DISPLAY_LOGO, SECTION_TAG, DESC, RENDER) {
    var ICONS = "";
    //making ready for child nodes
    var $QUICK_ICON_CONTENT = $("<ul>", {
        id: SECTION_TAG,
        class: "treeview-menu sidebar-menu hidden"
	});
	
    //building quick icons
    ICONS += '<div class="quick-icons _quick_icon" onclick="SWITCH_DISPLAY(\'' + RENDER + '\');unhide(\'' + SECTION_TAG + '\',\'menu\');">';
    ICONS += '<div class="fa ' + DISPLAY_LOGO + '"></div>';
    ICONS += '<div class="quick-icons-caption">' + DISPLAY_NAME + '</div>';
    ICONS += '</div>';
    $("#_top-menu").append(ICONS);
    $("#_menulist").append($QUICK_ICON_CONTENT);
    delete $QUICK_ICON_CONTENT;
    delete ICONS;
}

function RENDER_MENU_STRUCTURE(display_name, logo, desc, group, section_tag, section) {
    var MENU_BAR = "";
    if (section == "section") {
		
        MENU_BAR = '<li class="_tree_child tree_child selected"><a class="cursor" onclick="javascript:make_active();unhide(\'' + section_tag + '\',\'section\');"><i class="fa ' + logo + '"></i><span class="child-color">' + display_name + '</span></a><span onclick="SHOW_DESC_DETAILS(\'_desc_' + section_tag + '\')" class="fa fa-info-circle show_desc"></span></li>';		
		
        $('#_desc').append('<div id="_desc_' + section_tag + '" class="hidden" >' + desc + '</div>');
		
	} else {

        MENU_BAR = '<li class="tree_child _desc_' + section_tag + '"><a href="#" class="cursor"><i class="fa ' + logo + '"></i><span>' + display_name + '</span><span onclick="SHOW_DESC_DETAILS(\'_desc_' + section_tag + '\')" class="fa fa-info-circle show_desc view_desc"></span></a><ul class="treeview-menu" id="' + section_tag + '"></ul></li>';
		
        $('#_desc').append('<div id="_desc_' + section_tag + '" class="hidden" >' + desc + '</div>');		
	}
	
    $("#" + group).append(MENU_BAR);
    delete MENU_BAR;
}

function make_active() {
    //prompt which section yopu are in
    $("._tree_child").click(function () {
        $("._tree_child").removeClass("active");
        $(this).addClass("active");
	})
}

function SHOW_DESC_DETAILS(desc_view) {
    $('#_desc .unhide').each(function () {
        $(this).toggleClass('unhide hidden');
	});
	if (desc_view === "desc_subscription")
		desc_view = "subscription";
	
    $("#" + desc_view).toggleClass('hidden unhide');
    $("#" + desc_view + " > div").removeClass('hidden');
}

function save_policies(id, handler, type, section, subsection, view_id) {
	
	split_id = id.split("_");
	
    if(view_id){
		put_log('submiting the rule '+view_id);
		status_log('Saving rule');
		$('#'+view_id).removeClass('hidden');
		$('#'+view_id.replace('_view','')).addClass('hidden');
		
		$('#'+view_id).css('text-align','center');
		$('#'+view_id).css('padding', '0 45%');
		$('#'+view_id).html('<span style="display:inline-block"><i class="fa fa-circle-o-notch fa-spin" style="font-size:2em"></i><h6>Saving Rule...</h6></span>');
	}
	
    var FIELD_array = id.toString().split(',');
    var FIELD_TYPE = type.toString().split(',');
    DATA = "";
	
    if (id != "null") {
        for (j = 0; j < FIELD_array.length; j++) {
			
            if ($('#' + FIELD_array[j]).hasClass("ms-ctn")) {
				
                if (FIELD_TYPE[j] === "STRING_SELECT_MANY") {
					
                    var FIELD_ENT = $("input[name='" + FIELD_array[j] + "[]']").map(function () {
                        return $(this).val();
					}).get();
                    
					if (FIELD_ENT != "") {
                        var str_array = FIELD_ENT.toString().split(',');
					} else {
                        var str_array = [];
					}
                    
					for (m = 0; m < str_array.length; m++) {
                        DATA += "F" + j + "_" + str_array[m] + "=on&";
					}
					
				} else {
                    var FIELD_value = $("input[name='" + FIELD_array[j] + "[]']").map(function () {
                        return $(this).val();
					}).get();
					
                    DATA += "F" + j + "=" + encodeURIComponent(FIELD_value) + "&";
					
				}
			} else {
                if (FIELD_TYPE[j] === "STRING_RANGE") {
                    FIELD_value1 = $("input[name='" + FIELD_array[j] + "_from[]']").map(function () {
                        return $(this).val();
					}).get();
					
                    FIELD_value2 = $("input[name='" + FIELD_array[j] + "_to[]']").map(function () {
                        return $(this).val();
					}).get();
					
                    DATA += "F" + j + "_active=on&";
                    DATA += "F" + j + "=" + FIELD_value1 + "&";
                    DATA += "F" + j + "_2=" + FIELD_value2 + "&";
					
				} else if (FIELD_TYPE[j] === "INT_RANGE") {
                    FIELD_value1 = $('#' + FIELD_array[j] + "_from").val()
                    FIELD_value2 = $('#' + FIELD_array[j] + "_to").val()
                    DATA += "F" + j + "_active=on&";
                    DATA += "F" + j + "=" + FIELD_value1 + "&";
                    DATA += "F" + j + "_2=" + FIELD_value2 + "&";
					
				} else {
                    var FIELD_value = $('#' + FIELD_array[j]).val();
                    DATA += "F" + j + "=" + encodeURIComponent(FIELD_value) + "&";
				}
			}
		}
	}
	
    DATA += "handler=configuration&";
    DATA += handler;
	
	dee = {};
	if( split_id[0] == "delete"){
		dee["id"] = id;
		dee["handler"] = handler; 
		dee["type"] = type; 
		dee["section"] = section;
		dee["subsection"] = subsection;
		dee["view_id"] = view_id;
		
		Show_modal("delete", dee)	
		return;
	}
	
    jQuery.ajax({
        type: "POST",
        url: $.ssquid.params.url,
        data: DATA,
        cache: false,
        dataType: "xml",
        success: function (response) {
            if (response) {
                status_log('Action Started');
                $xmlconf_call = $($.get_structure($.ssquid.params.handler.config_xml, true));
                if ($xmlconf_call.text())
				$xmlconf = $xmlconf_call;
				
                delete $xmlconf_call;
				
                unhide(section, "section", "_details");
				
                if (subsection) {
                    $("#option_section_" + section + "_" + subsection).trigger("click");
                    $('#search_rule_' + id).trigger("click");
				}
				
                STRING_LIST_STORAGE = [];
                MAGIC_SUGGEST_DETAIL = [];
				
				show_rule = readCookie('rule_info');
				
				if(show_rule){
					goto_div(show_rule);
					eraseCookie('rule_info');
					divID_chk = "";
				}
			}
            status_log('Action Completed');
		},
        error: function () {
            console.log("Could not send data " + DATA);
            status_log('Could not complete the action');
		}
	});
	
    if ($('._new_policy').hasClass("hidden")) {
        $('._new_policy').removeClass("hidden");
	}
	
	createCookie('rule_info', view_id, '0.1') ;
}

function RENDER_MENU() {
    var $xml_structure = $xmlsection.find($.ssquid.params.root_tag);
    $xml_structure.children().each(function (i) {
        SECTION_TAG = $(this)[0].nodeName;
        ENABLE_SECTION = $(this).find($.ssquid.params.section.enabled_tag).eq(0).text();
		
        if (ENABLE_SECTION === "true") {
            DISPLAY_LOGO = $(this).find($.ssquid.params.section.logo_tag).eq(0).text();
            DISPLAY_NAME = $(this).find($.ssquid.params.section.display_name_tag).eq(0).text();
            DESC = $(this).find($.ssquid.params.section.desc_tag).eq(0).text();
            GROUP = $(this).find($.ssquid.params.section.parent_tag).eq(0).text();
            SOURCE_TYPE = $(this).find($.ssquid.params.section.type_tag).eq(0).text();
            SOURCE_WIZARD = $(this).find($.ssquid.params.section.wizard_tag).eq(0).text();
            SOURCE_FLAG = $(this).find($.ssquid.params.section.rwd_flag_tag).eq(0).text();
			
            if (SOURCE_FLAG != "0") {
				
                SECTIONS_PARAMS.push({
                    "display_name": DISPLAY_NAME,
                    "logo": DISPLAY_LOGO,
                    "desc": DESC,
                    "group": GROUP,
                    "type": SOURCE_TYPE,
                    "wizard": SOURCE_WIZARD,
                    "flag": SOURCE_FLAG,
                    "section_tag": SECTION_TAG
				});
				
                if (GROUP == "quick-icon") {
                    var SOURCE_RENDER = $(this).find($.ssquid.params.section.render_option).eq(0).text();
                    RENDER_QUICK_ICON(DISPLAY_NAME, DISPLAY_LOGO, SECTION_TAG, DESC, SOURCE_RENDER);
				}
				
                //for section list which is to be used for search
                if (SOURCE_TYPE == "section")
					SECTIONS.push(SECTION_TAG);
			}
		}
	});
	
    for (i = 0; i < SECTIONS_PARAMS.length; i++) {
        if (SECTIONS_PARAMS[i].type == "group") {
            RENDER_MENU_STRUCTURE(SECTIONS_PARAMS[i].display_name, SECTIONS_PARAMS[i].logo, SECTIONS_PARAMS[i].desc, SECTIONS_PARAMS[i].group, SECTIONS_PARAMS[i].section_tag, "MENU");
		}
		
        if ((SECTIONS_PARAMS[i].group != "") && (SECTIONS_PARAMS[i].type != "group")) {
            RENDER_MENU_STRUCTURE(SECTIONS_PARAMS[i].display_name, SECTIONS_PARAMS[i].logo, SECTIONS_PARAMS[i].desc, SECTIONS_PARAMS[i].group, SECTIONS_PARAMS[i].section_tag, "section");
		}
	}
	
    //get subscription details
    activation_refresh('false');
    delete $subscriptionxml;
    delete key;
    delete DISPLAY_LOGO;
    delete DISPLAY_NAME;
    delete DESC;
    delete GROUP;
    delete SOURCE_TYPE;
    delete SOURCE_WIZARD;
    delete SOURCE_FLAG;
}

function save_config($cld_bkp = "yes", $restart_chk = "no") {
    var SAVEXML = $.getValues($.ssquid.params.handler.save);
    var $save = $(SAVEXML);
    status_log('Saving Configuration file');
    $xml_subsrciption = $save.find('save_settings').find('results');
    var result = GET_ATTR($xml_subsrciption, 'result');
    $("#save_icon").hide();
	
    if ($cld_bkp == "yes") {
        if (result === "File saved") {
			
            var $content_dialog = '<p>Backup current configuration, to cloud?</p>';
            $content_dialog += '<div id="dialog_radio_option">';
            $content_dialog += '<label class="radio-inline"><input type="radio" name="optradio" value="yes" checked>Yes</label>';
            $content_dialog += '<label class="radio-inline"><input type="radio" name="optradio" value="no" >No</label>';
            $content_dialog += '</div>';
			
            $('.ui-dialog-titlebar-close').html('X');
            $('#dialog_prompt').html($content_dialog);
			
            $("#dialog_prompt").dialog({
                buttons: {
                    "Submit": function () {
                        $(this).dialog("close");
                        filterDay = $('#dialog_radio_option input:radio:checked').val()
						
                        if (filterDay == "yes") {
                            SAVEXML = $.getValues($.ssquid.params.handler.cloud_backup);
                            $save = $(SAVEXML);
                            $xml_subsrciption = $save.find('cloud_backup').find('results').attr('result');
                            status('Cloud Backup success');
                            $("#show_save_msg").html("<p class='alert file_success'>" + $xml_subsrciption + "</p>");
                            $("#show_save_msg").show().delay(1000).fadeOut();
							
						} else {
                            //status_log('File saved on disk');
                            put_log('did not take backup');
						}
						
                        if ($restart_chk == "restart") {
                            restart_now();
						}
						
					},					
				}
			});
			
			
			
            $("#show_save_msg").html("<p class='alert file_success'>" + result + "</p>");
            status_log('Configuration File saved');
            $("#show_save_msg").show().delay(1000).fadeOut();
            $("#dialog_prompt").dialog("open");
			
			
		} else {
            status_log('Failed to save Configuration file');
            $("#show_save_msg").html("<p class='alert file_failed'>" + result + "</p>");
            $("#show_save_msg").show().delay(1000).fadeOut();
		}
		
	}
	
    setTimeout(function () {
        $("#save_icon").show()
	}, 1400);
	
	
	
    delete SAVEXML;
    delete $save;
    delete $xml_subsrciption;
    delete result;
}

function GENERATE_INPUT(input_type, input_value, id, input_name, name_desc) {
    status_log('Generate Input');
    var field = "";
    switch (input_type) {
        case "BOOL":
			field = '<input name="' + input_name + '" id="' + id + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control BOOL input_detail"  placeholder="Not specified" onfocus="this.blur()" readonly/>';
		break;
		case "IP_RANGE_LIST":
        case "MULTILINE_STRING":
			field = "<textarea class='form-control MULTILINE_STRING input_detail' id='" + id + "' name='" + input_name + "' onclick='SHOW_DESC_DETAILS(\"" + name_desc + "\")' disabled>" + input_value + "</textarea>";
		break;
        case "INT":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control INT input_detail" placeholder="Not specified" disabled/>';
		break;
        case "UINT":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control UINT input_detail" placeholder="Not specified" disabled/>';
		break;
        case "DOUBLE":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control DOUBLE input_detail" placeholder="Not specified" disabled/>';
		break;
        case "UNIQUE_ID":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control UNIQUE_ID input_detail" placeholder="Not specified" disabled/>';
		break;
        case "FILE_SIZE":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control input_detail" placeholder="Not specified" disabled/>';
		break;
        case "LONG_FILE_SIZE":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control FILE_SIZE input_detail" placeholder="Not specified" disabled/>';
		break;
        case "IP_RANGE_LIST_X":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control IP_RANGE_LIST input_detail" placeholder="Not specified" disabled/>';
		break;
        case "PORT_RANGE_LIST":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control PORT_RANGE_LIST input_detail" placeholder="Not specified" disabled/>';
		break;
        case "STRING":
			field = '<input name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control STRING input_detail" placeholder="Not specified" disabled/>';
		break;
        case "STRING_SELECT_ONE":
			field = '<input name="' + input_name + '" id="' + id + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control STRING_SELECT_ONE input_detail" placeholder="Not specified" onfocus="this.blur()" readonly/>';
		break;
        case "STRING_SELECT_MANY":
			field = '<input name="' + input_name + '" id="' + id + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control STRING_SELECT_MANY input_detail" placeholder="Not specified" onfocus="this.blur()" readonly/>';
		break;
        case "STRING_LIST":
			field = '<input name="' + input_name + '" id="' + id + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control STRING_LIST input_detail" placeholder="Not specified" onfocus="this.blur()" readonly/>';
		break;
        case "signature":
			field = '<input name="' + input_name + '" id="' + id + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control signature input_detail" placeholder="Not specified" onfocus="this.blur()" readonly/>';
		break;
        case "password":
			field = '<input type="password" name="' + input_name + '" id="' + id + '" value="' + input_value + '" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control password input_detail" placeholder="Generate Password" readonly/>';
		break;
		case "STRING_RANGE":
			field = '<div id="' + id + '" style="display: inherit;width:100%">';
			field += '<input name="' + input_name + '_from" id="' + id + '_from" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control STRING_RANGE input_detail from" placeholder="From" onfocus="this.blur()" readonly/>';
			field += '<input name="' + input_name + '_to" id="' + id + '_to" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control STRING_RANGE input_detail to" placeholder="To" onfocus="this.blur()" readonly/>';
			field += '</div>';
		break;
        case "INT_RANGE":
			value = input_value.toString().split(',');
			field = '<div id="' + id + '" style="display: inherit;width:100%">';
			field += '<input name="' + input_name + '_to" id="' + id + '_from" value="' + value[0] + '" onblur="empty_checker(this.value,this.id,' + value[0] + ')" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control INT_RANGE input_detail from" placeholder="from" disabled/>';
			field += '<input name="' + input_name + '_to" id="' + id + '_to" value="' + value[1] + '" onblur="empty_checker(this.value,this.id,' + value[1] + ')" onclick="SHOW_DESC_DETAILS(\'' + name_desc + '\')" class="form-control INT_RANGE input_detail to" placeholder="to" disabled/>';
			field += '</div>';
		break;
	}
    return field;
}
function urldecode_(val)
{
	if(typeof val !== "undefined" ){
		val=val.replace(/\+/g, '%20');
		var str=val.split("%");
		var cval=str[0];
		for (var i=1;i<str.length;i++) {
			cval+=String.fromCharCode(parseInt(str[i].substring(0,2),16))+str[i].substring(2);
		}
	} else {
		cval = null;
	}
	return cval;
}

function _urldecode_(val)
{
	if(typeof val !== "undefined" ){
		val=val.replace(/\+/g, '%20');
		var str=val.split("%");
		var cval=str[0];
		for (var i=1;i<str.length;i++) {
			cval+=String.fromCharCode(parseInt(str[i].substring(0,2),16))+str[i].substring(2);
		}
	} else {
		cval = null;
	}
	return cval;
}



function urldecode(val)
{
	return val;
}

function MAKE_JSON_DATA(name, desc, value) {
    var r = [];
    for (var i = 0; i < name.length; i++) {
        if (name[i] != "") {
            r.push({
                "name": name[i],
                "desc": desc[i],
                "value": value[i]
			});
		}
	}
    return r;
}

function getNames(obj, name) {
    var result = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if ("object" == typeof (obj[key])) {
                getNames(obj[key], name);
				} else if (key == name) {
                result.push(obj[key]);
			}
		}
	}
    return result;
}

function DOWNLOAD_PDF() {
    var content = "";
    var tr = PDF_DATA;
    var doc = new jsPDF('p', 'pt');
	
    doc.fromHTML(tr);
    doc.save('Reports.pdf');
}

function MAKE_PAGE(section, type_show) {
	
    //make empty previous data
    $('#_desc ._section_desc').html("");
    $('#' + type_show + ' ._section_content ul').html("");
    $('#' + type_show + ' ._section_content ._tab_content').html("");
	
    DATASTORE = [];
	
    put_log("MAKE_PAGE: " + " started making content for " + section + " length of global: " + DATASTORE.length);
	
    var SELECTARRAY = [];
    var RENDER_DATA = "";
	
    var $section_tag = $xmlsection.find($.ssquid.params.root_tag).children(section);
    var DISPLAY_NAME = $section_tag.find($.ssquid.params.section.display_name_tag).eq(0).text();
    var LOGO_NAME = $section_tag.find($.ssquid.params.section.logo_tag).eq(0).text();
    var APP_TYPE = $section_tag.find($.ssquid.params.section.type_tag).eq(0).text();
    var section_desc = "<div class='section_desc_body'>" + $section_tag.find($.ssquid.params.section.desc_tag).eq(0).text() + "</div>";
    status_log('Started making content for '+DISPLAY_NAME);
    $('#section_header').html(section_desc);
	
    var TAB_HEADING = "";
    var TAB_BODY = "";
	
    active = 0
    //Make Tabs
    status_log('Started Rendering '+DISPLAY_NAME);
    var CHECK_GLOBAL = $section_tag.children($.ssquid.params.section.global_defn).find($.ssquid.params.section.display_name_tag);
    if (CHECK_GLOBAL.length > 0) {
        var desc_now = 'desc_' + section + '_global';
		
        var SECTION_NM = "global_" + section;
        TAB_HEADING += '<li class="active"><a onclick="SHOW_DESC_DETAILS(\'' + desc_now + '\')" href="#' + SECTION_NM + '" data-toggle="tab">Global</a></li>';
        TAB_BODY += '<div class="tab-pane fullHeight fullWidth global_entry active" id="' + SECTION_NM + '"></div>';
		
        var sec_name_ = $section_tag.find($.ssquid.params.section.global_defn).children($.ssquid.params.section.desc_tag).length;
		
        if (sec_name_ > 0) {
            var sec_name = $section_tag.find($.ssquid.params.section.global_defn).children($.ssquid.params.section.desc_tag).text();
		} else {
            var sec_name = $section_tag.find($.ssquid.params.section.desc_tag).eq(0).text();
		}
		
        $('#_desc ._section_desc').append("<div id=" + desc_now + " class='hidden' ><div>" + sec_name + "</div></div>");
	}
	
    var CHECK_SUBSECTION = $section_tag.children($.ssquid.params.section.subsecton_defn).children();
	
    if (CHECK_SUBSECTION.length > 0) {
        CHECK_SUBSECTION.each(function () {
            var CLASS = "";
            if ((CHECK_GLOBAL.length == 0) && (active == 0)) {
                CLASS = "active";
				} else {
                CLASS = "";
			}
			
            var SUBSECTION_NAME = $(this).find($.ssquid.params.section.display_name_tag).text();
            var SUBSECTION_ENABLE = $(this).find($.ssquid.params.section.enabled_tag).text();
            var ONCLICK_FUNCTION = $(this).find($.ssquid.params.section.function_name).text();
            var SUBSECTION_PARENT = $(this).find($.ssquid.params.section.parent_tag).text();
            var TEMPLATE = $(this).find($.ssquid.params.section.template_defn).text();
            var SUBSECTION_TAG = $(this).get(0).tagName;
			
            var SECTION_NM = "section_" + SUBSECTION_TAG + "_" + section;
			
            var desc_now = 'desc_' + section + '_' + SUBSECTION_TAG;
			
            if (SUBSECTION_ENABLE != "false") {
				
                $('#_desc ._section_desc').append("<div id=" + desc_now + " class='hidden' ><div class='desc_heading'>" + $(this).find($.ssquid.params.section.display_name_tag).eq(0).text() + "</div>" + $(this).find($.ssquid.params.section.desc_tag).text() + "</div>");
				
                TAB_HEADING += '<li class="' + CLASS + '"><a id="option_section_' + section + '_' + SUBSECTION_TAG + '" href="#' + SECTION_NM + '" data-toggle="tab" ' + ONCLICK_FUNCTION + ' onclick="SHOW_DESC_DETAILS(\'' + desc_now + '\')">' + SUBSECTION_NAME + '</a></li>';
                TAB_BODY += '<div class="tab-pane fullHeight fullWidth ' + CLASS + '" id="' + SECTION_NM + '"></div>';
                active = active + 1;
				
			}
			
		});
	}
	
    $('#' + type_show + ' ._section_content ._nav_tabs').append(TAB_HEADING);
    $('#' + type_show + ' ._section_content ._tab_content').append(TAB_BODY);
	
    delete TAB_HEADING;
    delete TAB_BODY;
    delete active;
	
    if (CHECK_GLOBAL.length > 0) {
        var SECTION_NM = "global_" + section;
        var GLOBAL_ENTRIES = [];
        var GLOBAL_TYPES = [];
        var RENDER_DATA_1 = "";
        var RENDER_DATA = "";
        status_log('Started making content for Global section');
		
        $section_tag.children($.ssquid.params.section.global_defn).children().each(function () {
            input_type = $(this).find('type').eq(0).text();
            input_value = $xmlconf.find(section).children($(this).get(0).tagName).eq(0).text();
			input_value_ori = $(this).find('value').eq(0).text();;
            id = "" + section + "_" + ($(this).get(0).tagName) + "_global";
            input_name = id;
            name_desc = section + '_' + ($(this).get(0).tagName) + '_global_desc'
            var RESOURCE_VALUE = [];
            GLOBAL_ENTRIES.push(id);
            GLOBAL_TYPES.push(input_type);
            $('#_desc ._section_desc').append("<div id=" + name_desc + " class='hidden' ><div class='desc_heading'>" + $(this).find($.ssquid.params.section.display_name_tag).eq(0).text() + "</div><br>" + $(this).find($.ssquid.params.section.desc_tag).text() + "</div>");
            //DATA_CONTAINER = $(this).find('suggestion').eq(0).text();
            INPUT_DATA = GENERATE_INPUT(input_type, input_value, id, input_name, name_desc);
            RENDER_DATA_1 += '<div class="_form-group"><div class="label_input">' + $(this).find($.ssquid.params.section.display_name_tag).eq(0).text() + '<span  class="fa fa-info-circle show_desc" onclick="SHOW_DESC_DETAILS(\'' + section + '_' + ($(this).get(0).tagName) + '_global_desc\')" ></span></div>' + INPUT_DATA + '</div>';
			
			SUGGEST = false;
			_DEFAULT_VALUE_ = null;
			json_data_fin = {};
			input_value_ = [];
			
			if ((input_type == "BOOL") || (input_type == "STRING_SELECT_ONE")) {
				SUGGEST = true;
				MAX_SELECTION = 1 ;
				NEG = "";
				GROUP_BY = null;
				SORT_BY = "\"_4\"";
				input_value_.push(input_value)
			}
			
			if(SUGGEST){
				
				if( (typeof DATASTORE[input_value_ori] == "undefined") ){
					uniqlist = "section="+section+"&subsection="+$.ssquid.params.section.global_defn+"&value="+input_value_ori+NEG;
					json_data = $($.getJSON($.ssquid.params.handler.list_handler + uniqlist));
					put_log(JSON.stringify(json_data));
					
					DATASTORE[input_value_ori] = json_data;
				} else {
					json_data = DATASTORE[input_value_ori];
				}
				
				json_data_fin = JSON.stringify(json_data[0]["_d"]);
				
				if(input_value)
					_DEFAULT_VALUE_ = JSON.stringify(input_value_);
				
				RENDER_DATA_1 += '<script>var ms = $("#' + id + '").magicSuggest({ data: ' + json_data_fin + ',displayField : "_0", valueField : "_1" ,  expandOnFocus: true, hideTrigger: true, resultAsString: true, editable : true, allowDuplicates : false, maxSelection : '+MAX_SELECTION+' , maxSuggestions: 50 , value: '+_DEFAULT_VALUE_+', allowFreeEntries : true, groupBy : '+GROUP_BY+', sortOrder : '+SORT_BY+', selectionRenderer : function (data) { return urldecode(data._1);}, renderer : function (data) { return \'<div class="country"><div class="name">\'+urldecode(data._0)+\'</div></div>\';} });';
				
				RENDER_DATA_1 += '$("#' + id + '>.ms-helper").addClass("hidden");';
				RENDER_DATA_1 += '$(ms).on("blur", function (c) {	$(".ms-sel-item span").removeClass("ms-close-btn");	});';
				RENDER_DATA_1 += '$(ms).on("selectionchange", function (e, m) { if (this.getValue() == "" ){  this.setValue(' + _DEFAULT_VALUE_ + ');   this.setData(' + json_data_fin + ') } $(".ms-sel-item span").removeClass("ms-close-btn");});';
				RENDER_DATA_1 += '$(ms).on("focus", function (c) { SHOW_DESC_DETAILS("' + name_desc + '");});</script>'
				
			}

            var default_option = "";
			
			var show_dd = json_data_fin;
			
            if (show_dd.length > 0) {
                default_option += "<div class='desc_heading sub_heading'>Available Options</div>";
                default_option += "<ul class='list-group ul_options'>";
                default_option += build_default(show_dd, "selected", "true");
                default_option += "</ul>";
				
                $('#_desc ._section_desc #' + name_desc).append(default_option);
				
			}
			
		});
		
        var $arry = GLOBAL_ENTRIES;
        var $type = GLOBAL_TYPES;
        var GLOBAL_SET = "'section=" + section + "&action=global&handler=configuration'";
		
        RENDER_DATA += '<div class="_policy_manager autoFlex fullHeight">';
        RENDER_DATA += '<div class="policy_defination policies scrollContent">';
		
        RENDER_DATA += '<!-- remove start -->';
        RENDER_DATA += '<div id="' + section + '_global_view" class="view config_buttons hidden">';
        RENDER_DATA += '<div data-toggle="tooltip" title="Save Policy" data-placement="right" onclick="save_policies(\'' + $arry + '\',' + GLOBAL_SET + ',\'' + $type + '\',\'' + section + '\',\'\')" class="square_buttons _round_button btn-savePolicy fa fa-check-square-o"></div>';
        RENDER_DATA += '<div data-toggle="tooltip" title="Discard Changes" data-placement="right" onclick="EDIT_ZONE(\'' + section + '_global_view\',\'' + section + '_global_edit\');reset_policy(\'' + section + '_global_view\');disableSelection(\'' + $arry + '\',\'ID\');" class="square_buttons _round_button btn-closePolicy fa fa-times "></div></div>';
        RENDER_DATA += '<div id="' + section + '_global_edit" class="edit config_buttons unhide">';
        RENDER_DATA += '<div data-toggle="tooltip" title="Edit Policy" data-placement="right" onclick="EDIT_ZONE(\'' + section + '_global_edit\',\'' + section + '_global_view\');enableSelection(\'' + $arry + '\',\'ID\');" class="square_buttons _round_button btn-editPolicy fa fa-pencil-square-o"></div></div>';
        RENDER_DATA += '<!-- remove end -->';
        RENDER_DATA += '<div class="entry">';
		
        RENDER_DATA += RENDER_DATA_1;
        RENDER_DATA += '</div>';
        RENDER_DATA += '</div></div>';
        $('#' + SECTION_NM).html(RENDER_DATA);
        disableSelection($arry);
        status_log('Completed Rendering Global section');
        delete RENDER_DATA_1;
        delete RENDER_DATA;
        delete $arry;
        delete SECTION_NM;
        delete GLOBAL_ENTRIES;
        delete GLOBAL_TYPES;
		
	}
	
    if (CHECK_SUBSECTION.length > 0) {
        section_xml = 1;
        $section_tag.children("subsection").children().each(function () {
            var SUBSECTION_NAME = $(this).find($.ssquid.params.section.display_name_tag).text();
            var SUBSECTION_PARENT = $(this).find($.ssquid.params.section.parent_tag).text();
            var TEMPLATE = $(this).find($.ssquid.params.section.template_defn).text();
            var SUBSECTION_TAG = $(this).get(0).tagName;
            var RENDER_DATA = "";
            var SECTION_NM = "section_" + SUBSECTION_TAG + "_" + section;
            status_log('Started making content for '+SUBSECTION_NAME);
			
            if (SUBSECTION_PARENT == "inherit") {
				
                if ($(this).find($.ssquid.params.section.type_tag).text() == "app") {
					
                    var $subsectiontemplate = $section_tag.children("subsection").children(SUBSECTION_TAG).find($.ssquid.params.section.template_defn).text();
                    RENDER_DATA += '<div class="_policy_manager scrollContent autoFlex fullHeight">';
                    RENDER_DATA += '<!-- Find Me 530 -->';
                    RENDER_DATA += $section_tag.find($.ssquid.params.section.template_defn).children($subsectiontemplate).text();
                    RENDER_DATA += '</div></div>';
					
				} else {
                    CHECK_RULE_AVAIL = $xmlconf.find(section).children(SUBSECTION_TAG);
                    //put_log(CHECK_RULE_AVAIL.text());
					
                    var policy_content = "";
                    policy_content += '<div class="_policy_manager scrollContent autoFlex fullHeight" id="policy_manager_' + SUBSECTION_TAG + '">';
                    policy_content += '<!-- Find Me 537 -->';
					
                    if (CHECK_RULE_AVAIL.length > 0) {

						for (i = 0; i < CHECK_RULE_AVAIL.length; i++) {
							
                            content_data = CHECK_RULE_AVAIL.eq(i);
                            rule_id = content_data.attr("id");
							
                            var MOVE_TOP = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=top'";
                            var MOVE_UP = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=up'";
                            var MOVE_DOWN = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=down'";
                            var MOVE_BOTTOM = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=bottom'";
							
                            var CLONE_SET = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=clone'";
                            var DELETE_SET = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=delete'";
							
                            policy_content += '<div class="policies"><div  id="rule_' + rule_id + '_view" class="unhide edit_button fullWidth"><div class="config_buttons">';
							
                            policy_content += '<div class="square_buttons _round_button btn-editPolicy  fa fa-pencil-square-o" data-placement="right" onclick="edit_content(\'' + rule_id + '\',\'' + section + '\',\'' + SUBSECTION_TAG + '\',\'' + TEMPLATE + '\',\'rule_' + rule_id + '_view\',\'rule_' + rule_id + '\');goto_div(\'config_' + rule_id + '\');" data-toggle="tooltip" title="Edit Policies"></div>';
							
                            policy_content += '<div class="square_buttons _round_button btn-delPolicy  fa fa-trash" data-placement="right" onclick="save_policies(\'delete_' + rule_id + '\',' + DELETE_SET + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')" data-toggle="tooltip" title="Delete Policies"></div>';
							
                            policy_content += '<div data-toggle="tooltip" title="Clone it" data-placement="right" onclick="save_policies(\'null\',' + CLONE_SET + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')" class="square_buttons _round_button btn-clonePolicy  fa fa-clone"></div>';
							
                            policy_content += '</div><div class="entry">';
                            //$section_tag.children("subsection").find(TEMPLATE).children().each(function () {
							
                            $xmlsection.find(section).find($.ssquid.params.section.template_defn).find(TEMPLATE).children().each(function (m) {
								
                                $type_defn = $(this).find($.ssquid.params.section.type_tag).text();
								
                                $data_show_value = content_data.children($(this).get(0).tagName).text();
								
								$manish_encoded = 0;
								
                                if ($data_show_value) {
									
                                    if (($type_defn === "STRING_LIST") || ($type_defn === "STRING_SELECT_MANY") || ($type_defn === "STRING_RANGE") || ($type_defn === "INT_RANGE")) {
                                        $data_show_value = "";
                                        $data_show_render = content_data.children($(this).get(0).tagName).text().split(',');
                                        $string_val = $data_show_render.length;
                                        
										for ($h = 0; $h < $string_val; $h++) {
											
                                            $data_show_value += '<span class="list_item">';
                                            //$data_show_value += $data_show_render[$h];
											// $data_show_value += urldecode($data_show_render[$h]);
											$data_show_value += urldecode($data_show_render[$h]).replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; });
                                            $data_show_value += '</span> ';
											$manish_encoded = 1;
											
										}
										
                                        $data_show_render = [];
										
									} 
								} else
									return;
								
                                if (content_data.children($(this).get(0).tagName).text() != "") {
                                    policy_content += '<div class="_form-group col-lg-12 col-md-12 col-xs-12">';
                                    policy_content += '<div class="label_input col-lg-2 col-md-2 col-xs-2" >' + $(this).find($.ssquid.params.section.display_name_tag).text() + '<span onclick="SHOW_DESC_DETAILS(\'' + section + '_' + SUBSECTION_TAG + "_" + ($(this).get(0).tagName) + '_desc\')" class="fa fa-info-circle show_desc"></span></div>';
									
                                    policy_content += '<div class="details_search col-lg-10 col-md-10 col-xs-10">';
									if ($manish_encoded == 0)
										policy_content += $data_show_value.replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#'+i.charCodeAt(0)+';'; });
									else
									//	policy_content += $data_show_value;
									policy_content += urldecode($data_show_value);
                                    policy_content += '</div>';
                                    policy_content += '</div>';
									
								}
							});
							
                            policy_content += '</div>';
							
                            policy_content += "<div class='config_buttons'>";
                            policy_content += '<div class="square_buttons _round_button bg-gray fa fa-arrow-circle-o-up" data-placement="left" onclick="save_policies(\'null\',' + MOVE_TOP + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')"  data-toggle="tooltip" title="Move top"></div>';
                            policy_content += '<div class="square_buttons _round_button bg-gray  fa fa-sort-up" data-placement="left" onclick="save_policies(\'null\',' + MOVE_UP + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')" data-toggle="tooltip" title="Move up"></div>';
                            policy_content += '<div class="square_buttons _round_button bg-gray  fa fa-sort-down" data-placement="left" onclick="save_policies(\'null\',' + MOVE_DOWN + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')" data-toggle="tooltip" title="Move down"></div>';
                            policy_content += '<div  class="square_buttons _round_button bg-gray  fa fa-arrow-circle-o-down" data-placement="left" onclick="save_policies(\'null\',' + MOVE_BOTTOM + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')" data-toggle="tooltip" title="Move Bottom"></div></div>';
							
                            policy_content += '</div>';
                            policy_content += '<div id="rule_' + rule_id + '" class="hidden">';
                            policy_content += '</div></div>';
							
						}
					}
					
					
					
                    $xmlsection.find(section).find($.ssquid.params.section.template_defn).find(TEMPLATE).children().each(function () {

						var name_desc = section + "_" + SUBSECTION_TAG + "_" + ($(this).get(0).tagName) + "_desc";
                        $('#_desc ._section_desc').append("<div id=" + name_desc + " class='hidden' ><div class='desc_heading'>" + $(this).find($.ssquid.params.section.display_name_tag).text() + "</div><div class='desc_body'>" + $(this).find($.ssquid.params.section.desc_tag).text() + "</div></div>");
						
                        if ($(this).find('type').text() != "STRING_LIST") {
							
                            var name_desc = section + "_" + SUBSECTION_TAG + "_" + ($(this).get(0).tagName) + "_desc";
                            var $content_default = $(this).find('suggestion').eq(0).text();
                            var default_option = "";
                            var shhh = $content_default.replace(/[[\]]/g, '');
                            var contet = '[' + shhh + ']';
                            var show_dd = JSON.parse(contet);
							
                            if (show_dd.length > 0) {
                                default_option += "<div class='desc_heading sub_heading'>Available Options</div>";
                                default_option += "<ul class='list-group ul_options'>";
                                default_option += build_default(show_dd, "selected", "true");
                                default_option += "</ul>";
								
                                $('#_desc ._section_desc #' + name_desc).append(default_option);
							}
						}
					});
                    policy_content += '</div>';
                    policy_content += '<div class="new_policy_setup fullHeight fullWidth new_policy" >';
                    policy_content += '<div  id="new_button_' + SUBSECTION_TAG + '" >';
                    policy_content += '<button data-toggle="tooltip" title="Add New" onclick="EDIT_ZONE(\'\',\'' + section + '_' + SUBSECTION_TAG + '_new_policy\');EDIT_ZONE(\'new_button_' + SUBSECTION_TAG + '\',\'policy_manager_' + SUBSECTION_TAG + '\');make_content(\'new_rule\', \'' + section + '\', \'' + SUBSECTION_TAG + '\', \'' + TEMPLATE + '\')" class="square fa fa-plus"></button>';
                    policy_content += '</div>';
                    policy_content += '<div id="' + section + '_' + SUBSECTION_TAG + '_new_policy" class="_new_policy scrollContent fullHeight fullWidth hidden"></div>';
                    policy_content += '</div>';
                    RENDER_DATA += policy_content;
                    RENDER_DATA += '</div>';
				}
			}
            $('#' + SECTION_NM).html(RENDER_DATA);
            status_log('Completed making content for '+SUBSECTION_NAME);
            delete RENDER_DATA;
            delete policy_content;
            section_xml = section_xml + 1;
		});
	}
    if (section == "utilities")
	$(".nav-justified li").remove(); // To Remove Support Tab in support section
    put_log("MAKE_PAGE: " + " completed making content for " + section);
    status_log('Completed Rendering '+DISPLAY_NAME);
}

function build_default(JSON_DATA_, searchField, searchVal) {
	JSON_DATA = JSON.parse(JSON_DATA_);
	
    var results = "";
	
    if (isJSON(JSON_DATA)) {
        for (var i = 0; i < JSON_DATA.length; i++) {
            if (JSON_DATA[i][searchField] == searchVal) {
                results += "<p class='option_desc'>" + urldecode(JSON_DATA[i]._0) + "</p></li>";
			} else {
                results += "<p class='option_desc'>" + urldecode(JSON_DATA[i]._0) + "</p></li>";
			}
		}
	} else {
        results.push("not JSON");
	}
	
    return results;
	
}

function edit_content(rule_id, section, SUBSECTION_TAG, TEMPLATE, rule_view, edit_view) {
    EDIT_ZONE(rule_view, edit_view);
	
    if ($('#' + edit_view).find('._tab-content').length == 0)
		make_content(rule_id, section, SUBSECTION_TAG, TEMPLATE);
	
}

function JSONize(str) {
    return str
	// wrap keys without quote with valid double quote
	.replace(/([\$\w]+)\s*:/g, function (_, $1) {
		return '"' + $1 + '":'
	})
	// replacing single quote wrapped ones to double quote
	.replace(/'([^']+)'/g, function (_, $1) {
		return '"' + $1 + '"'
	})
}

function Show_modal(button, id) {
	
    if (button == "password") {
        createCookie('fieldname', id, '0.2');
        $("#_popups ._section_content").html('<div id="check"></div><div id="_encryption"><div class="col-lg-5"><input class="form-control" placeholder="type your password" type="password" id="_enc_pass"/></div><div class="col-lg-5"><input class="form-control" placeholder="confirm password" type="password"  id="_enc_cnf_pass"/></div></div><button type="button" class="btn btn-xs btn-editPolicy  col-sm-2 hidden" id="_encrypt_botton" data-dismiss="modal" onclick="encrypt()">Encrypt</button>');
		$("#_popups .modal-footer").removeClass("hidden");
        load_scripts('encrypt_password');
		
	} else if (button == "delete") {	
	
		$("#_popups #policy_setup_options").html("Delete Confirmation");
		$("#_popups ._section_content").html('<div>'+$.ssquid.params.content.del+'</div><button type="button" class="pull-right" data-dismiss="modal">Close</button><button class="pull-right" onclick="save_policies(\'cnf_'+id["id"]+'\',\''+id["handler"]+'\',\'\',\''+id["section"]+'\',\''+id["subsection"]+'\');hide_modal_p(\'_popups\')">Confirm</button>');
		$("#_popups .modal-content").addClass("alert");
		$("#_popups .modal-footer").addClass("hidden");
		$("#_popups").modal({ show: true});		
	}
	
    unhide(button, 'section', 'modal');
}

function hide_modal_p(div_id) {
	put_log(div_id);
	$("#"+div_id).modal('hide');	
}

function SHOW_MAGIC(id_name_data) {
	
    id_name = id_name_data.toString().split(',');
    
	for (i = 0; i < id_name.length; i++) {
		
        MAGIC_RESO = $.grep(MAGIC_SUGGEST_DETAIL, function (e) {
            return e.ID == id_name[i];
		});
        MAGIC_DATA = $.grep(RULE_DETAIL_DATA, function (e) {
            return e.FIELD_SOURCE == MAGIC_RESO[0].FIELD_SOURCE;
		});
		
        magicsuggest_data(MAGIC_DATA[0].DATA, MAGIC_RESO[0].VALUE, MAGIC_RESO[0].ID, MAGIC_DATA[0].TYPE, MAGIC_DATA[0].MAGIC_NAME);
	}
}

function isJSON(something) {
    if ((typeof something != 'string') && (something))
		something = JSON.stringify(something);
    try {
        JSON.parse(something);
        return true;
	} catch (e) {
        return false;
	}
}

function make_content(rule_id, section, SUBSECTION_TAG, TEMPLATE) {
    divID_chk = "";
	put_log("make_content: " + " started making content for " + rule_id);
	status_log('Making content for the rule');
    var RENDER_DATA = "";
    var SELECTARRAY = [];
    var MAGIC_SUGGEST_DETAIL = [];
    var RENDER_DATA_FIELD = "";
    var FIELD_NAME = [];
    var FIELD_TYPE = [];
    var $arry = "";
    var $type = "";
    var show_edit = "";
    var render_data_id = "";
	rule_id == "new_rule" ? render_data_id = '#' + section + '_' + SUBSECTION_TAG + '_new_policy' : render_data_id = "#rule_" + rule_id;
	$(render_data_id).css('text-align','center');
	$(render_data_id).html('<i class="fa fa-circle-o-notch fa-spin" style="font-size:2em"></i>');
	
    $xmlsection.find(section).children('select').children().each(function (i) {
        SELECTARRAY.push($(this).get(0).tagName);
	});
	
    if (rule_id == "new_rule") {
        var EDIT_SET = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&action=add'";
        //$('._new_policy').addClass("new_policy_overflow");
	} else
		var EDIT_SET = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=edit'";
	
    var DELETE_SET = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=delete'";
	
    var MOVE_TOP = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=top'";
    var MOVE_UP = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=up'";
    var MOVE_DOWN = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=down'";
    var MOVE_BOTTOM = "'section=" + section + "&subsection=" + SUBSECTION_TAG + "&id=" + rule_id + "&action=shift&direction=bottom'";
	
    $xmlsection.find(section).find($.ssquid.params.section.template_defn).find(TEMPLATE).children().each(function (i) {
        var BUTTON_SHOW = "";
        var INPUT_DATA = "";
        var DATA_CONTAINER = [];
        var input_value = "";
		var DEFAULT_VALUE = [];
        var FROM = [];
        var TO = [];
        input_type = $(this).find($.ssquid.params.section.type_tag).text();
		input_value_ori = $(this).find('value').text();
        if (rule_id != "new_rule")
			input_value = $xmlconf.find(section).find(SUBSECTION_TAG + "[id='" + rule_id + "']").children($(this).get(0).tagName).eq(0).text();
        else {
            input_value = $(this).find($.ssquid.params.section.rule_value).text();
		}
        id = section + "_" + SUBSECTION_TAG + "_" + $(this).get(0).tagName + "_" + rule_id;
        input_name = id;
        desc_content = $(this).find($.ssquid.params.section.desc_tag).text();
		
        var button = $(this).find("button").text();
        var name_desc = section + "_" + SUBSECTION_TAG + "_" + ($(this).get(0).tagName) + "_desc";
		
        if (input_value) {
            DEFAULT_VALUE = input_value.split(',');
		} else {
            DEFAULT_VALUE = null;
		}
		
		put_log('Fields: '+$(this).get(0).tagName);
		FIELD_NAME_DISPLAY = $(this).find($.ssquid.params.section.display_name_tag).text();
		status_log('Loading content for the field '+FIELD_NAME_DISPLAY);
        FIELD_NAME.push(id);
        FIELD_TYPE.push(input_type);
        if (button) {
            button_show = button.toString().split(',');
            for (j = 0; j < button_show.length; j++) {
                if (button_show[j] == "password") {
                    input_type = "password";
                    BUTTON_SHOW += '<div class="btnM cursor" data-target="#_popups" data-toggle="modal"  title="Encrypt Password" onclick="Show_modal(\'' + button_show[j] + '\',\'' + id + '\')"><i class="fa fa-paper-plane" aria-hidden="true"></i></div>';
				} else {
                    BUTTON_SHOW += '<div class="btnM cursor" data-toggle="tooltip" title="Go to ' + $xmlsection.find(button_show[j]).children('comment').eq(0).text() + '" onclick="workflow(\'' + section + '\',\'' + SUBSECTION_TAG + '\',\'' + button_show[j] + '\');unhide(\'' + button_show[j] + '\',\'section\')"><i class="fa fa-paper-plane" aria-hidden="true"></i></div>';
				}
			}
		}
        INPUT_DATA = GENERATE_INPUT(input_type, input_value, id, input_name, name_desc);
        RENDER_DATA_FIELD += '<div class="_form-group col-lg-12 col-md-12 col-xs-12">';
        RENDER_DATA_FIELD += '<div class="label_input col-lg-3 col-md-3 col-xs-3">' + $(this).find($.ssquid.params.section.display_name_tag).text() + '<span  class="fa fa-info-circle show_desc" onclick="SHOW_DESC_DETAILS(\'' + section + '_' + SUBSECTION_TAG + "_" + ($(this).get(0).tagName) + '_desc\')" ></span></div>';
        if (BUTTON_SHOW) {
            RENDER_DATA_FIELD += '&nbsp;<div class="col-lg-12 col-md-12 col-xs-12 flex">' + INPUT_DATA + ' &nbsp; ' + BUTTON_SHOW + '</div></div>';
		} else {
            RENDER_DATA_FIELD += '&nbsp;<div class="col-lg-12 col-md-12 col-xs-12 flex">' + INPUT_DATA + '</div></div>';
		}
		SUGGEST = false;
		_DEFAULT_VALUE_ = null;
		json_data_fin = {};
		SINGLE = 1;
		if ((input_type == "BOOL") || (input_type == "STRING_SELECT_ONE")) {
			SUGGEST = true;
			MAX_SELECTION = 1 ;
			NEG = "";
			GROUP_BY = null;
			SORT_BY = "\"_4\"";
			//DEFAULT_VALUE = null;
			
		} else if(input_type == "STRING_SELECT_MANY"){
			SUGGEST = true;
			MAX_SELECTION = null ;
			NEG = "";
			GROUP_BY = null;
			SORT_BY = "\"_4\"";
			//DEFAULT_VALUE = null;
			}else if(input_type == "STRING_LIST"){
			SUGGEST = true;
			MAX_SELECTION = null ;
			GROUP_BY = "\"_3\"";
			SORT_BY = "\"_4\"";
			NEG = "&neg=";
			var N = $(this).find('neg').text();
			if ( N == "1" ) 
				NEG += "1";
			//DEFAULT_VALUE = null;
		} else if(input_type == "STRING_RANGE") {
			SUGGEST = true;
			MAX_SELECTION = 1 ;
			GROUP_BY = "\"_3\"";
			SORT_BY = "\"_4\"";
			SINGLE = 0;
		}
		
		if(SUGGEST){
			
			if( (typeof DATASTORE[input_value_ori] == "undefined") ){
				uniqlist = "section="+section+"&subsection="+SUBSECTION_TAG+"&value="+input_value_ori+NEG;
				json_data = $($.getJSON($.ssquid.params.handler.list_handler + uniqlist));
				DATASTORE[input_value_ori] = json_data;
			} else {
				json_data = DATASTORE[input_value_ori];
			}
			
			json_data_fin = JSON.stringify(json_data[0]["_d"]);
			
			if(DEFAULT_VALUE)
				_DEFAULT_VALUE_ = JSON.stringify(DEFAULT_VALUE);
			
			if (rule_id == "new_rule") {
				DEFAULT_VALUE_ = JSON.stringify(json_data[0]["_v"]);
				if(DEFAULT_VALUE_)
				_DEFAULT_VALUE_ = DEFAULT_VALUE_;
			}
			
			if(input_type == "STRING_LIST"){
				input_neg = $(this).find('neg').text();
				put_log(input_neg);
				
				if( input_neg == 0 ) {
					
					$.each(json_data[0]["_d"], function(i, el){
						str_cmp = this["_1"];
						
						if(str_cmp) {
							
							if (str_cmp.match(/\!.*$/)) {
								json_data[0]["_d"].splice(i, 1);
							} 
						}
					});
					
					json_data_fin = JSON.stringify(json_data[0]["_d"]);
				}
				
			}
			
			if(input_type == "STRING_RANGE"){
				
				if (rule_id == "new_rule") {
					put_log("default : "+DEFAULT_VALUE_+"--"+JSON.stringify(DEFAULT_VALUE_));
					DEFAULT_VALUE = [];
					DEFAULT_VALUE.push(json_data[0]["_v"]);
					DEFAULT_VALUE.push(json_data[0]["_v"]);
					
					put_log("default : "+DEFAULT_VALUE+"--"+JSON.stringify(DEFAULT_VALUE));
				}
			}
			
			if (SINGLE == 1) {

				RENDER_DATA_FIELD += '<script>var ms = $("#' + id + '").magicSuggest({ data: ' + json_data_fin + ',displayField : "_0", valueField : "_1" ,  expandOnFocus: true, hideTrigger: true, resultAsString: true, editable : true, allowDuplicates : false, maxSelection : '+MAX_SELECTION+' , maxSuggestions: 150 , value: '+_DEFAULT_VALUE_+', allowFreeEntries : true, groupBy : '+GROUP_BY+', sortOrder : '+SORT_BY+', selectionRenderer : function (data) { return urldecode(data._1);}, renderer : function (data) { return \'<div class="country"><div class="name">\'+urldecode(data._0)+\'</div><div style="clear:both;"></div><div class="prop"></div></div>\';} });';
				
				RENDER_DATA_FIELD += '$("#' + id + '>.ms-helper").addClass("hidden");';
				RENDER_DATA_FIELD += '$(ms).on("blur", function (c) {	$(".ms-sel-item span").removeClass("ms-close-btn");	});';
				
				RENDER_DATA_FIELD += '$(ms).on("focus", function (c) { SHOW_DESC_DETAILS("' + name_desc + '");});</script>';
				
			} else {
				
				RENDER_DATA_FIELD += '<script>var ms = $("#' + id + '_from").magicSuggest({ data: ' + json_data_fin + ',displayField : "_0", valueField : "_1" ,  expandOnFocus: true, hideTrigger: true, resultAsString: true, editable : true, allowDuplicates : false, maxSelection : '+MAX_SELECTION+' , maxSuggestions: 50 , value: ["'+DEFAULT_VALUE[0]+'"], allowFreeEntries : true, groupBy : '+GROUP_BY+', sortOrder : '+SORT_BY+', selectionRenderer : function (data) { return urldecode(data._1);}, renderer : function (data) { return \'<div class="country"><div class="name">\'+urldecode(data._0)+\'</div><div style="clear:both;"></div><div class="prop"></div></div>\';} });';
				
				RENDER_DATA_FIELD += '$("#' + id + '_from>.ms-helper").addClass("hidden");';
				RENDER_DATA_FIELD += '$(ms).on("blur", function (c) {	$(".ms-sel-item span").removeClass("ms-close-btn");	});';				
				RENDER_DATA_FIELD += '$(ms).on("focus", function (c) { SHOW_DESC_DETAILS("' + name_desc + '");});</script>'
				RENDER_DATA_FIELD += '<script>var ms = $("#' + id + '_to").magicSuggest({ data: ' + json_data_fin + ',displayField : "_0", valueField : "_1" ,  expandOnFocus: true, hideTrigger: true, resultAsString: true, editable : true, allowDuplicates : false, maxSelection : '+MAX_SELECTION+' , maxSuggestions: 50 , value: ["'+DEFAULT_VALUE[1]+'"], allowFreeEntries : true, groupBy : '+GROUP_BY+', sortOrder : '+SORT_BY+', selectionRenderer : function (data) { return urldecode(data._1);}, renderer : function (data) { return \'<div class="country"><div class="name">\'+urldecode(data._0)+\'</div><div style="clear:both;"></div><div class="prop"></div></div>\';} });';
				
				RENDER_DATA_FIELD += '$("#' + id + '_to>.ms-helper").addClass("hidden");';
				RENDER_DATA_FIELD += '$(ms).on("blur", function (c) {	$(".ms-sel-item span").removeClass("ms-close-btn");	});';				
				RENDER_DATA_FIELD += '$(ms).on("focus", function (c) { SHOW_DESC_DETAILS("' + name_desc + '");});</script>'
			}
			
		}
	});
	
    $arry = FIELD_NAME;
    $type = FIELD_TYPE;
    //render to html as rule set
    RENDER_DATA += "<div class='policy_defination' id='defination_" + rule_id + "'>";
    RENDER_DATA += '<!-- remove start -->';
	
    show_edit = "unhide";
    RENDER_DATA += "<div id='edit_" + rule_id + "' class='config_buttons " + show_edit + "'>";
    RENDER_DATA += '<div class="square_buttons _round_button btn-savePolicy" data-placement="right" data-toggle="tooltip" title="Save Policy" onclick="save_policies(\'' + $arry + '\',' + EDIT_SET + ',\'' + $type + '\',\'' + section + '\',\'' + SUBSECTION_TAG + '\',\'rule_' + rule_id + '_view\');"><i class="fa fa-check-square-o"></i></div>';
	
    if (rule_id == "new_rule") {
		RENDER_DATA += '<div class="square_buttons _round_button btn-closePolicy" data-placement="right" data-toggle="tooltip" title="Go back"  onclick="save_policies(\'null\',' + DELETE_SET + ',\'\',\'' + section + '\',\'' + SUBSECTION_TAG + '\')"><i class="fa fa-times"></i></div>';
	} else {
        RENDER_DATA += '<div class="square_buttons _round_button btn-closePolicy  fa fa-times" data-placement="right" data-toggle="tooltip" title="Go back" onclick="EDIT_ZONE(\'rule_' + rule_id + '_view\',\'rule_' + rule_id + '\');disableSelection(\'' + $arry + '\',\'ID\');"></div>';
        RENDER_DATA += '<div  class="square_buttons _round_button btn-resetPolicy  fa fa-undo" data-toggle="tooltip" onclick="reset_policy(\'' + rule_id + '\');enableSelection(\'' + $arry + '\')" title="Reset Policies" data-placement="right" onclick=""></div>';
        RESET_DATA[rule_id] = RENDER_DATA_FIELD;
	}
	
    RENDER_DATA += "</div><!--Ends config_buttons-->";
    RENDER_DATA += '<!-- remove end -->';
	
    RENDER_DATA += "<div id='config_" + rule_id + "' class='policy_config fullHeight entry'>";
    RENDER_DATA += RENDER_DATA_FIELD;
    RENDER_DATA += "</div>";
    RENDER_DATA += "</div>";
    //rule_id == "new_rule" ? render_data_id = '#' + section + '_' + SUBSECTION_TAG + '_new_policy' : render_data_id = "#rule_" + rule_id;
    put_log("make_content: " + " making html: " + render_data_id);
	
    $(render_data_id).html(RENDER_DATA);
    put_log("make_content: " + " done html: " + render_data_id);
	
    //rule_id == "new_rule" ? enableSelection($arry) : disableSelection($arry);
	
    enableSelection($arry);
    put_log("make_content: " + " completed making content for " + rule_id);
    status_log('Completed making content for the rule');
}

function unique(list) {
    var result = [];
	
    $.each(list, function (i, e) {
        if ($.inArray(e, result) == -1)
			result.push(e);
	});
	
    return result;
}

function get_default(JSON_DATA, searchField, searchVal) {
	
    var results = [];
    for (var i = 0; i < JSON_DATA.length; i++) {
        if (JSON_DATA[i][searchField] == searchVal) {
            results.push(JSON_DATA[i].value);
		}
	}
    return results;
	
}

function isScriptAlreadyIncluded(src) {
    var scripts = document.getElementsByTagName("script");
    
	for (var i = 0; i < scripts.length; i++)
		if (scripts[i].getAttribute('src') == src)
			return true;
    
	return false;
}

function downScripts(js, fn) {
    var source = "js/" + js;
	
    if (!isScriptAlreadyIncluded(source)) {
        var element = document.createElement("script");
        element.type = "text/javascript";
        element.src = source;
        document.body.appendChild(element);
	}
	
    var func = eval(fn);
}

function goto_div(id) {
	put_log("option div : "+id);
    $data_scroll = $('#' + id)[0];
    if ($data_scroll)
		$data_scroll.scrollIntoView(true);
}

//This function is set value if value is empty in INT_RANGE

function empty_checker(val, id, val2) {
	
    if (val == "") {
        alert("Please do not keep empty");
        $("#" + id).val(val2);
	}
}
