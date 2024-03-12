function RESPONSE_HANDLER_LDAP(RESPONSE, div) {
    var ldap_response;
    var login_attribute = [];
    var ldap_domain = [];
    var ldap_profiles = [];
    var _TABLE_ = [];
    ldap_response = RESPONSE;
    var $ldap_data = $(ldap_response);
    console.log(div);
    status_log('LDAP Entries');
    $('#' + div).append('<div border="0" class="loader col-lg-offset-4 col-md-offset-4 col-sm-offset-4 "></div>');

    $xmlsetconnection1 = $ldap_data.find('ldap_entries');
    if ($xmlsetconnection1 != null) {
        $xmlsetconnection1.children().each(function () {
            login_attribute.push($(this).attr("login_attribute"));
            ldap_domain.push($(this).attr("ldap_domain"));
            ldap_profiles.push($(this).attr("ldap_profiles"));
        });
        var count = login_attribute.length;
        var TABLE = ' <table  id="table_ldap"  class = "table table-striped table-bordered">';
        TABLE += '<thead ><tr><th>Login Attribute</th><th>LDAP Domain</th><th >LDAP Profiles</th></tr></thead>'
        TABLE += '<tbody>';
        for (i = 0; i < count; i++) {

            _TABLE_.push([login_attribute[i], ldap_domain[i], ldap_profiles[i]]);

        }
        TABLE += "</tbody></table>";
        $('#' + div).html(TABLE);

        $('#table_ldap').dataTable().fnDestroy();
        $('#table_ldap').dataTable({
            data: _TABLE_,
            orderClasses: false,
            deferRender: true,
            pageLength: 25
        });
        //var search = '<button type="submit" style="margin-left:5ex" class="btn bg-purple btn-xs" onclick="view_ldap(\'' + div + '\',\'refresh\')">Refresh</button>';
        var search = '<span type="submit" style="left:96%" class="square_buttons btn-refresh pull-left" onclick="view_ldap(\'' + div + '\',\'refresh\')"><i class="fa fa-refresh"></i></span>'
        $("#" + div + " .dataTables_filter").append(search);
        //$("#" + div + " .active").css('display', 'inline-block');
    }
}

function view_ldap(div, refresh) {
    divID_chk = '';
    abort_all_xhr();
    abort = "";
    
    if ($("#" + div).text().length == 0 || refresh == "refresh") {
        status_log('ldap');
        var QUERY = $($.getValues($.ssquid.params.handler.show_ldap, 'LDAP'));
        RESPONSE_HANDLER_LDAP(QUERY, div);
    }else{
        status_log('LDAP Entries');
    }
}