function show_cache(res) {
    var url, vut_url;
    if (!res) {
        res = $.getValues($.ssquid.params.handler.cache + "&show=yes");
    }
    var cache_xml = $(res);
    var $cache_res = $(cache_xml).find('Cache_information');
    $cache_res.find('Memory_cache').each(function () {
        $('#memory_cache').html($(this).attr("entries") + " entries / " + $(this).attr("bytes") + " bytes / " + $(this).attr("used") + "% used");
    });
    $cache_res.find('Disk_cache').each(function () {
        $('#disk_cache').html($(this).attr("entries") + " entries / " + $(this).attr("bytes") + " bytes / " + $(this).attr("used") + "% used");
    });
    var TABLE = '<h4> Cache list </h4>  <table class ="table table-striped table-bordered">';
    TABLE += '<thead ><tr><th >URL</th><th >Size</th><th >Memory</th><th >Disk</th><th >Users</th></tr></thead>';
    TABLE += '<tbody>';
    $cache_res.find('Search_cache_entries').each(function () {
        TABLE += '<tr>';
        url = cut_url = $(this).attr("Url");
        if (cut_url.length > 100)
            cut_url = cut_url.slice(0, 100) + "...";

        TABLE += '<td><a href="' + url.replace(/http:\/\//g, "http:\/\/xx--cache.") + '" style="color:#000" target="_blank">' + cut_url + '</a></td>';
        TABLE += '<td>' + formatBytes($(this).attr("Size")) + '</td>';
        TABLE += '<td>' + $(this).attr("Memory") + '</td>';
        TABLE += '<td>' + $(this).attr("Disk") + '</td>';
        TABLE += '<td>' + $(this).attr("Users") + '</td></tr>';
    });
    TABLE += '</tbody></table>';
    $('#cache_list').html(TABLE);
    $('.table').DataTable({
		pageLength:25
	});
    //var search = "<button type='submit' style='float:right' class='btn bg-purple btn-xs' onclick='show_cache()'>Refresh</button> ";
    var search = '<span type="submit" style="" class="square_buttons btn-refresh pull-right fa fa-refresh" onclick="show_cache()"></span>'
    $("div.dataTables_filter").append(search);
}

function submit_cache_values() {
    var website = $('#regex_match').val();
    var modify_after = $('#modify_after').val();
    var modify_before = $('#modified_before').val();
    var access_after = $('#accessed_after').val();
    var access_before = $('#accessed_before').val();
    var from_value = $("#file_size_from").val();
    var to_value = $("#file_size_to").val();
    var check = $('#check_matches').prop('checked');
    if (check == true) {
        check = "on";
    } else {
        check = "off"
    }
    var cache = $.getValues($.ssquid.params.handler.cache + "&pattern=" + website + "&delete=" + check + "&show=yes");
    show_cache(cache);
}
var today_date1 = moment().format('YYYY/MM/DD:HH');
var cache_entries = "";
$(document).ready(function () {
    cache_entries = $.getValues($.ssquid.params.handler.cache + "&show=yes");
    show_cache(cache_entries);
    $('.calendar').datetimepicker({
        format: 'yyyy/mm/dd:hh',
        today: "Today",
        todayBtn: "linked",
        minView: 'day',
        showMeridian: true,
        locale: {
            format: 'yyyy/mm/dd:hh'
        },
        endDate: today_date1,
        autoclose: true,
        calendarWeeks: true,
        todayHighlight: true,
        showClear: true,
        pickerPosition: "top-right"
    });
});