var blueprintModule=angular.module('blueprint',[]);
/* ------------------------------------蓝图管理------------------------------------ */
blueprintModule.controller('blueprintManageCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$cookieStore','$filter','$state',function($rootScope,$scope,$http,ngDialog,Notify,$cookieStore,$filter,$state){
 

  $scope.blueprintPages=[
     "app.blueprint_manage",
     "app.blueprint_edit",
     "app.blueprint_flow_create",
     "app.blueprint_flow_manage",
     "app.blueprint_flow_update",
     "app.blueprint_ins_add",
     "app.blueprint_view" 
  ]

  $scope.pageSize=10;

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    var isClear=$filter('filter')($scope.blueprintPages,toState.name).length>0?false:true;
    if(isClear){
      $scope.clearCookie(); 
    }
  });

  // 搜索类型
  $scope.searchTypeList=[
    {text:'按蓝图名称搜索',value:'blueprint'},
    {text:'按组件名称搜索',value:'app'}
  ];

  $scope.templateName='';

  $scope.appName='';

  $scope.searchType=$cookieStore.get('blueprintSearchType')?$cookieStore.get('blueprintSearchType'):"blueprint";

  $scope.searchval=$cookieStore.get('blueprintSearch')?$cookieStore.get('blueprintSearch'):'';

  if($cookieStore.get('blueprintPageNum')){
     $scope.listDataPromise=$http.get('/cloudui/master/ws/blueprintTemplate/listBlueprintTemplateByNameAndApp'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:1,
            pageSize:$scope.pageSize,
            templateName:$scope.templateName,
            appName:$scope.appName
          }
     }).then(function(res){
        
         $scope.totalPageNum=res.data.totalPageNum;
         
         if($cookieStore.get('blueprintPageNum')<=$scope.totalPageNum){
            $scope.pageNum=$cookieStore.get('blueprintPageNum');
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
    $cookieStore.put('blueprintPageNum',$scope.pageNum);
    $cookieStore.put('blueprintSearchType',$scope.searchType);
    $cookieStore.put('blueprintSearch',$scope.searchval);
	}
	
	$scope.clearCookie=function(){
		$cookieStore.remove("blueprintPageNum");
    $cookieStore.remove("blueprintSearchType");
    $cookieStore.remove("blueprintSearch");
	}

   $scope.$watch('searchType',function(newval,oldval){
      if(newval&&(newval!==oldval)){
         $scope.search();
      }else if(newval&&(newval==oldval)){
        $scope.searchValFn();
      } 
  })
   
	// 蓝图列表
	

    $scope.onPageChange = function ()
    {   
      $http.get('/cloudui/master/ws/blueprintTemplate/listBlueprintTemplateByNameAndApp'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.pageNum,
            pageSize:$scope.pageSize,
            templateName:$scope.templateName,
			      appName:$scope.appName
          }
     }).success(function(data){
     	$scope.listoff=data.rows.length>0?true:false;
        $scope.warninginfo='暂无数据';
        $scope.blueprintList = data.rows;
        
        $scope.pageCount=Math.ceil(data.total/$scope.pageSize);
        if($scope.pageCount==0){
          $scope.pageCount=1;
        }
     }).error(function(){
         $scope.listoff=false;
         $scope.warninginfo='暂无结果';
     })
    }
    // 搜索蓝图

    $scope.searchValFn=function(){
        if($scope.searchType=='app'){ // 按组件搜索
           $scope.templateName='';
           $scope.appName=$scope.searchval;
        }else if($scope.searchType=='blueprint'){ // 按蓝图搜索
           $scope.templateName=$scope.searchval;
           $scope.appName='';
        }
    }

    $scope.search=function()
    { 
       $scope.searchValFn();
    	 $scope.pageNum=1;
    	 $scope.setCookie();
       $scope.onPageChange(); 
    
    } 
    // 删除蓝图
    $scope.delBlueprint=function(params,index){
      ngDialog.openConfirm({
            template:
                 '<p class="modal-header">您确定要删除此蓝图模板吗?</p>' +
                 '<div class="modal-body text-right">' +
                   '<button type="button" class="btn btn-default mr20" ng-click="closeThisDialog(0)">取消' +
                   '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
                 '</button></div>',
           plain: true,
           className: 'ngdialog-theme-default'
      }) .then(
         function(){
          $rootScope.app.layout.isShadow=true;
          $scope.setCookie();
          $http({
              method:'post',
              url:'/cloudui/ws/blueprintTemplate/delBlueprintTemplate',
              data: $.param({
            	  blueprintId:params
              }), 
              headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
           }).success(function(data){
              $rootScope.app.layout.isShadow=false;
              if(data.result)
              {
                Notify.alert(
                     '<em class="fa fa-check"></em> '+data.message ,
                     {status: 'success'}
                 ); 
                $state.go('app.blueprint_manage',{},{reload:true});
              }else
              {
                 Notify.alert(
                     '<em class="fa fa-times"></em> '+data.message ,
                     {status: 'danger'}
                  ); 
               }
          })    
      })
    }
    
    // 导入蓝图
    $scope.importBlueprint=function(){
        ngDialog.open({
          template: 'app/views/dialog/blueprint-import.html'+'?action='+(new Date().getTime()),
          className: 'ngdialog-theme-default',
          scope: $scope,
          closeByDocument:false,
          cache:false,
          controller:'importBlueprintCtrl'
        });
    }
    
    // 导出蓝图
    $scope.exportBlueprint=function(){
        ngDialog.open({
          template: 'app/views/dialog/blueprint-export.html'+'?action='+(new Date().getTime()),
          className: 'ngdialog-theme-default',
          scope: $scope,
          closeByDocument:false,
          cache:false,
          controller:'exportBlueprintCtrl'
        });
    }

    // cop
     //发布蓝图:cj add
  $scope.printBlueprint=function(bluePrintId,bluePrintName,index){
    
    $http.get('/cloudui/ws/blueprint/getBlueprintTemplate'+'?v='+(new Date().getTime()),{
        params:{
          bpName:bluePrintName
        }
    })
    .success(function(data){
      var blueprintInfo=angular.toJson(angular.fromJson(data.INFO),true); 
      //先创建myDiagram
      var myThumbDiagrm = initMyThumbDiagram(blueprintInfo);
      var thumbDataBase64=myThumbDiagrm.makeImageData({
          scale: 1,
          background: "White",
          type: "image/jpeg",
          //size: new go.Size(800,800)
        });
      var paramsObject = {
          thumb:thumbDataBase64
      };
      $http({
        method:"post",
        url:"/backend/api/middleware/setBlueprintThumb/"+bluePrintId,
        data:paramsObject
      }).success(function(data){
        console.log(data);

        window.location.href="/backend/index.html#/CtrlMiddleWare?blueprintName="+bluePrintId;
      });
    });
  } // end publish bluePrint to cop
  
  //发布蓝图前初始化myDiagram:cj add
    function initMyThumbDiagram(blueprintInfo) {
     
      var $ = go.GraphObject.make; 
      
      // 图表
      var myDiagram =
      $(go.Diagram, "myThumbDiagramDiv",   
        {
        // 网格线样式设置
          /*grid: $(go.Panel, "Grid",
              { gridCellSize: new go.Size(20, 20) },
                  $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                  $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
                  $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
                  $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
          ),*/
          scale:0.9,// 缩放
          allowDrop: true,  // 是否可以进行拖拽操作 
          mouseDrop: function(e) { finishDrop(e, null); },// 鼠标拖放结束事件
          "LinkDrawn": function(e){newLinkDrawn(e)}, // 画线 
          "LinkRelinked":function(e){LinkRelinkedCheck(e)},// 修改线
          initialContentAlignment: go.Spot.Center,
          "undoManager.isEnabled": true
        }
      );
     
      // 鼠标拖放结束执行的函数
      function finishDrop(e, grp) {
        
        // 组件名称唯一
        
        if(!e.ij){
          
            var selectionData=e.diagram.selection.Da.key.data;
            
            if(selectionData.eleType=='component'){
              
              var curDragDiagram=e.diagram;
              
                var nodeDataArray=curDragDiagram.model.nodeDataArray;
                
                var curNode=selectionData.text;
             
                for(var i=0;i<nodeDataArray.length;i++)
                {
                  if(nodeDataArray[i].text==curNode){
                         var text=curNode+nodeDataArray[i].key;
                         curDragDiagram.startTransaction('finishDrop');    
                         curDragDiagram.model.setDataProperty(nodeDataArray[i],'text',text);
                         curDragDiagram.commitTransaction('finishDrop');
                  }
                }
            }
          }
        
          var ok = (grp !== null
            ? grp.addMembers(grp.diagram.selection, true)
            : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
          if (!ok){
            e.diagram.currentTool.doCancel();
            return;
          };
   
     }

   // 重画线的重复检测
   function LinkRelinkedCheck(e) {
     newLinkDrawn(e,true);
   }
    
   // 画线检测
   function newLinkDrawn (e,fromRelink) {
        var fromNode = myDiagram.findNodeForKey(e.subject.data.from);
        var toNode = myDiagram.findNodeForKey(e.subject.data.to);
        var linkCount = fromNode.findLinksBetween(toNode).count;
      
        // 不能重复连线
        if(linkCount > 1){
          myDiagram.rollbackTransaction();
          alert('不要重复连接');
          return false;
       }
   }
     
   // 监听图表修改
     myDiagram.addDiagramListener("Modified", function(e) {
        // 如果图表修改，启用保存按钮，且文档标题加'*';如果图表没修改，禁用保存按钮，文档标题去掉'*'
        var button = document.getElementById("save");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
          if (idx < 0) document.title += "*";
        } else {
          if (idx >= 0) document.title = document.title.substr(0, idx);
        }
     });
   
     // 接口节点样式设置
   function showPorts(node, show) {
      
        var diagram = node.diagram;

        if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
        if(!show){
          node.ports.each(function(port){
            port.stroke = (port.stroke == "red" ? "red" : (port.stroke == "green"? "green" : null));
          });
        }else{
          node.ports.each(function(port) {
            port.stroke = (port.stroke == "red" ? "red" : (port.stroke == "green"? "green" : "#B5C2D6"));
          });
        }
  }

  // 移入组高亮，移出取消组高亮
  function highlightGroup(e, grp, show) {
        if (!grp) return;
        e.handled = true;
        if (show) {
          
          var tool = grp.diagram.toolManager.draggingTool;
          var map = tool.draggedParts || tool.copiedParts;   
           
          if (grp.canAddMembers(map.toKeySet())) {
            grp.isHighlighted = true;
            return;
          }
        }
        grp.isHighlighted = false;
    }
    
  // 接口节点模型设置
    function makePort(name, spot, output, input) {
      return $(go.Shape, "Circle",
         {
          fill: "transparent",   
          stroke: null,
          desiredSize: new go.Size(12, 12),
          alignment: spot,  
          alignmentFocus: spot,
          portId: name,   
          fromSpot: spot, toSpot: spot,   
          fromLinkable: output, toLinkable: input,   
          cursor: "pointer"  
        }
      );
   }
   
   // 节点样式设置
   function isDelFn() {
      return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      {
        locationSpot: go.Spot.Center,
        mouseEnter: function (e, obj) { showPorts(obj.part, true); },
        mouseLeave: function (e, obj) { showPorts(obj.part, false); },
        deletable:true
      }];
  }

  // 组节点模板
  myDiagram.groupTemplateMap.add("OfNodes",
    $(go.Group, "Spot",isDelFn(),
        {
            background: "transparent",
            layoutConditions:go.Part.LayoutNodeSized,
            mouseDragEnter: function(e, grp, prev) {highlightGroup(e, grp, true); },
            mouseDragLeave: function(e, grp, next) {highlightGroup(e, grp, false); },
            doubleClick:function(e, node) {toEditView(e,node,myDiagram)},
            computesBoundsAfterDrag: true,
            mouseDrop: finishDrop,
            handlesDragDropForMembers: true
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        $(go.Panel,go.Panel.Auto,
              $(go.Shape, "Rectangle",
                 { 
                 fill: null, 
                 stroke: "#5fa2cd", 
                 strokeWidth: 2,
                 minSize: new go.Size(200, 80)
                 },
                 new go.Binding("stroke", "color")
              ),
              $(go.Panel, "Vertical",  
                  $(go.Panel, "Auto",   
                     { 
                     stretch: go.GraphObject.Horizontal, 
                     background: "#5fa2cd",
                     minSize: new go.Size(200, 80) 
                     },
                     new go.Binding("background", "color"), 
                     $(go.Panel,"Horizontal",
                          {alignment: go.Spot.Left},
                          $(go.Picture,
                              {desiredSize: new go.Size(60, 60),
                              margin: new go.Margin(0, 0, 0, 10)},
                              new go.Binding("source")
                           ),
                           $(go.Panel,"Table",
                               {
                                  maxSize: new go.Size(150, 999),
                                  margin: new go.Margin(-6, 10, 0, 3),
                                  defaultAlignment: go.Spot.Left
                               },
                               $(go.RowColumnDefinition, { column: 2, width: 4 }),
                               $(go.TextBlock,   // the name
                                    {
                                      row: 0, column: 0, columnSpan: 5,
                                      font: "12pt Segoe UI,sans-serif",
                                      editable: false, isMultiline: false,
                                      minSize: new go.Size(10, 16),
                                      margin: new go.Margin(0, 0, 2, 0),
                                      stroke: "#fff"
                                    },
                                    new go.Binding("text", "nodeName").makeTwoWay()
                                ),
                                $(go.TextBlock, 
                                  {
                                    row: 1, column: 1, columnSpan: 5,
                                    editable: false, isMultiline: false,
                                    stroke: "#fff",
                                    margin: new go.Margin(2, 0, 0, 0)
                                  },
                                    new go.Binding("text", "des").makeTwoWay()
                                )
                              )
                            ),
                            $(go.TextBlock,{alignment: go.Spot.TopRight,margin: 5,font: "bold 12pt  Segoe UI,sans-serif",stroke: "#fff"},new go.Binding("text","ins"))
                          ),  // end Horizontal Panel
                         $(go.Placeholder,{ padding: 15})
                     ) 
            ),
            makePort("T", go.Spot.Top, true, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, true)
        )
   );

   // 原子节点模板
   myDiagram.nodeTemplateMap.add("",
        $(go.Node, "Spot", isDelFn(),
              {
                layoutConditions:go.Part.LayoutNone,
                doubleClick: function(e, node) {toEditView(e,node,myDiagram)},
                locationSpot: go.Spot.Center 
              },
            $(go.Panel,go.Panel.Auto,
                $(go.Shape, "Rectangle",
                   { 
                   fill: null, 
                   stroke: '#878788',
                   minSize: new go.Size(200, 80)},
                   new go.Binding("fill", "color")
                 ),
                 $(go.Panel,"Horizontal",
                      {alignment: go.Spot.Left},
                      $(go.Picture,
                        {
                          desiredSize: new go.Size(60, 60),
                          margin: new go.Margin(0, 0, 0, 10)},
                          new go.Binding("source")
                      ),
                      $(go.Panel,"Table",
                           {
                              maxSize: new go.Size(150, 999),
                              margin: new go.Margin(-6, 10, 0, 3),
                              defaultAlignment: go.Spot.Left
                           },
                           $(go.RowColumnDefinition, { column: 2, width: 4 }),
                           $(go.TextBlock,   // the name
                               {
                                   row: 0, column: 0, columnSpan: 5,
                                   font: "12pt Segoe UI,sans-serif",
                                   editable: true, isMultiline: false,
                                   minSize: new go.Size(10, 16)
                               },
                                new go.Binding("text", "nodeName").makeTwoWay()
                           ),
                           $(go.TextBlock, 
                              {
                               row: 1, column: 1, columnSpan: 5,
                               editable: true, isMultiline: false,
                               margin: new go.Margin(2, 0, 0, 0)
                              },
                             new go.Binding("text", "des").makeTwoWay()
                           )
                      )
                 ),
                 $(go.TextBlock,{alignment: go.Spot.TopRight,margin: 5,font: "bold 12pt  Segoe UI,sans-serif",stroke: "#13910d"},new go.Binding("text","ins"))
          ),
          makePort("T", go.Spot.Top, true, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, true)
     )
  )
   
  // 线模型
  myDiagram.linkTemplate =$(go.Link,
    {
          layoutConditions:go.Part.LayoutNone,
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 0,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
          mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
      },
      $(go.Shape,
         { 
          isPanelMain: true, 
            strokeWidth: 8, 
            stroke: "transparent", 
            name: "HIGHLIGHT" 
           }
      ),
      $(go.Shape,
         {
            isPanelMain: true, 
            stroke: "gray", 
            strokeWidth: 2
         },
         new go.Binding("stroke", "linkColor")
      ),
      $(go.Shape,
         { 
           toArrow: "standard", 
           stroke: "gray",
           strokeWidth: 4,
           "fill":"gray"
          },
        new go.Binding("toArrow","toArrowFigure").makeTwoWay(),
        new go.Binding("stroke","toArrowStroke").makeTwoWay(),
        new go.Binding("fill","stroke",function(s){return s}).ofObject()
     )
    );
   
  myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
  myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

  myDiagram.model = go.Model.fromJson(blueprintInfo);
  var pos = myDiagram.model.modelData.position;
  if (pos) myDiagram.initialPosition = go.Point.parse(pos);
 
    return myDiagram;
  }  // end init cj add
}])


/* ------------------------------------导入蓝图------------------------------------ */
blueprintModule.controller('importBlueprintCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$state','$filter',function($rootScope,$scope,$http,ngDialog,Notify,$state,$filter){

	$rootScope.submitted = false;
	
    $scope.importFn=function(){
       
       $rootScope.submitted = true;
       
       var url='/cloudui/ws/blueprintTemplate/importBlueprint';
       
       var fd = new FormData();
       
       var file = document.querySelector('input[type=file]').files[0];
       
       if(angular.isUndefined(file)){
	       Notify.alert(
               '<em class="fa fa-times"></em>'+"请选择文件！" ,
               {status: 'danger'}
           );
	      return;
       }
       $rootScope.app.layout.isShadow=true;
       fd.append("file",file);
       
       $http.post(url, fd, {
           transformRequest: angular.identity,
           headers: {'Content-Type': undefined}
       }).success(function(data){
           
    	   $rootScope.app.layout.isShadow=false;
    	   
		   if(data.result)
	       {
	    	   Notify.alert(
	               '<em class="fa fa-check"></em>'+data.message ,
	               {status: 'success'}
	           );
	    	   ngDialog.close(); 
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
	

/* ------------------------------------导出蓝图------------------------------------ */
blueprintModule.controller('exportBlueprintCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$state','$filter',function($rootScope,$scope,$http,ngDialog,Notify,$state,$filter){
	
  $scope.checkData=[];
	$scope.checkappId=[]; // 选中的蓝图
  
	
	$scope.exportPageSize=5;
  $scope.exportPageNum=1;
	// 蓝图列表
    $scope.onExportPageChange = function ()
    {   
      $http.get('/cloudui/ws/blueprintTemplate/listBlueprintTemplates'+'?v=' + (new Date().getTime()),{
      params:
          {
            pageNum:$scope.exportPageNum,
            pageSize:$scope.exportPageSize,
            blueprintName:$scope.exportSearchval
          }
     }).success(function(data){

    	angular.forEach(data.rows,function(val,key){
    		 var ischecked=$filter('filter')($scope.checkappId,val.ID).length>0?true:false;
    		 data.rows[key].ischecked=ischecked;
         data.rows[key].packageArr=[];
    	})
    	 
     	$scope.exportListoff=data.rows.length>0?true:false;
        $scope.exportWarninginfo='暂无数据';
        $scope.exportBlueprintList = data.rows;
        
        $scope.exportPageCount=Math.ceil(data.total/$scope.exportPageSize);
        if($scope.exportPageCount==0){
           $scope.exportPageCount=1;
        }
     }).error(function(){
         $scope.exportListoff=false;
         $scope.exportWarninginfo='暂无结果';
     })
    }
    // 搜索蓝图
    $scope.exportSearch=function(e,search)
    { 
         $scope.onExportPageChange(); 
         if($scope.exportSearchval.length==0)
         {
              $scope.exportPageNum=1;
              $scope.onExportPageChange(); 
         }
    }

 
    
   // 导出蓝图
    $scope.exportFn=function()
    {
    	 
    	  var checkbox = $scope.checkappId;
        if(checkbox.length==0)
        {
           Notify.alert(
             '请选择要导出的蓝图！' ,
             {status: 'info'}
           );
        }else
        {
          var ids=[];

          for(var i=0;i<checkbox.length;i++)
          {

             if($filter('filter')($scope.checkData,checkbox[i])[0]){
                var exportPackageId=$filter('filter')($scope.checkData,checkbox[i])[0].packageArr;
             }else{
                var exportPackageId=[];
             }
             ids.push({
                blueprintId:checkbox[i],
                exportPackageId:exportPackageId
             })
          }

         
           window.location.href='/cloudui/master/ws/blueprintTemplate/exportBlueprint?ids='+encodeURI(angular.toJson(ids));
           ngDialog.close();
        }
    }
    // 选择要导出的工件
    $scope.exportPackage=function(name,id,packageArr){
        ngDialog.open({
          template: 'app/views/dialog/blueprint-package-export.html'+'?action='+(new Date().getTime()),
          className: 'ngdialog-theme-default',
          scope: $scope,
          closeByDocument:false,
          data:{bluePrintName:name,bluePrintId:id,packageArr:packageArr},
          cache:false,
          controller:'blueprintPackageExport'
        }) 
    }

   



}])

/* ------------------------------------导出蓝图里的工件包------------------------------------ */
blueprintModule.controller('blueprintPackageExport',['$scope','$http','$filter',function($scope,$http,$filter){
  
  $scope.checkappId=[]; // 选中的工件包
  $scope.parentData=$scope.$parent;
  
  // 工件包列表
  $scope.getPackageList=function(){
    $http.get('/cloudui/master/ws/blueprintTemplate/getWorkpieceByBlueprintName'+'?v='+(new Date().getTime()),{
      params:{
        blueprint_name:$scope.ngDialogData.bluePrintName
      }
    })
    .success(function(data){
       $scope.packageList=data;
    })
  }
  $scope.getPackageList();


  // 确定导出
  $scope.exportFn=function(closeThisDialog){
    closeThisDialog(0);
    $filter('filter')($scope.parentData.exportBlueprintList,$scope.ngDialogData.bluePrintId)[0].packageArr=$scope.checkappId;
    $scope.parentData.checkData.push($filter('filter')($scope.parentData.exportBlueprintList,$scope.ngDialogData.bluePrintId)[0]);
  }
 
}])

/* ------------------------------------添加蓝图------------------------------------ */
blueprintModule.controller('addBlueprintCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$state',function($rootScope,$scope,$http,ngDialog,Notify,$state){
	
	$rootScope.submitted = false; 
	    
	$scope.saveBlueprintTemplateFn=function(){
		
		$rootScope.submitted = true;
		
		$rootScope.app.layout.isShadow=true;
		         
		var url='/cloudui/ws/blueprintTemplate/saveBlueprintTemplate';
		var data={
				blueprint_info:$scope.ngDialogData.blueprintInfo,
				blueprint_name:$scope.name,
				blueprintDesc:$scope.description,
				user_id:$rootScope.user.id,
				op:'add'
		}
		
		$http({
			method:'post',
			url:url,
			data:$.param(data),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		}).success(function(data){
			
			$rootScope.app.layout.isShadow=false;
			
			if(data.result)
			{ 
			    Notify.alert(
					'<em class="fa fa-check"></em> '+data.message ,
					{status: 'success'}
				); 
				ngDialog.close();
				$state.go('app.blueprint_manage',{},{reload:true});
			}else{
				Notify.alert(
					'<em class="fa fa-times"></em> '+data.message ,
				    {status: 'danger'}
				);
			}
		})
	}
}])


/* ------------------------------------添加蓝图流程------------------------------------ */
blueprintModule.controller('blueprintFlowCreateCtrl',['$rootScope','$scope','$stateParams','$http','ngDialog','$state','Notify',function($rootScope,$scope,$stateParams,$http,ngDialog,$state,Notify){
 
	$rootScope.submitted = false;
	
	$scope.blueprintId=$stateParams.blueprintId;
	
	$scope.addFlowFn=function(){
		
		$rootScope.submitted = true;

		var url='/cloudui/ws/blueprintTemplate/addBlueprintTemplateFlow';
    	var data={
    			flowName:$scope.name,
    			flowInfoGroup:$scope.ngDialogData.flowInfo,
    			blueprintId:$stateParams.blueprintId,
    			appName:''
    	}

        $http({
            method:'post',
            url:url,
            data:$.param(data),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
        }).success(function(data){
        	if(data.result){
	    		Notify.alert(
                    '<em class="fa fa-check"></em> '+data.message ,
                    {status: 'success'}
	            );
	    		ngDialog.close();
	    		$state.go('app.blueprint_manage',{},{reload:true});
	    	}else{
	    		Notify.alert(
                    '<em class="fa fa-times"></em> '+data.message ,
                    {status: 'danger'}
	            );
	    	}
             
        })
    }
}])

/* ------------------------------------创建蓝图实例------------------------------------ */
blueprintModule.controller('addBlueprintInsCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$state','$stateParams',function($rootScope,$scope,$http,ngDialog,Notify,$state,$stateParams){

	$rootScope.submitted = false;
	
	$scope.saveBlueprintInstanceFn=function(){
		 
        $rootScope.submitted = true;
		
		$rootScope.app.layout.isShadow=true;
		 
		$http({
			method:'post',
			url:'/cloudui/master/ws/blueprint/saveBlueprintInstance',
			data:$.param({
				blueprint_info:$scope.ngDialogData.blueprintInfo,
				blueprint_name:$scope.name,
				blueprint_desc:$scope.description,
				blueprint_template_id:$stateParams.blueprintId
			}),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		}).success(function(data){
			$rootScope.app.layout.isShadow=false;
			if(data.result)
			{
				Notify.alert(
					'<em class="fa fa-check"></em> '+data.message ,
					{status: 'success'}
				);
				ngDialog.close();
				$state.go('app.blueprint_ins_manage',{},{reload:true});
			}else{
				Notify.alert(
					'<em class="fa fa-times"></em> '+data.message ,
					{status: 'danger'}
				);
			}
		})
	}
}])

/* ------------------------------------蓝图流程管理------------------------------------ */
blueprintModule.controller('blueprintFlowManageCtrl',['$scope','$http','$stateParams','Notify','$state','ngDialog',function($scope,$http,$stateParams,Notify,$state,ngDialog){
	
	$scope.blueprintId=$stateParams.blueprintId;
	
	$scope.templateName=$stateParams.templateName;
	
	// 流程列表
	$http.get('/cloudui/ws/blueprintTemplate/listBlueprintTemplateFlow',{
		 params:{
			 blueprintId:$stateParams.blueprintId
		 }
	}).success(function(data){
		 $scope.flowList=data;
	})
	
 
	// 删除流程
	$scope.delFLow=function(id,index){
		
		ngDialog.openConfirm({
	           template:
	                '<p class="modal-header">您确定要删除此过程吗?</p>' +
	                '<div class="modal-body text-right">' +
	                  '<button type="button" class="btn btn-default mr20" ng-click="closeThisDialog(0)">取消' +
	                  '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
	                '</button></div>',
	          plain: true,
	          className: 'ngdialog-theme-default'
	     }) .then(function(){
	    	 $http({
	 			method:'post',
	 			url:"/cloudui/ws/blueprintTemplate/delBlueprintTemplateFlow",
	 			data:$.param(
	 			    {
	 			    	cdFlowId:id
	 				}		
	 		    ),
	 			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
	 	    }).success(function(data){
	 	    	if(data.result)
	 			{ 
	 			    Notify.alert(
	 					'<em class="fa fa-check"></em> '+data.message ,
	 					{status: 'success'}
	 				); 
	 				$scope.flowList.splice(index,1);
	 			}else{
	 				Notify.alert(
	 					'<em class="fa fa-times"></em> '+data.message ,
	 				    {status: 'danger'}
	 				);
	 			}
	 	    })
	     }
	     )
	}
 
}])

//验证蓝图流程名字唯一
blueprintModule.directive('validnameexist', function($http) {
    return {
        require : 'ngModel',
        link : function(scope, elm, attrs, ctrl) {
            elm.bind('change', function() {
            	if(!scope.type||scope.type.length==0){
            		return;
            	}
                $http(
            		{
            			method: 'GET', 
            			url: '/cloudui/ws/blueprintTemplate/checkBlueprintTemplateFlowUnique'+'?v='+(new Date().getTime()),
            		    params:{
            		    	blueprintId:scope.blueprintId,
            		    	flowName:scope.name
            		    }
            		}
                ). 
                success(function(data, status, headers, config) {
                    if(data.result){
                        ctrl.$setValidity('isexit',true);
                    }else{
                        ctrl.$setValidity('isexit',false);
                    }
                }).
                error(function(data, status, headers, config) {
                    ctrl.$setValidity('isexit', false);
                });
            });
        }
    };
}); 


