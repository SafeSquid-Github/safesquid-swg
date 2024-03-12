function connection_pool_handler(RESPONSE) {
    var activeconnxmlDoc2;
    var protocol = [];
    var host = [];
    var port = [];
    var username = [];
    var age = [];
    activeconnxmlDoc2 = RESPONSE;
    var $activeconnxmlDocxml1 = $(activeconnxmlDoc2);
    $xmlsetconnection1 = $activeconnxmlDocxml1.find('connection_pool');
    if ($xmlsetconnection1 != null) {
        $xmlsetconnection1.children().each(function () {
            protocol.push($(this).attr("protocol"));
            host.push($(this).attr("host"));
            port.push($(this).attr("port"));
            username.push($(this).attr("username"));
            age.push($(this).attr("age"));
        });
        var count = protocol.length;
        var TABLE = ' <table  id="table_pool"  class = "table table-striped table-bordered">';
        TABLE += '<thead ><tr><th style="width: 10%;max-width: 10ex;">Protocol</th><th style="width: 40%;max-width: 50ex;" >Host</th><th style="width: 5%;max-width: 5ex;" >Port</th><th style="width: 30%;max-width: 35ex;" >Useraname</th><th style="width: 5%;max-width: 5ex;" >Age</th></tr></thead>'
        TABLE += '<tbody>';
        for (i = 0; i < count; i++) {
            TABLE += "<tr>";
            TABLE += "<td>" + protocol[i] + "</td><td>" + host[i] + "</td><td>" + port[i] + "</td><td>" + username[i] + "</td><td>" + age[i] + "</td>";
            TABLE += "</tr>";
        }
        TABLE += "</tbody></table>";
        $('#section_pool_general ._policy_manager').html(TABLE);
        $('#table_pool').DataTable();
    }
}

function connection_pool() {
    var QUERY = $.getValues($.ssquid.params.handler.connection_pool);
    connection_pool_handler(QUERY);
}
$(document).ready(function () {
    connection_pool();
});