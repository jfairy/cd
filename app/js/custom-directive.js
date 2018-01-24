var directiveMoudle=angular.module('custom-directive',[]);

/* -----------------------------------------分页------------------------------------- */
directiveMoudle.directive('page',function(){
    return {
        restrict:'E',
        templateUrl:'app/views/partials/page.html'+'?action='+(new Date().getTime()),
        scope:{
            onPageChange: '&',
            pageNum: '=',
            pageCount:'='
        }, 
        link:function(scope,element,attr)
        {
           //scope.pageNum=1;
           scope.pageChange = function(page) {
              if (page >= 1 && page <= scope.pageCount) {
                scope.pageNum = page;
              } else {
                scope.pageNum = 1;
              }
           }
           
           scope.pageRefresh=function(pagenum){
        	   
        	   scope.pageNum=pagenum;
        	   if(!scope.pageNum)
        	   {
        		   scope.pageNum=1;
        	   }
        	   
        	   
        	   pageData()
           }
            

           function pageData()
           {
              scope.onPageChange();
           }
         
           scope.$watch('pageNum',function(newval,oldval){
             pageData()
           })

           
        }

    }
})

/* -----------------------------------------右侧边栏------------------------------------- */
directiveMoudle.directive('toggleState', ['toggleStateService', function(toggle) {
  'use strict';
  
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      var $body = $('body');

      $(element)
        .on('click', function (e) {
          e.preventDefault();
          var classname = attrs.toggleState;
          
          if(classname) {
            if( $body.hasClass(classname) ) {
              $body.removeClass(classname);
              if( ! attrs.noPersist)
                toggle.removeState(classname);
            }
            else {
              $body.addClass(classname);
              if( ! attrs.noPersist)
                toggle.addState(classname);
            }
            
          }

      });
    }
  };
  
}]);

/* -----------------------------------------全选------------------------------------- */
directiveMoudle.directive('checkAll', function() {
	  'use strict';
	  
	  return {
	    restrict: 'A',
	    controller: ["$scope", "$element","$filter", function($scope, $element,$filter){
	      $scope.curCheckappId=[];
	      $element.on('change', function() {

	        var $this = $(this),
	            index= $this.index() + 1,
	            checkbox = $this.find('input[type="checkbox"]'),
	            table = $this.parents('table');
	        // Make sure to affect only the correct checkbox column
	        table.find('tbody > tr > td:nth-child('+index+') input[type="checkbox"]')
	          .prop('checked', checkbox[0].checked);
	        
	        var eleArr=table.find('tbody > tr > td:nth-child('+index+') input[type="checkbox"]');
	        
	        if(checkbox[0].checked){
	          $scope.curCheckappId=[];
	      	  for(var i=0;i<eleArr.length;i++)
	      	  {
	      	
	      		 var eleId=eleArr[i].getAttribute('save-id');
	      		 $scope.curCheckappId.push(eleId);
	      	 
	      		 var isExit=$filter('filter')($scope.checkappId,eleId).length>0?true:false;
	      		 if(!isExit){
	      			 $scope.checkappId.push(eleId);
	      		 }
	      		
	      	  } 
	 
	        }else{
	            $scope.checkappId=$scope.checkappId.filter(function(key) { 
	        		var isDel=$filter('filter')($scope.curCheckappId,key).length>0?true:false;
	        		if(isDel){
	        			return false;
	        		}else{
	        			return true;
	        		}
	        	})
	        }
	        

	      });
	    }]
	  };

	});

/* -----------------------------------------复选框保存数据------------------------------------- */
directiveMoudle.directive('saveId', function() {
	 'use strict';
	  return {
	    restrict: 'ECA',
	    scope:{
	    	checkappId: '=',
       },
	    link:function(scope,element,attr){
	    	 element.on('change',function(){

	    		 var eleid=$(this).attr('save-id');

	    		 if($(this).is(':checked')){
		    		   scope.checkappId.push(eleid) 
		    	 }else
	    	     { 
		    		 
		    		 var theadCheckbox=$(this).parents('table').find('thead input[type="checkbox"]');
		    		
		    		 if(theadCheckbox.length>0){
		    			 theadCheckbox[0].checked=false;
		    		 } 
		
		    		 for(var i=0;i<scope.checkappId.length;i++)
		    		 {
		    			 if(scope.checkappId[i]==eleid)
		    			 {
		    				 scope.checkappId.splice(i,1) 
		    			 }
		    		 }
	    	     }
	    
	    	 })
	    }
	  };

});

/* -----------------------------------------日期插件------------------------------------- */

directiveMoudle.directive('ruledate',function(){
    return {
        restrict:'A',
        link:function(scope,element,attr)
        {
    
            function attrDefault($el, data_var, default_val)
        	{
        		if(typeof $el.data(data_var) != 'undefined')
        		{
        			return $el.data(data_var);
        		}
        		
        		return default_val;
        	}
        	// Date Range Picker
          
        	if($.isFunction($.fn.daterangepicker))
        	{
        		$(".daterange").each(function(i, el)
        		{
        			// Change the range as you desire
        			var ranges = {
        				'Today': [moment(), moment()],
        				'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
        				'Last 7 Days': [moment().subtract('days', 6), moment()],
        				'Last 30 Days': [moment().subtract('days', 29), moment()],
        				'This Month': [moment().startOf('month'), moment().endOf('month')],
        				'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        			};
        			
        			var $this = $(el),
        				opts = {                        
        					format: attrDefault($this, 'format', 'YYYY/DD/MM'),
        					timePicker: attrDefault($this, 'timePicker', false),
        					timePickerIncrement: attrDefault($this, 'timePickerIncrement', false),
        					separator: attrDefault($this, 'separator', ' - '),
        				},
        				min_date = attrDefault($this, 'minDate', ''),
        				max_date = attrDefault($this, 'maxDate', ''),
        				start_date = attrDefault($this, 'startDate', ''),
        				end_date = attrDefault($this, 'endDate', '');
        			
        			if($this.hasClass('add-ranges'))
        			{
        				opts['ranges'] = ranges;
        			}	
        				
        			if(min_date.length)
        			{
        				opts['minDate'] = min_date;
        			}
        				
        			if(max_date.length)
        			{
        				opts['maxDate'] = max_date;
        			}
        				
        			if(start_date.length)
        			{
        				opts['startDate'] = start_date;
        			}
        				
        			if(end_date.length)
        			{
        				opts['endDate'] = end_date;
        			}
        			
        			
        			$this.daterangepicker(opts, function(start, end)
        			{
        				var drp = $this.data('daterangepicker');
        				
        				if($this.is('[data-callback]'))
        				{
        					//daterange_callback(start, end);
        					callback_test(start, end);
        				}
        				
        				if($this.hasClass('daterange-inline'))
        				{
        					$this.find('span').html(start.format(drp.format) + drp.separator + end.format(drp.format));
        				}
        			});
        			
        			if(typeof opts['ranges'] == 'object')
        			{
        				$this.data('daterangepicker').container.removeClass('show-calendar');
        			}
        		});
        		}
         
        	if($.isFunction($.fn.timepicker))
    		{
    			$(".timepicker").each(function(i, el)
    			{
    				var $this = $(el),
    					opts = {
    						template: attrDefault($this, 'template', false),
    						showSeconds: attrDefault($this, 'showSeconds', false),
    						defaultTime: attrDefault($this, 'defaultTime', 'current'),
    						showMeridian: attrDefault($this, 'showMeridian', true),
    						minuteStep: attrDefault($this, 'minuteStep', 15),
    						secondStep: attrDefault($this, 'secondStep', 15)
    					},
    					$n = $this.next(),
    					$p = $this.prev();
    				
    				$this.timepicker(opts);
    				
    				if($n.is('.input-group-addon') && $n.has('a'))
    				{
    					$n.on('click', function(ev)
    					{
    						ev.preventDefault();
    						
    						$this.timepicker('showWidget');
    					});
    				}
    				
    				if($p.is('.input-group-addon') && $p.has('a'))
    				{
    					$p.on('click', function(ev)
    					{
    						ev.preventDefault();
    						
    						$this.timepicker('showWidget');
    					});
    				}
    			});
    		}
        }

    }
})

// 文件上传
directiveMoudle.directive('filestyle', function() {
  return {
    restrict: 'A',
    controller: ["$scope", "$element", function($scope, $element) {
      var options = $element.data();
      
      // old usage support
        options.classInput = $element.data('classinput') || options.classInput;
      
      $element.filestyle(options);
    }]
  };
});

// 滚动
directiveMoudle.directive('scrollable', function(){
	  return {
	    restrict: 'EA',
	    link: function(scope, elem, attrs) {
	      var defaultHeight = 250;
	      elem.slimScroll({
	          height: (attrs.height || defaultHeight)
	      });
	    }
	  };
	});
 // 地图
directiveMoudle.directive('ngEcharts',[function(){
        return {
            scope:{
                option:'=ecOption'
            },
            restrict:'EA',
            link: function(scope,element,attrs,ctrl){
                function refreshChart(){
                       var chart = echarts.init(element[0]);
                       var geoCoordMap = {
                        '海门':[121.15,31.89],
                        '邯郸':[114.47,36.6],
                        '郑州':[113.65,34.76],
                        '哈尔滨':[126.63,45.75],
                        '聊城':[115.97,36.45],
                        '芜湖':[118.38,31.33],
                        '唐山':[118.02,39.63],
                        '平顶山':[113.29,33.75],
                        '邢台':[114.48,37.05],
                        '德州':[116.29,37.45],
                        '金华':[119.64,29.12],
                        '岳阳':[113.09,29.37],
                        '长沙':[113,28.21],
                        '衢州':[118.88,28.97],
                        '廊坊':[116.7,39.53],
                        '菏泽':[115.480656,35.23375],
                        '合肥':[117.27,31.86],
                        '武汉':[114.31,30.52],
                        '大庆':[125.03,46.58]
                    };
                        var convertData = function (data) {
                            var res = [];
                            for (var i = 0; i < data.length; i++) {
                                var geoCoord = geoCoordMap[data[i].name];
                                if (geoCoord) {
                                    res.push({
                                        name: data[i].name,
                                        value: geoCoord.concat(data[i].value)
                                    });
                                }
                            }
                            return res;
                        };
                        
                        var option = {
                             backgroundColor: scope.option.backgroundColor,
                             title: scope.option.title,
                             tooltip :scope.option.tooltip,
                             legend: scope.option.legend,
                             geo: {
                                map: 'china',
                                label: {
                                    emphasis: {
                                        show: true
                                    }
                                },
                                roam: true,
                                itemStyle: {
                                    normal: {
                                        areaColor: scope.option.geo.normal.areaColor,
                                        borderColor: scope.option.geo.normal.borderColor
                                    },
                                    emphasis: {
                                        areaColor: scope.option.geo.emphasis.areaColor
                                    }
                                }
                             },
                             series : [
                                {
                                    name: scope.option.series[0].name,
                                    type: 'scatter',
                                    coordinateSystem: 'geo',
                                    data: convertData(scope.option.series[0].data),
                                    symbolSize: function (val) {
                                        return val[2] / 10;
                                    },
                                    label: {
                                        normal: {
                                            formatter: '{b}',
                                            position: 'right',
                                            show: false
                                        },
                                        emphasis: {
                                            show: true
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            color: '#ddb926'
                                        }
                                    }
                                },
                                {
                                    name: scope.option.series[1].name,
                                    type: 'effectScatter',
                                    coordinateSystem: 'geo',
                                    data: convertData(scope.option.series[1].data.sort(function (a, b) {
                                        return b.value - a.value;
                                    }).slice(0, 6)),
                                    symbolSize: function (val) {
                                        return val[2] / 10;
                                    },
                                    showEffectOn: 'render',
                                    rippleEffect: {
                                        brushType: 'stroke'
                                    },
                                    hoverAnimation: true,
                                    label: {
                                        normal: {
                                            formatter: '{b}',
                                            position: 'right',
                                            show: true
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            color: '#f4e925',
                                            shadowBlur: 10,
                                            shadowColor: '#333'
                                        }
                                    },
                                    zlevel: 1
                                }
                            ]
                        };

                       chart.setOption(option, true);

                }

                //图表原生option
                scope.$watch(
                    function () { return scope.option; },
                    function (value) {if (value) {refreshChart();}},
                    true
                );
            }
        }
    }]);