var operationalModule=angular.module('operational',[]);

operationalModule.controller('operationalManage',['$scope','$http','Notify','$timeout','$filter','ngDialog',function($scope,$http,Notify,$timeout,$filter,ngDialog){
   $scope.pageSize=10;
   $scope.pageNum=1;
   $scope.loadoff=false;
   $scope.checkappId=[]; // 选中的蓝图
   // 用户列表
   $http.get('/cloudui/master/ws/audit/getAllUsers?v='+(new Date().getTime())).
   success(function(data){
      $scope.userList=data;
      $scope.userList.unshift('(ALL)');
      $scope.user=$scope.userList[0];
   })
   // 操作资源类型
   $http.get('/cloudui/master/ws/audit/getAllResourceType?v='+(new Date().getTime())).
   success(function(data){
      $scope.resourceTypeList=data;
      $scope.resourceTypeList.unshift('(ALL)');
      $scope.resourceType=$scope.resourceTypeList[0];
   })
   // 操作结果
   $scope.resultList=[
      {value:"",text:"(ALL)"},
      {value:0,text:"失败"},
      {value:1,text:"成功"}
   ]
   $scope.operateResult=$scope.resultList[0].value;
   // 操作类型
   $scope.operateTypeList=[
      {value:"",text:"(ALL)"},
      {value:"add",text:"新增"},
      {value:"update",text:"更新"},
      {value:"delete",text:"删除"},
      {value:"import",text:"导入"},
      {value:"export",text:"导出"},
      {value:"login",text:"登录"},
      {value:"logout",text:"注销"}
   ]
   $scope.operateType=$scope.operateTypeList[0].value;
   // 文字显示
   $scope.text=function(value,type){
      if(type=="operateType"){
         return $filter('filter')($scope.operateTypeList,value)[0].text;
      }else if(type=="operateResult"){
         return $filter('filter')($scope.resultList,value)[0].text;
      }
   }
   //查询
   $scope.queryFn=function(pageNum){
      $scope.loadoff=false;

      $timeout(function(){
       $scope.loadoff=true;
      })

      var daterange=$('.daterange').val();
     
      $scope.startdate=daterange.split(' - ')[0];
      $scope.enddate=daterange.split(' - ')[1];
 
      $scope.onPageChange = function (pageNum)
      {    
           $http.get('/cloudui/master/ws/audit/list?v='+'?v=' + (new Date().getTime()),{
           params:
           {
              "pageSize":$scope.pageSize,
              "pageNum":pageNum,
              "userId":$scope.user=='(ALL)'?'':$scope.user,
              "resourceType":$scope.resourceType=='(ALL)'?'':$scope.resourceType,
              "operateType":$scope.operateType||'',
              "operateResult":$scope.operateResult||'', 
              "startDate":$scope.enddate||'',
              "endDate":$scope.startdate||''
           }
       }).success(function(data){
          angular.forEach(data.rows,function(val,key){
             var ischecked=$filter('filter')($scope.checkappId,val.id).length>0?true:false;
             data.rows[key].ischecked=ischecked;
          })
          $scope.resultData=data.rows;   
          $scope.listoff=data.total>0?true:false;
          $scope.warninginfo='提示：暂无数据';
          $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
          if($scope.pageCount==0){
            $scope.pageCount=1;
          } 
       }).error(function(){
          $scope.listoff=false;
          $scope.warninginfo='暂无结果';
       })
         
    }

   }

   // 导出
   $scope.exportData=function(){
        var checkbox = $scope.checkappId;
        if(checkbox.length==0)
        {
           Notify.alert(
             '请选择要导出的数据！' ,
             {status: 'info'}
           );
        }else
        {
           window.location.href = '/cloudui/master/ws/audit/export?ids='+checkbox;
        }
   }
}])



