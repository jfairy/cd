
var quartzModule=angular.module('quartz',[]);

quartzModule.controller('quartzList',['$window','$scope','$http','ngDialog','Notify',function($window,$scope,$http,ngDialog,Notify){
    
  $scope.pageSize=10;
  $scope.pageNum=1;
  $scope.onPageChange = function ()
    {   
      $http.get('/quartz/ws/quartz/getQuartzListByPage'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            key:$scope.searchval
          }
     }).success(function(data){
         $scope.quartzList = data;
         $scope.listoff=data.total>0?true:false;
         $scope.warninginfo='提示：暂无定时任务';
         $scope.pageCount=Math.ceil($scope.quartzList.total/$scope.pageSize);
         if($scope.pageCount==0)
         {
           $scope.pageCount=1;
         }
     }).error(function(){
         $scope.listoff=false;
         $scope.warninginfo='暂无结果';
      })
    };
    
    // 搜索
    $scope.search=function()
    { 
    	 $scope.pageNum=1;
         $scope.onPageChange(); 
         if($scope.searchval.length==0)
         {
              $scope.pageNum=1;
              $scope.onPageChange(); 
         }
    } 
    
    //恢复Job
    $scope.resumeQuartzJob=function(index,quartzId)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要恢复所有job吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
    	   $http({
               method  : 'POST',
               url     : '/quartz/ws/quartz/resumeQuartzInJob',
               data    : $.param({
             	  quartzId: quartzId
               }),   
               headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
              }).success(function(data){
            	  if(data.result)
                  {  
               	     Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                      );
               	     $window.location.reload();
                  }else
                  {
               	     Notify.alert(
                          '<em class="fa fa-times"></em>'+data.message ,
                          {status: 'danger'}
                      );
                     $window.location.reload(); 
                  }
              });
     
    })
   }
    
    //暂停Job
    $scope.stopQuartzJob=function(index,quartzId)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要暂停所有job吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
    	   $http({
               method  : 'POST',
               url     : '/quartz/ws/quartz/stopQuartzInJob',
               data    : $.param({
             	  quartzId: quartzId
               }),   
               headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
              }).success(function(data){
            	  if(data.result)
                  {  
               	    Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                      );
                  	$window.location.reload();
                  }else
                  {
               	    Notify.alert(
                          '<em class="fa fa-times"></em>'+data.message ,
                          {status: 'danger'}
                      );
                 	$window.location.reload(); 
                  }
              });
     
    })
   }
    //删除定时任务
    $scope.delQuartz=function(index,quartzId)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要删除定时任务吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
    	   $http({
               method  : 'POST',
               url     : '/quartz/ws/quartz/deleteQuartzInJob',
               data    : $.param({
             	  quartzId: quartzId
               }),   
               headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
              }).success(function(data){
            	  if(data.result)
                  {  
               	   Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                      );
               	   $window.location.reload();
                  }else
                  {
               	   Notify.alert(
                          '<em class="fa fa-times"></em>'+data.message ,
                          {status: 'danger'}
                      );
               	   $window.location.reload(); 
                  }
              });
     
    })
   }
  
}])




/* 定时任务添加 */
quartzModule.controller('quartzCreate',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){

 $rootScope.submitted = false;
 $scope.createQuartz=function(){
   $rootScope.submitted = true;
   $http({
              method  : 'POST',
              url     : '/quartz/ws/quartz/addQuartzInfo',
              data    : $.param({
            	  quartzName: $scope.quartzName,
           	   	  quartzDate: $scope.quartzCron
              }),   
    headers : { 'Content-Type': 'application/x-www-form-urlencoded' }})
   .success(function(data){
	   if(data.result)
       {
    	   Notify.alert(
               '<em class="fa fa-check"></em>'+data.message ,
               {status: 'success'}
           );
    	   $state.go('app.listQuartz',{},{reload:true}); 
       }else
       {
    	   Notify.alert(
               '<em class="fa fa-times"></em>'+data.message ,
               {status: 'danger'}
           );
       }
   })
   .error(function(){
   });
 }
}])


/* 更新定时任务 */

quartzModule.controller('quartzUpdate',['$rootScope','$scope','$http','$state','$stateParams','Notify',function($rootScope,$scope,$http,$state,$stateParams,Notify){
    
    $scope.quartzId=$stateParams.quartzId; // 
    
    // 定时任务信息
    $http.get('/quartz/ws/quartz/getQuartz'+'?v=' + (new Date().getTime()),{
        params:{quartzId:$scope.quartzId}
    }).success(function(data){
       $scope.quartzInfo=data;
       $scope.quartzName=data.quartzName;
       $scope.quartzCron=data.quartzCron;
    })

     $rootScope.submitted = false;
 
    $scope.updateQuartz=function(){

          $rootScope.submitted = true;
    	   $http({
    	              method  : 'POST',
    	              url     : '/quartz/ws/quartz/updateQuartzInfo',
    	              data    : $.param({
    	            	  quartzId:$scope.quartzId,
    	            	  quartzName: $scope.quartzName,
    	           	   	  quartzDate: $scope.quartzCron
    	              }),   
    	    headers : { 'Content-Type': 'application/x-www-form-urlencoded' }})
    	   .success(function(data){
    		   if(data.result)
    	       {
    	    	   Notify.alert(
    	               '<em class="fa fa-check"></em>'+data.message ,
    	               {status: 'success'}
    	           );
    	    	   $state.go('app.listQuartz',{},{reload:true}); 
    	       }else
    	       {
    	    	   Notify.alert(
    	               '<em class="fa fa-times"></em>'+data.message ,
    	               {status: 'danger'}
    	           );
    	       }
    	   })
    	   .error(function(){
    	   });
    	 }
}])


quartzModule.controller('quartzInfo',['$rootScope','$scope','$http','$state','$stateParams','Notify',function($rootScope,$scope,$http,$state,$stateParams,Notify){
   
    $scope.quartzId=$stateParams.quartzId; // 
    
    // 所有蓝图实例
    $http.get('/quartz/ws/quartz/listAllBlueprintInstances'+'?v=' + (new Date().getTime())).success(function(data){
		$scope.tree = data;
	}).error(function(){
		$scope.applistoff=false;
		$scope.warninginfo='';
	});
	$scope.change = function(engineer){
		 $http.get('/quartz/ws/quartz/listBpInstanceFlows'+'?v=' + (new Date().getTime()),{
           params:
               {
        	       blueprintInstanceId  :$scope.engineer.INSTANCE_ID
               }
          }).success(function(data){
				 $scope.component = data;
			}).error(function(){
				 $scope.applistoff=false;
				 $scope.warninginfo='暂无结果';	
         });   
     };
     $scope.addQuartzJob = function ()
     {   
       var daterange=$('.daterange').val();
       $http({
           method  : 'POST',
           url     : '/quartz/ws/quartz/createQuartzJob',
           data    : $.param({
        	   instanceId:$scope.engineer.INSTANCE_ID,
        	   instanceName:$scope.engineer.INSTANCE_NAME,
      	       flowName:$scope.component1.FLOW_NAME,
      	       flowId:$scope.component1.ID,
      	       quartzId:$scope.quartzId
           }),   
           headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(data){
    	  if(data.result)
	       {
	    	   Notify.alert(
	               '<em class="fa fa-check"></em>'+data.message ,
	               {status: 'success'}
	           );
	    	   $state.go('app.listQuartz',{},{reload:true}); 
	       }else
	       {
	    	   alert(data.message);
	    	   Notify.alert(
	               '<em class="fa fa-times"></em>'+data.message ,
	               {status: 'danger'}
	           );
	       }
      })
     };
  
}])

//查看jobs
quartzModule.controller('quartzJobs',['$state','$scope','$http','ngDialog','$stateParams','Notify',function($state,$scope,$http,ngDialog,$stateParams,Notify){
	$scope.quartzId=$stateParams.quartzId;
	$scope.pageSize=10;
   $scope.pageNum=1;

  $scope.onPageChange = function ()
    {   
      $http.get('/quartz/ws/quartz/getJobsOfQuartz'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            quartzId:$scope.quartzId
          }
     }).success(function(data){
       $scope.quartzList = data;
       $scope.listoff=data.total>0?true:false;
         $scope.warninginfo='提示：暂无job';
         $scope.pageCount=Math.ceil($scope.quartzList.total/$scope.pageSize);
         if($scope.pageCount==0)
         {
           $scope.pageCount=1;
         }
     }).error(function(){
         $scope.listoff=false;
         $scope.warninginfo='暂无结果';
      })
    };  
    
  //resumeQuartzJob
    $scope.resumeQuartzJobOne=function(index,jobName)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要恢复此job吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
    	   $http({
               method  : 'POST',
               url     : '/quartz/ws/quartz/OperateQuartzJobOne',
               data    : $.param({
            	   jobName: jobName,
            	   op:'resume'
               }),   
               headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
              }).success(function(data){
            	  if(data.result)
                  {  
               	   Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                      );
               	$state.go('app.quartz_jobs',{quartzId:$scope.quartzId},{reload:true});
                  }else
                  {
               	   Notify.alert(
                          '<em class="fa fa-times"></em>'+data.message ,
                          {status: 'danger'}
                      );
               	$state.go('app.quartz_jobs',{quartzId:$scope.quartzId},{reload:true}); 
                  }
              });
     
    })
   };
   
 //stopQuartzJob
   $scope.stopQuartzJobOne=function(index,jobName)
   {
   	ngDialog.openConfirm({
       template:
            '<p class="modal-header">您确定要暂停此job吗?</p>' +
            '<div class="modal-body text-right">' +
              '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
              '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
            '</button></div>',
      plain: true,
      className: 'ngdialog-theme-default'
      }).then(function(){
   	   $http({
              method  : 'POST',
              url     : '/quartz/ws/quartz/OperateQuartzJobOne',
              data    : $.param({
           	   jobName: jobName,
           	   op:'stop'
              }),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
             }).success(function(data){
           	  if(data.result)
                 {  
              	   Notify.alert(
                         '<em class="fa fa-check"></em>'+data.message ,
                         {status: 'success'}
                     );
              	 $state.go('app.quartz_jobs',{quartzId:$scope.quartzId},{reload:true});
                 }else
                 {
              	   Notify.alert(
                         '<em class="fa fa-times"></em>'+data.message ,
                         {status: 'danger'}
                     );
              	 $state.go('app.quartz_jobs',{quartzId:$scope.quartzId},{reload:true});
                 }
             });
    
   })
  };
    
//deleteQuartzJob
  $scope.deleteQuartzJobOne=function(index,jobName)
  {
  	ngDialog.openConfirm({
      template:
           '<p class="modal-header">您确定要删除此job吗?</p>' +
           '<div class="modal-body text-right">' +
             '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
             '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
           '</button></div>',
     plain: true,
     className: 'ngdialog-theme-default'
     }).then(function(){
  	   $http({
             method  : 'POST',
             url     : '/quartz/ws/quartz/OperateQuartzJobOne',
             data    : $.param({
          	   jobName: jobName,
          	   op:'delete'
             }),   
             headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function(data){
          	  if(data.result)
                {  
             	   Notify.alert(
                        '<em class="fa fa-check"></em>'+data.message ,
                        {status: 'success'}
                    );
             	  $state.go('app.quartz_jobs',{quartzId:$scope.quartzId},{reload:true});
                }else
                {
             	   Notify.alert(
                        '<em class="fa fa-times"></em>'+data.message ,
                        {status: 'danger'}
                    );
             	  $state.go('app.quartz_jobs',{quartzId:$scope.quartzId},{reload:true});
                }
            });
   
  })
 };
 
}])



