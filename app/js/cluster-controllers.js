var clusterModule=angular.module('cluster',[]);

/* ------------------------------------资源池管理------------------------------------ */
clusterModule.controller('clusterManageCtrl',['$rootScope','$scope','Notify','ngDialog','$http','$state','$cookieStore','$filter','$location',function($rootScope,$scope,Notify,ngDialog,$http,$state,$cookieStore,$filter,$location){
  
  $scope.clusterPages=[
     "app.cluster_manage",
     "app.cluster_detail",
     "app.node_add",
     "app.node_edit"
  ]
  
  // 资源池列表
  $scope.isLoad=false;
  $scope.pageSize=8; 

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    var isClear=$filter('filter')($scope.clusterPages,toState.name).length>0?false:true;
    if(isClear){
      $scope.clearCookie(); 
    }
  });

  
  $scope.searchval=$cookieStore.get('clusterSearch')?$cookieStore.get('clusterSearch'):'';
 

  if($cookieStore.get('clusterPageNum')){
     $scope.listDataPromise=$http.get('/cloudui/master/ws/cluster'+'?v=' + (new Date().getTime()),{
        params:
        {
          pageNum:1,
          pageSize:$scope.pageSize,
          name:$scope.searchval||''
        }
     }).then(function(res){
        
         $scope.totalPageNum=res.data.totalPageNum;
         
         if($cookieStore.get('clusterPageNum')<=$scope.totalPageNum){
            $scope.pageNum=$cookieStore.get('clusterPageNum');
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
    $cookieStore.put('clusterPageNum',$scope.pageNum);
    $cookieStore.put('clusterSearch',$scope.searchval);
  }
  
  $scope.clearCookie=function(){
    $cookieStore.remove("clusterPageNum");
    $cookieStore.remove("clusterSearch");
  }
     
  // 新建资源池弹出框
  $scope.openCreateCluster = function () {
        ngDialog.open({
          template: 'app/views/dialog/cluster-create.html'+'?action='+(new Date().getTime()),
          className: 'ngdialog-theme-default',
          scope: $scope,
          cache:false,
          closeByDocument:false,
          controller:'createClusterCtrl'
        });
  };

  // 删除资源池
  $scope.openDelCluster=function(params){
      if(params.hostNum>0){
        Notify.alert( 
                '环境上有主机不能删除！', 
                {status: 'info'}
            );
        return false;
      }
        ngDialog.openConfirm({
           template:
                '<p class="modal-header">您确定要删除 '+params.name+' 环境吗?</p>' +
                '<div class="modal-body text-right">' +
                  '<button type="button" class="btn btn-default mr20" ng-click="closeThisDialog(0)">取消' +
                  '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
                '</button></div>',
          plain: true,
          className: 'ngdialog-theme-default'
        })
        .then(
          function(){
           $rootScope.app.layout.isShadow=true;
           $scope.setCookie();
             $http.delete('/cloudui/master/ws/cluster',{
               params:{
                 clusterId:params.id 
               }
             })
             .success(function(data){
               $rootScope.app.layout.isShadow=false;
                 if(data.result)
                 {
                    Notify.alert( 
                       '<em class="fa fa-check"></em> 删除成功！', 
                       {status: 'success'}
                    );
                    $state.go('app.cluster_manage',{},{ reload: true });
                 }else
                 {
                     Notify.alert( 
                        '<em class="fa fa-times"></em> '+data.info, 
                        {status: 'danger'}
                     );
                 }
             })
          }
        )
    }
  
    
    $scope.onPageChange = function ()
    {
      if(!$scope.pageNum){
         return ;
      }
      $http.get('/cloudui/master/ws/cluster'+'?v=' + (new Date().getTime()),{
        params:
            {
              pageNum:$scope.pageNum,
              pageSize:$scope.pageSize,
              name:$scope.searchval||''
            }
      }).success(function(data){
            $scope.isLoad=true;
            $scope.isExistCluster=data.rows.length>0?true:false;
              $scope.clusterList = data.rows;
              $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
              if($scope.pageCount==0){
                $scope.pageCount=1;
              }
      }).error(function(){
          $scope.isExistCluster=false;
      })
    } 
    
    // 搜素资源池
    $scope.search=function()
    { 
         $scope.pageNum=1;
         $scope.setCookie();
         $scope.onPageChange(); 
    } 
}])

/* -----------------------------------------创建资源池---------------------------------- */
clusterModule.controller('createClusterCtrl',['$rootScope','$scope','$http','$state','ngDialog',function($rootScope,$scope,$http,$state,ngDialog){
   
  $scope.account = {};
 
  $scope.authMsg = '';
  
  $rootScope.submitted = false;

  $scope.createclusterFn = function(obj) {
    
  $rootScope.submitted = true;
     
    $scope.authMsg = '';

    // 验证资源池名字 
    $http.get('/cloudui/master/ws/cluster/check'+'?v=' + (new Date().getTime()),{
      params:{
        name:$scope.account.name
      }
    }).success(function(data) {
           if(data.result)
           {
             $rootScope.app.layout.isShadow=true;
              // 新增资源池
              $http({
                method  : 'POST',
                url     : '/cloudui/master/ws/cluster',
                data    : {name:$scope.account.name},  
                headers : { 'Content-Type': 'application/json' }
              })
              .then(function(response) {
                $rootScope.app.layout.isShadow=false;
                if (response.data.result ) {
                  ngDialog.close();
                  $state.go('app.cluster_detail',{clusterid:response.data.id},{ reload: true });
                }else{
                   $scope.authMsg = '创建失败，请重新添加环境！';  
                }
              }, function(x) {
                $scope.authMsg = '服务器请求错误';
              });
              
           }else{
              $scope.authMsg = '此环境已存在，请重新命名！';
              $scope.createclusterForm.$valid=false;
           }

        })
  };

}])

/* -------------------------------------重命名资源池---------------------------------- */
clusterModule.controller('changeClusterNameCtrl',['$rootScope','$scope','$http','$state','$stateParams','ngDialog','Notify',function($rootScope,$scope,$http,$state,$stateParams,ngDialog,Notify){
      
  $scope.account = {};

  $scope.account.name=$scope.ngDialogData.name;
 
  $scope.authMsg = '';
  
  $rootScope.submitted = false;

  $scope.changeclusterNameFn = function() {
    
  $rootScope.submitted = true;
     
    $scope.authMsg = '';

    // 验证名字 
    $http.get('/cloudui/master/ws/cluster/checkOther'+'?v=' + (new Date().getTime()),{
      params:{
        name:$scope.account.name,
        id:$stateParams.clusterid
      }
    }).success(function(data) {
         if(data.result)
         {
          $rootScope.app.layout.isShadow=true;
            // 重命名资源池  
            $http({
               method:'PUT',
               url:'/cloudui/master/ws/cluster',  
               data: {
                 id:$stateParams.clusterid,
                 name:$scope.account.name
                },
             headers : { 'Content-Type': 'application/json' }
            }).success(function(data){
              $rootScope.app.layout.isShadow=false;
              if(data.result)
                {
                   Notify.alert(
                      '<em class="fa fa-check"></em> 重命名成功!' ,
                      {status: 'success'}
                   );
                   ngDialog.close();
                   $state.go('app.cluster_detail',{clusterid:$stateParams.clusterid},{reload:true});
                }else{
                   Notify.alert(
                      '<em class="fa fa-times"></em> 重命名失败!' ,
                      {status: 'danger'}
                   );
                } 
            })
         }else{
            $scope.authMsg = '此环境已存在，请重新命名！';
            $scope.changeclusterNameForm.$valid=false;
         }

      })
  };

}])

/* --------------------------------------资源池详情---------------------------------- */

clusterModule.controller('clusterDetailCtrl',['$rootScope','$scope','$http','$stateParams','ngDialog','$state','Notify',function($rootScope,$scope,$http,$stateParams,ngDialog,$state,Notify){
  
   // 重命名集群弹出框
   $scope.openchangeCluster = function (params) {
      ngDialog.open({
        template: 'app/views/dialog/cluster-changename.html'+'?action='+(new Date().getTime()),
        className: 'ngdialog-theme-default',
        scope: $scope,
        cache: false,
        closeByDocument:false,
        data:{name:params},
        controller:'changeClusterNameCtrl'
      });
   };

   // 删除资源池
   $scope.openDelCluster=function(params){
     if(params.hostNum>0) 
      {
       Notify.alert( 
                '环境上有主机不能删除！', 
                {status: 'info'}
           );
        return false;
      }
      ngDialog.openConfirm({
         template:
              '<p class="modal-header">您确定要删除此环境吗?</p>' +
              '<div class="modal-body text-right">' +
                '<button type="button" class="btn btn-default mr20" ng-click="closeThisDialog(0)">取消' +
                '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
              '</button></div>',
        plain: true,
        className: 'ngdialog-theme-default'
      })
      .then(
        function(){
           $rootScope.app.layout.isShadow=true;
     
           $http.delete('/cloudui/master/ws/cluster',{
               params:{
                 clusterId:params.id 
               }
           })
           .success(function(data){
             $rootScope.app.layout.isShadow=false;
               if(data.result)
               {
                 Notify.alert( 
                  '<em class="fa fa-check"></em> 删除成功！', 
                  {status: 'success'}
                 );
                 $state.go('app.cluster_manage',{},{ reload: true });
               }else
               {
                Notify.alert( 
                     '<em class="fa fa-times"></em> '+data.info, 
                     {status: 'danger'}
                  );
               }
          })  
        }
      )
  }

  // 资源池基本信息   
  $http.get('/cloudui/master/ws/cluster/'+$stateParams.clusterid).success(function(data){ 
      $scope.clusterDetail = data; 
  })

}])

/* --------------------------------------资源池上的主机---------------------------------- */
clusterModule.controller('nodesListCtrl',['$rootScope','$scope','$http','$stateParams','ngDialog','Notify','$state','$filter',function($rootScope,$scope,$http,$stateParams,ngDialog,Notify,$state,$filter){
  
  $scope.checkappId=[]; // 选中的主机
  // 主机列表 
  $scope.pageSize=10;
  $scope.pageNum=1;
  $scope.onPageChange = function ()
  {
    
     $http.get('/cloudui/master/ws/node'+'?v='+(new Date().getTime()),{
     params:
         {
           pageNum:$scope.pageNum,
           pageSize:$scope.pageSize,
           clusterId:$stateParams.clusterid
         }
    }).success(function(data){
      
     angular.forEach(data.rows,function(val,key){
           var ischecked=$filter('filter')($scope.checkappId,val.id).length>0?true:false;
           data.rows[key].ischecked=ischecked;
       })
           
       $scope.nodesList = data.rows;
     $scope.listoff=data.rows.length>0?true:false;
       $scope.warninginfo='提示：暂无主机';
          
       $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
         if($scope.pageCount==0){
           $scope.pageCount=1;
         }
    }).error(function(){
         $scope.listoff=false;
         $scope.warninginfo='暂无结果';
    })
  }
    
   // 删除主机
   
   $scope.delNodeHttp=function(ids,index){
     $rootScope.app.layout.isShadow=true;
     $http.delete('/cloudui/master/ws/node/multiDelete',{params:
         {
          nodes:ids,
          clusterId:$stateParams.clusterid
       }
     }).success(function(data){
          $rootScope.app.layout.isShadow=false;
            if(data.result)
            {
                Notify.alert(
                  '<em class="fa fa-check"></em> 删除成功！' ,
                  {status: 'success'}
                );
                
                if(index)
                {
                   $scope.nodesList.splice(index, 1);
                }else{
                  $state.go('app.cluster_detail',{clusterid:$stateParams.clusterid},{reload:true});
                }              
            }else
            {
                Notify.alert(
                  '<em class="fa fa-check"></em> '+data.info ,
                  {status: 'danger'}
                );
            }
        }) 
   }

   $scope.delNodeFn=function(params,index)
   {
     
       ngDialog.openConfirm({
           template:
               '<p class="modal-header">您确定要删除吗?</p>' +
               '<div class="modal-body text-right">' +
                 '<button type="button" class="btn btn-default mr20" ng-click="closeThisDialog(0)">取消' +
                 '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
               '</button></div>',
           plain: true,
           className: 'ngdialog-theme-default'
       })
       .then(
          function(){  
            var ids=''; // 主机id字符串
            if(angular.isObject(params)){
                             
                ids=params.join(',');
               
              $scope.delNodeHttp(ids);
            }else{
              $scope.delNodeHttp(params,index);
            } 
          }
       )
   }

   $scope.openDelNodeFn=function(params,index){
    
       if(params)
       {
          $scope.delNodeFn(params,index);
       }else
       {
        var checkbox = $scope.checkappId;
          if(checkbox.length==0)
          {
             Notify.alert(
                '请选择您要删除的主机!' ,
                {status: 'info'}
             );
          }else
          {
             $scope.delNodeFn(checkbox);
          }
       }
   }  
     
     
}])


/* ------------------------------------添加主机------------------------------------ */
clusterModule.controller('addNodeCtrl',['$rootScope','$scope','$http','ngDialog','$stateParams','$state','$interval','Notify',function($rootScope,$scope,$http,ngDialog,$stateParams,$state,$interval,Notify){
 
  $scope.clusterid=$stateParams.clusterid;
  $scope.clustername=$stateParams.clustername;
  
  $scope.system='linux';
 
  $scope.formnodeData={};

  var addNodeFn=function(){
    $http({
           method:'post',
           url:'/cloudui/master/ws/node',
           data: {
             name:$scope.formnodeData.name,
             description:$scope.formnodeData.description,
             ip:$scope.formnodeData.ip,
             userName:$scope.userName,
             userPassword:$scope.userPassword,
           clusterId:$stateParams.clusterid,
           osType:$scope.system
           },
           headers : { 'Content-Type': 'application/json' }
       }).success(function(data){
           if(data.result){
             Notify.alert(
                     '<em class="fa fa-check"></em> 添加主机成功！' ,
                     {status: 'success'}
                  );
             $state.go('app.cluster_detail',{clusterid:$stateParams.clusterid},{reload:true});
           }else{
             Notify.alert(
                     '<em class="fa fa-times"></em> '+data.info ,
                     {status: 'danger'}
                  );
           }
       })
  }
 // 发送命令
 $rootScope.submitted = false;
 $scope.addNodeFn=function(){
   $rootScope.submitted = true;
   if($scope.system=='linux'){
     $scope.userName=$scope.formnodeData.username;
     $scope.userPassword=$scope.formnodeData.password;
   }else if($scope.system=='windows'){
     $scope.userName='';
     $scope.userPassword='';
   }
   $rootScope.app.layout.isShadow=true;
   $http({
         method:'post',
         url:'/cloudui/master/ws/node/detectNode',
         data: {
           name:$scope.formnodeData.name,
           description:$scope.formnodeData.description,
           ip:$scope.formnodeData.ip,
           userName:$scope.userName,
           userPassword:$scope.userPassword,
         clusterId:$stateParams.clusterid,
         osType:$scope.system
         },
         headers : { 'Content-Type': 'application/json' }
     }).success(function(data){
       $rootScope.app.layout.isShadow=false;
         if(data.result){
          //添加主机
          addNodeFn();
         }else{
           ngDialog.openConfirm({
                template:
                     '<p class="modal-header">该主机网络不可达，您确定要添加此主机吗?</p>' +
                     '<div class="modal-body text-right">' +
                       '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
                       '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
                     '</button></div>',
               plain: true,
               className: 'ngdialog-theme-default'
               }).then(function(){
                 //添加主机
                 addNodeFn();
            })
         }
     })
   
 }

}])

/* ------------------------------------编辑主机------------------------------------ */
clusterModule.controller('editNodeCtrl',['$rootScope','$scope','$http','ngDialog','$stateParams','$state','$interval','Notify',function($rootScope,$scope,$http,ngDialog,$stateParams,$state,$interval,Notify){
 
  $scope.formnodeData={};
  
  
  
  //资源池基本信息   
  $http.get('/cloudui/master/ws/cluster/'+$stateParams.clusterid).success(function(data){ 
      $scope.clustername=data.name;
  })
  
  // 主机信息
  $http.get('/cloudui/master/ws/node/'+$stateParams.nodeid).success(function(data){ 
      $scope.nodeDetail=data;
      $scope.formnodeData.name=data.name;
      $scope.formnodeData.description=data.description||'';
      $scope.formnodeData.ip=data.ip;
      $scope.system=data.osType;
  })

  var editNodeFn=function(){
     $rootScope.submitted = true;
     if($scope.system=='linux'){
       $scope.userName=$scope.formnodeData.username;
       $scope.userPassword=$scope.formnodeData.password;
     }else if($scope.system=='windows'){
       $scope.userName='';
       $scope.userPassword='';
     }
     $http({
           method:'put',
           url:'/cloudui/master/ws/node',
           data: {
             name:$scope.formnodeData.name,
             description:$scope.formnodeData.description,
             ip:$scope.formnodeData.ip,
             userName:$scope.userName,
             userPassword:$scope.userPassword,
           id:$stateParams.nodeid,
           osType:$scope.system
           },
           headers : { 'Content-Type': 'application/json' }
       }).success(function(data){
           if(data.result){
             Notify.alert(
                     '<em class="fa fa-check"></em> 修改主机成功！' ,
                     {status: 'success'}
                  );
             $state.go('app.cluster_detail',{clusterid:$stateParams.clusterid},{reload:true});
           }else{
             Notify.alert(
                     '<em class="fa fa-times"></em> '+data.info ,
                     {status: 'danger'}
                  );
           }
       })
   }
  //发送命令
  $rootScope.submitted = false;
  $scope.editNodeFn=function(){
     $rootScope.submitted = true;
     if($scope.system=='linux'){
       $scope.userName=$scope.formnodeData.username;
       $scope.userPassword=$scope.formnodeData.password;
     }else if($scope.system=='windows'){
       $scope.userName='';
       $scope.userPassword='';
     }
     $rootScope.app.layout.isShadow=true;
     $http({
           method:'post',
           url:'/cloudui/master/ws/node/detectNode',
           data: {
             name:$scope.formnodeData.name,
             description:$scope.formnodeData.description,
             ip:$scope.formnodeData.ip,
             userName:$scope.userName,
             userPassword:$scope.userPassword,
           clusterId:$stateParams.clusterid,
           osType:$scope.system
           },
           headers : { 'Content-Type': 'application/json' }
       }).success(function(data){
         $rootScope.app.layout.isShadow=false;
           if(data.result){
            //编辑主机
            editNodeFn();
           }else{
             ngDialog.openConfirm({
                  template:
                       '<p class="modal-header">该主机网络不可达，您确定要编辑此主机吗?</p>' +
                       '<div class="modal-body text-right">' +
                         '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
                         '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
                       '</button></div>',
                 plain: true,
                 className: 'ngdialog-theme-default'
                 }).then(function(){
                   //编辑主机
                   editNodeFn();
              })
           }
       })
     
   }

}])

//添加主机验证ip唯一
clusterModule.directive('addnodeonlyip', function($http) {
    return {
        require : 'ngModel',
        link : function(scope, elm, attrs, ctrl) {
           function validFn(){
             $http(
                {
                  method: 'get', 
                  url: '/cloudui/master/ws/node/checkIP'+'?v='+(new Date().getTime()),
                    params:{
                      ip:scope.formnodeData.ip
                    }
                }
                ). 
                success(function(data, status, headers, config) {
                    if(data.result){
                        ctrl.$setValidity('isonly',true);
                    }else{
                        ctrl.$setValidity('isonly',false);
                    }
                }).
                error(function(data, status, headers, config) {
                    ctrl.$setValidity('isonly', false);
                });
            }

            scope.$watch('formnodeData.ip',function(newval,oldval){
               if(newval&&(newval!==oldval)){
                   validFn();
               }
            })
        }
    };
}); 


//编辑主机验证ip唯一
clusterModule.directive('editnodeonlyip', function($http) {
    return {
        require : 'ngModel',
        link : function(scope, elm, attrs, ctrl) {

            function validFn(){
                $http(
                {
                  method: 'get', 
                  url: '/cloudui/master/ws/node/checkOtherIP'+'?v='+(new Date().getTime()),
                    params:{
                      ip:scope.formnodeData.ip,
                      id:scope.nodeDetail.id
                    }
                }
                ). 
                success(function(data, status, headers, config) {
                    if(data.result){
                        ctrl.$setValidity('isonly',true);
                    }else{
                        ctrl.$setValidity('isonly',false);
                    }
                }).
                error(function(data, status, headers, config) {
                    ctrl.$setValidity('isonly', false);
                });
            }

            elm.bind('change', function() {
                 validFn();
            });
        }
    };
}); 

