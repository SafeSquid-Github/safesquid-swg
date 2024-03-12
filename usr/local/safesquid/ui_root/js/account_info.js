function get_account_info() {
    var account = $($.getValues($.ssquid.params.handler.account_info, "#_subscription"));
    var account_show = account.find('users_information');
    $("#_named-users-number").html(account_show.find("users_count").find("named_users").text());
    $("#_current-users-number").html(account_show.find("users_count").find("concurrent_users").text());
    $("#_current-connection-number").html(account_show.find("users_count").find("concurrent_connections").text());
    var table1 = '<table class = "table _table_reference table-striped table-bordered">';
    table1 += '<thead ><tr><th >User Name</th><th>Con-current Connections</th></tr></thead><tbody>'
    account_show.find("users_name").eq(0).each(function () {
        for (i = 0; i < $(this).find("name").length; i++) {
            table1 += "<tr><td>" + $(this).find("name").eq(i).text() + "</td>";
            table1 += '<td class="right_align">' + $(this).find("concurrent_connections").eq(i).text() + "</td></tr>";
        }
    })
    table1 += "</tbody><table>";
    var table2 = '<table class = "table _table_reference table-striped table-bordered">';
    table2 += '<thead ><tr><th>IP Address</th><th>Con-current Connections</th></tr></thead><tbody>'
    account_show.find("ips_info").each(function () {
        for (i = 0; i < $(this).find("ip_address").length; i++) {
            table2 += "<tr><td>" + $(this).find("ip_address").eq(i).text() + "</td>";
            table2 += '<td class="right_align">' + $(this).find("concurrent_connections").eq(i).text() + "</td></tr>";
        }
    })
    table2 += "</tbody><table>";
    $("#_named-users").html(table1);
    $("#_ip-users").html(table2);
    $('._table_reference').DataTable();
    $("#_subscription").html(DATA_ENTRY_SUBSCRIPTION);
}
$(document).ready(function () {
    get_account_info();
});