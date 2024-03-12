function header_filter() {
    var QUERY = ["handler=filtered_headers&format=xml", "handler=unfiltered_headers&format=xml"];
    for (i = 0; i < 2; i++) {
        var tag = "";
        jQuery.ajax({
            type: "POST",
            url: "",
            data: QUERY[i],
            cache: false,
            dataType: "xml",
            success: function(response) {
                var $save_response1 = $(response);
                var $save_response2 = $save_response1.find('show_headers');
                var TABLE = "";
                TABLE += '<table class="table table-striped table-bordered">';
                TABLE += '<thead><tr><th>type</th><th>value</th></tr></thead>';
                $save_response2.children().each(function() {
                    tag = this.tagName;
                    TABLE += "<tr><td>" + $(this).attr("type") + "</td><td>" + $(this).attr("value") + "</td></tr>";
                });
                TABLE += "</tbody></table>";
                $('#' + tag + '_log').html("<h4>" + tag + " headers</h4><br />" + TABLE);
            }
        });
    }
}
$(document).ready(function() {
    header_filter();
});