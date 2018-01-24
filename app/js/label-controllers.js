var labelModule=angular.module('label',[]);
/* ------------------------------------插件管理------------------------------------ */
labelModule.controller('labelManageCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$cookieStore',function($rootScope,$scope,$http,ngDialog,Notify,$cookieStore){
   
    var labelSearchVal=$cookieStore.get('labelSearchVal');
	
	if(labelSearchVal){
		$scope.searchval=labelSearchVal;
	}else{
		$scope.searchval="";
	}
	
	$scope.setCookie=function(val){
		$cookieStore.put('labelSearchVal',val);
	}
	
	$scope.clearCookie=function(){
		$cookieStore.remove("labelSearchVal");
		$scope.searchval="";
		$scope.onPageChange();
	}
    $scope.labels =new Array();
	//获取标签类型
	$http.get('/cloudui/master/ws/labelManager/listLabelTypes'+'?v=' + (new Date().getTime()),{
	      params:
	          {
	            pageNum:1,
	            pageSize:999
	          }
	     }).success(function(data){
			 angular.forEach(data.rows,function(val,key){
				 var map = {};
				 map['code']=val.code;
				 map['name']=val.name;
				 $scope.labels.push(map);
			 });
	     });
	
   $scope.pageSize=10;
   $scope.pageNum=1;
   $scope.onPageChange = function ()
   {   
       
      $http.get('/cloudui/master/ws/labelManager/listLabels'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            labelName:$scope.searchval
          }
     }).success(function(data){
       $scope.labelList = data.rows;
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
    	$scope.setCookie($scope.searchval);
 	    $scope.onPageChange(); 
       if($scope.searchval.length==0)
       {
            $scope.pageNum=1;
            $scope.onPageChange(); 
       }
    }
    
    $scope.delLabel=function(index,id,name)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要删除此标签吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
    	   $rootScope.app.layout.isShadow=true;
           $http.delete('/cloudui/master/ws/labelManager/deleteLabel',{
        	   	params:{
        	   		id:id,
        	   		name:name
        	   	}
           }).success(function(data){
            	  $rootScope.app.layout.isShadow=false;
            	  if(data.result)
                  {
            	      
               	      Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                       );
               	       $scope.clearCookie();
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
    $scope.addLabelFn=function(){
    	ngDialog.open({
    		template:'app/views/dialog/label-create.html'+'?action='+(new Date().getTime()),
    		className:'ngdialog-theme-default',
    		scope: $scope,
    		closeByDocument:false,
    		cache:false,
    		controller:'addLabelCtrl'
    	});
	}
    
    $scope.updateLabel=function(index,param){
    	ngDialog.open({
    		template:'app/views/dialog/label-update.html'+'?action='+(new Date().getTime()),
    		className:'ngdialog-theme-default',
    		scope: $scope,
    		data:{info:param,index:index},
    		closeByDocument:false,
    		cache:false,
    		controller:'updateLabelCtrl'
    	});
	}
}])


/*-------------------------------------------新建标签------------------*/
labelModule.controller('addLabelCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){
    $scope.saveFn = function() {
        if($scope.addLabelForm.$valid) {
           $http({
        	   method :'GET',
        	   url    :'/cloudui/master/ws/labelManager/checkLabel'+'?action='+(new Date().getTime()),
        	   params :{
        		     labelName:$scope.name,
                	 code:$scope.selectedLabel.code
        	   }
           })
           .success(function(data){
			if(data.result){
              $http({
                method  : 'POST',
                url     : '/cloudui/master/ws/labelManager/saveLabel',
                data    : {
					      name:$scope.name,
                      	  description:$scope.description,
                      	  code:$scope.selectedLabel.code
						},  
                headers : { 'Content-Type': 'application/json' }
              })
              .then(function(response) {
                $rootScope.app.layout.isShadow=false;
                if (response.data.result ) {
                  ngDialog.close();
				  $state.go('app.label_manage',{},{ reload: true });
                }else{
                   $scope.authMsg = '创建失败，请重新添加标签！';  
                }
              }, function(x) {
                $scope.authMsg = '服务器请求错误';
              });
        	   }else{
        		   Notify.alert(
                           '<em class="fa fa-times"></em> '+data.message ,
                           {status: 'danger'}
                        );
        	   }


		   })
         }
     else { 
       $scope.addLabelForm.text.$dirty = true;
     }
   };
}])


/*-------------------------------------------更新标签------------------*/
labelModule.controller('updateLabelCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){
	$scope.label=$scope.ngDialogData.info;
	$scope.name=$scope.ngDialogData.info.name;
	$scope.description=$scope.ngDialogData.info.description;
	$scope.index=$scope.ngDialogData.index;
	$scope.saveFn = function() {
        if($scope.updateLabelForm.$valid) {
           $http({
        	   method :'GET',
        	   url    :'/cloudui/master/ws/labelManager/checkLabel'+'?action='+(new Date().getTime()),
        	   params :{
        		     labelName:$scope.name,
                	 code:$scope.label.code,
                	 id:$scope.label.id
        	   }
           })
           .success(function(data){
			if(data.result){
              $http({
                method  : 'PUT',
                url     : '/cloudui/master/ws/labelManager/updateLabel',
                data    : {
					      name:$scope.name,
                      	  description:$scope.description,
						  id:$scope.label.id
						},  
                headers : { 'Content-Type': 'application/json' }
              })
              .then(function(response) {
                $rootScope.app.layout.isShadow=false;
                if (response.data.result ) {
                  ngDialog.close();
				  $state.go('app.label_manage',{},{ reload: true });
                }else{
                   $scope.authMsg = '创建失败，请重新添加标签！';  
                }
              }, function(x) {
                $scope.authMsg = '服务器请求错误';
              });
        	   }else{
        		   Notify.alert(
                           '<em class="fa fa-times"></em> '+data.message ,
                           {status: 'danger'}
                        );
        	   }


		   })
         }
     else { 
       $scope.updateLabelForm.text.$dirty = true;
     }
   };
}])