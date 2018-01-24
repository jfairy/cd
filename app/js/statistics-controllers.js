var statisticsModule=angular.module('statistics',[]);

/* ------------------------------------操作记录统计------------------------------------ */
statisticsModule.controller('recordStatisticsCtrl',['$scope','$http','Notify',function($scope,$http,Notify){
	
	// 蓝图实例列表
    $http.get('/cloudui/master/ws/dashboard/listAllBlueprintInstances'+'?v=' + (new Date().getTime())).success(function(data){
      $scope.blueprintInstancesList = data;
      $scope.blueprintInstancesList.unshift({'INSTANCE_NAME':'(ALL)'});
      $scope.blueprint=data[0];
    })
		 
    
    $scope.$watch('blueprint',function(newval,oldval){
    	if(newval){
	      if(newval.INSTANCE_ID){
	    	 // 获取蓝图实例下流程列表
	         $http.get('/cloudui/master/ws/dashboard/getFlows'+'?v=' + (new Date().getTime()),{
	             params:
	                 {
	            	    blueInstanceId:newval.INSTANCE_ID,
	                 }
	         }).success(function(data){
	               $scope.flowList = data;
	               //$scope.flow=data[0];
	               $scope.flowList.unshift({'FLOW_NAME':'(ALL)'});
	               
	               if(newval.flow){
		               $scope.flow=$filter('filter')($scope.flowList.flow,newval.flow)[0]; 
	               }else{
	            	   $scope.flow=$scope.flowList[0]; 
		           }
	         })
	      }else{
	    	  /*$scope.flowList.splice(0,$scope.flowList.length);
	    	  $scope.flow=$scope.flowList[0]; */
	    	  $scope.flowList=[{'FLOW_NAME':'(ALL)'}];
	    	  $scope.flow=$scope.flowList[0];
	      }
	      if(newval.ID){
	    	// 获取蓝图实例下组件列表
	        $http.get('/cloudui/master/ws/dashboard/listApps'+'?v=' + (new Date().getTime()),{
	           params:
	               {
	                  id:newval.ID
	               }
	        }).success(function(data){
	             $scope.componentList = data;
	             //$scope.component=data[0];
	             $scope.componentList.unshift({'nodeDisplay':'(ALL)'});
	             
	             if(newval.component){
	                 $scope.blueprint=$filter('filter')($scope.componentList.component,newval.component)[0]; 
	             }else{
	           	  	 $scope.component=$scope.componentList[0]; 
	             }
	        }) 
	        
	      }else{
	    	  /*$scope.componentList.splice(0,$scope.componentList.length);
	    	  $scope.component=$scope.componentList[0]; */
	    	  $scope.componentList=[{'nodeDisplay':'(ALL)'}];
	    	  $scope.component=$scope.componentList[0];
	      }
    	}
    },true)
    
    // 操作列表
    $scope.doList=[
       {"text":"(ALL)","value":""},
       {"text":"部署","value":"deploy"},
       {"text":"启动","value":"start"},
       {"text":"停止","value":"stop"},
       {"text":"卸载","value":"destroy"},
       {"text":"升级","value":"upgrade"},
       {"text":"回滚","value":"rollback"},
       {"text":"快照","value":"snapshot"}
    ]
    
    $scope.op=$scope.doList[0].value;
    
    $scope.resultText=function(text){
    	return text?'成功':'失败';
    }
    
//    $scope.warninginfo='提示：请选择日期区间查询数据！';
    
    // 查询
    $scope.querylog = function ()
	{   
		 var daterange=$('.daterange').val();
		 
/*		 if(!daterange){
	         Notify.alert( 
	               '请先选择日期区间，再进行查询！', 
	               {status: 'info'}
	           );
	         return false;
	     }*/
		 
		 $scope.startdate=daterange.split(' - ')[0];
		 $scope.enddate=daterange.split(' - ')[1];

		 console.log($scope.component);
		 console.log($scope.flow);
		 console.log($scope.blueprint);
		 console.log($scope.op);

 
            
          var blueInstanceName=$scope.blueprint.INSTANCE_NAME=='(ALL)'?'':$scope.blueprint.INSTANCE_NAME;
          var blueInstanceId=$scope.blueprint.INSTANCE_NAME=='(ALL)'?'':$scope.blueprint.INSTANCE_ID;
          var flowName=$scope.flow.FLOW_NAME=='(ALL)'?'':$scope.flow.FLOW_NAME;
          var flowId=$scope.flow.FLOW_NAME=='(ALL)'?'':$scope.flow.FLOW_ID;
          var componentName=$scope.component.nodeDisplay=='(ALL)'?'':$scope.component.componentName;
          var appName=$scope.component.nodeDisplay=='(ALL)'?'':$scope.component.appName;
          var nodeDisplay=$scope.component.nodeDisplay=='(ALL)'?'':$scope.component.nodeDisplay;
		  var op =$scope.op?$scope.op:'';

		 
		 $http.get('/cloudui/master/ws/dashboard/getRecords'+'?v=' + (new Date().getTime()),{
		     params:
		     {
		    	 nodeDisplay:nodeDisplay,
		    	 appName:appName,
		    	 blueInstanceId:blueInstanceId,
		    	 blueInstanceName:blueInstanceName,
		    	 componentName:componentName,
		    	 endDate:$scope.enddate||'',
		    	 flowId:flowId,
		    	 flowName:flowName,
		    	 op:op,
		    	 startDate:$scope.startdate||''
		     }
		 }).success(function(data){
			$scope.resultData=data;   
		    $scope.listoff=data.total>0?true:false;
		    $scope.warninginfo='提示：暂无数据';
		 }).error(function(){
		    $scope.listoff=false;
		    $scope.warninginfo='暂无结果';
	     })
		};

}])

