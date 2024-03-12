function sub_details(refresh = 'false') {

    var query = $.ssquid.params.handler.subscription + refresh;
    status_log('Fetching Subscription Details');
    var $sub_xml = $($.getValues(query));
    status_log('Obtained Subscription Details');
    $subscription_type = get_tag_attr($sub_xml, 'information', 'Subscription_Type');

    $subscription = "";
    $subscription += '<tr><td class="l_name">Activation Key Name</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Activation_Key_Name') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Subscription Start</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'SUBSCRIPTION_START') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Creator Details</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'CREATOR_DETAILS') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Contact Details</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Contact_Details') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Status</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Status') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Service ID</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Service_ID') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Service Name</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Service_Name') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Subscription Type</td><td class="l_val">' + $subscription_type + '</td></tr>';
    if ($subscription_type == 'CPU usage') {
        $subscription += '<tr><td class="l_name">Remaining Subscription Quantity</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Remaining_Subscription_Quantity') + '</td></tr>';
    } else {
        $subscription += '<tr><td class="l_name">Current Subscription Quantity</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Current_Subscription_Quantity') + '</td></tr>';
    }
    $subscription += '<tr><td class="l_name">Service Location</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Service_Location') + '</td></tr>';
    $subscription += '<tr><td class="l_name">Last Updated Time</td><td class="l_val">' + get_tag_attr($sub_xml, 'information', 'Last_Updated_Time') + '</td></tr>';

    $('#license_info > tbody').html($subscription);

}

$(document).ready(function () {
    sub_details();
});