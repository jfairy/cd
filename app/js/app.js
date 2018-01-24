// 定义初始模块
var appModule = angular.module('app', [
    'ngRoute',
    'ngAnimate',
    'ngStorage',
    'ngCookies',
    'pascalprecht.translate',
    'ui.bootstrap',
    'ui.router',
    'oc.lazyLoad',
    'cfp.loadingBar',
    'ngSanitize',
    'ngResource',
    'tmh.dynamicLocale',
    'ui.utils',
    'custom-directive',// 自定义指令
    'custom-server',// 自定义服务
    'cluster', // 资源池管理
    'blueprint', // 蓝图管理
    'blueprint-ins', // 蓝图实例管理,
    'blueprint-designer',// 蓝图设计器
    'component', // 组件管理
    'flow-designer', // 流程设计器
    'plugin', // 插件管理
    'script', // 脚本管理
    'workpiece-package', // 工件包管理
    'statistics', // 操作统计
    'limit', // 权限管理
    'custom', // 定制管理
    'label', // 标签管理
    'quartz',// 定时任务
    'operational'//操作审计
]);

//定义全局作用域
appModule.run(["$rootScope", "$state", "$stateParams",  '$window', '$templateCache','$location','$http','$cookieStore',function ($rootScope, $state, $stateParams, $window, $templateCache,$location,$http,$cookieStore) {

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$storage = $window.localStorage;
  $rootScope.sys='cd';
 
  
  $rootScope.app = {
    layout: {
      isShadow: false,
      isCollapsed: true,
      isDropdown:true
    },
    viewAnimation: 'ng-fadeInUp'
  };

  $rootScope.app.pageStyle=$cookieStore.get('pageStyle')||'style1';

   $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
	  
	   $rootScope.previousState_name = fromState.name;  
       $rootScope.previousState_params = fromParams; 
        $rootScope.curPath=$location.path();
        $rootScope.getTabClasses=function(param){
            if($rootScope.curPath.indexOf(param)==-1)
              {
                return '';
              }else{
                return 'active';
              }   
        }     
  });

   if($rootScope.sys=='cop'){
      $rootScope.isCollapsed = true;
   }else{
       $rootScope.isCollapsed=$cookieStore.get('isCollapsed');
   }
   
  
   
    
   $rootScope.setCollapsedCookie = function() {  
	   $cookieStore.put('isCollapsed',$rootScope.isCollapsed);
	   $rootScope.isCollapsed=$cookieStore.get('isCollapsed');
   }; 
   
  
   $rootScope.setCollapsed =function(){
	   $rootScope.isCollapsed = !$rootScope.isCollapsed;
	   $rootScope.setCollapsedCookie();
   } 

   $rootScope.changeStyle=function(style){
      if(style=='blue')
      {
          $rootScope.app.pageStyle='style2';
          $cookieStore.put('pageStyle','style2');
      }else if(style=='purple'){
          $rootScope.app.pageStyle='style1';
          $cookieStore.put('pageStyle','style1');
      }
   }

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
  
  // big logo

  $http.get('/cloudui/master/ws/logo/download?v='+(new Date().getTime()),{
    params:{
      size:"big"
    }
  }).
  success(function(data){
      if(data){
          $rootScope.app.logosrc_big ="/cloudui/master/ws/logo/download?size=big";
      }else{
          $rootScope.app.logosrc_big= 'app/images/dcits_logo.png';
      }
  })

  // small logo

  $http.get('/cloudui/master/ws/logo/download?v='+(new Date().getTime()),{
    params:{
        size:"small"
    }
  }).
  success(function(data){
      if(data){
          $rootScope.app.logosrc_small ="/cloudui/master/ws/logo/download?size=small";
      }else{
          $rootScope.app.logosrc_small= 'app/images/logo-new-single.png';
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
          $rootScope.app.logosrc_favicon= 'app/images/logo.ico';
      }
  })

  // 用户信息 
  $http.post('/cloudui/ws/user/userInfo').
  success(function(data){
      $rootScope.user = data;
      $rootScope.userImg='app/images/user.jpg'
  })
  
  // 注销用户
  $rootScope.loginout=function(){
      $http.get('/cloudui/ws/user/logout'+'?v='+(new Date().getTime()))
      .success(function(data){
           if(data=='true')
           {
             window.location='app/pages/login.html';
           }else
           {
             return false;
           }
      })
  }
  
  //用户手册
  /* $rootScope.userguide=function(){
    window.open="UserGuide/UserGuide_v1.5.html";
  }*/

  // 表单验证
  $rootScope.submitted = false;
  $rootScope.validateInput = function(form,name, type) {
      var input = form[name];
      return (input.$dirty || $rootScope.submitted) && input.$error[type];
  };
  
}]);


// 定义常量
appModule
  .constant('APP_COLORS', {
    'primary':                '#5d9cec',
    'success':                '#27c24c',
    'info':                   '#23b7e5',
    'warning':                '#ff902b',
    'danger':                 '#f05050',
    'inverse':                '#131e26',
    'green':                  '#37bc9b',
    'pink':                   '#f532e5',
    'purple':                 '#7266ba',
    'dark':                   '#3a3f51',
    'yellow':                 '#fad732',
    'gray-darker':            '#232735',
    'gray-dark':              '#3a3f51',
    'gray':                   '#dde6e9',
    'gray-light':             '#e4eaec',
    'gray-lighter':           '#edf1f2'
  })
  .constant('APP_MEDIAQUERY', {
    'desktopLG':             1200,
    'desktop':                992,
    'tablet':                 768,
    'mobile':                 480
  })
  .constant('APP_REQUIRES', {
    scripts: {
      'icons': [ 'vendor/fontawesome/css/font-awesome.min.css',
                 'vendor/simple-line-icons/css/simple-line-icons.css' ],
      'cd-icons': [ 'vendor/cd-font/css/style.css',
                 'vendor/cd-font/css/user.css'
      ],
      'modernizr': ['vendor/modernizr/modernizr.js'],
      'filestyle':['vendor/bootstrap-filestyle/src/bootstrap-filestyle.js'],
      'loaders.css':['vendor/loaders.css/loaders.css'],
      'spinkit': ['vendor/spinkit/css/spinkit.css'],
      'whirl':['vendor/whirl/dist/whirl.css'],
      'jquery':['vendor/highchart/jquery-1.11.1.min.js'],
      'highchart':['vendor/highchart/highcharts.js'],
      'highcharts-more':['vendor/highchart/highcharts-more.js'],
      'bootstrap-menu':['vendor/bootstrap-menu/bootstrap-submenu.min.css'
      ],
      'moment':['vendor/daterangepicker/moment.min.js'],
      'daterangepicker':[
          'vendor/daterangepicker/daterangepicker-bs3.css',
          'vendor/daterangepicker/daterangepicker.js'
      ],
      'timepicker':[
         'vendor/timepicker/timepicker.css',
         'vendor/timepicker/bootstrap-timepicker.min.js'
      ],
      'istevenMultiSelect':['vendor/isteven-multi-select/isteven-multi-select.css',
                            'vendor/isteven-multi-select/isteven-multi-select.js'],
      'parsley': ['vendor/parsleyjs/dist/parsley.min.js'],
      'codemirror':['vendor/codemirror/lib/codemirror.js',
                    'vendor/codemirror/lib/codemirror.css'],
      'codemirror-modes-web': ['vendor/codemirror/mode/javascript/javascript.js',
                                 'vendor/codemirror/mode/xml/xml.js',
                                 'vendor/codemirror/mode/htmlmixed/htmlmixed.js',
                                 'vendor/codemirror/mode/css/css.js'],
       'gojs': ['vendor/flow/go.js'],
       'jquery-ui': ['vendor/flow/jquery-ui.css'],
       'blueprintDesigner': ['vendor/gojs/goflow.css'], 
       'flowDesigner': [
         'vendor/flow/BPMN.css',
         'vendor/flow/DrawCommandHandler.js'
       ],
       'flowClasses1':['vendor/flow/BPMNClasses.js'],
       'flowClasses2':['vendor/flow/BPMNClasses2.js'],
       'codemirror':['vendor/codemirror/lib/codemirror.js',
                     'vendor/codemirror/lib/codemirror.css'],
 	   'codemirror-modes-web': ['vendor/codemirror/mode/javascript/javascript.js',
 	                             'vendor/codemirror/mode/xml/xml.js',
 	                             'vendor/codemirror/mode/htmlmixed/htmlmixed.js',
 	                             'vendor/codemirror/mode/css/css.js'],
 	    'slimscroll': ['vendor/slimScroll/jquery.slimscroll.min.js']
    },
    modules: [
      {
        name: 'ngDialog',                  
        files: ['vendor/ngDialog/js/ngDialog.min.js',
                'vendor/ngDialog/css/ngDialog.min.css',
                'vendor/ngDialog/css/ngDialog-theme-default.min.css'] 
      },
      {
          name: 'ui.codemirror',             
          files: ['vendor/angular-ui-codemirror/ui-codemirror.js']
      },
      {
       name: 'ui.codemirror',             
       files: ['vendor/angular-ui-codemirror/ui-codemirror.js']
      },
      {
       name: 'ui.bootstrap-slider',       
       files: [
         'vendor/slider/bootstrap-slider.min.js',
         'vendor/slider/bootstrap-slider.min.css',
         'vendor/slider/slider.js']
      },
      {
        name: 'localytics.directives',     
        files: ['vendor/chosen_v1.2.0/chosen.jquery.min.js',
                'vendor/chosen_v1.2.0/chosen.min.css',
                'vendor/angular-chosen-localytics/chosen.js']
      },
      {
        name: 'xeditable',                 
        files: ['vendor/angular-xeditable/dist/js/xeditable.js',
                'vendor/angular-xeditable/dist/css/xeditable.css']
      },
      {
        name: 'angularBootstrapNavTree',   
        files: ['vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
             'vendor/angular-bootstrap-nav-tree/dist/abn_tree.css'
        ]
      },
      {
          name: 'angularBootstrapNavTree2',   
          files: ['vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive2.js',
               'vendor/angular-bootstrap-nav-tree/dist/abn_tree2.css'
          ]
      },
      {
          name: 'angularBootstrapNavTree3',   
          files: ['vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive3.js',
               'vendor/angular-bootstrap-nav-tree/dist/abn_tree3.css'
          ]
      },
      {
        name: 'angularFileUpload',         
        files: ['vendor/angular-file-upload/angular-file-upload.js']
      }
    ]
  })
;

// 在路由切换时加载所需要资源
appModule.provider('RouteHelpers', ['APP_REQUIRES',function (appRequires) {

  this.basepath = function (uri) {
    return 'app/views/' + uri;
  };

  this.resolveFor = function () {
    var _args = arguments;
    return {
      deps: ['$ocLazyLoad','$q', function ($ocLL, $q) {
       
        var promise = $q.when(1);  

        for(var i=0, len=_args.length; i < len; i ++){
          promise = andThen(_args[i]);
        }
        return promise;

        
        function andThen(_arg) {
          
          if(typeof _arg == 'function')
              return promise.then(_arg);
          else
              return promise.then(function() {
                
                var whatToLoad = getRequired(_arg);
               
                if(!whatToLoad) return $.error('Route resolve: Bad resource name [' + _arg + ']');
                 
                return $ocLL.load( whatToLoad );
              });
        }
       
        function getRequired(name) {
          if (appRequires.modules)
              for(var m in appRequires.modules)
                  if(appRequires.modules[m].name && appRequires.modules[m].name === name)
                      return appRequires.modules[m];
          return appRequires.scripts && appRequires.scripts[name];
        }

      }]};
  }; // resolveFor

   
  this.$get = function(){
    return {
      basepath: this.basepath
    }
  };

}]);

//公用页面
appModule.controller('commonCtrl',
  ['$rootScope', '$scope', '$state', '$window', '$timeout', 'cfpLoadingBar','$location',
  function($rootScope, $scope, $state, $window, $timeout, cfpLoadingBar,$location) {
 
    var thBar;
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        if($('.wrapper > section').length)  
          thBar = $timeout(function() {
            cfpLoadingBar.start();
          }, 0);  
    });
     

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        event.targetScope.$watch("$viewContentLoaded", function () {
          $timeout.cancel(thBar);
          cfpLoadingBar.complete();
        });
    });

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
   
        $rootScope.currTitle = $state.current.title;
        $rootScope.pageTitle();
    
    });

    $rootScope.currTitle = $state.current.title;

    $rootScope.pageTitle = function() {
      var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
      document.title = title;
      return title;
    };  

}]);

// 编辑器
appModule.controller('FormxEditableController', ['$scope', 'editableOptions', 'editableThemes',
  function($scope, editableOptions, editableThemes) {

  editableOptions.theme = 'bs3';
  
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableThemes.bs3.submitTpl = '<button type="submit" class="btn btn-success" ng-click="save();editlabel($data);"><span class="fa fa-check"></span></button>';
  editableThemes.bs3.cancelTpl = '<button type="button" class="btn btn-default" ng-click="$form.$cancel()">'+
                                   '<span class="fa fa-times text-muted"></span>'+
                                 '</button>';    
  }]);


appModule.service('Utils', ["$window", "APP_MEDIAQUERY", function($window, APP_MEDIAQUERY) {
    'use strict';
    
    var $html = angular.element("html"),
        $win  = angular.element($window),
        $body = angular.element('body');

    return {
      // DETECTION
      support: {
        transition: (function() {
                var transitionEnd = (function() {

                    var element = document.body || document.documentElement,
                        transEndEventNames = {
                            WebkitTransition: 'webkitTransitionEnd',
                            MozTransition: 'transitionend',
                            OTransition: 'oTransitionEnd otransitionend',
                            transition: 'transitionend'
                        }, name;

                    for (name in transEndEventNames) {
                        if (element.style[name] !== undefined) return transEndEventNames[name];
                    }
                }());

                return transitionEnd && { end: transitionEnd };
            })(),
        animation: (function() {

            var animationEnd = (function() {

                var element = document.body || document.documentElement,
                    animEndEventNames = {
                        WebkitAnimation: 'webkitAnimationEnd',
                        MozAnimation: 'animationend',
                        OAnimation: 'oAnimationEnd oanimationend',
                        animation: 'animationend'
                    }, name;

                for (name in animEndEventNames) {
                    if (element.style[name] !== undefined) return animEndEventNames[name];
                }
            }());

            return animationEnd && { end: animationEnd };
        })(),
        requestAnimationFrame: window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame ||
                               window.msRequestAnimationFrame ||
                               window.oRequestAnimationFrame ||
                               function(callback){ window.setTimeout(callback, 1000/60); },
        touch: (
            ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
            (window.DocumentTouch && document instanceof window.DocumentTouch)  ||
            (window.navigator['msPointerEnabled'] && window.navigator['msMaxTouchPoints'] > 0) || //IE 10
            (window.navigator['pointerEnabled'] && window.navigator['maxTouchPoints'] > 0) || //IE >=11
            false
        ),
        mutationobserver: (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null)
      },
      // UTILITIES
      isInView: function(element, options) {

          var $element = $(element);

          if (!$element.is(':visible')) {
              return false;
          }

          var window_left = $win.scrollLeft(),
              window_top  = $win.scrollTop(),
              offset      = $element.offset(),
              left        = offset.left,
              top         = offset.top;

          options = $.extend({topoffset:0, leftoffset:0}, options);

          if (top + $element.height() >= window_top && top - options.topoffset <= window_top + $win.height() &&
              left + $element.width() >= window_left && left - options.leftoffset <= window_left + $win.width()) {
            return true;
          } else {
            return false;
          }
      },
      langdirection: $html.attr("dir") == "rtl" ? "right" : "left",
      isTouch: function () {
        return $html.hasClass('touch');
      },
      isSidebarCollapsed: function () {
        return $body.hasClass('aside-collapsed');
      },
      isSidebarToggled: function () {
        return $body.hasClass('aside-toggled');
      },
      isMobile: function () {
        return $win.width() < APP_MEDIAQUERY.tablet;
      }
    };
}]);

