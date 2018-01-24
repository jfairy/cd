var pluginModule=angular.module('plugin',[]);
/* ------------------------------------插件管理------------------------------------ */
pluginModule.controller('pluginManageCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$cookieStore','$filter',function($rootScope,$scope,$http,ngDialog,Notify,$cookieStore,$filter){
   
  $scope.pluginPages=[
     "app.plugin_manage",
     "app.plugin_add",
     "app.plugin_detail",
     "app.plugin_update"
  ]

  $scope.pageSize=10;

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    var isClear=$filter('filter')($scope.pluginPages,toState.name).length>0?false:true;
    if(isClear){
      $scope.clearCookie(); 
    }
  });

   
  $scope.searchval=$cookieStore.get('pluginSearch')?$cookieStore.get('pluginSearch'):'';

  if($cookieStore.get('pluginPageNum')){
     $scope.listDataPromise=$http.get('/cloudui/ws/plugin/listPlugins'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:1,
            pageSize:$scope.pageSize,
            pluginName:$scope.searchval
          }
     }).then(function(res){
        
         $scope.totalPageNum=res.data.total;
         
         if($cookieStore.get('pluginPageNum')<=$scope.totalPageNum){
            $scope.pageNum=$cookieStore.get('pluginPageNum');
         }else{
            $scope.pageNum=$scope.totalPageNum;
         }

     }) 
 
  }else{
     $scope.pageNum=1;
  }

 

  $scope.$watch('pageNum',function(newval,oldval){
     $scope.pageNum=newval;
  })
	
	$scope.setCookie=function(){
		$cookieStore.put('pluginPageNum',$scope.pageNum);
    $cookieStore.put('pluginSearch',$scope.searchval);
	}
	
	$scope.clearCookie=function(){
		$cookieStore.remove("pluginPageNum");
		$cookieStore.remove("pluginSearch");
	}
	
   
   $scope.onPageChange = function ()
   {   
      if(!$scope.pageNum){
           return ;
      }
      
      $http.get('/cloudui/ws/plugin/listPlugins'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            pluginName:$scope.searchval
          }
     }).success(function(data){
       $scope.pluginList = data.rows;
       $scope.listoff=data.total>0?true:false;
       $scope.warninginfo='提示：暂无数据';
       $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
       if($scope.pageCount==0)
       {
           $scope.pageCount=1;
       }
     }).error(function(){
         $scope.listoff=false;
         $scope.warninginfo='暂无结果';
      })
    };
    
    $scope.search=function()
    {
    	$scope.pageNum=1;
    	$scope.setCookie();
 	    $scope.onPageChange(); 
    }
    
    $scope.delPlugin=function(index,pluginName)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要删除此插件吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
    	   $rootScope.app.layout.isShadow=true;
           $http({
                 method:"DELETE",
                 url:'/cloudui/ws/plugin/deletePlugin/'+pluginName
              }).success(function(data){
            	  $rootScope.app.layout.isShadow=false;
                $scope.setCookie();
            	  if(data.result)
                  {
            	      
               	      Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                       );
               	       $state.go('app.plugin_manage',{},{reload:true});
                  }else
                  {
               	     Notify.alert(
                          '<em class="fa fa-times"></em>'+data.message ,
                          {status: 'danger'}
                      );
                  }
              });
     
    })
   }
  
 // 更新标签弹窗
    $scope.openUpdateLabel=function(param){
        ngDialog.open({
          template: 'app/views/dialog/plugin-label-update.html'+'?action='+(new Date().getTime()),
          className: 'ngdialog-theme-default',
          cache:false,
          closeByDocument:false,
          scope: $scope,
          data:{info:param},
          controller:'UpdatePluginLabel'
        })
    }
    
}])

/* ------------------------------------插件添加------------------------------------ */
pluginModule.controller('addPluginCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify','FileUploader','$timeout',function($rootScope,$scope,$http,ngDialog,$state,Notify,FileUploader,$timeout){
	 //获取插件标签
	$scope.labelsList=function(){
		$http.get('/cloudui/master/ws/labelManager/listLabels'+'?v=' + (new Date().getTime()),{
		      params:
		          {
		            pageNum:1,
		            pageSize:99999,
		            labelCode:4
		          }
		     }).success(function(data){
		    	 $scope.hasLabels=true;
		    	 for(var i = 0; i< data.rows.length; i++){
		    		 $("<option value='"+data.rows[i].id+"'>"+data.rows[i].name+"</option>").appendTo("#optionalLabels");
	             };
	             $("#optionalLabels").chosen({
	                no_results_text:"没有搜索到此环境"
	             });
		     });	
	}
	$scope.labelsList();
	$rootScope.submitted = false;
    $scope.labelsarr=[]; //标签
    $scope.paramsarr=[]; //插件参数

    // 添加 
    $scope.add=function(list){
	    var obj={};
        $scope[list].push(obj);
    }

    // 删除 
    $scope.del=function(list,idx){
        $scope[list].splice(idx,1);
    }
	
	var uploader = $scope.uploader = new FileUploader({
	      url: '/cloudui/ws/plugin/registPlugin',
	      formData:[

	      	      ]
	});
	
	$scope.isloading=true;
	$scope.isDisabled=true;
	
	//上传文件限制
	uploader.filters.push({
	  name: 'customFilter',
	  fn: function(item, options) {
		    
		    var nameArr=item.name.split('.');
	        
	        var name=item.name.split('.'+nameArr[nameArr.length-1])[0]; // 文件名称
	
	        var fileType=nameArr[nameArr.length-1]; // 文件类型
	        
	        var reg=/^[^<>,'";:\?[\]{}()*&%$#@!\s]+$/;
	
	        if(fileType!=='jar'){
	    	     return false;
	        }else if(!reg.test(name)){
		         return reg.test(name);
	        } 
	        return this.queue.length < 1;
	  }
	});
	
	//当文件上传失败
	uploader.onWhenAddingFileFailed = function(item, filter, options) {
	
	      var nameArr=item.name.split('.');
	    
	      var name=item.name.split('.'+nameArr[nameArr.length-1])[0];
	      
	      var fileType=nameArr[nameArr.length-1];
	    
	      var reg=/^[^<>,'";:\?[\]{}()*&%$#@!\s]+$/;

	      if(this.queue.length<1){
          if(fileType!=='jar'){
               Notify.alert(
		            '<em class="fa fa-check"></em> 请添加jar类型的操作文件!',
		             {status: 'success'}
			     );
          }else{
               if(!reg.test(name)){
			  	      Notify.alert(
				         '<em class="fa fa-check"></em> 上传包名称包含空格或特殊字符，请重新命名!',
				          {status: 'success'}
				       );
				  }
          }
	      }else{
	      	  Notify.alert(
		         '<em class="fa fa-check"></em> 只能添加一个文件!',
		          {status: 'success'}
		      );
	      }
	      
	      $scope.isloading=false;
	      
		  $timeout(function(){
	      	   $scope.isloading=true;
	      })
	};
	
	//上传文件后
	uploader.onAfterAddingFile=function(fileItem){
		  $scope.isloading=false;
		  $scope.isDisabled=false;
		  $timeout(function(){
	      	   $scope.isloading=true;
	      })
	      
	      fileItem.remove=function(){
		      this.uploader.removeFromQueue(this);
		      $scope.uploadData=null;
		  }
	}
	
	//上传文件成功
	uploader.onSuccessItem = function(fileItem, response, status, headers) {
		
		$rootScope.app.layout.isShadow=false; 
 
	    if(response.result){
	  	  
	       $scope.uploadData=response;
	       
	       Notify.alert(
               '<em class="fa fa-check"></em>'+response.message ,
               {status: 'success'}
           );
    	    $state.go('app.plugin_manage',{},{reload:true});
	         
	    }else{

	       Notify.alert(
	           '<em class="fa fa-times"></em> '+response.message ,
	           {status: 'danger'}
	       );
	      
	    }
		      
	};
	
	// 添加操作
	$scope.addPluginFn=function(){
		
		$rootScope.submitted = true;
		$rootScope.app.layout.isShadow=true;
		
		//$scope.labelsData={};
		$scope.paramsData={};
		
        /*angular.forEach($scope.labelsarr,function(val,key){
            $scope.labelsData[val.key]=val.val || '';
        });*/
    
        angular.forEach($scope.paramsarr,function(val,key){
            $scope.paramsData[val.key]=val.val || '';
        });
	       
	    var uploaderFile=uploader.queue[0];
	    var labelIds="";
	    if(typeof($scope.labels) != "undefined"){
	    	labelIds = $scope.labels.join(";");
	    }
		uploaderFile.formData.push(
			{
  			    "pluginName": $scope.pluginName,
  			    "description": $scope.description,
  			    "preAction": $scope.preAction,
  			    "postAction": $scope.postAction,
  			    "invoke": $scope.invoke,
  			    "agent": $scope.agent,
  			    "label": labelIds,
  			    "params": angular.toJson($scope.paramsData),
  			    "label":labelIds
			}	 
		 );
		
		 uploaderFile.upload()
 
	}	
}])


/* ------------------------------------插件详情------------------------------------ */
pluginModule.controller('pluginDetailCtrl',['$scope','$http','$stateParams',function($scope,$http,$stateParams){

	
	$http.get('/cloudui/ws/plugin/getPlugin'+'?v=' + (new Date().getTime()),{params:{pluginName:$stateParams.pluginName}}).success(function(data){
       $scope.pluginInfo=data;
       // 环境变量
       $scope.paramsarr=[];
       angular.forEach(data.params,function(val,key){
           $scope.paramsarr.push({
              key:key,
              val:val
           })
       })
       // 标签
       $scope.labelsarr=[];
       angular.forEach(data.label,function(val,key){
           $scope.labelsarr.push({
              key:key,
              val:val
           })
       })
  })
}])


/* ------------------------------------插件更新------------------------------------ */
pluginModule.controller('pluginUpdateCtrl',['$rootScope','$scope','$http','$state','$stateParams','Notify',function($rootScope,$scope,$http,$state,$stateParams,Notify){
   
    $scope.pluginName=$stateParams.pluginName; // 插件名
    $scope.addParams=[]; // 添加环境变量
    $scope.addlabels=[];// 添加标签
    
    // 添加变量
    $scope.add=function(list){
      var obj={};
      $scope[list].push(obj); 
    }
    // 删除变量
    $scope.del=function(list,idx){
        $scope[list].splice(idx,1);
    }
    // 插件信息
    $http.get('/cloudui/ws/plugin/getPlugin'+'?v=' + (new Date().getTime()),{
        params:{pluginName:$scope.pluginName}
    }).success(function(data){
       $scope.pluginInfo=data;
       $scope.description=data.description;
       $scope.preAction=data.preAction;
       $scope.invoke=data.invoke;
       $scope.postAction=data.postAction;
       $scope.agent=data.agent;

        // 标签展示
        /*$scope.labelsarr=[];// 标签
        angular.forEach($scope.pluginInfo.label,function(val,key){
            $scope.labelsarr.push({
               key:key,
               val:val
            })
        })*/
        // 环境变量展示
        $scope.paramsarr=[];// 标签
        angular.forEach($scope.pluginInfo.params,function(val,key){
            $scope.paramsarr.push({
               key:key,
               val:val
            })
        })
    })
 
    // 更新插件信息
    $rootScope.submitted = false;
    $scope.submitForm = function() {
      $rootScope.submitted = true;
      $rootScope.app.layout.isShadow=true;
      
      /*$scope.labelsData={};
      angular.forEach($scope.labelsarr,function(val,key){
         $scope.labelsData[val.key]=val.val || '';
      })*/
      angular.forEach($scope.addlabels,function(val,key){
         $scope.labelsData[val.key]=val.val || '';
      })
      // 标签传值
      $scope.paramsData={};
      angular.forEach($scope.paramsarr,function(val,key){
         $scope.paramsData[val.key]=val.val || '';
      })
      angular.forEach($scope.addParams,function(val,key){
         $scope.paramsData[val.key]=val.val || '';
      })
 

      var postData ={
    	  pluginName: $scope.pluginName,
		  description: $scope.description,
		  preAction: $scope.preAction,
		  agent: $scope.agent,
		  postAction: $scope.postAction,
		  invoke: $scope.invoke,
//		  label: angular.toJson($scope.labelsData),
		  params: angular.toJson($scope.paramsData)
      }
      
      var fd = new FormData();
      
      angular.forEach(postData, function(val, key) {
        fd.append(key, val);
      });
      
      // 提交更新信息
     $http.post('/cloudui/ws/plugin/updatePlugin',fd,{
         transformRequest: angular.identity,
         headers: {'Content-Type': undefined}
     }).then(function(response) {
    	 $rootScope.app.layout.isShadow=false;
        // 通过返回数据，没通过返回错误信息
        if(response.data.result)
        {
          Notify.alert(
             '<em class="fa fa-check"></em> '+response.data.message ,
              {status: 'success'}
          );
        
          $state.go('app.plugin_manage',{},{reload:true}); 
        }else{
          Notify.alert(
             '<em class="fa fa-times"></em> '+response.data.message ,
              {status: 'danger'}
          );
        }

        }, function(x) {
           $scope.authMsg = '服务器请求错误';
        });
   }

}])

/* 插件标签更新*/
    pluginModule.controller('UpdatePluginLabel',['$rootScope','$scope','$http','$stateParams','ngDialog','Notify','$state','$filter',function($rootScope,$scope,$http,$stateParams,ngDialog,Notify,$state,$filter){
    	
    	$scope.pluginInfo=$scope.ngDialogData.info;
    	$scope.selectedLabels=$scope.pluginInfo.labelIds.split(";");
    	  //获取插件标签
    	$scope.labelsList=function(){
    		$http.get('/cloudui/master/ws/labelManager/listLabels'+'?v=' + (new Date().getTime()),{
    		      params:
    		          {
    		            pageNum:1,
    		            pageSize:99999,
    		            labelCode:4
    		          }
    		     }).success(function(data){
    		    	 $scope.hasLabels=true;
    		    	 for(var i = 0; i< data.rows.length; i++){
    		    		 var selected=$filter('filter')($scope.selectedLabels,data.rows[i].id).length>0?true:false;
    		    		 if(selected){
    		    			 $("<option value='"+data.rows[i].id+"' selected = 'selected'>"+data.rows[i].name+"</option>").appendTo("#optionalLabels");
    		    		 }else{
    		    			 $("<option value='"+data.rows[i].id+"'>"+data.rows[i].name+"</option>").appendTo("#optionalLabels");
    		    		 }
    	             };
    	             $("#optionalLabels").chosen({
    	                no_results_text:"没有搜索到此环境"
    	             });
    		     });	
    	}
    	$scope.labelsList();
        $scope.saveFn = function() {
        	var labelIds="";
    		  if(typeof($scope.labels) != "undefined"){
                labelIds = $scope.labels.join(";");
    		  }
        	 $http({
                 method  : 'PUT',
                 url     : '/cloudui/master/ws/labelManager/updateResourceLabel',
                 data    : {
    					      resourceId:$scope.pluginInfo.pluginName,
                       	      labelIds:labelIds
    						},  
                 headers : { 'Content-Type': 'application/json' }
               })
               .then(function(response) {
                 $rootScope.app.layout.isShadow=false;
                 if (response.data.result ) {
                   ngDialog.close();
    				  $state.go('app.plugin_manage',{},{ reload: true });
                 }else{
                    $scope.authMsg = '创建失败，请重新添加标签！';  
                 }
               }, function(x) {
                 $scope.authMsg = '服务器请求错误';
               });
       };
    }])
