function network_connection(type){	
	divID_chk = "";
	abort_all_xhr();
	abort = "";	
	
	if( type == "active" ){
		url =$.ssquid.params.handler.active_connections;
		abot = "Active Cnnections";
		datatable_ = "#table_active_connections";		
		chunk(url, abot, datatable_);
	}else if( type == "dns" ){
		url =$.ssquid.params.handler.dns_cache;
		abot = "DNS Cache";
		datatable_ = "#table_dns";		
		chunk(url, abot, datatable_);
	}else {
		url =$.ssquid.params.handler.connection_pool;
		abot = "Connection Pool";
		datatable_ = "#table_pool";	
		chunk(url, abot, datatable_);
	}
		
}




