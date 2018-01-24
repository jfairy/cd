var serverMoudle=angular.module('custom-server',[]);

/* -----------------------------------------弹出信息框------------------------------------- */
serverMoudle.service('Notify', ["$timeout", function($timeout){
    this.alert = alert;

    function alert(msg, opts) {
        if ( msg ) {
            $timeout(function(){
            
                $.notify(msg, opts || {});
            });
        }
    }

}]);

/* -----------------------------------------信息弹窗------------------------------------- */ 
(function($, window, document){

    var containers = {},
        messages   = {},

        notify     =  function(options){

            if ($.type(options) == 'string') {
                options = { message: options };
            }

            if (arguments[1]) {
                options = $.extend(options, $.type(arguments[1]) == 'string' ? {status:arguments[1]} : arguments[1]);
            }

            return (new Message(options)).show();
        },
        closeAll  = function(group, instantly){
            if(group) {
                for(var id in messages) { if(group===messages[id].group) messages[id].close(instantly); }
            } else {
                for(var id in messages) { messages[id].close(instantly); }
            }
        };

    var Message = function(options){

        var $this = this;

        this.options = $.extend({}, Message.defaults, options);

        this.uuid    = "ID"+(new Date().getTime())+"RAND"+(Math.ceil(Math.random() * 100000));
        this.element = $([
            // @geedmo: alert-dismissable enables bs close icon
            '<div class="uk-notify-message alert-dismissable">',
                '<a class="close">&times;</a>',
                '<div>'+this.options.message+'</div>',
            '</div>'

        ].join('')).data("notifyMessage", this);

        // status
        if (this.options.status) {
            this.element.addClass('alert alert-'+this.options.status);
            this.currentstatus = this.options.status;
        }

        this.group = this.options.group;

        messages[this.uuid] = this;

        if(!containers[this.options.pos]) {
            containers[this.options.pos] = $('<div class="uk-notify uk-notify-'+this.options.pos+'"></div>').appendTo('body').on("click", ".uk-notify-message", function(){
                $(this).data("notifyMessage").close();
            });
        }
    };


    $.extend(Message.prototype, {

        uuid: false,
        element: false,
        timout: false,
        currentstatus: "",
        group: false,

        show: function() {

            if (this.element.is(":visible")) return;

            var $this = this;

            containers[this.options.pos].show().prepend(this.element);

            var marginbottom = parseInt(this.element.css("margin-bottom"), 10);

            this.element.css({"opacity":0, "margin-top": -1*this.element.outerHeight(), "margin-bottom":0}).animate({"opacity":1, "margin-top": 0, "margin-bottom":marginbottom}, function(){

                if ($this.options.timeout) {

                    var closefn = function(){ $this.close(); };

                    $this.timeout = setTimeout(closefn, $this.options.timeout);

                    $this.element.hover(
                        function() { clearTimeout($this.timeout); },
                        function() { $this.timeout = setTimeout(closefn, $this.options.timeout);  }
                    );
                }

            });

            return this;
        },

        close: function(instantly) {

            var $this    = this,
                finalize = function(){
                    $this.element.remove();

                    if(!containers[$this.options.pos].children().length) {
                        containers[$this.options.pos].hide();
                    }

                    delete messages[$this.uuid];
                };

            if(this.timeout) clearTimeout(this.timeout);

            if(instantly) {
                finalize();
            } else {
                this.element.animate({"opacity":0, "margin-top": -1* this.element.outerHeight(), "margin-bottom":0}, function(){
                    finalize();
                });
            }
        },

        content: function(html){

            var container = this.element.find(">div");

            if(!html) {
                return container.html();
            }

            container.html(html);

            return this;
        },

        status: function(status) {

            if(!status) {
                return this.currentstatus;
            }

            this.element.removeClass('alert alert-'+this.currentstatus).addClass('alert alert-'+status);

            this.currentstatus = status;

            return this;
        }
    });

    Message.defaults = {
        message: "",
        status: "normal",
        timeout: 3000,
        group: null,
        pos: 'top-center'
    };


    $["notify"]          = notify;
    $["notify"].message  = Message;
    $["notify"].closeAll = closeAll;

    return notify;

}(jQuery, window, document));


/* -----------------------------------------错误请求处理------------------------------------- */ 
serverMoudle.factory('httpInterceptor',['$q','$injector',function($q,$injector){
  var httpInterceptor ={
    'response':function(response){  
        return response;
     }, 
    'responseError':function(response){
       
        if (response.status == 401) { 
              var rootScope = $injector.get('$rootScope'); 
              var state = $injector.get('$rootScope').$state.current.name; 
              rootScope.stateBeforLogin = state; 
            
              window.location.href="/cloudui/app/pages/login.html";
              return $q.reject(response); 
            } else if (response.status === 404) { 
              
              alert("404!,"+response.data.path); 
              return $q.reject(response); 
            } else {
              
                alert(response.status+'!,'+response.data.path); 
            }
       return response;
    }
  }
  return httpInterceptor;
}])

serverMoudle.config(function($httpProvider){
 $httpProvider.interceptors.push('httpInterceptor');
})

/* -----------------------------------------右侧边栏滑进滑出------------------------------------- */ 
serverMoudle.service('toggleStateService', ['$rootScope', function($rootScope) {

  var storageKeyName  = 'toggleState';

  // Helper object to check for words in a phrase //
  var WordChecker = {
    hasWord: function (phrase, word) {
      return new RegExp('(^|\\s)' + word + '(\\s|$)').test(phrase);
    },
    addWord: function (phrase, word) {
      if (!this.hasWord(phrase, word)) {
        return (phrase + (phrase ? ' ' : '') + word);
      }
    },
    removeWord: function (phrase, word) {
      if (this.hasWord(phrase, word)) {
        return phrase.replace(new RegExp('(^|\\s)*' + word + '(\\s|$)*', 'g'), '');
      }
    }
  };

  // Return service public methods
  return {
    // Add a state to the browser storage to be restored later
    addState: function(classname){
      var data = angular.fromJson($rootScope.$storage[storageKeyName]);
      
      if(!data)  {
        data = classname;
      }
      else {
        data = WordChecker.addWord(data, classname);
      }

      $rootScope.$storage[storageKeyName] = angular.toJson(data);
    },

    // Remove a state from the browser storage
    removeState: function(classname){
      var data = $rootScope.$storage[storageKeyName];
      // nothing to remove
      if(!data) return;

      data = WordChecker.removeWord(data, classname);

      $rootScope.$storage[storageKeyName] = angular.toJson(data);
    },
    
    // Load the state string and restore the classlist
    restoreState: function($elem) {
      var data = angular.fromJson($rootScope.$storage[storageKeyName]);
      
      // nothing to restore
      if(!data) return;
      $elem.addClass(data);
    }

  };

}]);



//图片设置
serverMoudle.factory('setPic',function(){
  
  var picarr=[
        {
          key:'CMD',
          value:'cmd.png'
        },
        {
          key:'CMD4Analysis',
          value:'cmd4analysis.png'
        },
        {
          key:'CMD4Local',
          value:'cmd4local.png'
        },
        {
          key:'CMD4Script',
          value:'cmd4script.png'
        },
        {
          key:'CMD4Script',
          value:'CMD4ScriptAndAnalysis.png'
        },
        {
          key:'DetectPort',
          value:'detectport.png'
        },
        {
          key:'DownloadArtifact',
          value:'downloadartifact.png'
        },
        {
          key:'DownloadComp',
          value:'downloadcomp.png'
        },
        {
          key:'DownloadSaltArtifact',
          value:'downloadsaltartifact.png'
        },
        {
          key:'DownloadSaltComp',
          value:'downloadsaltcomp.png'
        },
        {
          key:'download',
          value:'download.png'
        },
        {
          key:'GetCompCurrentVersion',
          value:'getcompcurrentversion.png'
        },
        {
          key:'GetCompTargetVersion',
          value:'getcomptargetversion.png'
        }, 
        {
          key:'InstallNode',
          value:'installnode.png'
        }, 
        {
          key:'JudgeEmpty',
          value:'judgeempty.png'
        },
        {
          key:'LoopCount',
          value:'loopcount.png'
        },
        {
          key:'SaltConfig',
          value:'saltconfig.png'
        }, 
        {
          key:'SaltSSH',
          value:'saltssh.png'
        },
        {
          key:'salt',
          value:'salt.png'
        },
        {
          key:'Snapshot',
          value:'snapshot.png'
        },
        {
          key:'SqlServer',
          value:'sqlserver.png'
        },
        {
          key:'SqlServer',
          value:'sqlserver.png'
        },
        {
          key:'Sql',
          value:'sql.png'
        },
        {
          key:'config',
          value:'config.png'
        },
        {
          key:'unzip',
          value:'unzip.png'
        },
        {
          key:'destroy',
          value:'destroy.png'
        },
        {
          key:'tomcat',
          value:'tomcat.png'
        },
        {
          key:'apache',
          value:'apache.png'
        },
        {
          key:'weblogic',
          value:'weblogic.png'
        },
        {
          key:'docker',
          value:'docker.png'
        },
        {
          key:'nginx',
          value:'nginx.png'
        },
        {
          key:'mongo',
          value:'mongodb.png'
        },
        {
          key:'php',
          value:'php.png'
        },
        {
          key:'war',
          value:'war.png'
        },
        {
          key:'redis',
          value:'redis.png'
        },
        {
          key:'oracle',
          value:'oracle.png'
        },
        {
          key:'mysql',
          value:'mysql.png'
        },
        {
          key:'storm',
          value:'storm.png'
        },
        {
          key:'jdk',
          value:'jdk.png'
        },
        {
          key:'jboss',
          value:'jboss.png'
        },
        {
          key:'database',
          value:'database.png'
        },
        {
          key:'zookeeper',
          value:'zookeeper.png'
        },
        {
          key:'静态资源池',
          value:'static.png'
        },
        {
          key:'动态资源池',
          value:'dynamic.png'
        },
        {
          key:'云资源池',
          value:'cloud.png'
        },
        {
          key:'ssh',
          value:'SSH.png'
        },
        {
          key:'http',
          value:'http.png'
        }, 
        {
          key:'user',
          value:'user.png'
        },
        {
          key:'wordpress',
          value:'wordpress.png'
        },
        {
          key:'nfs',
          value:'nfs.png'
        },
        {
          key:'node',
          value:'node.png'
        },
        {
          key:'node',
          value:'node.png'
        },
        {
          key:'quartz',
          value:'quartz.png'
        }
    ];
 return {
     setPicFn: function(text){ 
      
          var pic='';
         
          var textCur=angular.lowercase(text);
        
          for(var j=0;j<picarr.length;j++)
          {
            var keyCur=angular.lowercase(picarr[j].key);
            if(textCur==keyCur){
                var pic=picarr[j].value;
            }else if(textCur.indexOf(keyCur)!==-1)
            { 
              var pic=picarr[j].value;
            }
          }
       
          if(!pic){
          pic="component.png" 
          }
          
         return pic;
     } 
 }
})

/* -----------------------------------------读取文件------------------------------------- */ 

serverMoudle.service('fileReader', function ($q) {

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