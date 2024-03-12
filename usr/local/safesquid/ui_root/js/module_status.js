function module_status(div, div2) {
    var svscan_status = $($.getValues($.ssquid.params.handler.svscan_status));
    var name = "",
            value = "",
            data = "";
    data += '<ul class="list-group"><li class="list-group-item list-heading">SvScan Status</li>';
    $(svscan_status).find('SvScan').children().each(function () {
        $.each(this.attributes, function (i, attrib) {
            name = attrib.name;
            value = attrib.value;
            data += '<li class="list-group-item"><span class="badge bg-default">' + value + '</span>' + name + '</li>';
        });
    });
    $(div).html(data);
    if (div2 != "") {
        data = "";
        data = '<ul class="list-group"><li class=" list-group-item list-heading">Categories Status</li>';
        var sscore_status = $($.getValues($.ssquid.params.handler.sscore));
        $(sscore_status).find('SScore').children().each(function () {
            name = this.nodeName;
            $.each(this.attributes, function (i, attrib) {
                value = attrib.value;
                data += '<li class="list-group-item"><span class="badge bg-default">' + value + '</span>' + name + '</li>';
            });
        });
        $(div2).html(data);
    }
}