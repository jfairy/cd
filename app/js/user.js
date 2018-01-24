/* 控制器 */

var userControllers = angular.module('userControllers', ['ipCookie']);

/* 密码一致验证 */
 
userControllers.directive('equalpassword', function($http) {
    return {
        require : 'ngModel',
        link : function(scope, elm, attrs, ctrl) {
          elm.bind('keydown', function() {
            scope.$watch(function(){
                if(scope.account.password!==scope.account.account_password_confirm)
                  {  
                     ctrl.$setValidity('equal',false);
                  }else{
                    ctrl.$setValidity('equal',true);
                  }
              })
          })
 
        }
    };
}); 
/* -----------------------------------------读取文件------------------------------------- */ 
userControllers.service('fileReader', function ($q) {

    var onLoad = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };

    var getReader = function (deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        return reader;
    }

    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);
        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL
    };
});

//定义全局作用域
userControllers.run(["$rootScope",'$http','fileReader',function ($rootScope,$http,fileReader) {

   $rootScope.app={};

  // 定制信息 
  $http.get('/cloudui/master/ws/logo/info?v='+(new Date().getTime())).
  success(function(data){
      if(data.name){
          $rootScope.app.name = data.name;
      }else{
          $rootScope.app.name = '神州信息自动部署平台';
      }

      if(data.description){
          $rootScope.app.description = data.description;
      }else{
          $rootScope.app.description = '全栈式应用自动化部署工具';
      }
  })
  
  // logo

  $http.get('/cloudui/master/ws/logo/download?v='+(new Date().getTime()),{
    params:{
       size:"big"
    }
  }).
  success(function(data){
      if(data){
          $rootScope.app.logosrc ="/cloudui/master/ws/logo/download?size=big";
      }else{
          $rootScope.app.logosrc= '../../app/images/dcits_logo.png';
      }
  })

  // favicon logo

  $http.get('/cloudui/master/ws/logo/download?v='+(new Date().getTime()),{
    params:{
        size:"icon"
    }
  }).
  success(function(data){
      if(data){
          $rootScope.app.logosrc_favicon ="/cloudui/master/ws/logo/download?size=icon";
      }else{
          $rootScope.app.logosrc_favicon= '../../app/images/logo.ico';
      }
  })

  
}]);

/* 登录 */

userControllers.controller('LoginFormController', ['$rootScope','$scope', '$http','$location','ipCookie', function($rootScope,$scope, $http,$location,ipCookie) {
   $(document).keydown(function (e) {

        if (e.keyCode == 13) {

            if (e && e.preventDefault) {

                //阻止默认浏览器动作(W3C)

                e.preventDefault();

            } else {

                //IE中阻止函数器默认动作的方式

                window.event.returnValue = false;

            }

            if ($("#loginid").is(":focus") == false && ($scope.account.username == undefined || $scope.account.username == '')) {

                $("#loginid").focus();

            } else if ($("#loginpwd").is(":focus") == false && ($scope.account.password == undefined || $scope.account.password == '')) {

              

                $("#loginpwd").focus();

            } else {

                $scope.login();

            }

        }

    });

    function getContext(){

      var absu = $location.absUrl();

      var port = $location.port().toString();

      var start = absu.indexOf(port) + port.length;

      var end = absu.indexOf("/", start + 1);

      var context = absu.substring(start, end);

      return context;

    }

    function mixPwd(pwd){

      var a='pco';

      var b=pwd.substring(0,7);

      var c='jxd';

      var d=pwd.substring(7);

      var e='waxloli';

      return a+b+c+d+e;

    }

    function retrievePwd(pwd){

      var rs=pwd.substring(3);

      var a=rs.substring(0,6);

      var b=rs.substring(10);

      var i=b.lastIndexOf('waxlol');

      b=b.substring(0,i);

      return a+b;

    }

  // 绑定表单的所有数据
  $scope.account = {};
  if(ipCookie('copCurrentUid')!=null){

      try{

        var user=ipCookie('copCurrentUid');

        $scope.isCookie=true;

        $scope.account.username=decodeURI(ipCookie(user));

        var pwd=Base64.decode(decodeURI(ipCookie(user+'-pwd')));

        $scope.account.password=retrievePwd(pwd);

      }catch(err){

        console.log(err.message);

      }

    }

    console.log(ipCookie());

    $scope.fillPwd=function(){

      if($scope.account.username==''||$scope.account.username==null){

        return false;

      }else{

        if(ipCookie($scope.account.username)!=null){

          try{

            var pwd=Base64.decode(decodeURI(ipCookie($scope.account.username+'-pwd')));

              $scope.account.password=retrievePwd(pwd);

            }catch(err){

              console.log(err.message);

            }

        }

      }

    }

    $scope.saveCount=function(ctrl){

      if(ctrl!=0){

        if($scope.isCookie){

          $scope.isCookie=false;

        }else{

          $scope.isCookie=true;

        }

      }

    }

  /*  $scope.context='/cloudui';

    $http({

        method: 'GET',

        url: $scope.context+'/api/customMade/queryCustomMade' + '?v=' + (new Date().getTime())

    }).success(function(data) {

      $scope.sysTitle='神州信息云管理平台';

      $scope.description='新一代企业混合云管理平台';

      if(data != undefined && data != ''){

        if(data.webTitle!=null&&data.webTitle!=''){

          $scope.sysTitle=data.webTitle;

        }

        if(data.description!=null&&data.description!=''){

          $scope.description=data.description;

        }

        if(data.logo != undefined && data.logo !=''){

            $scope.imageSrc = $scope.context+'/api/customMade/findLogo' + '?logoUrl=' + data.logo + '&v=' + (new Date().getTime());

          }

      }

    }).error(function(data, status, headers, config) {

        alert('Failure loading menu');

    });*/





  // 错误信息
  $scope.authMsg = '';

  $scope.login = function() {

    $scope.authMsg = '';

    if($scope.loginForm.$valid) {
      $http({
        method  : 'POST',
          url     : '/cloudui/ws/user/login',
          data    : 'username='+$scope.account.username+'&password='+md5($scope.account.password),  
          headers : { 'Content-Type': 'application/x-www-form-urlencoded' } 
      })
        .then(function(response) {
          // 通过返回数据，没通过返回错误信息
          if ( response.data=='false') {
            $scope.authMsg = '用户名或密码错误';
          }else{
            if($scope.isCookie){

                        if(ipCookie($scope.account.username)!=null){

                            ipCookie.remove($scope.account.username,{path: '/'});

                            ipCookie.remove($scope.account.username+'-pwd',{path: '/'});

                        }

                        if(ipCookie('copCurrentUid')!=null){

                            ipCookie.remove('copCurrentUid',{path: '/'});

                        }

                        var uid=encodeURI($scope.account.username);

                        var pwd=encodeURI(Base64.encode(mixPwd($scope.account.password)));

                        ipCookie('copCurrentUid',uid,{ expires: 7, expirationUnit:'days', path: '/'});

                        ipCookie($scope.account.username,uid,{ expires: 7, expirationUnit:'days', path: '/'});

                        ipCookie($scope.account.username+'-pwd',pwd,{ expires: 7, expirationUnit:'days', path: '/'});

                      }else{

                        if(ipCookie('copCurrentUid')!=null){

                            ipCookie.remove('copCurrentUid',{path: '/'});

                        }

                        if(ipCookie($scope.account.username)!=null){

                            ipCookie.remove($scope.account.username,{path: '/'});

                            ipCookie.remove($scope.account.username+'-pwd',{path: '/'});

                        }

                      }
            window.location='../../index.html'
          }
        }, function(x) {
          $scope.authMsg = '服务器请求错误';
        });
    }
    else {
      // 用户直接点击登录设置脏值
      $scope.loginForm.account_username.$dirty = true;
      $scope.loginForm.account_password.$dirty = true;
    }
  };

}]);


/* 注册 */

userControllers.controller('RegisterFormController', ['$scope', '$http',function($scope, $http) {
  $scope._val = "leifengshushu";
  // 绑定表单的所有数据
  $scope.account = {};
  // 错误信息
  $scope.authMsg = '';
    
  $scope.register = function() {
    $scope.authMsg = '';
    if($scope.registerForm.$valid) {
      $http({
        method  : 'POST',
          url     : '/cloudui/ws/user/signin',
          data    : 'username='+$scope.account.username+'&password='+$scope.account.password,   
          headers : { 'Content-Type': 'application/x-www-form-urlencoded' } 
      })
        .then(function(response) {
          // 通过返回数据，没通过返回错误信息
          if ( response.data.result) {
              window.location='login.html'
          }else{
            $scope.authMsg = response.data.message;
          }
        }, function(x) {
          $scope.authMsg = '服务器请求错误';
        });
    }
    else {
      // 用户直接点击注册设置脏值
      $scope.registerForm.account_username.$dirty = true;
      $scope.registerForm.account_password.$dirty = true;
      $scope.registerForm.account_password_confirm.$dirty = true;
      $scope.registerForm.account_agreed.$dirty = true;
      
    }
  };

}]);