function svscan_status() {
    /*var SVSCAN_RES = $.getValues($.ssquid.params.handler.svscan_status);
    var $svscan_res1 = $(SVSCAN_RES).find('SvScan');
    var TABLE = '<table  style="width:0%" class ="table table-striped table-bordered">';
    TABLE += '<thead ><tr><th >Params</th><th >Status</th></tr></thead>';
    TABLE += '<tbody>';
    $svscan_res1.find('status').each(function() {
        TABLE += '<tr><td>Library Status  </td><td>' + $(this).attr("Library_Status") + '</td></tr>';
        TABLE += '<tr><td>Scanner Status  </td><td>' + $(this).attr("Scanner_Status") + '</td></tr>';
        TABLE += '<tr><td>Update Status  </td><td>' + $(this).attr("Update_Status") + '</td></tr>';
        TABLE += '<tr><td>Threats Detected  </td><td>' + $(this).attr("Threats_Detected") + '</td></tr>';
        TABLE += '<tr><td>Requests Blocked  </td><td>' + $(this).attr("Requests_Blocked") + '</td></tr>';
        TABLE += '<tr><td>Responses Blocked  </td><td>' + $(this).attr("Responses_Blocked") + '</td></tr>';
    });
    TABLE += '</tbody></table>';
    TABLE += "<div><button type='button' class='btn btn-primary btn-xs' onclick='svscan_status()'>Refresh</button></div>";*/
	
	var svscan_status = $($.getValues($.ssquid.params.handler.svscan_status));
	TABLE = "";
	TABLE += '<ul class="list-group">';
    $(svscan_status).find('SvScan').children().each(function() {
        $.each(this.attributes, function(i, attrib) {
            name = attrib.name;
            value = attrib.value;
            TABLE += '<li class="list-group-item"><span class="badge ">' + value + '</span>' + name + '</li>';
        });
    });
	
	
	
    
	$('#svscan_status').html(TABLE);
    
	
}
$(document).ready(function() {
    svscan_status();
});