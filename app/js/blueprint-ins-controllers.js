var blueprintInsModule=angular.module('blueprint-ins',[]);
/* ------------------------------------蓝图实例管理------------------------------------ */
blueprintInsModule.controller('blueprintInsManageCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$state','$cookieStore','$filter',function($rootScope,$scope,$http,ngDialog,Notify,$state,$cookieStore,$filter){
	
  $scope.blueprintInsPages=[
     "app.blueprint_ins_manage",
     "app.blueprint_ins_view",
     "app.blueprint_ins_clone",
     "app.blueprint_ins_snapshoot",
     "app.blueprint_ins_flow_view",
     "app.blueprint_ins_log_manage",
     "app.blueprint_ins_resource_configs",
     "app.blueprint_ins_component_configs",
     "app.blueprint_ins_configs_compare",
     "app.blueprint_ins_flow_monitor",
     "app.blueprint_ins_components",
     "app.blueprint_ins_components_log_manage",
     "app.blueprint_ins_component_flow_monitor",
     "app.blueprint_ins_component_instance"
  ]

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    var isClear=$filter('filter')($scope.blueprintInsPages,toState.name).length>0?false:true;
    if(isClear){
      $scope.clearCookie(); 
    }
  });

  // 搜索类型
  $scope.searchTypeList=[
    {text:'按蓝图实例名称搜索',value:'blueprint-ins'},
    {text:'按组件名称搜索',value:'app'},
    {text:'按蓝图模板名称搜索',value:'blueprint'}
  ];
  
  $scope.templateName='';
  $scope.appName='';
  $scope.blueprintName='';

  $scope.pageNum=$cookieStore.get('blueprintInsPageNum')?$cookieStore.get('blueprintInsPageNum'):1;

  $scope.searchType=$cookieStore.get('blueprintInsSearchType')?$cookieStore.get('blueprintInsSearchType'):"blueprint-ins";
	
  $scope.searchval=$cookieStore.get('blueprintInsSearch')?$cookieStore.get('blueprintInsSearch'):'';

	$scope.setCookie=function(val){
		$cookieStore.put('blueprintInsPageNum',$scope.pageNum);
    $cookieStore.put('blueprintInsSearchType',$scope.searchType);
    $cookieStore.put('blueprintInsSearch',$scope.searchval);
	}
	
	$scope.clearCookie=function(){
		$cookieStore.remove("blueprintInsPageNum");
		$cookieStore.remove("blueprintInsSearchType");
    $cookieStore.remove("blueprintInsSearch");
	}    

  $scope.$watch('searchType',function(newval,oldval){
      if(newval&&(newval!==oldval)){
         $scope.search();
      }else if(newval&&(newval==oldval)){
        $scope.searchValFn();
      } 
  }) 
	
	// 蓝图实例列表
    $scope.pageSize=10;
    $scope.onPageChange = function ()
    {   
      $http.get('/cloudui/master/ws/blueprint/listBlueprintByNameAndTemplateAndApp'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            blueprintName:$scope.blueprintName,
			      templateName:$scope.templateName,
			      appName:$scope.appName,
          }
     }).success(function(data){
    	 
    	// 蓝图实例流程列表
        angular.forEach(data.rows,function(val,key){
    		 $http.get('/cloudui/master/ws/blueprint/getFlowsByInstance',{
    			 params:{
    				 blueprintInstanceId:val.INSTANCE_ID
    			 }
    		 }).success(function(data){
    			 val.flowList=data;
    		 })
    	})
    	// 蓝图实例流程列表 end
    	
    	// 兄弟蓝图实例列表
        angular.forEach(data.rows,function(val,key){
    		 $http.get('/cloudui//master/ws/blueprint/getBrotherBlueprintInstance',{
    			 params:{
    				 blueprintId:val.TEMPLATE_ID,
    				 blueprintInsId:val.INSTANCE_ID
    			 }
    		 }).success(function(data){
    			 val.compareList=data;
    		 })
    	})
    	// 兄弟蓝图实例列表 end
    	
    	$scope.listoff=data.rows.length>0?true:false;
        $scope.warninginfo='暂无数据';
        $scope.blueInstancesList = data.rows;
        $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
        if($scope.pageCount==0){
          $scope.pageCount=1;
        }
     }).error(function(){
         $scope.templistoff=false;
         $scope.warninginfo='暂无结果';
     })
    }

    $scope.searchValFn=function(){
        if($scope.searchType=='app'){ // 按组件搜索
           $scope.templateName='';
           $scope.blueprintName='';
           $scope.appName=$scope.searchval;
       }else if($scope.searchType=='blueprint'){ // 按蓝图搜索
           $scope.templateName=$scope.searchval;
           $scope.blueprintName='';
           $scope.appName='';
       }else if($scope.searchType=='blueprint-ins'){ // 按蓝图实例搜索
           $scope.templateName='';
           $scope.blueprintName=$scope.searchval;
           $scope.appName='';
       }
    }
    
    // 搜索蓝图实例
    $scope.search=function()
    { 
       $scope.searchValFn();
    	 $scope.pageNum=1;
    	 $scope.setCookie();
       $scope.onPageChange(); 
    }
    

    // 删除蓝图实例
    $scope.delIns=function(param){
      ngDialog.openConfirm({
           template:
                '<p class="modal-header">您确定要删除此蓝图实例吗?</p>' +
                '<div class="modal-body text-right">' +
                  '<button type="button" class="btn btn-default mr20" ng-click="closeThisDialog(0)">取消' +
                  '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
                '</button></div>',
          plain: true,
          className: 'ngdialog-theme-default'
     }) .then(
        function(){
         $rootScope.app.layout.isShadow=true;
         $http({
             method  : 'POST',
             url     : '/cloudui/ws/blueprint/delBlueprintInstance',   
             data    : $.param({blueprintInstanceId:param}),   
             headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
       })
       .success(function(data){
          $rootScope.app.layout.isShadow=false;
            if(data.result)
          {
              Notify.alert(
                  '<em class="fa fa-check"></em> '+data.message ,
                  {status: 'success'}
              );  
              $scope.clearCookie();
              $state.go('app.blueprint_ins_manage',{},{reload:true});
          }else
          {
              Notify.alert(
                  '<em class="fa fa-times"></em> '+data.message ,
                  {status: 'danger'}
              ); 
          }
         })    
     })
   }
    
   // 生成快照
   $scope.snapshoot=function(id){
	   ngDialog.open({
	          template: 'app/views/dialog/blueprint-ins-snapshoot.html'+'?action='+(new Date().getTime()),
	          className: 'ngdialog-theme-default',
	          scope: $scope,
	          data:{id:id},
	          closeByDocument:false,
	          cache:false,
	          controller:'snapshoot'
       });
   }
   
 
}])

/* ------------------------------------蓝图实例生成快照------------------------------------ */
blueprintInsModule.controller('snapshoot',['$rootScope','$scope','$http','ngDialog','Notify',function($rootScope,$scope,$http,ngDialog,Notify){
	
	$rootScope.submitted = false;
	
	$scope.saveSnapshootFn=function(){
		
        $rootScope.submitted = true;
		
		$rootScope.app.layout.isShadow=true;
		
		$http({
	        method:'post',
	        url:'/cloudui/master/ws/blueprint/saveSnapshotofBlueprintInstance', 
	        data: $.param({
	        	blueInstanceId:$scope.ngDialogData.id,
	        	snapshotName:$scope.name,
	        	userId:$rootScope.user.id
	        }),   
	          headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
	     })
	     .success(function(data){
	    	 $rootScope.app.layout.isShadow=false;
	         if(data.result)
	         {
	            Notify.alert(
	              '<em class="fa fa-check"></em> '+data.message,
	              {status: 'success'}
	            );
	            ngDialog.close();
	         }else
	         {
	           Notify.alert(
	             '<em class="fa fa-times"></em> '+data.message,
	             {status: 'danger'}
	           );
	         }
	     })
	}
	
}])

/* ------------------------------------蓝图实例资源配置管理------------------------------------ */
blueprintInsModule.controller('blueprintInsResourceConfigsManageCtrl',['$rootScope','$scope','$http','$stateParams','$filter','$state','Notify','ngDialog','$timeout',function($rootScope,$scope,$http,$stateParams,$filter,$state,Notify,ngDialog,$timeout){
    
	$rootScope.submitted = false;
	
	$scope.nodeModify=false;
	
	// 蓝图实例资源列表	
	$http({
      method  : 'POST',
      url     : '/cloudui/master/ws/blueprint/getBlueprintResourcePoolConfigs',   
      data    : $.param({
    	  blueprintId:$stateParams.insId
      }),   
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
    }).success(function(data){
    	if(data.result){
			$scope.resourceData=angular.fromJson(data.data);
			$scope.resourceList=[];
			angular.forEach($scope.resourceData,function(val,key){
				$scope.resourceList.push(val);
			})
			$scope.resource=$scope.resourceList[0];
		}
    })
	
	$scope.$watch('resource',function(newval,oldval){
		if(newval){
			$scope.label=newval.label.value;
			$scope.cluster_id=newval.cluster_id;
			$scope.dafaultNodes=angular.fromJson(newval.nodes);
			$scope.checkappId=[];
		    angular.forEach($scope.dafaultNodes,function(val,key){
		        $scope.checkappId.push(val.ip)
		    })
		    $scope.getNodeList($scope.cluster_id);
			$scope.nodeModify = false;
		}
	})

	$scope.nodeCheckModify=function(node,event){
		$scope.nodeModify=false;
		var action=event.target;
		var check=action.checked;
		var mark=-1;
		if(check){
			$scope.checkappId.push(node.ip);
		}
		else{
			angular.forEach($scope.checkappId,function(val,key){
				if(val==node.ip){
					$scope.checkappId.splice(key,1);
					mark=key;
				}
			})
		}
		if($scope.checkappId.length==$scope.dafaultNodes.length){
			angular.forEach($scope.checkappId,function(val,key){
				var exist=$filter('filter')(angular.fromJson($scope.dafaultNodes),val).length>0?true:false;
				if(!exist){
					$scope.nodeModify=true;
				}
			})
		}
		else{
			$scope.nodeModify=true;
		}
		if(check){
			$scope.checkappId.pop();
		}
		else{
			$scope.checkappId.splice(mark,0,node.ip);
		}
	}

    // 环境下的节点
	
	$scope.getNodeList=function(clusterId){
        $http.get('/cloudui/master/ws/node/listAll'+'?v='+(new Date().getTime()),{
            params:{
              clusterId:clusterId
            }
          }).
          success(function(data){
             if($scope.dafaultNodes){
               angular.forEach(data,function(val,key){
                  var ischecked=$filter('filter')(angular.fromJson($scope.dafaultNodes),val.ip).length>0?true:false;
                  val.ischecked=ischecked;
                 })
                 $scope.nodeList=data;
             }else{
               $scope.nodeList=data;
             } 
              
          })
   }

    $scope.$watch('cluster_id',function(newval,oldval){
        if(newval){
        	$scope.getNodeList(newval);
        }
    })

    // 选择节点
    $scope.saveConfig=function(){
	$rootScope.submitted = false;
      // 选中节点
      var checkbox = $scope.checkappId;
      
      var nodes=[];
      var nodesList=[];
      angular.forEach(checkbox,function(val,key){
    	    var obj={};
    	    obj.ip=val;
            nodes.push(val);
            nodesList.push(obj);
      })
      $scope.resource.label.value=$scope.label;
 
       $scope.resource.nodes=nodesList;
       $scope.resource.ins=nodesList.length;
       $scope.resourcePoolConfig={};
       $scope.resourcePoolConfig[$scope.resource.key]=$scope.resource;
       
       $http({
              method  : 'POST',
              url     : '/cloudui/master/ws/blueprint/updateBlueprintResourcePoolConfigs',   
              data    : $.param({
            	  blueprintId:$stateParams.insId,
            	  resourcePoolConfig:angular.toJson($scope.resourcePoolConfig)
              }),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
      }).success(function(data){
    	  if(data.result)
          {
			  $scope.nodeModify=false;
			  $scope.dafaultNodes=angular.fromJson(nodesList);
			  $scope.checkappId=[];
		      angular.forEach($scope.dafaultNodes,function(val,key){
				  $scope.checkappId.push(val.ip)
		      })
              Notify.alert(
                    '<em class="fa fa-check"></em> '+data.message ,
                    {status: 'success'}
               );
          }else
          {
               Notify.alert(
                    '<em class="fa fa-times"></em> '+data.message ,
                    {status: 'danger'}
                ); 
          }
      })
   }
	
	// 确定
	$scope.sureFn=function(){
		// 获取伸缩资源池配置
		$http({
	        method:'post',
	        url:'/cloudui/master/ws/blueprint/getRcResourcePoolByBlueprintInstance', 
	        data: $.param({
	        	blueInstanceId:$stateParams.insId,
	        	userId:$rootScope.user.id
	        }),   
	          headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
	    })
	    .success(function(data){
	    	 if(data.result){
	    		 $scope.rcnodeListData=angular.fromJson(data.data);
	    		 $scope.rcnodeList=[];
	    		 angular.forEach($scope.rcnodeListData,function(val,key){
	    			 $scope.rcnodeList.push(val);
	    		 })
	 
	    		 if($scope.rcnodeList.length>0){
	    			 ngDialog.open({
	    		          template: 'app/views/dialog/blueprint-ins-resource-telescopic.html'+'?action='+(new Date().getTime()),
	    		          className: 'ngdialog-theme-default ngdialog-lg',
	    		          scope: $scope,
	    		          data:{insName:$stateParams.insName,insId:$stateParams.insId,INSTANCE_ID:$stateParams.INSTANCE_ID,resource:$scope.rcnodeList},
	    		          closeByDocument:false,
	    		          cache:false,
	    		          controller:'resourceTelescopic'
	    	         }); 
	    		 }else{
	    			Notify.alert(
    		             '资源映射无修改，无需伸缩！',
    		             { status: 'success',
    		               timeout:500	 
    		             }
	    	    	);
	    			
	    			$state.go('app.blueprint_ins_manage',{},{reload:true}); 
	    			
	    		 }
	    	 }else{
	    		 Notify.alert(
		             '<em class="fa fa-times"></em> '+data.message+data.reason,
		             {status: 'danger'}
	    	      );
	    	 }
	    })
		
	}
}])

/* ------------------------------------蓝图实例资源收缩------------------------------------ */
blueprintInsModule.controller('resourceTelescopic',['$rootScope','$scope','$http','$stateParams','$filter','Notify','$state','ngDialog','$timeout',function($rootScope,$scope,$http,$stateParams,$filter,Notify,$state,ngDialog,$timeout){

	// 获取伸缩资源池配置
	$scope.rcnodeList=$scope.ngDialogData.resource;
	
	$scope.isexit_increase=false; // 是否有扩展流程(有一个资源池有即有)
	
	$scope.isexit_reduce=false;   // 是否有收缩流程(有一个资源池有即有)
	
    $scope.increasecheckappId=[]; // 选中的扩展流程
	
	$scope.reducecheckappId=[]; // 选中的收缩流程
	
	angular.forEach($scope.rcnodeList,function(val,key){
		 
		var increase_nodes=angular.fromJson(val.increase_nodes);
		var reduce_nodes=angular.fromJson(val.reduce_nodes);
		if(increase_nodes.length>0){
			$timeout(function(){
				$scope.isexit_increase=true;
			})
		} 
		
		if(reduce_nodes.length>0){
			$timeout(function(){
				$scope.isexit_reduce=true;
			})
		} 
	})
	
	// 节点列表
    $scope.getNodeListArr=function(str){
		return angular.fromJson(str);
	}
    
    // 蓝图实例流程列表
     $http.get('/cloudui/master/ws/blueprint/getFlowsByInstance',{
		 params:{
			 blueprintInstanceId:$scope.ngDialogData.INSTANCE_ID
		 }
	 }).success(function(data){
		 $scope.flowList=data;
	 })
	 
	 // 伸缩
	 $scope.telescopicFn=function(){
 		var cdFlowIds={};

 		cdFlowIds.increase=$scope.increasecheckappId.toString()||'';
 		cdFlowIds.reduce=$scope.reducecheckappId.toString()||'';
 			
 		$http({
 	        method:'post',
 	        url:'/cloudui/master/ws/blueprint/executeBlueprintRCFlow', 
 	        data: $.param({
 	        	blueInstanceId:$scope.ngDialogData.insId,
 	        	cdFlowIds:angular.toJson(cdFlowIds) 
 	        }),   
 	        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
 	    }).success(function(data){
 	    	if(data.result)
 	         {
 	            Notify.alert(
 	              '<em class="fa fa-check"></em> '+data.message,
 	              {status: 'success'}
 	            );
 	            ngDialog.close();
 	            $state.go('app.blueprint_ins_log_manage',{insName:$scope.ngDialogData.insName,INSTANCE_ID:$scope.ngDialogData.INSTANCE_ID},{reload:true});
 	         }else
 	         {
 	           Notify.alert(
 	             '<em class="fa fa-times"></em> '+data.message,
 	             {status: 'danger'}
 	           );
 	         }
 	    })
 	}
}])
	
 
/* ------------------------------------蓝图实例组件配置管理------------------------------------ */
blueprintInsModule.controller('blueprintInsComponentConfigsManageCtrl',['$rootScope','$scope','$http','$stateParams','$filter','Notify','$state','$timeout',function($rootScope,$scope,$http,$stateParams,$filter,Notify,$state,$timeout){
	
	$scope.current={}; // 当前版本
	$scope.target={};  // 目标版本
	$scope.switchOff=false;
	$rootScope.submitted = false;
	
	// 获取蓝图实例组件列表
	$http({
        method:'post',
        url:'/cloudui/master/ws/blueprint/getBlueprintComponents',
        data: $.param({
        	blueprintId:$stateParams.INSTANCE_ID
        }),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
    	 if(data.result){
    		 $scope.componentList=angular.fromJson(data.message);
    		 $scope.component=$scope.componentList[0];
    	 } 
    })
    
   
    $scope.$watch('component',function(newval,oldval){
    	if(newval){
    		// 组件智能开关
    		if(newval.smartFlag==1){
    			$scope.switchOff=true;
    		}else if(newval.smartFlag==0){
    			$scope.switchOff=false;
    		}else{
    			$scope.switchOff=false;
    		}
    		// 获取组件版本列表
    		$http.get('/cloudui/master/ws/resource/listNewResourceVersionByPage'+'?v=' + (new Date().getTime()),{
		          params:
		          {
			          resourceId:newval.resourceId,
			          pageSize:10000,
			          pageNum:1,
			          versionName:''
		          }
	        }).success(function(data){	    	
	             $scope.componentVersionList = data.rows;
	             $scope.componentVersionList.unshift({});

	             if(newval.currentVersion){
	            	 $scope.current.version=$filter('filter')($scope.componentVersionList,newval.currentVersion)[0]; 
	             }else{
	            	 $scope.current.version=$scope.componentVersionList[0]; 
	             }
	             
	             if(newval.targetVersion){
	            	 $scope.target.version=$filter('filter')($scope.componentVersionList,newval.targetVersion)[0]; 
	             }else{
	            	 $scope.target.version=$scope.componentVersionList[0]; 
	             }
     
	       })
        }
   })
   
   // 展示组件版本配置
   $scope.showConfig=function(config,inputArr,outputArr){
     
       if(config.input)
       {
       	  angular.forEach(config.input,function(val,key){
       		inputArr.push({key:key,value:val})
          })
       } 
       
       if(config.output){
       	  angular.forEach(config.output,function(val,key){
       		outputArr.push({key:key,value:val})
          })
       } 
       
  }
	
	
   
   // 获取当前组件版本配置
   $scope.$watch('current.version',function(newval,oldval){
	    
	   if(newval.id){
		   $http({
		        method:'post',
		        url:'/cloudui/master/ws/blueprint/getBlueprintComponentConfig',
		        data: $.param({
		        	blueprintId:$stateParams.INSTANCE_ID,
		    		componentId:$scope.component.id,
		    		version:'current',
		    		resourceVersionId:newval.id
		        }),
		        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		    }).success(function(data){
		    	 if(data.result){
		    		 $scope.currentInputConfigs=[];
		    		 $scope.currentOutputConfigs=[];
		    		 $scope.showConfig(angular.fromJson(data.message),$scope.currentInputConfigs,$scope.currentOutputConfigs);
		    	 } 
		    })
	   }else{
		   $scope.currentInputConfigs=[];
  		   $scope.currentOutputConfigs=[]; 
	   }
   })
   
   
   // 获取目标组件版本配置
   $scope.$watch('target.version',function(newval,oldval){
	   if(newval.id){
		   $http({
		        method:'post',
		        url:'/cloudui/master/ws/blueprint/getBlueprintComponentConfig',
		        data: $.param({
		        	blueprintId:$stateParams.INSTANCE_ID,
		    		componentId:$scope.component.id,
		    		version:'target',
		    		resourceVersionId:newval.id
		        }),
		        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		    }).success(function(data){
		    	 if(data.result){
		    		 $scope.targetInputConfigs=[];
		    		 $scope.targetOutputConfigs=[];
		    		 $scope.showConfig(angular.fromJson(data.message),$scope.targetInputConfigs,$scope.targetOutputConfigs);
		    	 } 
		    })
	   }else{
		   $scope.targetInputConfigs=[];
  		   $scope.targetOutputConfigs=[];
	   }
   })
   
   // 添加
   $scope.add=function(list){
	   var obj={};
       $scope[list].push(obj);
   }
	
   // 删除
   $scope.del=function(list,idx){
       $scope[list].splice(idx,1);
   }
   
   // 配置数组转json
   $scope.configArrToJson=function(arr){
	   var obj={};
	   angular.forEach(arr,function(val,key){
		   obj[val.key]=val.value;
       })
       return obj;
   }
   
   $scope.newvarList=[]; // 自定义变量
   
   // 保存配置
   $scope.saveConfigs=function(){
        
       if($scope.switchOff){
    	   $scope.smartFlag=1;
       }else{
    	   $scope.smartFlag=0;
       }
       
	   if(!$scope.current.version.id&&!$scope.target.version.id){
		   Notify.alert(
              '当前版本或目标版本至少有一个需要选择版本！',
              {status: 'info'}
           );  
		   return false;
	   } 
	   
	   $rootScope.submitted = true;
	   
	   $scope.delWithPassword($scope.targetInputConfigs, 'targetinputvalue');
	   $scope.delWithPassword($scope.targetOutputConfigs, 'targetoutputvalue');
	   $scope.delWithPassword($scope.currentInputConfigs, 'currentinputvalue');
	   $scope.delWithPassword($scope.currentOutputConfigs, 'currentoutputvalue');

	   $http({
	        method:'post',
	        url:'/cloudui/master/ws/blueprint/updateBlueprintComponentConfig',
	        data: $.param({
	        	blueprintId:$stateParams.INSTANCE_ID,
	    		componentId:$scope.component.id,
	    		currentVersion:$scope.current.version.id,
	    		currentInput:$scope.currentInputConfigs==[]?"":angular.toJson($scope.configArrToJson($scope.currentInputConfigs)),
	    		currentOutput:$scope.currentOutputConfigs==[]?"":angular.toJson($scope.configArrToJson($scope.currentOutputConfigs)),
	    		targetVersion:$scope.target.version.id,
	    		targetInput:$scope.targetInputConfigs==[]?"":angular.toJson($scope.configArrToJson($scope.targetInputConfigs)),
	    		targetOutput:$scope.targetOutputConfigs==[]?"":angular.toJson($scope.configArrToJson($scope.targetOutputConfigs)),
	    		smartFlag:0
	        }),
	        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
	   }).success(function(data){
	    	 if(data.result){
	    		 $scope.varList=[];
	    		 var varData=angular.fromJson(data.message);
	    		 
	    		 angular.forEach(varData,function(val,key){
	    			 $scope.varList.push({key:key,value:val})
	    	   })

           $timeout(function(){
                var h = $(document).height()-$(window).height();
                $(document).scrollTop(h); 
            })
	    	 } 
	   })
   }
   
   // 保存变量
   $scope.saveVar=function(){
	   $scope.delWithPassword($scope.varList, 'varvalue');
	   $scope.delWithPassword($scope.newvarList, 'newvarvalue');
	   $http({
	        method:'post',
	        url:'/cloudui/master/ws/blueprint/updateBlueprintConfig',
	        data: $.param({
	    		blueprintId:$stateParams.INSTANCE_ID,
	    		configValue:angular.toJson($.extend($scope.configArrToJson($scope.varList),$scope.configArrToJson($scope.newvarList)))	
	        }),
	        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
	   }).success(function(data){
		   if(data.result)
	       {
	           Notify.alert(
	              '<em class="fa fa-check"></em> '+data.message ,
	              {status: 'success'}
	           );  
	           $state.go('app.blueprint_ins_manage',{},{reload:true});
	        }else
	        {
	            Notify.alert(
	                '<em class="fa fa-times"></em> '+data.message ,
	                {status: 'danger'}
	            ); 
	        }
	   })
   }

   // 计算密码类checkbox是否选中,初始化input类型
   $scope.passwordChecked=function(obj,inputId){
	   if(obj.value.substring(0,4)=='DEC(' && obj.value.substring(obj.value.length-1, obj.value.length)==')'){
		  document.getElementById(inputId).setAttribute('type','password');
		  obj.value = obj.value.substring(4, obj.value.length-1);
	   }
	   var type = document.getElementById(inputId).getAttribute('type');
	   if(type=='password'){
		  return true;
	   }
	   else{
		  return false;
	   }
   }

   // 切换input的type为text/password
   $scope.passwordTypeChange=function(obj,inputId){
	   var type = document.getElementById(inputId).getAttribute('type');
	   if(type=='password'){
		  document.getElementById(inputId).setAttribute('type','text');
	   }
	   else{
		  document.getElementById(inputId).setAttribute('type','password');
	   }
   }

   // 计算需要加密的参数
   $scope.delWithPassword=function(obj,inputId){
	   angular.forEach(obj,function(ele,index){
			var type=document.getElementById(inputId+index).getAttribute('type');
			if(type=='password'){
				ele.value='DEC('+ele.value+')';
			}	
	   })
   }
  
}])
 
    
 
/* ------------------------------------蓝图实例日志管理------------------------------------ */
blueprintInsModule.controller('blueprintInsLogManageCtrl',['$scope','$http','$stateParams','Notify','$interval',function($scope,$http,$stateParams,Notify,$interval){
    
	$scope.$on('$destroy', function() {
	     $interval.cancel($scope.historyTimer);  
    });
	
	$scope.doData={};
	$scope.pageSize=10;
	$scope.pageNum=1;

	// 查看对应的流程操作类型操作历史记录
    $scope.doHistoryListFn=function(index,flowName){
    	for(var i=0;i<$scope.flowList.length;i++)
    	{
    		$scope.flowList[i].off=false;
    	}
    	$scope.flowList[index].off=true;
    }
    
    $scope.onPageChange = function (pageNum,flowName,flowId)
	 {  

    	$scope.curPageNum=pageNum;
    	$scope.curFlowName=flowName;
    	$scope.curFlowId=flowId;
		$http.get('/cloudui/master/ws/monitor/getFlowInstanceIds'+'?v='+(new Date().getTime()),{
	         params:{
	        	 bluePrintInsId:$stateParams.INSTANCE_ID,
	        	 flowId:flowId,
	        	 pageSize:$scope.pageSize, 
	        	 pageNum:pageNum
	         }
	     }).
	     success(function(data){
	    	  $scope.doData[flowName]=data.rows;
	    	  $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
	          if($scope.pageCount==0){
	            $scope.pageCount=1;
	          }
	         
	     })
	 }
    
    
    $scope.historyTimer=$interval(function(){
  	    if($scope.curPageNum&&$scope.curFlowName&&$scope.curFlowId){
  	    	$scope.onPageChange($scope.curPageNum,$scope.curFlowName,$scope.curFlowId);
  	    }
    },3000)
	 
	// 获取蓝图实例流程的操作类型
	$http.get('/cloudui/master/ws/blueprint/getFlowsByInstance',{
		 params:{
			 blueprintInstanceId:$stateParams.INSTANCE_ID
		 }
	 }).success(function(data){
		 angular.forEach(data,function(val,key){
			 val.off=false;
		 })
		 $scope.flowList=data;
		 if(data){
			 $scope.flowList[0].off=true;
		 }
		 
	 })
   
	 // 结束
	 $scope.overFn=function(id){
		$http.get('/cloudui/master/ws/monitor/endInstance'+'?v='+(new Date().getTime()),
			{
			params:{
			  id:id
		    }
		}).success(function(data){
			if(data.result){
				Notify.alert(
	               '<em class="fa fa-check"></em> '+data.message,
	               {status: 'success'}
	            );
			}else{
				Notify.alert(
	               '<em class="fa fa-times"></em> '+data.message,
	               {status: 'danger'}
	            );
			}
		})
	}
}])

/* ------------------------------------蓝图实例流程监控------------------------------------ */
blueprintInsModule.controller('blueprintInsFlowMonitorCtrl',['$scope','$http','$stateParams','ngDialog','$interval','$filter','$timeout','Notify',function($scope,$http,$stateParams,ngDialog,$interval,$filter,$timeout,Notify){
	
	$scope.$on('$destroy', function() {
	     $interval.cancel($scope.treeTimer);  
    });
	
	// 树结构数据重组
    $scope.changeTreeData=function(obj){
    	obj.label=obj.name;
    	if(obj.children){
    		angular.forEach(obj.children,function(val,key){
    			$scope.changeTreeData(val);
    		})
    	}
    }

    $scope.dataMonitor=function(oriObj,newObj){
 
    	oriObj.state=newObj.state; // 改变状态
    	oriObj.meddleError=newObj.meddleError;
      oriObj.id=newObj.id;
        if(oriObj.children){
        	for(var i=0;i<newObj.children.length;i++)
        	{
        		if(oriObj.children[i]){ // 已有节点改变状态
        			$scope.dataMonitor(oriObj.children[i],newObj.children[i]);
        		}else{ // 新节点添加到数据中
        			oriObj.children.push(newObj.children[i])
        		}
        	}
        }
    }

    // 树形状态实时刷新
    $scope.treeMonitor=function(oriData){
    	$scope.treeTimer=$interval(function(){
    		$http.get('/cloudui/master/ws/monitor/getFlowNodes'+'?v='+(new Date().getTime()),{
    			params:{
    				id:$stateParams.flowMonitorInsId,
    				flowId:$stateParams.flowId
    			}
    		}).success(function(data){
    			if(data.result){
    				var treeNodeData=angular.fromJson(data.message);
    				$scope.changeTreeData(treeNodeData); 
    				 
        			$scope.dataMonitor(oriData,treeNodeData);
    			}else{
    				$interval.cancel($scope.treeTimer);
    			}
    			
    		}).error(function(oriData){
    			$interval.cancel($scope.treeTimer);  
    		})
       },3000)
    }
    

	$http.get('/cloudui/master/ws/monitor/getFlowNodes'+'?v='+(new Date().getTime()),{
		params:{
			id:$stateParams.flowMonitorInsId,
			flowId:$stateParams.flowId
		}
	}).success(function(data){
		if(data.result){
			var treeNodeData=angular.fromJson(data.message);
			$scope.treeData=[];
			$scope.treeData.push(treeNodeData);
			$scope.changeTreeData($scope.treeData[0]); 
			if($scope.treeData){
				$scope.treeoff=true;
				$scope.my_data=$scope.treeData;
				if($scope.my_data[0]){
					$scope.treeMonitor($scope.my_data[0]);
				}
				var tree;
				$scope.my_tree = tree = {};
			}
		}else{
			$interval.cancel($scope.treeTimer);  
		}
		
	}).error(function(){
		$interval.cancel($scope.treeTimer);  
	})
	
	// 获取文件内容
	$scope.my_tree_handler = function(branch,tree) {

		$scope.isMonitor=false;	
		$scope.branch=branch;	
		$scope.$watch('branch',function(newval,oldval){
			if(newval){
				$scope.isMonitor=true;
			}else{
				$scope.isMonitor=false;
			}
		})
		 
    };
    
    $scope.stateFn=function(state){
        if(state==2){
           return "执行成功！"
        }else if(state==7){
           return "执行失败！"
        }else if(state==0){
           return "正在执行！"
        }
     }
    
    // 日志详情
    $scope.pluginLog=function(type,id){
    	// 开始节点错误日志
    	if(type=='1'){
    		ngDialog.open({
	  	          template: 'app/views/dialog/monitor-startnode-log-detail.html'+'?action='+(new Date().getTime()),
	  	          className: 'ngdialog-theme-default ngdialog-lg',
	  	          scope: $scope,
	  	          data:{id:id},
	  	          closeByDocument:false,
	  	          cache:false,
	  	          controller:'startLogMonitor'
  	        });
    	}else if(type=='9'){ // 插件日志
    		ngDialog.open({
    	          template: 'app/views/dialog/monitor-pluginnode-log-detail.html'+'?action='+(new Date().getTime()),
    	          className: 'ngdialog-theme-default ngdialog-lg',
    	          scope: $scope,
    	          data:{id:id},
    	          closeByDocument:false,
    	          cache:false,
    	          controller:'logMonitor'
    	    });
    	} 
    }
    
    // 干预
    $scope.intervene=function(branch){
    	$http.get('/cloudui/master/ws/monitor/meddleFlow'+'?v='+(new Date().getTime()),{
    		params:{
    			id:branch.id,
    			state:branch.state
    		}
    	}).success(function(data){
    		if(data.result)
            {
               Notify.alert(
                     '<em class="fa fa-check"></em> '+data.message ,
                     {status: 'success'}
               );
            }else{
               Notify.alert(
                     '<em class="fa fa-times"></em> '+data.message ,
                     {status: 'danger'}
               );
            }
    	})
    }
}])

/* ------------------------------------蓝图流程插件日志详情------------------------------------ */

blueprintInsModule.controller('logMonitor',['$scope','$http','ngDialog','$interval','$ocLazyLoad',function($scope,$http,ngDialog,$interval,$ocLazyLoad){
 
	$scope.editorOpts = {
	    mode: 'javascript',
	    lineNumbers: true,
	    matchBrackets: true,
	    theme: 'mbo',
	    viewportMargin: Infinity
	 };

	 $scope.refreshEditor = 0;

	 $scope.loadTheme = function() {
	    var BASE = 'vendor/codemirror/theme/';
	    $ocLazyLoad.load(BASE + $scope.editorOpts.theme + '.css');
	    $scope.refreshEditor = !$scope.refreshEditor;
	 };
	  
	 $scope.loadTheme($scope.editorOpts.theme);
	
	 $scope.getPluginLogDetail=function(){
		$http.get('/cloudui/master/ws/monitor/getPluginNodeLogInfo'+'?v='+(new Date().getTime()),{
	      params:{
	    	id:$scope.ngDialogData.id
	      }
	    }).success(function(data){
	        $scope.preLog_code = data.preLog||'没有日志！';
	        $scope.postLog_code = data.postLog||'没有日志！';
	        $scope.invokeLog_code = data.invokeLog||'没有日志！';
	        $scope.activeLog_code = data.activeLog||'没有日志！';  
	        $scope.getCode($scope.preLog_code,1)
	    })
	}
    
	$scope.getPluginLogDetail();
	
	$scope.getCode=function(code,num){
		$scope.isActive=num;
		$scope.code=code;
	}

    
}])

/* ------------------------------------蓝图流程开始节点错误日志详情------------------------------------ */

blueprintInsModule.controller('startLogMonitor',['$scope','$http','ngDialog','$interval','$ocLazyLoad',function($scope,$http,ngDialog,$interval,$ocLazyLoad){
 
	$scope.editorOpts = {
	    mode: 'javascript',
	    lineNumbers: true,
	    matchBrackets: true,
	    theme: 'mbo',
	    viewportMargin: Infinity
	 };

	 $scope.refreshEditor = 0;

	 $scope.loadTheme = function() {
	    var BASE = 'vendor/codemirror/theme/';
	    $ocLazyLoad.load(BASE + $scope.editorOpts.theme + '.css');
	    $scope.refreshEditor = !$scope.refreshEditor;
	 };
	  
	 $scope.loadTheme($scope.editorOpts.theme);
	
	 $scope.getPluginLogDetail=function(){
		$http.get('/cloudui/master/ws/monitor/getPluginNodeLogInfo'+'?v='+(new Date().getTime()),{
	      params:{
	    	id:$scope.ngDialogData.id
	      }
	    }).success(function(data){
	        $scope.code = data.start||'没有日志！'; 
	    })
	}
    
	$scope.getPluginLogDetail();
    
}])

/* ------------------------------------蓝图实例配置比对------------------------------------ */

blueprintInsModule.controller('blueprintInsConfigsCompare',['$scope','$http','$stateParams','$cookieStore',function($scope,$http,$stateParams,$cookieStore){
	
	 
	// 当前蓝图实例
	$scope.oriId=$stateParams.Ori_insId; 
	$scope.oriInstanceId=$stateParams.Ori_INSTANCE_ID;
	$scope.oriResourceList=[];
	$scope.oriComponentList=[];
	$scope.oriBlueprintList=[];
	
	// 比对蓝图实例
	$scope.compareId=$stateParams.Compare_insId;
	$scope.compareInstanceId=$stateParams.Compare_INSTANCE_ID;
	$scope.compareResourceList=[];
	$scope.compareComponentList=[];
	$scope.compareBlueprintList=[];
	
	$scope.compareConfig = function(id1,id2,uuid1,uuid2) {
		var config = {
				method:"get",
				url:"/cloudui/master/ws/blueprint/compareConfig",
				params:{blueprintInstanceUUID1:uuid1,blueprintInstanceUUID2:uuid2,blueprintInstanceId1:id1,blueprintInstanceId2:id2}
		};
		$http(config).success(function(data){
			if(data) {
				if(data.one) {
					angular.forEach(data.one.pools, function(value, key) {
						value.nodesArr = angular.fromJson(value.nodes.value);
						$scope.oriResourceList.push(value);
					});
					angular.forEach(data.one.components, function(value, key) {
						value.currentInputArr = [];
						angular.forEach(value.currentInput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.currentInputArr.push(kv);
						});
						value.currentOutputArr = [];
						angular.forEach(value.currentOutput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.currentOutputArr.push(kv);
						});
						value.targetInputArr = [];
						angular.forEach(value.targetInput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.targetInputArr.push(kv);
						});
						value.targetOutputArr = [];
						angular.forEach(value.targetOutput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.targetOutputArr.push(kv);
						});
						$scope.oriComponentList.push(value);
					});
					angular.forEach(data.one.blueprintInstance, function(value, key) {
						var kv = {};
						kv.key = key;
						kv.value = value;
						$scope.oriBlueprintList.push(kv);
					});
				}
				if(data.two) {
					angular.forEach(data.two.pools, function(value, key) {
						value.nodesArr = angular.fromJson(value.nodes.value);
						$scope.compareResourceList.push(value);
					});
					angular.forEach(data.two.components, function(value, key) {
						value.currentInputArr = [];
						angular.forEach(value.currentInput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.currentInputArr.push(kv);
						});
						value.currentOutputArr = [];
						angular.forEach(value.currentOutput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.currentOutputArr.push(kv);
						});
						value.targetInputArr = [];
						angular.forEach(value.targetInput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.targetInputArr.push(kv);
						});
						value.targetOutputArr = [];
						angular.forEach(value.targetOutput, function(v,k) {
							var kv = {};
							kv.key = k;
							kv.value = v;
							value.targetOutputArr.push(kv);
						});
						$scope.compareComponentList.push(value);
					});
					angular.forEach(data.two.blueprintInstance, function(value, key) {
						var kv = {};
						kv.key = key;
						kv.value = value;
						$scope.compareBlueprintList.push(kv);
					});
				}
			}
		});
	};
	
	$scope.compareConfig($scope.oriId,$scope.compareId,$scope.oriInstanceId,$scope.compareInstanceId);

//	// 获取蓝图实例资源列表	
//	$scope.getResourceList=function(id,arr){
//		$http({
//		      method  : 'POST',
//		      url     : '/cloudui/master/ws/blueprint/getBlueprintResourcePoolConfigs',   
//		      data    : $.param({
//		    	  blueprintId:id
//		      }),   
//		      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
//		}).success(function(data){
//	    	if(data.result){
//				var resourceData=angular.fromJson(data.data);
//				angular.forEach(resourceData,function(val,key){
//					val.nodesArr=angular.fromJson(val.nodes);
//					arr.push(val);
//				})
//			}
//	   })
//  }
//	
//  $scope.getResourceList($scope.oriId,$scope.oriResourceList);
//  $scope.getResourceList($scope.compareId,$scope.compareResourceList);
//
//  // 获取蓝图实例组件列表
//  $scope.getComponentList=function(id,arr){
//	  $http({
//	        method:'post',
//	        url:'/cloudui/master/ws/blueprint/getBlueprintComponents',
//	        data: $.param({
//	        	blueprintId:id
//	        }),
//	        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
//	    }).success(function(data){
//	    	 if(data.result){
//	    		 var msg=angular.fromJson(data.message);
//	    		 angular.forEach(msg,function(val,key){
//	    			
//	    			var currentInputObj=angular.fromJson(val.currentInput);
//	    			val.currentInputArr=[];
//	    			angular.forEach(currentInputObj,function(valconfig,keyconfig){
//	    				var obj={};
//	    				obj.value=valconfig;
//	    				obj.key=keyconfig;
//	    				val.currentInputArr.push(obj);
//	    			})
//	    			
//	    			var currentOutputObj=angular.fromJson(val.currentOutput);
//	    			val.currentOutputArr=[];
//	    			angular.forEach(currentOutputObj,function(valconfig,keyconfig){
//	    				var obj={};
//	    				obj.value=valconfig;
//	    				obj.key=keyconfig;
//	    				val.currentOutputArr.push(obj);
//	    			})
//	    			
//	    			var targetInputObj=angular.fromJson(val.targetInput);
//	    			val.targetInputArr=[];
//	    			angular.forEach(targetInputObj,function(valconfig,keyconfig){
//	    				var obj={};
//	    				obj.value=valconfig;
//	    				obj.key=keyconfig;
//	    				val.targetInputArr.push(obj);
//	    			})
//	    			
//	    			var targetOutputObj=angular.fromJson(val.targetOutput);
//	    			val.targetOutputArr=[];
//	    			angular.forEach(targetOutputObj,function(valconfig,keyconfig){
//	    				var obj={};
//	    				obj.value=valconfig;
//	    				obj.key=keyconfig;
//	    				val.targetOutputArr.push(obj);
//	    			})
//
//					arr.push(val);
//				 })
//	    	 } 
//	    })
//  }
//  $scope.getComponentList($scope.oriInstanceId,$scope.oriComponentList);
//  $scope.getComponentList($scope.compareInstanceId,$scope.compareComponentList);
//  
//  // 蓝图配置
//  $scope.getBlueprintList=function(id,arr){
//	  $http.get('/cloudui/master/ws/blueprint/getBlueprintInstanceKV'+'?v='+(new Date().getTime()),{
//		  params:{
//			  bluePrintInsId:id 
//		  }
//	  }).success(function(data){
//		  angular.forEach(data,function(val,key){
//			  var obj={};
//			  obj.key=key;
//			  obj.value=val;
//			  arr.push(obj)
//		  })
//	  })
//  }
//  
//  $scope.getBlueprintList($scope.oriInstanceId,$scope.oriBlueprintList);
//  $scope.getBlueprintList($scope.compareInstanceId,$scope.compareBlueprintList);

}])
    
/* ------------------------------------蓝图实例组件管理------------------------------------ */
blueprintInsModule.controller('blueprintInsComponentsCtrl',['$scope','$http','$stateParams','ngDialog',function($scope,$http,$stateParams,ngDialog){
	// 蓝图实例组件列表
	$http.get('/cloudui/ws/deployedApp/listApps'+'?v='+(new Date().getTime()),{
		params:{
			pageSize:10000,
			pageNum:1,
			blueInstanceId:$stateParams.insId
		}
	}).success(function(data){
		$scope.componentList=data.rows;
		$scope.listoff=data.rows.length>0?true:false;
        $scope.warninginfo='提示：暂无应用';
	}).error(function(){
        $scope.listoff=false;
        $scope.warninginfo='暂无结果';
    })
    // 组件维护
    $scope.mainTain=function(resourceId,appName){
		ngDialog.open({
	          template: 'app/views/dialog/component-maintain.html'+'?action='+(new Date().getTime()),
	          className: 'ngdialog-theme-default',
	          scope: $scope,
	          data:{blueprintInsName:$stateParams.insName,blueprintInsId:$stateParams.insId,blueprintINSTANCE_ID:$stateParams.INSTANCE_ID,resourceId:resourceId,appName:appName},
	          closeByDocument:false,
	          cache:false,
	          controller:'MainTain'
        });
	}
}])

/* ------------------------------------蓝图实例组件日志管理------------------------------------ */
blueprintInsModule.controller('componentsLogManageCtrl',['$scope','$http','$stateParams','Notify','$interval',function($scope,$http,$stateParams,Notify,$interval){
    
	$scope.$on('$destroy', function() {
	     $interval.cancel($scope.historyTimer);  
    });
	
	$scope.doData={};
	$scope.pageSize=10;

	// 查看对应的流程操作类型操作历史记录
    $scope.doHistoryListFn=function(index,flowName){
    	for(var i=0;i<$scope.flowList.length;i++)
    	{
    		$scope.flowList[i].off=false;
    	}
    	$scope.flowList[index].off=true;
    }
    $scope.pageNum=1;
    $scope.onPageChange = function (pageNum,flowName)
	 {  

    	$scope.curPageNum=pageNum;
    	$scope.curFlowName=flowName;
		var a=$http.get('/cloudui/master/ws/monitor/getSecondFlowInstanceDetail'+'?v='+(new Date().getTime()),{
	         params:{
	        	 bluePrintInsId:$stateParams.INSTANCE_ID,
	        	 flowName:flowName,
	        	 appName:$stateParams.appName,
	        	 pageSize:$scope.pageSize, 
	        	 pageNum:pageNum
	         }
	     }).
	     success(function(data){
	    	  $scope.doData[flowName]=data.rows;
	    	  $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
	          if($scope.pageCount==0){
	            $scope.pageCount=1;
	          }
	         
	     }).error(function(data, status, headers, config){
	    	 
	    	 $interval.cancel($scope.historyTimer);  
	     })
 
	 }
    
    
    $scope.historyTimer=$interval(function(){
  	    if($scope.curPageNum&&$scope.curFlowName){
  	    	$scope.onPageChange($scope.curPageNum,$scope.curFlowName);
  	    }
    },3000)
	 
	// 获取蓝图实例流程的操作类型
	$http.get('/cloudui/master/ws/blueprint/getSecondFlowsByInstance',{
		 params:{
			 blueprintInstanceId:$stateParams.INSTANCE_ID,
			 appName:$stateParams.appName
		 }
	 }).success(function(data){
		 angular.forEach(data,function(val,key){
			 val.off=false;
		 })
		 $scope.flowList=data;
		 if(data){
			 $scope.flowList[0].off=true;
		 }
		 
	 }) 
   
	 // 结束
	 $scope.overFn=function(id){
		$http.get('/cloudui/master/ws/monitor/endInstance'+'?v='+(new Date().getTime()),
			{
			params:{
			  id:id
		    }
		}).success(function(data){
			if(data.result){
				Notify.alert(
	               '<em class="fa fa-check"></em> '+data.message,
	               {status: 'success'}
	            );
			}else{
				Notify.alert(
	               '<em class="fa fa-times"></em> '+data.message,
	               {status: 'danger'}
	            );
			}
		})
	}
}])
 
/* ------------------------------------组件维护------------------------------------ */

blueprintInsModule.controller('MainTain',['$rootScope','$scope','$http','Notify','ngDialog','$state',function($rootScope,$scope,$http,Notify,ngDialog,$state){
	$scope.formData={};
	// 版本类型
	$scope.versionType=[
	                    {"text":"当前版本","value":"current"},
	                    {"text":"目标版本","value":"target"},
	                    {"text":"当前版本+目标版本","value":"current+target"}
	                ]
	
	$scope.formData.versionType='current';
    
    var getChineseName= function(key){
		switch(key){
	          case 'deploy':
	          return "部署";
	          break;
	          case 'destroy':
	          return "卸载";
	          break;
	          case 'stop':
	          return "停止";
	          break;
	          case 'start':
	          return "启动";
	          break;
	          case 'upgrade':
	          return "升级";
	          break;
	          case 'snapshot':
	          return "备份";
	          break;
	          case 'rollback':
	          return "回滚";
	          break;
	          default:
	           return key;
	          break;
	       }
	}
    var getVersionName= function(key){
		switch(key){
	          case 'destroy':
	          return "current";
	          break;
	          case 'stop':
	          return "current";
	          break;
	          default:
	           return 'target';
	          break;
	       }
	}
    
 // 获取组件的操作类型及流程列表
    $http({
        method:'post',
        url:'/cloudui/master/ws/resource/getNewResourceOperationFlows',
        data: $.param({
        	resourceId:$scope.ngDialogData.resourceId
        }),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .success(function(data){
    	if(data.result){
    		$scope.doList=[];
    		var flowData=angular.fromJson(data.data);
        	angular.forEach(flowData,function(val,key){
        		var obj={};
        		obj.doChineseName= getChineseName(key);
        		obj.doName=key;
        		obj.doCont=val;
        		$scope.doList.push(obj);
        	})
    	} 
	})
	// 根据组件流程操作类型获取流程列表
	$scope.$watch('formData.do',function(newval,oldval){
    	if(newval){
    		if(!newval.doChineseName){
    			$scope.formData.versionType='current';
    		}else{
    			$scope.formData.versionType=getVersionName(newval.doName);
    		}
    		$scope.formData.flow=newval.doCont[0]; 
    	    if(newval.doName=='rollback'){
    	    	$scope.isRollback=true;
    	    }
    	}
    })
    // 如果是回滚流程，则展示快照列表
    $scope.$watch('isRollback',function(newval,oldval){
    	if(newval){
    		  // 快照列表
    		  $http({
    		        method  : 'POST',
    		        url     : '/cloudui/master/ws/blueprint/listSnapshotOfBlueprintInstance',   
    		        data    : $.param({
    		        	blueInstanceId:$scope.ngDialogData.blueprintINSTANCE_ID,
    		        	userId:$rootScope.user.id
    		        }),   
    		        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
    		  })
    		  .success(function(data){
    			  if(data.result)
    		      {
    		         $scope.snapshootList=angular.fromJson(data.data);
    		      } 
    		  })
    	}
    })
    // 维护执行
    $scope.mainTainFn=function(){
    	$http({
            method:'post',
            url:'/cloudui/master/ws/blueprint/addAndExecSecondFlow',
            data:$.param({
            	blueprintId:$scope.ngDialogData.blueprintINSTANCE_ID,
            	appName:$scope.ngDialogData.appName,
            	flowType:$scope.formData.do.doName,
            	flowName:$scope.formData.flow.flowName,
            	cdFlowId:$scope.formData.flow.cdFlowId,
            	versionConfig:$scope.formData.versionType,
            	snapshotId:$scope.formData.snapshoot||''
            }),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
        }).success(function(data){
        	if(data.result)
            {
        		 ngDialog.close();
                 Notify.alert(
                    '<em class="fa fa-check"></em> '+data.message ,
                    {status: 'success'}
                 );
                 $state.go('app.blueprint_ins_components_log_manage',{insName:$scope.ngDialogData.blueprintInsName,insId:$scope.ngDialogData.blueprintInsId,INSTANCE_ID:$scope.ngDialogData.blueprintINSTANCE_ID,appName:$scope.ngDialogData.appName},{reload:true})
            }else{
                   Notify.alert(
                      '<em class="fa fa-times"></em> '+data.message ,
                      {status: 'danger'}
                   );    
            }
        })
    }
}])

/* ------------------------------------组件实例实例管理------------------------------------ */

blueprintInsModule.controller('blueprintInsComponentDetailInstanceCtrl',['$scope','$stateParams','$http','$interval',function($scope,$stateParams,$http,$interval){
  
  $scope.$on('$destroy', function() {
     $interval.cancel($scope.instimer);  
  });
  
  $scope.pageSize=10;
  $scope.pageNum=1;
  $scope.onPageChange = function ()
  {
    	$http.get('/cloudui/ws/deployedApp/listInstances'+'?v='+(new Date().getTime()),{
    		params:{
    			pageSize:10000,
    			pageNum:1,
    			appId:$stateParams.componentId
    		}
    	}).success(function(data){
    		$scope.insList=data.rows;
    		$scope.listoff=data.rows.length>0?true:false;
            $scope.warninginfo='提示：暂无数据';
            $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
    	}).error(function(){
            $scope.listoff=false;
            $scope.warninginfo='暂无结果';
        })
 }
    
 $scope.instimer=$interval(function(){
      $scope.onPageChange();
 },3000)

}])


/* ------------------------------------蓝图实例快照管理------------------------------------ */

blueprintInsModule.controller('blueprintInsSnapshoot',['$rootScope','$scope','$stateParams','$http','Notify','ngDialog','$cookieStore',function($rootScope,$scope,$stateParams,$http,Notify,ngDialog,$cookieStore){
   
   
  // 快照列表
  $http({
        method  : 'POST',
        url     : '/cloudui/master/ws/blueprint/listSnapshotOfBlueprintInstance',   
        data    : $.param({
        	blueInstanceId:$stateParams.INSTANCE_ID,
        	userId:$rootScope.user.id
        }),   
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
  })
  .success(function(data){
	  if(data.result)
      {
         $scope.snapshootList=angular.fromJson(data.data);
      }else
      {
        Notify.alert(
          '<em class="fa fa-times"></em> '+data.message,
          {status: 'danger'}
        );
      }
  })
  
  // 回滚
  $scope.rollBack=function(id){
	  ngDialog.open({
          template: 'app/views/dialog/snapshoot-rollback.html'+'?action='+(new Date().getTime()),
          className: 'ngdialog-theme-default',
          scope: $scope,
          data:{insName:$stateParams.insName,blueprintInstanceId:$stateParams.INSTANCE_ID,snapshotId:id},
          closeByDocument:false,
          cache:false,
          controller:'rollBackCtrl'
      }); 
  }
   
}])

/* ------------------------------------快照回滚------------------------------------ */

blueprintInsModule.controller('rollBackCtrl',['$rootScope','$scope','$http','Notify','ngDialog','$state',function($rootScope,$scope,$http,Notify,ngDialog,$state){
  // 流程列表
  $http.get('/cloudui/master/ws/blueprint/getFlowsByInstance',{
	 params:{
		 blueprintInstanceId:$scope.ngDialogData.blueprintInstanceId
	 }
  }).success(function(data){
	 $scope.flowList=data;
  })
  
  // 回滚 
  $scope.rollBackFn=function(){
	  $http.get('/cloudui/master/ws/blueprint/executeBlueprintRollBackFlow'+'?v='+(new Date().getTime()),{params:{
		   cdFlowId:$scope.flow.ID,
    	 blueprintInstanceId:$scope.ngDialogData.blueprintInstanceId,
    	 snapshotId:$scope.ngDialogData.snapshotId,
    	 userId:$rootScope.user.id 
	  }})
	  .success(function(data){
		  if(data.result)
	      {
			  Notify.alert(
		          '<em class="fa fa-check"></em> '+data.message+',frame返回的流程实例id:'+data.id,
		          {status: 'success'}
		       );
			  ngDialog.close();
			  $state.go('app.blueprint_ins_flow_monitor',{insName:$scope.ngDialogData.insName,INSTANCE_ID:$scope.ngDialogData.blueprintInstanceId,flowMonitorInsId:data.id,flowName: $scope.flow.FLOW_NAME,flowId:$scope.flow.ID},{reload:true});
	      }else
	      {
	        Notify.alert(
	          '<em class="fa fa-times"></em> '+data.message,
	          {status: 'danger'}
	        );
	      }
	  })
  }
 
  
}])
  
 
/* ------------------------------------克隆蓝图实例------------------------------------ */
blueprintModule.controller('cloneBlueprintInsCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$state','$stateParams',function($rootScope,$scope,$http,ngDialog,Notify,$state,$stateParams){

	$rootScope.submitted = false;
	
	$scope.cloneBlueprintInstanceFn=function(){
		 
        $rootScope.submitted = true;
		
		$rootScope.app.layout.isShadow=true;
		$http({
			method:'post',
			url:'/cloudui/master/ws/blueprint/cloneBlueprintInstance',
			data:$.param({
				blueprint_info:$scope.ngDialogData.blueprintInfo,
				blueprint_name:$scope.name,
				blueprint_desc:$scope.description,
				blueprint_clone_id:$stateParams.insCloneId
			}),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		}).success(function(data){
			$rootScope.app.layout.isShadow=false;
			if(data.result)
			{
				Notify.alert(
					'<em class="fa fa-check"></em> '+data.message ,
					{status: 'success'}
				);
				ngDialog.close();
				$state.go('app.blueprint_ins_manage',{},{reload:true});
			}else{
				Notify.alert(
					'<em class="fa fa-times"></em> '+data.message ,
					{status: 'danger'}
				);
			}
		})
	}
}])
 
