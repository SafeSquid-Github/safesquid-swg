function get_ssl_cache() {
    var session_array = 'session_array[]';
    var context_array = 'context_array[]';
    var ssl_cache_xml = $.getValues($.ssquid.params.handler.ssl_cache);
    var $ssl_res = $(ssl_cache_xml).find('ssl_cache');
    var TABLE = '<h4>Session Cache </h4><table  style="width:100%" class ="table table-striped table-bordered">';
    TABLE += '<thead ><tr><th><input type="checkbox" id="checkall" /></th><th >Hostname</th><th >Age</th><th >Reference</th></tr></thead>';
    TABLE += '<tbody>';
    var CONTEXT_TABLE = '<h4>Context Cache </h4><table  style="width:100%" class ="table table-striped table-bordered">';
    CONTEXT_TABLE += '<thead ><tr><th><input type="checkbox" id="checkall1" /></th><th >Hostname</th><th >Age</th><th >Reference</th></tr></thead>';
    CONTEXT_TABLE += '<tbody>';
    $ssl_res.find('session_cache').each(function() {
        TABLE += '<tr><td><input name ="session_array[]" type="checkbox" class="checkthis" value="' + $(this).attr("host") + '"/></td>';
        TABLE += '<td>' + $(this).attr("host") + '</td>';
        TABLE += '<td>' + $(this).attr("age") + '</td>';
        TABLE += '<td>' + $(this).attr("session_references") + '</td></tr>';
    });
    TABLE += '</tbody></table>';
    TABLE += '<button class="btn btn-xs btn-remove" onclick ="remove_session_cache()">Remove from cache</button>';
    $('.session_cache').html(TABLE);
    $ssl_res.find('ctx_client').each(function() {
        CONTEXT_TABLE += '<tr><td><input name="context_array[]" type="checkbox" class="checkthis" value="' + $(this).attr("host") + '"/></td>';
        CONTEXT_TABLE += '<td>' + $(this).attr("host") + '</td>';
        CONTEXT_TABLE += '<td>' + $(this).attr("age") + '</td>';
        CONTEXT_TABLE += '<td>' + $(this).attr("context_references") + '</td></tr>';
    });
    $ssl_res.find('ctx_server').each(function() {
        if (CONTEXT_TABLE.indexOf($(this).attr("host").replace(':443', '')) == -1) {
            CONTEXT_TABLE += '<tr><td><input name="context_array[]" type="checkbox" class="checkthis" value="' + $(this).attr("host") + '"/></td>';
            CONTEXT_TABLE += '<td>' + $(this).attr("host") + '</td>';
            CONTEXT_TABLE += '<td>' + $(this).attr("age") + '</td>';
            CONTEXT_TABLE += '<td>' + $(this).attr("context_references") + '</td></tr>';
        }
    });
    CONTEXT_TABLE += '</tbody></table>';
    CONTEXT_TABLE += '<button class="btn btn-xs btn-remove" onclick="remove_context_cache()">Remove from cache</button>';
    $('.context_cache').html(CONTEXT_TABLE);
    $('.table').DataTable();
    $('#checkall').click(function(e) {
        $(this).closest('table').find('td input:checkbox').prop('checked', this.checked);
    });
    $('#checkall1').click(function(e) {
        $(this).closest('table').find('td input:checkbox').prop('checked', this.checked);
    });
}
var s_array = [];

function remove_session_cache() {
    var values = new Array();
    $.each($("input[name='session_array[]']:checked"), function() {
        var data = $(this).parents('tr:eq(0)');
        s_array.push($(data).find('td:eq(1)').text());
    });
    s_array.join();
    var res = $.getValues($.ssquid.params.handler.ssl_cache + "&session_remove=" + s_array.join());
    get_ssl_cache();
}
var c_array = [];

function remove_context_cache(array_name) {
    var values = new Array();
    $.each($("input[name='context_array[]']:checked"), function() {
        var data = $(this).parents('tr:eq(0)');
        c_array.push($(data).find('td:eq(1)').text());
    });
    c_array.join();
    var res = $.getValues($.ssquid.params.handler.ssl_cache + "&context_remove=" + c_array.join());
    get_ssl_cache();
}

function ssl_download() {
    jQuery.ajax({
//        url: 'http://safesquid.cfg',
        url: '',
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(response) {
//            window.location = 'http://safesquid.cfg?handler=cacert';
            window.location = '?handler=cacert';
        }
    });
}
$(document).ready(function() {
    get_ssl_cache();
})