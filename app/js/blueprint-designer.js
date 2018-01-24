var blueprintDesignerMoudle=angular.module('blueprint-designer',[]);

blueprintDesignerMoudle.controller('blueprintCtrl',['$rootScope','$scope','$http','ngDialog','$filter','$stateParams','Notify','setPic','$state','$timeout',function($rootScope,$scope,$http,ngDialog,$filter,$stateParams,Notify,setPic,$state,$timeout){
	
	$scope.isGo=false;

	if($stateParams.sys){
       $rootScope.sys=$stateParams.sys;
	}

	$scope.$watch('sys',function(newval,oldval){
       if(newval=='cop'){
	      $rootScope.isCollapsed = true;
	   }else{
	       $rootScope.isCollapsed=$cookieStore.get('isCollapsed');
	   }
	})

     $scope.goList=[
        "app.blueprint_add",
        "app.blueprint_edit"
     ];
     $scope.cList=[];
	 $http({
	    method:'GET',
	    url:'/cloudui/master/ws/labelManager/getLabels4Group'+'?v='+(new Date().getTime()),
	    params:{
		"labelCode":3
	    }
	   }).success(function(data){
	       $scope.cList=angular.fromJson(data);
	   })
     

     var isGoPage=$filter('filter')($scope.goList,$state.current.name).length>0?true:false;

     $scope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){

     	  if(!isGoPage){
             return ;
     	  }
  

     	  if(!$scope.isGo){ // 离开
             event.preventDefault();
             ngDialog.openConfirm({
		           template:
		                '<p class="modal-header">您还有未保存的内容，是否确认离开？</p>' +
		                '<div class="modal-body text-right">' +
		                  '<button type="button" class="btn btn-primary mr20" ng-click="confirm(1)"">是' +
		                  '<button type="button" class="btn btn-default" ng-click="closeThisDialog(0)">否' +
		                '</button></div>',
		           plain: true,
		           className: 'ngdialog-theme-default'
		     })
		     .then(
		          function(){
		            $scope.isGo=true;
		          	 ngDialog.close();
		        	 $state.go(toState.name,toParams,{reload:true});
		        	 return false;
		          },function(){
		          	$scope.isGo=false;
		          	angular.element("#loading-bar").remove();
		          	angular.element("#loading-bar-spinner").remove();
		          }
		     )
     	  } 

     	  
     	  
     })

	var major=[
		'app.blueprint_add',
		'app.blueprint_ins_add',
		'app.blueprint_view',
		'app.blueprint_edit',
		'app.blueprint_ins_view'
	];

	// 是否允许画线

    var isAllowLink=$filter('filter')(major,$state.current.name).length>0?false:true;

	var isDelNode=true;

	if($stateParams.insCloneId){
		$http.get('/cloudui/master/ws/blueprint/getBlueprintInstanceById'+'?v='+(new Date().getTime()),{
			  params:{
				  blueprintId:$stateParams.insCloneId
			  }
		})
		.success(function(data){
			  $scope.blueprintInfo=angular.toJson(angular.fromJson(data.INFO),true);
		})
		var isDelNode=false;
	
	}else if($stateParams.templateName){ // 查看蓝图模板(查看蓝图、编辑蓝图、创建蓝图实例)

		$http.get('/cloudui/ws/blueprint/getBlueprintTemplate'+'?v='+(new Date().getTime()),{
			  params:{
				  bpName:$stateParams.templateName
			  }
		})
		.success(function(data){
			  $scope.blueprintInfo=angular.toJson(angular.fromJson(data.INFO),true);
		})

		if($state.current.name=='app.blueprint_edit'){
			var isDelNode=true;
			var isEditDes=true;
		}else{
			var isDelNode=false;
		}
	}else if($stateParams.insId){ // 查看蓝图实例模板

		var isDelNode=false;
	    $http.get('/cloudui/ws/deployedApp/getBlueInstanceDetailInfo'+'?v='+(new Date().getTime()),{
			  params:{
				  blueInstanceId:$stateParams.insId
			  }
		}).success(function(data){
			$scope.tempName=data.instanceName;
			$scope.blueprintInfo=data.INFO;

		})
	}else{
        var isEditDes=true;
		var isDelNode=true;
		if(!$scope.blueprintInfo){  // 新建蓝图

			// 模板示例数据
			$http.get('server/blueprint'+'?v='+(new Date().getTime())).
			success(function(data){
				$scope.blueprintInfo=angular.toJson(data,true);
			})
		}else{

			$scope.blueprintInfo=$scope.blueprintInfo;
		}
	}

	$scope.init=function () {

	    var $ = go.GraphObject.make;

	    // 图表
	    myDiagram =
	    $(go.Diagram, "myDiagramDiv",
	      {
	    	// 网格线样式设置
	        grid: $(go.Panel, "Grid",
	        		{ gridCellSize: new go.Size(20, 20) },
	                $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
	                $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
	                $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
	                $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
	        ),
	        scale:0.9,// 缩放
	        allowDelete:isDelNode,
	        allowCopy:isDelNode,
	        allowMove:isDelNode,
	        allowDrop: true,  // 是否可以进行拖拽操作
	        allowLink:isAllowLink,
	        mouseDrop: function(e) { finishDrop(e, null); },// 鼠标拖放结束事件
	        /*"LinkDrawn": function(e){newLinkDrawn(e)}, // 画线
	        "LinkRelinked":function(e){LinkRelinkedCheck(e)},// 修改线
*/	        initialContentAlignment: go.Spot.Center,
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
   function nodeStyle() {
      return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      {
        locationSpot: go.Spot.Center,
        mouseEnter: function (e, obj) { showPorts(obj.part, true); },
        mouseLeave: function (e, obj) { showPorts(obj.part, false); }
      }];
  }

  // 组实例数
  function groupIns(s){
     if(s.eleType=='resource'){
        return s.ins;
     } 
  }

  // 组节点模板
  myDiagram.groupTemplateMap.add("OfNodes",
	  $(go.Group, "Spot",nodeStyle(),
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
	                	 background: "#b387c6",
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
	                                    editable: isEditDes, isMultiline: false,
	                                    minSize: new go.Size(10, 16),
	                                    margin: new go.Margin(0, 0, 2, 0),
	                                    stroke: "#fff"
	                                  },
	                                  new go.Binding("text", "nodeDisplay").makeTwoWay()
	                              ),
	                              $(go.TextBlock,
		                              {
		                                row: 1, column: 1, columnSpan: 5,
		                                editable: isEditDes, isMultiline: false,
		                                stroke: "#fff",
		                                margin: new go.Margin(2, 0, 0, 0)
		                              },
	                                  new go.Binding("text", "des").makeTwoWay()
	                              )
	                            )
	                          ),
	                          $(go.TextBlock,{alignment: go.Spot.TopRight,margin: 5,font: "bold 12pt  Segoe UI,sans-serif",stroke: "#fff"},new go.Binding("text","",groupIns))
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
	      $(go.Node, "Spot", nodeStyle(),
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
	                                 editable: isEditDes, isMultiline: false,
	                                 minSize: new go.Size(10, 16)
	                             },
	                              new go.Binding("text", "nodeDisplay").makeTwoWay()
	                         ),
	                         $(go.TextBlock,
	                            {
	                             row: 1, column: 1, columnSpan: 5,
	                             editable: isEditDes, isMultiline: false,
	                             margin: new go.Margin(2, 0, 0, 0)
	                            },
	                           new go.Binding("text", "des").makeTwoWay()
	                         )
	                    )
	               )/*,
	               $(go.TextBlock,{alignment: go.Spot.TopRight,margin: 5,font: "bold 12pt  Segoe UI,sans-serif",stroke: "#13910d"},new go.Binding("text","ins"))*/
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
    	    doubleClick:function(e, node) {linkDialog(e,node,myDiagram)},
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

	// 左侧菜单组模板
    var simpleGP=$(go.Group, "Auto",{margin: new go.Margin(0, 0, 0, 0)},
         $(go.Shape,"RoundedRectangle",{desiredSize: new go.Size(86, 86),strokeWidth:0, fill: "#f0f2f3"}),
         $(go.Panel,"Vertical",
         	  $(go.Panel,"Auto",
                   $(go.Shape, "RoundedRectangle",
	                  {
	            	    fill:  $(go.Brush, "Linear", { 0: "#fff", 1: "#fbfbff" }),
	            	    strokeWidth:1,
	            	    stroke:"#949ca6",
	            	    desiredSize: new go.Size(42, 42)
	            	  }
	                ),
                    $(go.Picture,{desiredSize: new go.Size(44, 44)},new go.Binding("source"))
         	  ),
              
              $(go.TextBlock,
                  {
                     font: "normal 10px arial",
                     stroke: '#4e5866',
                     margin: new go.Margin(4, 0,0, 0),
                     maxSize: new go.Size(74, NaN),
			         wrap: go.TextBlock.WrapFit
                   },
                  new go.Binding("text", "nodeName").makeTwoWay()
             )
         )
    );

    // 左侧菜单原子模板
    var simple=$(go.Node, "Auto",{margin: new go.Margin(0, 0, 0, 0)},
        $(go.Shape,"RoundedRectangle",{desiredSize: new go.Size(86, 86),strokeWidth:0,fill:'#f0f2f3'}),
        $(go.Panel,"Vertical",
             $(go.Picture,{desiredSize: new go.Size(60, 60)},new go.Binding("source")),
             $(go.TextBlock,   // the name
                 {
                    font: "normal 10px arial",
                    stroke: '#4e5866',
                    margin: new go.Margin(4, 0,0, 0),
                    maxSize: new go.Size(74, NaN),
			        wrap: go.TextBlock.WrapFit
                  },
                 new go.Binding("text", "nodeName").makeTwoWay()
            )
        )

    );

	myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
	myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
	
	// 组件列表
	$scope.getComponents=function(type,index,search){

         var componentListPromise=$http.get("/cloudui/ws/resource/listAllResource"+"?v="+(new Date().getTime()),{
		  	params:{
		  		resourceName:search||'',
		  		labelId:type
		  	}
		 }).success(function(data){
		 	         
                     angular.forEach(data,function(val,key){

		        	   var groupArr=['nginx','weblogic','tomcat','apache','jboss','oracle','mysql','mongodb'];

		               //var isGroup=$filter('filter')(groupArr,angular.lowercase(val.text)).length>0?true:false;

		               for(var j=0;j<groupArr.length;j++)
		               {

		                  if(val.text.indexOf(groupArr[j])!==-1)
		                  {

		                	  var isGroup=true;

		                  }
		               }

		               if(!isGroup){
		            	   var isGroup=/*false*/true;
		               }
		               val.isGroup=isGroup;
		               val.nodeName=val.text;
		               val.nodeDisplay=val.text;
		               val.ins=1;
		               val.category="OfNodes";
		               val.source="app/images/designer-icons/"+setPic.setPicFn(val.text);
		               val.eleType="component";
		               if(!val.isGroup){
		                  val.color='#fff'
		               }
		               val.versionlist=[];

		           })
                   data.push({
                   	   type:type,
                   	   index:index
                   });     
		   })

           return componentListPromise;
	}

    // 搜素组件
	$scope.search=function(type,index,search){
		$scope.getComponents(type,index,search).then(function(res){
            $scope.resData=[];
         	angular.forEach(res.data,function(val,key){
                if(val.id){
                    $scope.resData.push(val);
                }
         	 })
            $scope['componentsModel'+index].model.nodeDataArray=$scope.resData;
		})
	}

	function leftMenu(){
		 jQuery("#combar").accordion({
	        collapsible: true,
	        activate: function(event, ui,a) {
	        	for(var i=0;i<$scope.cList.length;i++)
	        	{
	        		$scope['components'+i].requestUpdate();
	        	}  
	        },
	        heightStyle: "content"
	    });
		// 左侧菜单折叠
	    jQuery("#accordion").accordion({
	        collapsible: true,
	        activate: function(event, ui,a) {
	            envresource.requestUpdate();
	            services.requestUpdate();
	            $scope['components0'].requestUpdate();
	        },
	        heightStyle: "content"
	    });
	    // 资源池数据
		envresource =
	      $(go.Palette, "envresource",
	        {
	          maxSelectionCount: 1,
	          nodeTemplate: simple,
	          groupTemplate: simpleGP,
	          model: new go.GraphLinksModel([
	               { "text":"静态资源池","nodeName":"静态资源池","nodeDisplay":"静态资源池","eleType":"resource","category":"OfNodes",pooltype:"1","isGroup":true,"ins":"","des":"静态资源池","source":"app/images/designer-icons/static.png",color:"#01c5c9"},
	               { "text":"动态资源池","nodeName":"动态资源池","nodeDisplay":"动态资源池", "eleType":"resource","category":"OfNodes",pooltype:"2","isGroup":true, "ins":"","des":"动态资源池","source":"app/images/designer-icons/dynamic.png",color:"#f45b96"},
	               { "text":"云资资源池","nodeName":"云资资源池","nodeDisplay":"云资资源池","eleType":"resource","category":"OfNodes", pooltype:"3","isGroup":true,"ins":"","des":"云资资源池","source":"app/images/designer-icons/cloud.png",color:"#ff916c"}
	          ])
	        }
	      );
		  // 服务数据
		  services =
	       $(go.Palette, "services",
	        {
	          maxSelectionCount: 1,
	          nodeTemplate: simple,
	          groupTemplate: simpleGP,
	          model: new go.GraphLinksModel([
	            {  category: "simple", "eleType":"service",text: "SSH",nodeName: "SSH",nodeDisplay: "SSH",des:"Redis","loc":"195 225","ins":1,source:"app/images/designer-icons/SSH.png",color:"#fff", figure: "Circle", fill: "#00AD5F" },
	            {  category: "simple", "eleType":"service", text: "HTTPD",nodeName: "HTTPD",nodeDisplay: "HTTPD",des:"WAR包","loc":"195 225","ins":1,source:"app/images/designer-icons/http.png",color:"#fff", figure: "Circle", fill: "#00AD5F" }
	          ])
	        }
	      );

		// 组件数据

		for(var i=0;i<$scope.cList.length;i++)
		{
			 var type=$scope.cList[i].type;
             $scope.getComponents(type,i).then(function(res){
              
             	 $scope.resData=[];
             	 angular.forEach(res.data,function(val,key){
                    if(val.id){
                        $scope.resData.push(val);
                    }else{
                    	$scope.index=val.index;
                    	$scope.type=val.type;
                    }
             	 })

                 $scope['components'+$scope.index]=
		             $(go.Palette, 'components'+$scope.index,
		              {
		                maxSelectionCount: 1,
		                nodeTemplate: simple,
		                groupTemplate: simpleGP,
		                model: new go.GraphLinksModel($scope.resData)
		            });
		            $scope['componentsModel'+$scope.index]=$scope['components'+$scope.index];
		   })
		}
 
	}

	 
	$timeout(function(){
		
		var isLoadComponentELe=[];

		for(var i=0;i<$scope.cList.length;i++)
		{
            if(angular.element('#components'+i).length>0){
               isLoadComponentELe.push(true);
            }else{
               isLoadComponentELe.push(false);
            }
		}

		var isLoadComponent=$filter('filter')(isLoadComponentELe,false).length>0?false:true;

		if(isLoadComponent){
            if(jQuery("#accordion").length>0){
		        leftMenu();
        	}
		}
	},500)

 

    $scope.$watch('blueprintInfo',function(newval,oldval){

   	   if(newval){
   		   $scope.load(newval);
   	   }
    },true)
  }  // end init


   function saveDiagramProperties() {
	   myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
   }

  function loadDiagramProperties(e) {
	   var pos = myDiagram.model.modelData.position;
	   if (pos) myDiagram.initialPosition = go.Point.parse(pos);
  }

  function linkDialog(e,node,myDiagram){
	  
      ngDialog.open({
        template: 'app/views/dialog/blueprintdesigner-link.html'+'?action='+(new Date().getTime()),
        className: 'ngdialog-theme-default',
        scope: $scope,
        data:{e:e,node:node,diagram:myDiagram},
        cache:false,
        closeByDocument:false,
        controller:'linkCtrl'
      });
  }

  function toEditView(e,node,myDiagram){

		var viewStateArr=['app.blueprint_view','app.blueprint_edit']

		var curState=$state.current.name;

		if(curState){
  		 isView=$filter('filter')(viewStateArr,curState);

      	 if(isView.length>0){
      		  return false;
      	 }
  	 }
	  if((node.data.eleType=="resource")&&($stateParams.templateName||$stateParams.insCloneId)){
          // 资源池弹框
          ngDialog.open({
            template: 'app/views/dialog/blueprintdesigner-resource-configs.html'+'?action='+(new Date().getTime()),
            className: 'ngdialog-theme-default ngdialog-lg',
            scope: $scope,
            data:{e:e,node:node,diagram:myDiagram},
            cache:false,
            closeByDocument:false,
            controller:'envResourceCtrl'
          });
      }
  }

  // 查看蓝图数据
  $scope.save=function() {
    saveDiagramProperties();
    var saveModel=jQuery.parseJSON(myDiagram.model.toJson());
    $scope.blueprintInfo = angular.toJson(saveModel,true);;
    myDiagram.isModified = false;
  }

  // 创建蓝图模板
  $scope.saveBlueprint=function(){
  	$scope.isGo=true;
	  $scope.save();
	  ngDialog.open({
	        template: 'app/views/dialog/blueprint-save.html'+'?action='+(new Date().getTime()),
	        className: 'ngdialog-theme-default',
	        scope: $scope,
	        closeByDocument:false,
	        cache:false,
	        data:{blueprintInfo:$scope.blueprintInfo},
	        controller:'addBlueprintCtrl'
	   });
  }

  // 更新蓝图模板
  $scope.editBlueprint=function(){
  	  $scope.isGo=true;
	  $scope.save();
	  if($rootScope.sys=='cop'){
         $rootScope.myThumbDiagrm = myDiagram; //cj add
	  }
	  
	  $http({
			method:'post',
			url:"/cloudui/ws/blueprintTemplate/saveBlueprintTemplate",
			data:$.param(
			    {
					blueprint_info:$scope.blueprintInfo,
					blueprint_name:$stateParams.templateName,
					user_id:$rootScope.user.id,
					op:'update'
				}
		    ),
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
			}else{
				Notify.alert(
					'<em class="fa fa-check"></em> '+data.message ,
				    {status: 'danger'}
				);
			}

			 if($rootScope.sys=='cop'){
			 	//cj add : 先根据蓝图名获取其bluePrintId
			$http.get('/cloudui/ws/blueprint/getBlueprintTemplate'+'?v='+(new Date().getTime()),{
				  params:{
					  bpName:$stateParams.templateName
				  }
			})
			.success(function(data){
				//更新cop蓝图缩略图
				var thumbDataBase64=$rootScope.myThumbDiagrm.makeImageData({
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
					url:"/backend/api/middleware/updateBlueprintThumb/"+data.ID,
					data:paramsObject
				}).success(function(data){
					console.log(data);
				});
			});
			 }

			
	  })
  }

  // 创建蓝图实例
  $scope.saveBlueprintIns=function(){
	  $scope.save();
	  ngDialog.open({
	        template: 'app/views/dialog/blueprint-ins-save.html'+'?action='+(new Date().getTime()),
	        className: 'ngdialog-theme-default',
	        scope: $scope,
	        closeByDocument:false,
	        cache:false,
	        data:{blueprintInfo:$scope.blueprintInfo},
	        controller:'addBlueprintInsCtrl'
	  });
  }

  // 载入蓝图数据
  $scope.load=function(info) {
	  myDiagram.model = go.Model.fromJson(info);
	  loadDiagramProperties();
  }

  // 克隆蓝图实例
  $scope.cloneBlueprintIns=function(){
	  $scope.save();
	  ngDialog.open({
	        template: 'app/views/dialog/blueprint-ins-clone-save.html'+'?action='+(new Date().getTime()),
	        className: 'ngdialog-theme-default',
	        scope: $scope,
	        closeByDocument:false,
	        cache:false,
	        data:{blueprintInfo:$scope.blueprintInfo},
	        controller:'cloneBlueprintInsCtrl'
	  });
  }

}])


blueprintDesignerMoudle.controller('envResourceCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$filter',function($rootScope,$scope,$http,ngDialog,Notify,$filter){

	var myDiagram=$scope.ngDialogData.diagram;
    var node=$scope.ngDialogData.node;
    var initNodeList=angular.fromJson(node.data.nodes);
    $scope.checkappId=[];


    if(node.data.label){
    	$scope.label=node.data.label.value;
    }

    // 环境列表
    $http.get('/cloudui/master/ws/cluster/listAll'+'?v='+(new Date().getTime())).
    success(function(data){
        $scope.clusterList=data;
        if(node.data.cluster_id)
        {
        	$scope.cluster=node.data.cluster_id;
        }else{
        	$scope.cluster=$scope.clusterList[0].id;
        }
    })

    // 环境下的主机列表

    $scope.$watch('cluster',function(newval,oldval){
        if(newval){

    		if(newval==node.data.cluster_id){
	            angular.forEach(initNodeList,function(val,key){
		           $scope.checkappId.push(val.ip)
	            })
        	}else{
        		$scope.checkappId=[];
        	} 
         
           $scope.authMsg="";
           $http.get('/cloudui/master/ws/node/listAll'+'?v='+(new Date().getTime()),{
        	  params:{
        		  clusterId:newval
        	  }
           }).
           success(function(data){
              if(node.data.nodes){
            	  angular.forEach(data,function(val,key){
              		 var ischecked=$filter('filter')(initNodeList,val.ip).length>0?true:false; 
              		 val.ischecked=ischecked;
              	  })
              	  $scope.nodeList=data;
              }else{
            	  $scope.nodeList=data;
              }

           })
        }
    })


    // 选择节点
    $rootScope.submitted = false;
    $scope.saveNode=function(){
       $rootScope.submitted = true;
       $scope.authMsg = '';

       // 选中节点
       var checkbox = $scope.checkappId;
       var nodes=[];
       var nodesList=[];
      
       angular.forEach(checkbox,function(val,key){
     	    var obj={};
     	    obj.ip=val;
            nodes.push(val);
            nodesList.push(obj);
       })
     
       if(nodes.length==0){
    	   Notify.alert(
               '<em class="fa fa-check"></em> 请添加节点！' ,
               {status: 'info'}
            );
    	   return false;
       }
/*
       // 标签重名校验
       $http.get('/cloudui/master/ws/label/check'+'?v='+(new Date().getTime()),{params:{
     	  clusterId:$scope.cluster,
     	  key:'compresmap',
     	  value:$scope.label,
     	  type:node.data.pooltype
       }}).success(function(data){
          if(data.result)
           {
                 $rootScope.app.layout.isShadow=false;
                 myDiagram.startTransaction('saveNode');
                 myDiagram.model.setDataProperty(node.data,'ins',nodes.length);
                 myDiagram.model.setDataProperty(node.data,'cluster_id',$scope.cluster);
                 myDiagram.model.setDataProperty(node.data,'nodes',angular.toJson(nodesList));
                 myDiagram.model.setDataProperty(node.data,'label',{key:'compresmap',value:$scope.label})
                 myDiagram.commitTransaction('saveNode');
                 ngDialog.close();

           }else{
        	   $scope.authMsg = '此标签已存在，请重新命名！';
         	   $scope.form.$valid = false;
           }
       })
*/	   
	   // if(!$scope.label)
	   {
		    var now = new Date();
			var month = now.getMonth()+1;
			$scope.label='Label'+now.getFullYear()+(month<10?'0'+month:month)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+now.getMilliseconds();
	   }
	   $rootScope.app.layout.isShadow=false;
	   myDiagram.startTransaction('saveNode');
	   myDiagram.model.setDataProperty(node.data,'ins',nodes.length);
	   myDiagram.model.setDataProperty(node.data,'cluster_id',$scope.cluster);
	   myDiagram.model.setDataProperty(node.data,'nodes',angular.toJson(nodesList));
	   myDiagram.model.setDataProperty(node.data,'label',{key:'compresmap',value:$scope.label})
	   myDiagram.commitTransaction('saveNode');
	   ngDialog.close();
   }

}])

// 线
blueprintDesignerMoudle.controller('linkCtrl',['$rootScope','$scope','$http','ngDialog','Notify','$filter',function($rootScope,$scope,$http,ngDialog,Notify,$filter){
	var myDiagram=$scope.ngDialogData.diagram;
    var node=$scope.ngDialogData.node;
	$scope.linkList=[
	    {value:"start",text:"启动依赖"},
	    {value:"stop",text:"停止依赖"}
	]

	$scope.depend=$scope.linkList[0].value;

	$scope.saveLink=function(){
		var linkColor=$scope.depend=='start'?'#43d967':'#ec2121';
		myDiagram.startTransaction('saveLink');
        myDiagram.model.setDataProperty(node.data,'linkColor',linkColor);
        myDiagram.model.setDataProperty(node.data,'depended',$scope.depend);
        myDiagram.commitTransaction('saveLink');
        ngDialog.close();
	}

}])
