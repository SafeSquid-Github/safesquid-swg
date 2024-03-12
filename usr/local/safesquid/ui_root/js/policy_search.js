function search_submit() {
        $('#_search_details').html("");
        if (!$('#_details').hasClass('hidden')) $('#_details').addClass('hidden');
        if ($('#_search_details').hasClass('hidden')) $('#_search_details').toggleClass('hidden unhide');
        var fetch_search = "";
        var send_query = 0;
        var $search_policy_response = "";
        var FIELD_NAME = $("input[name='search_option[]']").map(function() {
            return $(this).val();
        }).get();
        FIELD_NAME = FIELD_NAME.toString().replace(/[,]/g, "|");
        put_log("pipe : " + FIELD_NAME);
        var SECTION_NAME = $("input[name='search_section_name[]']").map(function() {
            return $(this).val();
        }).get();
        var QUERY_STRING = $('#search_value').val();
        FIELD_NAME != "" ? fetch_search += "&matchname=" + FIELD_NAME : send_query = send_query + 1;
        if (SECTIONS.length != SECTION_NAME.length) {
            SECTION_NAME != "" ? fetch_search += "&section=" + SECTION_NAME : send_query = send_query + 1;
        }
        QUERY_STRING != "" ? fetch_search += "&matchvalue=" + QUERY_STRING : send_query = send_query + 1;
        if (send_query != 3) {
            $search_policy_response = $($.getValues($.ssquid.params.handler.policy_search + fetch_search));
            show_search_result($search_policy_response);
        } else alert("Please select any one option!");
    }
    //when user clicks on search option
function search_policy() {
    var OPTIONS_LIST = $($.getText($.ssquid.params.handler.search_options));
	put_log(JSON.stringify(_(OPTIONS_LIST).toArray()));
    var search_body = '<div class="_form-group"><div class="label_input">Section</span></div> <input name="search_section_name" id="search_section_name"  placeholder="Select any Section" class="form-control" type="text"></div>';
    search_body += '<script>$("#search_section_name").magicSuggest({ data: ' + JSON.stringify(SECTIONS) + ',  expandOnFocus: true, hideTrigger: true,resultAsString: true, editable : true, allowDuplicates : false,allowFreeEntries : false, maxSelection : null, value: null });</script>';
    search_body += '<div class="_form-group"><div  class="label_input">Options</span></div> <input name="search_option" id="search_option"  placeholder="Select options" class="form-control" type="text"></div>';
    search_body += '<script>$("#search_option").magicSuggest({ data: ' + JSON.stringify(_(OPTIONS_LIST).toArray()) + ',  expandOnFocus: true, hideTrigger: true,resultAsString: true, editable : true, allowDuplicates : false,allowFreeEntries : false, maxSelection : null, value:null});</script>';
    search_body += '<div class="_form-group"><div  class="label_input">Value</span></div> <input id="search_value"  placeholder="Search for" class="form-control" type="text"></div>';
    search_body += '<input class="btn btn-sm btn-primary" type="button" onclick="search_submit()" value="search"/>';
    $('#_popups ._section_content').html(search_body);
    $('.modal-footer').removeClass("hidden");
    $('.modal-dialog').css("width", "600px");
}

function show_search_result(search_result) {
    var SELECTARRAY = [];
    var RENDER_DATA = "";
    $xml_search = search_result;
    var section_name = "";
    var $section_tag = $xml_search.find("safesquid");
    $section_tag.children().each(function(i) {
        section_name = $(this)[0].nodeName;
        BUILD_SEARCH(section_name, $xml_search);
    });
    $(".close").trigger("click");
}

function BUILD_SEARCH(section_name, $xml_search) {
    var $section_tag = $xmlsection.find(section_name);
    var BUILD_SEARCH_DATA = "";
    var DISPLAY_NAME = $section_tag.find($.ssquid.params.section.display_name_tag).eq(0).text();
    var LOGO_NAME = $section_tag.find($.ssquid.params.section.logo_tag).eq(0).text();
    //build heading
    BUILD_SEARCH_DATA += '<div class="report-header"><div class="report-title fa ' + LOGO_NAME + '"> ' + DISPLAY_NAME + '</div></div>';
    //loop based on section
    var CHECK_SUBSECTION = $section_tag.children($.ssquid.params.section.subsecton_defn).children().length;
    if (CHECK_SUBSECTION > 0) {
        section_xml = 1;
        $section_tag.children("subsection").children().each(function(j) { //Check each subsection
            var SUBSECTION_NAME = $(this).find($.ssquid.params.section.display_name_tag).text();
            var SUBSECTION_PARENT = $(this).find($.ssquid.params.section.parent_tag).text();
            var TEMPLATE = $(this).find($.ssquid.params.section.template_defn).text();
            var SUBSECTION_TAG = $(this).get(0).tagName;
            var RENDER_DATA = "";
            //sub section policy validation
            CHECK_RULE_AVAIL = $xml_search.find(section_name).children(SUBSECTION_TAG);
            BUILD_SEARCH_DATA += '<div class="search_subsection_rules">';
            if (CHECK_RULE_AVAIL.length > 0) {
                BUILD_SEARCH_DATA += '<div class="subsection_name "><div class="report-title"> ' + SUBSECTION_NAME + '</div></div>';
                //BUILD_SEARCH_DATA += '<div class="rules_defination">';
				BUILD_SEARCH_DATA += '<div class="_policy_manager scrollContent autoFlex fullHeight" id="policy_manager_' + SUBSECTION_TAG + '">';
                for (i = 0; i < CHECK_RULE_AVAIL.length; i++) {
				
                    BUILD_SEARCH_DATA += '<div class="policies">';
					BUILD_SEARCH_DATA += '<div class="unhide edit_button fullWidth">';
					BUILD_SEARCH_DATA += '<div class="config_buttons">';
					
					$RULE_THIS = CHECK_RULE_AVAIL.eq(i);
					
					BUILD_SEARCH_DATA += '<div class="square_buttons _round_button btn-refresh  fa fa-pencil-square-o" onclick="find_policy(\'' + section_name + "','" + SUBSECTION_TAG + "','" + $RULE_THIS.attr("id") + '\')"></div></div><div class="entry">';
					
                    $xmlsection.find(section_name).find($.ssquid.params.section.template_defn).find(TEMPLATE).children().each(function(m) {
                        if ($RULE_THIS.children($(this).get(0).tagName).text() != "") {
                            BUILD_SEARCH_DATA += '<div class="_form-group">';
                            BUILD_SEARCH_DATA += '<div class="label_input">' + $(this).find($.ssquid.params.section.display_name_tag).text() + '</div>';
                            BUILD_SEARCH_DATA += '<div class="details_search">' + $RULE_THIS.children($(this).get(0).tagName).text() + '</div></div>';
                        }
                    });
					
					
					
                    BUILD_SEARCH_DATA += '</div></div></div>'
                }
                BUILD_SEARCH_DATA += '</div>'
            }
        });
    }
    $('#_search_details').append(BUILD_SEARCH_DATA);
}

function find_policy(sec, tag, id) {
    //If details is already hidden then make it unhide
    if ($('#_details').hasClass('hidden')) $('#_details').toggleClass('hidden unhide');
    //If search is unhide make it hidden
    if ($('#_search_details').hasClass('unhide')) $('#_search_details').toggleClass('unhide hidden');
    MAKE_PAGE(sec, "_details");
    $("#option_section_" + sec + "_" + tag).trigger("click");
    //$('#search_rule_' + id).trigger("click"); /* In older version we have collapse option, thats why we used this trigger */
    $('#rule_' + id + '_view .fa-pencil-square-o').trigger("click");
    goto_div("rule_" + id);
}