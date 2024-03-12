/*
 * jQuery / jqLite Wizard Plugin
 * version: 0.0.4
 * Author: Girolamo Tomaselli http://bygiro.com
 *
 * Copyright (c) 2013 G. Tomaselli
 * Licensed under the MIT license.
 */

// compatibility for jQuery / jqLite
var bg = bg || false;
if(!bg){
	if(typeof jQuery != 'undefined'){
		bg = jQuery;
	} else if(typeof angular != 'undefined'){
		bg = angular.element;
		
		(function(){
			bg.extend = angular.extend;
			bg.isFunction = angular.isFunction;
		
			function selectResult(elem, selector){
				if (elem.length == 1)
					return elem[0].querySelectorAll(selector);
				else {
					var matches = [];
					for(var i=0;i<elem.length;i++){
						var elm = elem[i];
						var nodes = angular.element(elm.querySelectorAll(selector));
						matches.push.apply(matches, nodes.slice());					
					}
					return matches;
				}
			}	
		
			bg.prototype.find = function (selector){			
				var context = this[0];
				// Early return if context is not an element or document
				if (!context || (context.nodeType !== 1 && context.nodeType !== 9) || !angular.isString(selector)) {
					return [];
				}
				var matches = [];
				if (selector.charAt(0) === '>')
					selector = ':scope ' + selector;
				if (selector.indexOf(':visible') > -1) {
					var elems = angular.element(selectResult(this, selector.split(':visible')[0]))

					forEach(elems, function (val, i) {
						if (angular.element(val).is(':visible'))
							matches.push(val);
					})

				} else {
					matches = selectResult(this, selector)
				}

				if (matches.length) {
					if (matches.length == 1)
						return angular.element(matches[0])
					else {
						return angular.element(matches);
					}
				}
				return angular.element();
			};
			
			bg.prototype.outerWidth = function () {
				var el = this[0];
				if(typeof el == 'undefined') return null;
				return el.offsetWidth;
			};
			
			bg.prototype.width = function () {
				var el = this[0];
				if(typeof el == 'undefined') return null;
				var computedStyle = getComputedStyle(el);
				var width = el.offsetWidth;
				if (computedStyle)
					width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
				return width;
			};
		
		})();
	}
}
 
;(function ($, document, window){

	"use strict";
	
    var pluginName = "safesquidwizard",
    // the name of using in .data()
	dataPlugin = "plugin_" + pluginName,
	defaults = {
		currentStep: 0,
		checkStep: false,
		onCompleted: false,
		bottomButtons: true,
		topButtons: true,
		autoSubmit: false,
		nextClass: '.btn-next',
		prevClass: '.btn-prev',
		text:{
			finished: 'Complete',
			next: 'Next',
			previous: 'Previous'
		}
	},
	
	attachEventsHandler = function(){
		var that = this;
		
		that.$element.find('.btn-prev:not(.disabled):not(.hidden)').on('click', function(e){
			e.stopPropagation();
			that.previous.call(that,true,e);
		});	
		
		that.$element.find('.btn-next').on('click', function(e){
			e.stopPropagation();
			that.next.call(that,true,e);
			
			var step = that.$element.find('.steps > li.active').attr('data-step');
			
			
		});
		
		that.$element.find('.steps > li').on('click', function(e){
			e.stopPropagation();
			var step = $(this).attr('data-step'),
			isCompleted = $(this).hasClass('completed');
			if(!isCompleted) return true;
			
			that.setStep.call(that,step,e);
		});		
	},
	
	checkStatus = function(){
		var that = this,
			currentWidth,
			stepsWidth = 0,
			stepPosition = false,
			steps = that.$element.find('.steps'),
			stepsItems = that.$element.find('.steps > li');
			
		if(!this.currentStep) this.currentStep = 1;
		
		stepsItems.removeClass('active');
		that.$element
			.find('.steps > li[data-step="'+ that.currentStep +'"]')
			.addClass('active');
			
		that.$element.find('.steps-content .step-pane').removeClass('active');
		var current = that.$element.find('.steps-content .step-pane[data-step="'+ that.currentStep +'"]');
			current.addClass('active');

		for(var i=0;i<stepsItems.length;i++){
			var stepLi = $(stepsItems[i]);
			if(that.currentStep > (i+1)){
				stepLi.addClass('completed');				
			} else {
				stepLi.removeClass('completed');				
			}
			
			currentWidth = stepLi.outerWidth();
			if(!stepPosition && stepLi.hasClass('active')){				
				stepPosition = stepsWidth + (currentWidth / 2);
			}
			
			stepsWidth += currentWidth;			
		}
		
		// set buttons based on current step
		that.$element.find('.btn-next').removeClass('final-step btn-success');
		that.$element.find('.btn-prev').removeClass('disabled hidden');
		if(that.currentStep == stepsItems.length){
			// we are in the last step
			that.$element.find('.btn-next').addClass('final-step btn-success');
		} else if(that.currentStep == 1){
			that.$element.find('.btn-prev').addClass('disabled hidden');
		}		
		
		
		// move steps view if needed
		var totalWidth = that.$element.width() - that.$element.find('.actions').outerWidth();
		
		if(stepsWidth < totalWidth) return;
		
		var offsetDiff = stepPosition - (totalWidth / 2);
		if(offsetDiff > 0){
			// move it forward
			steps.css('left',-offsetDiff);
		} else {
			// move it backward
			steps.css('left',0);
		}
	},
	
	moveStep = function(step, direction, event, checkStep){		
		var canMove = true,
		steps = this.$element.find('.steps > li'),
		triggerEnd = false;
		
		checkStep = checkStep === false ? false : true;

		// check we can move
		if(checkStep && typeof this.options.checkStep == 'function'){
			canMove = this.options.checkStep(this,direction,event);
		}
		
		if(!canMove) return;
		
		if ( this.currentStep == 1 ){
		
			eraseCookie("krb_ip");
			eraseCookie("basedn");
			eraseCookie("domain");
			eraseCookie("fqdn");
		
			var request = "handler=generic_script_handler&script_to_execute=app_template.sh"				
				request += "&args=2&arg_1=script_name&val_1=kerberos.sh validate&arg_2=MIME&val_2=text/xml"
		
			var $xmlinfo = $($.getValues(request));							
			
			var kerbe_avl = $xmlinfo.find('kerberos').children('keytab').text();
			var kerbe_fqd = $xmlinfo.find('kerberos').children('adfqdn').text();
			var kerbe_dmn = $xmlinfo.find('kerberos').children('domain').text();
			
			if( kerbe_avl == "found" ){
				var DISPLAY_INFO = "<div class='fullHeight fullWidth'>";
				DISPLAY_INFO += "<p> <b>Keytab already Present</b>. Do you want to proceed generating new keytab by deleting older.</p>";
				DISPLAY_INFO += "<p> Keytab details:</p>";
				
				DISPLAY_INFO += "<table class='table'>";
				DISPLAY_INFO += "<tr><td>FQDN of Actice Directory</td><td>"+kerbe_fqd+"</td></tr>";
				DISPLAY_INFO += "<tr><td>Domain</td><td>"+kerbe_dmn+"</td></tr>";
				DISPLAY_INFO += "</table>";
				
				DISPLAY_INFO += "</div>";
				
				$('#Prerequisites').html(DISPLAY_INFO);
				
				var $check = readCookie("check");
				
				if ( !$check ){
					createCookie('check', "yes", 1);
					return;	
				}else{
					eraseCookie("check");
				}
				
				//return;
			}
				
		}else if( this.currentStep == 2 ){			 
			if( !$( "#kerberos_ipaddress" ).val() ) {				
				alert('enter ip address');
				return;				
			}			 
			  
			put_log('got ip address .should fetch ad fqdn and domain');				
			var $ip_address = $( "#kerberos_ipaddress" ).val();
			
			if($ip_address){
				var request = "handler=generic_script_handler&script_to_execute=app_template.sh"				
				request += "&args=2&arg_1=script_name&val_1=kerberos.sh ip "+$ip_address+"&arg_2=MIME&val_2=text/xml"
				
				createCookie( 'krb_ip', $ip_address, 1);
				var $xmlinfo = $($.getValues(request));									
			}else{
				put_log("empty ip");				
				return;
			}
							
			var kerbe_basedn = $xmlinfo.find('kerberos').children('basedn').text();
			var kerbe_domain = $xmlinfo.find('kerberos').children('domain').text();
			var kerbe_fqdn = $xmlinfo.find('kerberos').children('fqdn').text();
			
			var kerbe_error = $xmlinfo.find('kerberos').children('error').text();
			
			if(kerbe_error){
				alert(kerbe_error);
				return;
			}
			
			document.getElementById("kerberos_basedn").value = kerbe_basedn;
			document.getElementById("kerberos_domain").value = kerbe_domain;
			document.getElementById("kerberos_fqdn").value = kerbe_fqdn;
			  
		}else if( this.currentStep == 3 ){
			if( !$( "#kerberos_basedn" ).val() || !$( "#kerberos_domain" ).val() || !$( "#kerberos_fqdn" ).val() ) {				
				alert('specify AD information');
				return;							
			  }			  
			
			var $kerbe_basedn = $( "#kerberos_basedn" ).val();
			var $kerbe_domain = $( "#kerberos_domain" ).val();
			var $kerbe_fqdn = $( "#kerberos_fqdn" ).val();
			
			var $ip_address = readCookie('krb_ip');
					
			createCookie( 'basedn', $kerbe_basedn, 1);
			createCookie( 'domain', $kerbe_domain, 1);
			createCookie( 'fqdn', $kerbe_fqdn, 1);
			
			var request = "handler=generic_script_handler&script_to_execute=app_template.sh";				
				request += "&args=1&arg_1=script_name&val_1=kerberos.sh ip "+$ip_address+" domain "+$kerbe_domain+" fqdn "+$kerbe_fqdn;
				
			put_log(request);	
			
			document.getElementById("kerberos_username").value = "administrator@"+ $kerbe_domain.toUpperCase();			
			var $xmlinfo = $($.getValues(request));
			
		}else if( this.currentStep == 4 ){
			if( !$( "#kerberos_username" ).val() || !$( "#kerberos_password" ).val() ) {				
			alert('specify Username and password');
				return;				
			}
			
			var $ad_fqdn = readCookie('fqdn');
			
			var $kerbe_user = $( "#kerberos_username" ).val();
			var $kerbe_password = $( "#kerberos_password" ).val();				
			
			var request = "handler=generic_script_handler&script_to_execute=app_template.sh";				
			request += "&args=2&arg_1=script_name&val_1=kerberos.sh fqdn "+$ad_fqdn+" username "+$kerbe_user+" password "+$kerbe_password+"&arg_2=MIME&val_2=text/xml";
			
			var $xmlinfo = $($.getValues(request));	
			
			var kerbe_passwd = $xmlinfo.find('kerberos').children('PASSWD_MSG').text();
			var kerbe_msktut = $xmlinfo.find('kerberos').children('MSG').text();			
			
			if( kerbe_passwd == "Wrong Password" ){
				alert('wrong password enter correct password');
				return;
			}
			
			alert(kerbe_msktut);
			
		}
		
		if(step){
			this.currentStep = parseInt(step);
		} else {
			if(direction){
				this.currentStep++;
			} else {
				this.currentStep--;
			}
		}

		if(this.currentStep < 0) this.currentStep = 0;
		if(this.currentStep > steps.length){
			this.currentStep = steps.length;
			triggerEnd = true;
		}
		
		checkStatus.call(this);
		
		if(triggerEnd){
			if(typeof this.options.onCompleted == 'function'){
				this.options.onCompleted(this);
			} else if(this.options.autoSubmit) {
				// search if wizard is inside a form and submit it.
				var form = this.$element.closest('form');
				if(form.length)	form.submit();
			}
		}
	},
		
	methods = {
		init: function (element, options) {
			var that = this;
			this.$element = $(element);
			this.options = $.extend({},	defaults, options);
			
			var opts = this.options;

			this.$element.addClass('wizard');
			
			// add the buttons
			var stepsBar = this.$element.find('.steps'),			
			bottomActions = this.$element.find('.bottom-actions'),
			progressBar = this.$element.find('.progress-bar'),
			html = '';
			
			// wrap steps in a container with hidden overflow, if it doesn't have a container
			if(stepsBar.parent().hasClass('wizard')){
				// let's add a container
				stepsBar.wrap('<div class="steps-index-container"></div>');				
			} else {
				stepsBar.parent().addClass('steps-index-container');
			}
			
			html = '';
			if(opts.bottomButtons && !bottomActions.length){
				html += '<div class="bottom-actions">';
				html += '<button class="btn btn-default btn-mini btn-xs btn-prev"><span class="previous-text">'+ opts.text.previous +'</span></button>';
				html += '<button class="btn btn-default btn-mini btn-xs btn-next"><span class="next-text">'+ opts.text.next +'</span><span class="finished-text">'+ opts.text.finished +'</span></button>';
				html += '</div>';
				
				that.$element.find('.steps-content').append(html);	
			}

			// add arrows to btn
			this.$element.find('.btn-prev').prepend('<i class="wiz-icon-arrow-left"></i>');
			this.$element.find('.btn-next').append('<i class="wiz-icon-arrow-right"></i>');
			
			// get steps and prepare them
			var stepsLi = this.$element.find('.steps > li');
			for(var i=0;i<stepsLi.length;i++){
				
				var step = $(stepsLi[i]),						
				target = step.attr('data-step'),
				content = '<span class="step-text">'+ step.html() +'</span>';
				
				step.empty().html('<span class="step-index"><span class="label">'+ (i+1) +'</span></span>'+ content + '<span class="wiz-icon-chevron-right colorA"></span><span class="wiz-icon-chevron-right colorB"></span>');
				
				that.$element.find('.steps-content [data-step="'+ target +'"]').addClass('step-pane');
				
				// detect currentStep
				if(step.hasClass('active') && !that.currentStep){
					that.currentStep = i+1;
				}					
			}

			this.$element.find('.steps > li:last-child').addClass('final');
			
			attachEventsHandler.call(this);
			
			var callbacks = ['checkStep','onCompleted'],cb;
			for(var i=0;i<callbacks.length;i++){
				cb = callbacks[i];
				if(typeof this.options[cb] == 'string' && typeof window[this.options[cb]] == 'function'){
					this.options[cb] = window[this.options[cb]];
				}
			}
		
			checkStatus.call(this);
		},

		next: function(checkStep,event){
			moveStep.call(this,false,true,event,checkStep);
		},
		
		previous: function(checkStep,event){
			moveStep.call(this,false,false,event,checkStep);
		},
		
		setStep: function(step, checkStep, event){
			moveStep.call(this,step,null,event,checkStep);
		}
	};
		
    var main = function (method) {
        var thisPlugin = this.data(dataPlugin);
        if (thisPlugin) {
            if (typeof method === 'string' && thisPlugin[method]) {
                return thisPlugin[method].apply(thisPlugin, Array.prototype.slice.call(arguments, 1));
            }
            return console.log('Method ' + arg + ' does not exist on jQuery / jqLite' + pluginName);
        } else {
            if (!method || typeof method === 'object') {
				thisPlugin = $.extend({}, methods);
				thisPlugin.init(this, method);
				this.data(dataPlugin, thisPlugin);

				return this;
            }
            return console.log( pluginName +' is not instantiated. Please call $("selector").'+ pluginName +'({options})');
        }
    };

	// plugin integration
	if($.fn){
		$.fn[ pluginName ] = main;
	} else {
		$.prototype[ pluginName ] = main;
	}

	$(document).ready(function(){
		var mySelector = document.querySelector('[data-wizard-init]');
		$(mySelector)[ pluginName ]({});				
	});
}(bg, document, window));
