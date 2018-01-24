var scriptModule=angular.module('script',[]);
/* ------------------------------------脚本库管理------------------------------------ */
scriptModule.controller('scriptManageCtrl',['$rootScope','$scope','$http','ngDialog','Notify',function($rootScope,$scope,$http,ngDialog,Notify){
   // 脚本列表
   $scope.pageSize=10;
   $scope.pageNum=1;
   $scope.onPageChange = function ()
   {    
      $http.get('/cloudui/ws/resource/listScriptResourceByPage'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            name:$scope.searchval
          }
     }).success(function(data){
       $scope.scriptList = data.rows;
       $scope.listoff=data.total>0?true:false;
         $scope.warninginfo='提示：暂无脚本';
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
    
    // 搜素
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
    
    // 删除脚本
    $scope.delScript=function(index,id)
    {
    	ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要删除此脚本包吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
       }).then(function(){
           $http({
                 method:"DELETE",
                 url:'/cloudui/ws/resource/deleteScriptResource?id='+id
              }).success(function(data){
            	  if(data.result)
                  {
            		  $scope.scriptList.splice(index, 1);  
               	      Notify.alert(
                          '<em class="fa fa-check"></em>'+data.message ,
                          {status: 'success'}
                      );
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
    
}])

scriptModule.controller('addScriptCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify','FileUploader','$timeout',function($rootScope,$scope,$http,ngDialog,$state,Notify,FileUploader,$timeout){
	
	$rootScope.submitted = false;
	
	var uploader = $scope.uploader = new FileUploader({
	      url: '/cloudui/ws/resource/saveScript',
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
	
	        if(fileType!=='zip'){
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
            if(fileType!=='zip'){
                 Notify.alert(
		            '<em class="fa fa-check"></em> 请添加ZIP类型的脚本文件!',
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
	      	  $scope.isDisabled=true;
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
    	   $state.go('app.script_manage',{},{reload:true}); 
 
	    }else{

	       Notify.alert(
	           '<em class="fa fa-times"></em> '+response.message ,
	           {status: 'danger'}
	       );
	    }
		      
	};
	
	// 添加脚本
	$scope.addScriptFn=function(){
		 $rootScope.submitted = true;
		 $rootScope.app.layout.isShadow=true;
		 var uploaderFile=uploader.queue[0];
		 uploaderFile.formData.push(
			{
				"name": $scope.name,
			    "description": $scope.description||''
			}	 
		 );
		
		 uploaderFile.upload()
	
	}
}])
