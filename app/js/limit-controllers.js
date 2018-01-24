
var limitModule=angular.module('limit',['ngResource']);

/* ---------------------------------用户管理-------------------------------- */
limitModule.controller('limitUserCtrl',['$rootScope','$scope','$http','ngDialog','Notify',function($rootScope,$scope,$http,ngDialog,Notify){
	// 用户列表  
    $scope.pageSize=10;
    $scope.pageNum=1;
	$scope.onPageChange = function ()
	{   
	   $http.get('/cloudui/ws/admins/listUsers'+'?v=' + (new Date().getTime()),{
	        params:
		      {
		        pageSize:$scope.pageSize,
		        pageNum:$scope.pageNum,
		        key:$scope.searchval||''
		      }
	   }).success(function(data){
			   $scope.userList = data.rows;
			   $scope.listoff=data.total>0?true:false;
			   $scope.warninginfo='暂无数据';
			   $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
			   if($scope.pageCount==0)
			   {
			     $scope.pageCount=1;
			   }
	   }).error(function(){
		     $scope.listoff=false;
		     $scope.warninginfo='暂无结果';
	   })
   }

   // 搜素用户 
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

   // 新建用户弹窗
   $scope.openCreateUser=function(){
      ngDialog.open({
        template: 'app/views/dialog/limit-user-create.html'+'?action='+(new Date().getTime()),
        className: 'ngdialog-theme-default',
        scope: $scope,
        cache:false,
        closeByDocument:false,
        controller:'createUserCtrl'
      });
    }
   
   //删除用户
   $scope.delUser=function(index,param){
	   $scope.delID=param+"";
   	ngDialog.openConfirm({
           template:
                '<p class="modal-header">您确定要删除此用户吗?</p>' +
                '<div class="modal-body text-right">' +
                  '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
                  '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
                '</button></div>',
          plain: true,
          className: 'ngdialog-theme-default'
        }).then(function(){
       	$rootScope.app.layout.isShadow=true;
       	$http.get('/cloudui/master/ws/admin/delUserById?v='+ (new Date().getTime()),{
            params:{
            	userId:$scope.delID
             }
           }).success(function(data){
           	$rootScope.app.layout.isShadow=false;
             if(data.result)
             {
                    Notify.alert(
                         '<em class="fa fa-check"></em> 删除成功！' ,
                         {status: 'success'}
                    );
                    $scope.userList.splice(index,1);
             }else
             {
                    Notify.alert(
                      '<em class="fa fa-times"></em> 删除失败',
                      {status: 'danger'}
                    );
             }
           }) 
        })
   }
   //更新用户
   $scope.openUpdateUser=function(param,index){
       ngDialog.open({
         template: 'app/views/dialog/limit-user-update.html'+'?action='+(new Date().getTime()),
         className: 'ngdialog-theme-default',
         cache:false,
         closeByDocument:false,
         scope: $scope,
         data:{info:param,index:index},
         controller:'openUpdateUser'
       })
   }
}])

/* 更新用户信息*/
componentModule.controller('openUpdateUser',['$rootScope','$scope','$http','ngDialog','Notify','$state',function($rootScope,$scope,$http,ngDialog,Notify,$state){
	
	$scope.userInfo=$scope.ngDialogData.info;
	$scope.userName=$scope.userInfo.userName;
	//$scope.password=$scope.userInfo.password;
	$scope.index=$scope.ngDialogData.index;

    $scope.updateUserFn = function() {
        
        $scope.authMsg = '';
    
        if($scope.updateUserForm.$valid) {
    	$http.get('/cloudui/master/ws/admin/checkUserName?v='+ (new Date().getTime()),{
            params:{
            	userName:$scope.userName,
            	userId:$scope.userInfo.ID
             }
           }).success(function(response){
        	   var data =angular.fromJson(response);
        	   if ( !data.result ) {
                   Notify.alert(
                           '<em class="fa fa-times"></em> '+data.message,
                           {status: 'danger'}
                         );
                 }else{
        	    	$http({
                        method  : 'POST',
                        url     : '/cloudui/master/ws/admin/updateUser',
                        data    : $.param({
                       	 id:$scope.userInfo.ID,
                       	 username:$scope.userName,
                       	 password:$scope.password
                        }),   
                        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
                      }).then(function(response) {
                   	   $rootScope.app.layout.isShadow=false;
                          if ( !response.data.result ) {
                            Notify.alert(
                                    '<em class="fa fa-times"></em> '+response.data.message,
                                    {status: 'danger'}
                                  );
                          }else{
                       	   Notify.alert(
                                      '<em class="fa fa-check"></em> '+response.data.message,
                                      {status: 'success'}
                                 );
                              ngDialog.close();
                              $state.go('app.limit_manage.user',{},{ reload: true });
                          }  
                     },function(x) {
                          $scope.authMsg = '服务器请求错误';
                     }) 
        	    }
           })
         }
     else { 
       $scope.updateUserForm.text.$dirty = true;
     }
   };
}])


/* ---------------------------------新建用户-------------------------------- */
limitModule.controller('createUserCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){
   
   $scope.user = {};
 
   $scope.authMsg = '';

   $scope.user.rolename='运维';
   
   $rootScope.submitted = false;

   $scope.createUserFn = function(obj) {
	   
	$rootScope.submitted = true;
     
    $scope.authMsg = '';
   
    if($scope.createUserForm.$valid) {
      // 验证用户是否存在
      $http({
              method  : 'POST',
              url     : '/cloudui/ws/admins/isExitUser',   
              data    : $.param({userName:$scope.user.name}),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
      }).success(function(data){

         if(data.result)
         {
        	$rootScope.app.layout.isShadow=true;
            // 创建用户  
            $http({
              method  : 'POST',
              url     : '/cloudui/ws/admins/createUser',
              data    : $.param({
                username:$scope.user.name,
                password:$scope.user.password,
                rolename:$scope.user.rolename,
                pId:$rootScope.user.id
              }),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
           }).then(function(response) {
        	   $rootScope.app.layout.isShadow=false;
                if ( !response.data.result ) {
                  Notify.alert(
                          '<em class="fa fa-times"></em> '+response.data.message,
                          {status: 'danger'}
                        );
                }else{
                	Notify.alert(
                            '<em class="fa fa-check"></em> '+response.data.message,
                            {status: 'success'}
                       );
                    ngDialog.close();
                    $state.go('app.limit_manage.user',{},{ reload: true });
                }  
           },function(x) {
                $scope.authMsg = '服务器请求错误';
           })
         }else
         {
            $scope.authMsg = '此用户已存在，请重新命名！';
         }
      })

    }
  };
}])

/*---------------------------------------角色管理--------------------------- */
limitModule.controller('limitRoleCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){
  
  $scope.close=function(){
    $scope.treeoff=false;
  }

  // 角色列表   
  $http.get('/cloudui/ws/admins/listRoles'+'?v='+(new Date().getTime())).
  success(function(data){
      $scope.roleList=data;
  })
  // 新建角色弹窗
  $scope.openCreateRole=function(){
      ngDialog.open({
        template: 'app/views/dialog/limit-role-create.html'+'?action='+(new Date().getTime()),
        className: 'ngdialog-theme-default',
        scope: $scope,
        cache:false,
        closeByDocument:false,
        controller:'createRoleCtrl'
      });
  }

  // 删除角色  
  $scope.delRole=function(index,param){
     ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要删除此角色吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
     }).then(function(){
    	$rootScope.app.layout.isShadow=true;
        $http({
              method  : 'POST',
              url     : '/cloudui/ws/admins/delRole',   
              data    : $.param({roleName:param}),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
        }).then(function(response){
        	$rootScope.app.layout.isShadow=false;
            if(response.data.result)
            {
               Notify.alert(
                     '<em class="fa fa-check"></em> '+response.data.message ,
                     {status: 'success'}
               );
               $scope.roleList.splice(index,1);
            }else{
               Notify.alert(
                     '<em class="fa fa-times"></em> '+response.data.message ,
                     {status: 'danger'}
               );
            }
        })
     })
  }
  
  // 查看权限树
  $scope.getLimit=function(currole,url,treeOff,myData,myTree){
	  $http({
	      method:'post',
	      url:url,
	      data:$.param({
	    	  roleId:currole.roleId
	      }),
	      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
	   }).success(function(data){
		   
		   $scope.treeoff=true;
		   $scope[treeOff]=true;
		   $scope[myData]=[];
		   angular.forEach(data,function(val,key){
			   var obj={};
			   
			   if(treeOff=='treeoneoff'){
				   obj.label=val.policy.text;
				   obj.id=val.policy.page_id;
				   obj.checked=val.have;
				   obj.children=[];
				   angular.forEach(val.policy.policyChild,function(val2,key2){
					   var objchild={};
					   objchild.label=val2.text;
					   objchild.id=val2.id;
					   objchild.checked=val2.flag;
					   obj.children.push(objchild);
				   })
			   }else if(treeOff=='treetwooff'){
				   obj.label=val.policyChild.text;
				   obj.id=val.policyChild.id;
				   obj.checked=val.have;
				   obj.children=[];
				   angular.forEach(val.policyChild.policyMenu,function(val2,key2){
					   var objchild={};
					   objchild.label=val2.title;
					   objchild.id=val2.id;
					   objchild.checked=val2.menu_flag;
					   obj.children.push(objchild);
				   })
			   }
			   
			   $scope[myData].push(obj)

       })
       var tree;
       $scope[myTree] = tree = {};
         
     })
  }
  
  $scope.viewLimit=function(currole){
	  
	  $scope.currole=currole;
	  $scope.treeoff=false;
	  
	  // 一级权限
	  $scope.treeoneoff=false;
	  $scope.getLimit(currole,'/cloudui/ws/admins/getRootPolicysOfRole','treeoneoff','my_data_one','my_tree_one');
	  // 二级权限
	  $scope.treetwooff=false;
	  $scope.getLimit(currole,'/cloudui/ws/admins/getPolicysOfRole','treetwooff','my_data_two','my_tree_two');

  }
  
  // 修改权限树
   $scope.savetree=function(savedata,role){
      
     var policyIdsarr=[];
     var menuIdsarr=[];
 
     angular.forEach(savedata,function(val,key){
 
       if(val.checked)
       {
         policyIdsarr.push(val.id) 
       }
       
       angular.forEach(val.children,function(val2,key2){
         if(val2.checked){
           menuIdsarr.push(val2.id);
         }
       })
     })

     $http({
        method:'post',
        url:'/cloudui/ws/admins/savePolicysOfRole',
        data: $.param({
        roleId:role,
          policyIds:policyIdsarr.join(','),
          menuIds:menuIdsarr.join(',')
        }),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(data){
        if(data.result)
        {
          Notify.alert(
             '<em class="fa fa-check"></em> '+data.message ,
             {status: 'success'}
          );

        }else{
          Notify.alert(
                '<em class="fa fa-times"></em> 分配权限失败' ,
                {status: 'danger'}
           );
        }
   })
   }
}])

/*---------------------------------------新建角色--------------------------- */
limitModule.controller('createRoleCtrl',['$rootScope','$scope','$http','ngDialog','$state',function($rootScope,$scope,$http,ngDialog,$state){
   
   $scope.role = {};
 
   $scope.authMsg = '';
 
   $rootScope.submitted = false;
   
   $scope.createRoleFn = function(obj) {
    
	$rootScope.submitted = true;
	   
    $scope.authMsg = '';
   
    if($scope.createRoleForm.$valid) {
      // 验证角色是否存在
      $http({
              method  : 'POST',
              url     : '/cloudui/ws/admins/isExitRole',   
              data    : $.param({roleName:$scope.role.name}),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
      }).success(function(data){

         if(data.result)
         {
        	 $rootScope.app.layout.isShadow=true;
        	 
            // 创建角色 
            $http({
              method  : 'POST',
              url     : '/cloudui/ws/admins/createRole',
              data    : $.param({
                roleName:$scope.role.name
              }),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
           }).then(function(response) {
        	    $rootScope.app.layout.isShadow=false;
                if ( !response.data.result ) {
                  $scope.authMsg =response.data.message;
                }else{
                    ngDialog.close();
                    $state.go('app.limit_manage.role',{},{ reload: true });
                }  
           },function(x) {
                $scope.authMsg = '服务器请求错误';
           })
         }else
         {
            $scope.authMsg = '此角色已存在，请重新命名！';
         }
      })

    }
  };
}])

 
/*---------------------------------------菜单管理--------------------------- */
limitModule.controller('limitMenuCtrl',['$rootScope','$scope','$http','ngDialog','Notify',function($rootScope,$scope,$http,ngDialog,Notify){
   
   //菜单列表   
   $http.get('/cloudui/ws/admins/listPolicys'+'?v='+(new Date().getTime())).
   success(function(data){
       $scope.menuList=data;
   })
   // 新建菜单弹窗
  $scope.openCreateLimit=function(){
      ngDialog.open({
        template: 'app/views/dialog/limit-menu-create.html'+'?action='+(new Date().getTime()),
        className: 'ngdialog-theme-default',
        cache:false,
        closeByDocument:false,
        scope: $scope,
        controller:'createLimitCtrl'
      });
  }
  // 编辑菜单弹窗
  $scope.openEditLimit=function(param){
      ngDialog.open({
        template: 'app/views/dialog/limit-menu-edit.html'+'?action='+(new Date().getTime()),
        className: 'ngdialog-theme-default',
        cache:false,
        closeByDocument:false,
        data:{info:param},
        controller:'editLimitCtrl'
      });
  }
  // 删除权限
  $scope.delLimit=function(index,param1,param2){
     ngDialog.openConfirm({
        template:
             '<p class="modal-header">您确定要删除此权限吗?</p>' +
             '<div class="modal-body text-right">' +
               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
             '</button></div>',
       plain: true,
       className: 'ngdialog-theme-default'
     }).then(function(){
    	$rootScope.app.layout.isShadow=true;
        $http({
              method  : 'POST',
              url     : '/cloudui/ws/admins/delPolicyChild',   
              data    : $.param({policyChildId:param1,pId:param2}),   
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
        }).then(function(response){
        	 $rootScope.app.layout.isShadow=false;
            if(response.data.result)
            {
               Notify.alert(
                     '<em class="fa fa-check"></em> '+response.data.message ,
                     {status: 'success'}
               );
               $scope.menuList.splice(index,1);
            }else{
               Notify.alert(
                     '<em class="fa fa-times"></em> '+response.data.message ,
                     {status: 'danger'}
               );
            }
        })
     })
  }
}])

/*---------------------------------------菜单创建--------------------------- */
limitModule.controller('createLimitCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){
  
   $scope.limit = {};
 
   $scope.authMsg = '';
   
   // 一级菜单
   
   $http.get('/cloudui/ws/admins/listPolicysTemp'+'?v='+(new Date().getTime())).
   success(function(data){
	   $scope.parentMenuList=data;
   })
 
   $rootScope.submitted = false;
   
   $scope.createLimitFn = function() {
	   
	$rootScope.submitted = true;
     
    $scope.authMsg = '';
   
    if($scope.createLimitForm.$valid) {

      var policyInfos=angular.toJson({
         text:$scope.limit.text,
         icon:$scope.limit.icon,
         sref:$scope.limit.sref,
         title:$scope.limit.title,
         type:$scope.limit.type/*,
         serialNum:$scope.limit.serialNum*/
      })
      
      $rootScope.app.layout.isShadow=true;
      
      // 创建菜单  
      $http({
        method  : 'POST',
        url     : '/cloudui/ws/admins/createPolicyChild',
        data    : $.param({
          policyInfos:policyInfos,
          policytext:$scope.limit.parent||''
        }),   
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
      }).then(function(response){
    	  $rootScope.app.layout.isShadow=false;
          if ( !response.data.result ) {
            Notify.alert(
                '<em class="fa fa-times"></em> '+response.data.message ,
                {status: 'danger'}
             );
          }else{
              ngDialog.close();
              $state.go('app.limit_manage.menu',{},{ reload: true });
          }
      },function(x) {
         $scope.authMsg = '服务器请求错误';
      })
    }
  };
}])

 
/*---------------------------------------菜单编辑--------------------------- */
limitModule.controller('editLimitCtrl',['$rootScope','$scope','$http','ngDialog','$state','Notify',function($rootScope,$scope,$http,ngDialog,$state,Notify){
  
     var menuinfo=$scope.ngDialogData.info;

     $scope.limit={};

     $scope.authMsg = '';
     
      // 一级菜单
     $http.get('/cloudui/ws/admins/listPolicysTemp'+'?v='+(new Date().getTime())).
     success(function(data){
       $scope.parentMenuList=data;
     })
    
     $scope.limit.text=menuinfo.text;
     $scope.limit.icon=menuinfo.icon;
     $scope.limit.sref=menuinfo.sref;
     $scope.limit.type=menuinfo.type; 
     $scope.limit.serialNum=menuinfo.serialNum;
     $scope.limit.parent=menuinfo.parent_id;
     
     $rootScope.submitted = false;
     
     $scope.editLimitFn = function() {
     
       $rootScope.submitted = true;
    	 
       $scope.authMsg = '';
   
       if($scope.editLimitForm.$valid) {

          var policyInfos=angular.toJson({
             policyId:menuinfo.id,
             text:$scope.limit.text,
             icon:$scope.limit.icon,
             sref:$scope.limit.sref,
             type:$scope.limit.type,
             pId:$scope.limit.parent
          })
          
          $rootScope.app.layout.isShadow=true;
      
          // 编辑权限   
          $http({
            method  : 'POST',
            url     : '/cloudui/ws/admins/modifyPolicyChild',
            data    : $.param({
              policyInfos:policyInfos
            }),   
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
          }).then(function(response){
        	  
        	  $rootScope.app.layout.isShadow=false;
        	  
              if ( !response.data.result ) {
                Notify.alert(
                        '<em class="fa fa-times"></em> '+response.data.message ,
                        {status: 'danger'}
                );
              }else{
                  ngDialog.close();
                  $state.go('app.limit_manage.menu',{},{ reload: true });
              }
          },function(x) {
             $scope.authMsg = '服务器请求错误';
          })
        }
  };
   
}])

