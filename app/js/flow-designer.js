var flowDesignerMoudle=angular.module('flow-designer',[]);

flowDesignerMoudle.controller('flowCtrl',['$scope','$stateParams','ngDialog','$filter','$http','Notify','$state','$interval','setPic','$timeout',function($scope,$stateParams,ngDialog,$filter,$http,Notify,$state,$interval,setPic,$timeout){
    
    $scope.isGo=false;
    $scope.cList=[];
    $http({
	    method:'GET',
	    url:'/cloudui/master/ws/labelManager/getLabels4Group'+'?v='+(new Date().getTime()),
	    params:{
		"labelCode":4
	    }
	   }).success(function(data){
	       $scope.cList=angular.fromJson(data);
	   });

     $scope.goList=[
        "app.blueprint_flow_create",
        "app.blueprint_flow_update",
        "app.component_flow_create",
        "app.component_flow_update"
     ];


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
		'app.blueprint_ins_flow_view',
		'app.blueprint_ins_flow_monitor',
		'app.blueprint_ins_component_flow_monitor'
	];

	// 是否允许连线

    var isAllowLink=$filter('filter')(major,$state.current.name).length>0?false:true;


	$scope.$on('$destroy', function() {
		$interval.cancel($scope.flowMinitorTimer);  
	 });

	$scope.flowId=$stateParams.flowId;
	$scope.branch=$scope.$parent.$parent.branch;
	 
    
	// 更新获取流程
	if($stateParams.flowId){  // 查看蓝图流程
		if($stateParams.blueprintId){ //(编辑蓝图流程、执行蓝图实例流程)
			 
			if($state.current.name=='app.blueprint_ins_flow_view'){
				var isDelNode=false;
			}else{
				var isDelNode=true;
			}
			
	        $http.get('/cloudui/ws/blueprintTemplate/viewBluePrintTemplateFlow'+'?v='+(new Date().getTime()),{
	        	params:{
	        		cdFlowId:$stateParams.flowId
	        	}
	        })
	    	.success(function(data){
	    		$scope.flowName=data.type;
	    		$scope.flowInfo=angular.toJson(data,true);
	    	})
		}else if($stateParams.componentId){ //(编辑组件流程)
		 
			var isDelNode=true;
	        $http.post('/cloudui/master/ws/resource/getNewFlowInfoByFlowId',{
	        	cdFlowId:$stateParams.flowId
	        })
	    	.success(function(data){
	    		if(data.result){
	    			$scope.flowInfo=angular.toJson(angular.fromJson(data.data),true);
	    		}
	    	})
		}else{ // 流程监控
			var isDelNode=false;
			 
		}
	}else{ // 添加流程
		 
		var isDelNode=true;
	}

	var commonBackgroundColorFail="#f05050"
			  var commonBackgroundColorSuccess="#27c24c";
			  var commonBackgroundColorAction="#ff902b";
			  var commonBackgroundColorBeforeAction="#dde6e9";

	function nodeBgColor(s){ 

		  if(s=='2'){
			  return commonBackgroundColorSuccess;
		  }else if(s=='7'){
			  return commonBackgroundColorFail;
		  }else if(s=='0'){
			  return commonBackgroundColorAction;
		  }else if(s=='-1'){
			  return commonBackgroundColorBeforeAction; 
		  } 
	  }

	// activity模板填充颜色
	 function activityFillColorFn(s){

        if(s.state){
           return nodeBgColor(s.state);
        }else{
           if(s.flowcontroltype==3){
              return "#57f17f";
           }else if(s.flowcontroltype==9){
              return "#9bdbfc";
           }else if(s.flowcontroltype==39){
              return "#a2f2f3";
           }
        }
	 }

	 // activity模板边框颜色
	 function activityStrokeColorFn(s){
        if(s.state){
           return nodeBgColor(s.state);
        }else{
           if(s.flowcontroltype==3){
              return "#28c351";
           }else if(s.flowcontroltype==9){
              return "#4dc3ff";
           }else if(s.flowcontroltype==39){
              return "#73b4b5";
           }
        }
	 }

	// 立即结束、单一条件、聚合、分支填充颜色
	 function HexagonFillColorFn(s){
	 	if(s.state){
           return nodeBgColor(s.state);
	 	}else{
           switch(s.flowcontroltype){
	          case 30:
	          return "#fff";
	          break;
	          case 5:
	          return "#d676ff";
	          break;
	          case 12:
	          return "#6d71ef";
	          break;
	          case 8:
	          return "#0acbcf";
	          break;
	  	   }
	 	} 
	 }
     // 立即结束、单一条件、聚合、分支边框颜色
	 function HexagonStrokeColorFn(s){
	 	if(s.state){
           return "#fff";
	 	}else{
           switch(s.flowcontroltype){
	          case 30:
	          return "#3bbcf7";
	          break;
	          case 5:
	          return "#bc58e6";
	          break;
	          case 12:
	          return "#484bc8";
	          break;
	          case 8:
	          return "#25b4b8";
	          break;
	  	   }
	 	}
	 }
    
     // 图标
	function iconTypeFn(s){
	  	  switch(s){
              case 30:
              return "app/images/designer-icons/stop.png";
              break;
              case 5:
              return "app/images/designer-icons/in.png";
              break;
              case 12:
              return "app/images/designer-icons/out.png";
              break;
              case 8:
              return "app/images/designer-icons/single.png";
              break;
	  	  }
	  }

	  function activityIconFn(s){
         if(s.flowcontroltype==3){
            return "app/images/designer-icons/user.png";
         }else if(s.flowcontroltype==9){
         	return s.source;
         }else if(s.flowcontroltype==39){
         	return "app/images/designer-icons/api.png";
         }
	  }
 
	 
	$scope.init=function() {
		 var AllowTopLevel = false;
		 
		  var $ = go.GraphObject.make;  // for more concise visual tree definitions

		  var GradientYellow = $(go.Brush, "Linear", { 0: "LightGoldenRodYellow", 1: "#FFFF66" });
		  var GradientLightGreen = $(go.Brush, "Linear", { 0: "#E0FEE0", 1: "PaleGreen" });
		  var GradientLightGray = $(go.Brush, "Linear", { 0: "White", 1: "#DADADA" });

		  var ActivityNodeFill = $(go.Brush, "Linear", { 0: "OldLace", 1: "PapayaWhip" });
		  
		  var ActivityNodeFill2 = $(go.Brush, "Linear", { 0: "#87cdf7", 1: "#49aaef" });
		  
		  var customResourceFill1 = $(go.Brush, "Linear", { 0: "#f9bca8", 1: "#ff916c" });
		  
		  var customEnterFill=$(go.Brush, "Linear", { 0: "#f9cff5", 1: "#f9a8f0" });
			  
		  var ActivityNodeStroke = "#CDAA7D";
		  var ActivityMarkerStrokeWidth = 1.5;
		  var ActivityNodeWidth = 120;
		  var ActivityNodeHeight = 80;
		  var ActivityNodeStrokeWidth = 1;
		  var ActivityNodeStrokeWidthIsCall = 4;

		  var SubprocessNodeFill = $(go.Brush, "Linear", { 0: "White", 1: "White" });
		  var SubprocessNodeStroke = ActivityNodeStroke;

		  var EventNodeSize = 42;
		  var EventNodeInnerSize = EventNodeSize - 6;
		  var EventNodeSymbolSize = EventNodeInnerSize - 14;
		  var EventEndOuterFillColor = "pink";
		  var EventBackgroundColor = GradientLightGreen;
		  var EventSymbolLightFill = "white";
		  var EventSymbolDarkFill = "dimgray";
		  var EventDimensionStrokeColor = "green";
		  var EventDimensionStrokeEndColor = "red";
		  var EventNodeStrokeWidthIsEnd = 4;

		  var GatewayNodeSize = 80;
		  var GatewayNodeSymbolSize = 45;
		  var GatewayNodeFill = GradientYellow;
		  var GatewayNodeStroke = "darkgoldenrod";
		  var GatewayNodeSymbolStroke = "darkgoldenrod";
		  var GatewayNodeSymbolFill = GradientYellow;
		  var GatewayNodeSymbolStrokeWidth = 3;

		  var DataFill = GradientLightGray;
		  
		  
			  
			  
			  
		 
			  
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
			  
			  function insFn(node){ 
                    
				   if($stateParams.flowMonitorInsId){
					   return node.successCount+'/'+node.ins;
				   }else{
					   return '';
				   }
			  }
			  
 
		  

		  // custom figures for Shapes

		  go.Shape.defineFigureGenerator("Empty", function(shape, w, h) {
		    return new go.Geometry();
		  });

		  var annotationStr = "M 150,0L 0,0L 0,600L 150,600 M 800,0";
		  var annotationGeo = go.Geometry.parse(annotationStr);
		  annotationGeo.normalize();
		  go.Shape.defineFigureGenerator("Annotation", function(shape, w, h) {
		    var geo = annotationGeo.copy();
		    // calculate how much to scale the Geometry so that it fits in w x h
		    var bounds = geo.bounds;
		    var scale = Math.min(w / bounds.width, h / bounds.height);
		    geo.scale(scale, scale);
		    return geo;
		  });
         
		  var gearStr = "F M 391,5L 419,14L 444.5,30.5L 451,120.5L 485.5,126L 522,141L 595,83L 618.5,92L 644,106.5" +
		    "L 660.5,132L 670,158L 616,220L 640.5,265.5L 658.122,317.809L 753.122,322.809L 770.122,348.309L 774.622,374.309" +
		    "L 769.5,402L 756.622,420.309L 659.122,428.809L 640.5,475L 616.5,519.5L 670,573.5L 663,600L 646,626.5" +
		    "L 622,639L 595,645.5L 531.5,597.5L 493.192,613.462L 450,627.5L 444.5,718.5L 421.5,733L 393,740.5L 361.5,733.5" +
		    "L 336.5,719L 330,627.5L 277.5,611.5L 227.5,584.167L 156.5,646L 124.5,641L 102,626.5L 82,602.5L 78.5,572.5" +
		    "L 148.167,500.833L 133.5,466.833L 122,432.5L 26.5,421L 11,400.5L 5,373.5L 12,347.5L 26.5,324L 123.5,317.5" +
		    "L 136.833,274.167L 154,241L 75.5,152.5L 85.5,128.5L 103,105.5L 128.5,88.5001L 154.872,82.4758L 237,155" +
		    "L 280.5,132L 330,121L 336,30L 361,15L 391,5 Z M 398.201,232L 510.201,275L 556.201,385L 505.201,491L 399.201,537" +
		    "L 284.201,489L 242.201,385L 282.201,273L 398.201,232 Z";
		  var gearGeo = go.Geometry.parse(gearStr);
		  gearGeo.normalize();
		  
		  go.Shape.defineFigureGenerator("BpmnTaskService", function(shape, w, h) {
		    var geo = gearGeo.copy();
		    // calculate how much to scale the Geometry so that it fits in w x h
		    var bounds = geo.bounds;
		    var scale = Math.min(w / bounds.width, h / bounds.height);
		    geo.scale(scale, scale);
		    // text should go in the hand
		    geo.spot1 = new go.Spot(0, 0.6, 10, 0);
		    geo.spot2 = new go.Spot(1, 1);
		    return geo;
		  });

		  var handGeo = go.Geometry.parse("F1M18.13,10.06 C18.18,10.07 18.22,10.07 18.26,10.08 18.91," +
		    "10.20 21.20,10.12 21.28,12.93 21.36,15.75 21.42,32.40 21.42,32.40 21.42," +
		    "32.40 21.12,34.10 23.08,33.06 23.08,33.06 22.89,24.76 23.80,24.17 24.72," +
		    "23.59 26.69,23.81 27.19,24.40 27.69,24.98 28.03,24.97 28.03,33.34 28.03," +
		    "33.34 29.32,34.54 29.93,33.12 30.47,31.84 29.71,27.11 30.86,26.56 31.80," +
		    "26.12 34.53,26.12 34.72,28.29 34.94,30.82 34.22,36.12 35.64,35.79 35.64," +
		    "35.79 36.64,36.08 36.72,34.54 36.80,33.00 37.17,30.15 38.42,29.90 39.67," +
		    "29.65 41.22,30.20 41.30,32.29 41.39,34.37 42.30,46.69 38.86,55.40 35.75," +
		    "63.29 36.42,62.62 33.47,63.12 30.76,63.58 26.69,63.12 26.69,63.12 26.69," +
		    "63.12 17.72,64.45 15.64,57.62 13.55,50.79 10.80,40.95 7.30,38.95 3.80," +
		    "36.95 4.24,36.37 4.28,35.35 4.32,34.33 7.60,31.25 12.97,35.75 12.97," +
		    "35.75 16.10,39.79 16.10,42.00 16.10,42.00 15.69,14.30 15.80,12.79 15.96," +
		    "10.75 17.42,10.04 18.13,10.06z ");
		  handGeo.rotate(90, 0, 0);
		  handGeo.normalize();
		  go.Shape.defineFigureGenerator("BpmnTaskManual", function(shape, w, h) {
		    var geo = handGeo.copy();
		    // calculate how much to scale the Geometry so that it fits in w x h
		    var bounds = geo.bounds;
		    var scale = Math.min(w / bounds.width, h / bounds.height);
		    geo.scale(scale, scale);
		    // guess where text should go (in the hand)
		    geo.spot1 = new go.Spot(0, 0.6, 10, 0);
		    geo.spot2 = new go.Spot(1, 1);
		    return geo;
		  });


		  // define the appearance of tooltips, shared by various templates
		  var tooltiptemplate =
		    $(go.Adornment, go.Panel.Auto,
		      $(go.Shape, "RoundedRectangle",
		        { fill: "whitesmoke", stroke: "gray" }),
		      $(go.TextBlock,
		        { margin: 3, font: "10px Arial,sans-serif",editable: false },
		        new go.Binding("text", "", function (data) {
		          if (data.item !== undefined) return data.item;
		          return "(unnamed item)";
		        }))
		    );
		 

		  // conversion functions used by data Bindings

		  function nodeActivityTaskTypeConverter(s) {
		    var tasks = ["Empty",
		                  "BpmnTaskMessage",
		                  "BpmnTaskUser",
		                  "BpmnTaskManual",   // Custom hand symbol
		                  "BpmnTaskScript",
		                  "BpmnTaskMessage",  // should be black on white
		                  "BpmnTaskService",  // Custom gear symbol
		                  "InternalStorage",
		                  "Cube1"];
		    if (s < tasks.length) return tasks[s];
		    return "NotAllowed"; // error
		  }

		  // location of event on boundary of Activity is based on the index of the event in the boundaryEventArray
		  function nodeActivityBESpotConverter(s) {
		    var x = 10 + (EventNodeSize / 2);
		    if (s === 0) return new go.Spot(0, 1, x, 0);    // bottom left
		    if (s === 1) return new go.Spot(1, 1, -x, 0);   // bottom right
		    if (s === 2) return new go.Spot(1, 0, -x, 0);   // top right
		    return new go.Spot(1, 0, -x - (s - 2) * EventNodeSize, 0);    // top ... right-to-left-ish spread
		  }

		  function nodeActivityTaskTypeColorConverter(s) {
		    return (s == 5) ? "dimgray" : "white";
		  }

		  function nodeEventTypeConverter(s) {  // order here from BPMN 2.0 poster
		    var tasks = [ "NotAllowed",
		                  "Empty",
		                  "BpmnTaskMessage",
		                  "BpmnEventTimer",
		                  "BpmnEventEscalation",
		                  "BpmnEventConditional",
		                  "Arrow",
		                  "BpmnEventError",
		                  "ThinX",
		                  "BpmnActivityCompensation",
		                  "Triangle",
		                  "Pentagon",
		                  "ThickCross",
		                  "Circle"];
		    if (s < tasks.length) return tasks[s];
		    return "NotAllowed"; // error
		  }

		  function nodeEventDimensionStrokeColorConverter(s) {
		    if (s === 8) return EventDimensionStrokeEndColor;
		    return EventDimensionStrokeColor;
		  }

		  function nodeEventDimensionSymbolFillConverter(s) {
		    if (s <= 6) return EventSymbolLightFill;
		    return EventSymbolDarkFill;
		  }


		  //------------------------------------------  Activity Node Boundary Events   ----------------------------------------------

		  var boundaryEventMenu =  // context menu for each boundaryEvent on Activity node
		  $(go.Adornment, "Vertical",
		    $("ContextMenuButton",
		      $(go.TextBlock, "Remove event"),
		      // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
		      { click: function(e, obj) { removeActivityNodeBoundaryEvent(obj.part.adornedObject); } })
		   );

		  // removing a boundary event doesn't not reposition other BE circles on the node
		  // just reassigning alignmentIndex in remaining BE would do that.
		  function removeActivityNodeBoundaryEvent(obj) {
		    myDiagram.startTransaction("removeBoundaryEvent");
		    var pid = obj.portId;
		    var arr = obj.panel.itemArray;
		    for (var i = 0; i < arr.length; i++) {
		      if (arr[i].portId === pid) {
		        myDiagram.model.removeArrayItem(arr, i);
		        break;
		      }
		    }
		    myDiagram.commitTransaction("removeBoundaryEvent");
		  }

		  var boundaryEventItemTemplate =
		    $(go.Panel, "Spot",
		       { contextMenu: boundaryEventMenu,
		         alignmentFocus: go.Spot.Center,
		         fromLinkable: true, toLinkable: false, cursor: "pointer", fromSpot: go.Spot.Bottom,
		         fromMaxLinks: 1, toMaxLinks: 0
		       },
		       new go.Binding("portId", "portId"),
		       new go.Binding("alignment", "alignmentIndex", nodeActivityBESpotConverter),
		      $(go.Shape, "Circle",
		        { desiredSize: new go.Size(EventNodeSize, EventNodeSize) },
		        new go.Binding("strokeDashArray", "eventDimension", function(s) { return (s === 6) ? [4, 2] : null; }),
		        new go.Binding("fromSpot", "alignmentIndex",
		          function(s) {
		            //  nodeActivityBEFromSpotConverter, 0 & 1 go on bottom, all others on top of activity
		            if (s < 2) return go.Spot.Bottom;
		            return go.Spot.Top;
		          }),
		        new go.Binding("fill", "color")),
		      $(go.Shape, "Circle",
		         { alignment: go.Spot.Center,
		           desiredSize: new go.Size(EventNodeInnerSize, EventNodeInnerSize), fill: null },
		         new go.Binding("strokeDashArray", "eventDimension", function(s) { return (s === 6) ? [4, 2] : null; })
		       ),
		      $(go.Shape, "NotAllowed",
		          { alignment: go.Spot.Center,
		            desiredSize: new go.Size(EventNodeSymbolSize, EventNodeSymbolSize), fill: "white" },
		            new go.Binding("figure", "eventType", nodeEventTypeConverter)
		        )
		    );
		  
		  //------------------------------------------  Activity Node contextMenu   ----------------------------------------------

		  var activityNodeMenu =
		       $(go.Adornment, "Vertical",
		         $("ContextMenuButton",
		             $(go.TextBlock, "Add Email Event", { margin: 3 }),
		             { click: function(e, obj) { addActivityNodeBoundaryEvent(2, 5); } }),
		         $("ContextMenuButton",
		             $(go.TextBlock, "Add Timer Event", { margin: 3 }),
		             { click: function(e, obj) { addActivityNodeBoundaryEvent(3, 5); } }),
		         $("ContextMenuButton",
		             $(go.TextBlock, "Add Escalation Event", { margin: 3 }),
		             { click: function(e, obj) { addActivityNodeBoundaryEvent(4, 5); } }),
		         $("ContextMenuButton",
		             $(go.TextBlock, "Add Error Event", { margin: 3 }),
		             { click: function(e, obj) { addActivityNodeBoundaryEvent(7, 5); } }),
		         $("ContextMenuButton",
		             $(go.TextBlock, "Add Signal Event", { margin: 3 }),
		             { click: function(e, obj) { addActivityNodeBoundaryEvent(10, 5); } }),
		         $("ContextMenuButton",
		             $(go.TextBlock, "Add N-I Escalation Event", { margin: 3 }),
		             { click: function(e, obj) { addActivityNodeBoundaryEvent(4, 6); } }),
		         $("ContextMenuButton",
		             $(go.TextBlock, "Rename", { margin: 3 }),
		             { click: function(e, obj) { rename(obj); } }));


		  // sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
		  function makeSubButton(sub) {
		    if (sub)
		      return [$("SubGraphExpanderButton"),
		              { margin: 2, visible: false },
		                   new go.Binding("visible", "isSubProcess")];
		    return [];
		  }

		  // sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
		  function makeMarkerPanel(sub, scale) {
		    return $(go.Panel, "Horizontal",
		            { alignment: go.Spot.MiddleBottom, alignmentFocus: go.Spot.MiddleBottom },
		            $(go.Shape, "BpmnActivityLoop",
		              { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: ActivityMarkerStrokeWidth },
		              new go.Binding("visible", "isLoop")),
		            $(go.Shape, "BpmnActivityParallel",
		              { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: ActivityMarkerStrokeWidth },
		              new go.Binding("visible", "isParallel")),
		            $(go.Shape, "BpmnActivitySequential",
		              { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: ActivityMarkerStrokeWidth },
		              new go.Binding("visible", "isSequential")),
		            $(go.Shape, "BpmnActivityAdHoc",
		              { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: ActivityMarkerStrokeWidth },
		              new go.Binding("visible", "isAdHoc")),
		            $(go.Shape, "BpmnActivityCompensation",
		              { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: ActivityMarkerStrokeWidth, fill: null },
		              new go.Binding("visible", "isCompensation")),
		            makeSubButton(sub)
		          ); // end activity markers horizontal panel
		  }

		  var subflowNodeTemplate =
		  $(go.Node, "Spot", 
		     { locationObjectName: "SHAPE", locationSpot: go.Spot.Center,
		       resizable: true, resizeObjectName: "PANEL",
		       toolTip: tooltiptemplate,
		       selectionAdorned: false,  // use a Binding on the Shape.stroke to show selection
		       contextMenu: activityNodeMenu,
		       doubleClick: function(e, node) {toEditView(e,node,myDiagram)},
		       itemTemplate: boundaryEventItemTemplate
		     },
		     new go.Binding("itemArray", "boundaryEventArray"),
		     new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		     // move a selected part into the Foreground layer, so it isn"t obscured by any non-selected parts
		     new go.Binding("layerName", "isSelected", function(s) { return s ? "Foreground" : ""; }).ofObject(),
		    $(go.Panel, "Auto",
		      { name: "PANEL",
		          minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
		          desiredSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight)
		      },
		      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
		       $(go.Panel, "Spot",
		        $(go.Shape, "RoundedRectangle",  // the outside rounded rectangle
		          { name: "SHAPE",
		              fill: ActivityNodeFill, stroke: ActivityNodeStroke,
		            parameter1: 10, // corner size
		            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
		            fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
		          },
		          new go.Binding("fill", "color"),
		          new go.Binding("strokeWidth", "isCall",
		               function(s) { return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth; })
		         ),

		        // task icon
		        $(go.Shape, "BpmnTaskScript",    // will be None, Script, Manual, Service, etc via converter
		          { alignment: new go.Spot(0, 0, 5, 5), alignmentFocus: go.Spot.TopLeft,
		            width: 22, height: 22
		          },
		          new go.Binding("fill", "taskType", nodeActivityTaskTypeColorConverter),
		          new go.Binding("figure", "taskType", nodeActivityTaskTypeConverter)
		          ), // end Task Icon
		        makeMarkerPanel(false, 1) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
		        ),  // end main body rectangles spot panel
		        $(go.TextBlock,  // the center text
		        { alignment: go.Spot.Center,font: "10px Arial,sans-serif", textAlign: "left", 
		          editable: false,
		          font: "10px Arial,sans-serif",
		          margin: new go.Margin(0,0,6,0)
		        },
		        new go.Binding("text","desc").makeTwoWay()
		        ),
		      $(go.TextBlock,  // the center text
		        { alignment: go.Spot.Bottom, font: "10px Arial,sans-serif",textAlign: "center", margin: 4,
		    	  font: "10px Arial,sans-serif",
		          editable: false
		        },
		        new go.Binding("text").makeTwoWay()
		        )
		      )  // end Auto Panel
		    );  // end go.Node, which is a Spot Panel with bound itemArray

		  var activityNodeTemplate =
		  $(go.Node, "Spot",  
           	     { doubleClick: function(e, node) {toEditView(e,node,myDiagram)}},
           	     new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                 $(go.Panel,go.Panel.Auto,
                 	{desiredSize: new go.Size(200, NaN)},
                    $(go.Shape, "RoundedRectangle",
	                   {
	                   	  strokeWidth:1,
	            	      fill: "#9bdbfc",
	            	      stroke: '#4dc3ff',
	            	      parameter1: 4,  
		            portId: "", 
		            fromLinkable: true, 
		            toLinkable: true,
		             cursor: "pointer",
		            fromSpot: go.Spot.RightSide, 
		            toSpot: go.Spot.LeftSide
	            	   } ,
	            	   new go.Binding("fill", "",activityFillColorFn), 
        	           new go.Binding("stroke", "",activityStrokeColorFn) 
	                ),
	                $(go.Panel,"Horizontal",
	                    {
	                        alignment: go.Spot.Left,
                            margin: new go.Margin(0, 0, 0, 7),
	                    },
	                    $(go.Panel,"Auto",
	                        { margin: new go.Margin(0, 10, 0, 0)},
	                    	$(go.Shape, "RoundedRectangle",
			                   {
			                   	  strokeWidth:1,
			            	      fill:  $(go.Brush, "Linear", { 0: "#fefeff", 1: "#f6f7fa" }),
			            	      stroke: '#949ca6',
			            	      desiredSize: new go.Size(46, 46)
			            	   } 
			                ),
                            $(go.Picture,
		                    	{
		                    	  desiredSize: new go.Size(48,48)
		                    	 
		                    	},
		                    	 new go.Binding("source","",activityIconFn)	   
		                     )
	                    ),
                       
                       $(go.Panel,"Vertical",
                            $(go.TextBlock,   // the name
                             {
                                 
                                 font: "bold 12px Arial",
                                 editable: isDelNode, 
                                  alignment: go.Spot.Left,
                                 stroke:"#333",
                                 maxSize: new go.Size(160, NaN),
                                 wrap: go.TextBlock.WrapFit
                             },
                              new go.Binding("text", "nodeDisplay").makeTwoWay()
	                       ),
                           /* $(go.TextBlock,
	                            {
	                             
	                             editable: false,  
	                             font: "10px Arial",
	                             alignment: go.Spot.Left,
	                             stroke:"#333",
	                            },
	                           new go.Binding("text", "key",function(s){return "key:"+s}).makeTwoWay()
	                      ),*/
                            $(go.TextBlock,
	                            {
	                             row: 2,  
	                             editable: isDelNode,  
	                             font: "10px Arial",
	                            alignment: go.Spot.Left,
	                             stroke:"#333",
	                             maxSize: new go.Size(160, NaN),
	                             wrap: go.TextBlock.WrapFit
	                            },
	                           new go.Binding("text", "description").makeTwoWay()
	                        )
                       	)
	                )
                 )
		    )

		 


		  // ------------------------------- template for Activity / Task node in Palette  -------------------------------

		  var palscale = 2;
		  var activityNodeTemplateForPalette =
		  $(go.Node, "Spot",  
            $(go.Panel,go.Panel.Auto,
                    $(go.Shape, "RoundedRectangle",
	                  {
	            	    fill: "#dfe2eb",
	            	    strokeWidth:0,
	            	    desiredSize: new go.Size(86, 80) 
	            	  }
	                ),
	                $(go.Panel,"Vertical",
	                	$(go.Panel,"Auto",
	                	  $(go.Shape, "RoundedRectangle",
			                  {
			            	    fill:  $(go.Brush, "Linear", { 0: "#fff", 1: "#fbfbff" }),
			            	    strokeWidth:1,
			            	    stroke:"#949ca6",
			            	    desiredSize: new go.Size(42, 42)
			            	  },
			            	  new go.Binding("stroke",'',function(s){return s.flowcontroltype==9?"#949ca6":"#31cd5a"})
			                ),
			                $(go.Picture,
		                    	{
		                    	  desiredSize: new go.Size(44,44)
		                    	},
		                    	 new go.Binding("source",'',activityIconFn)   
		                    )
	                	),
                        $(go.TextBlock,
					        { 
					          alignment: go.Spot.Center, 
					          font: "10px Arial",
					          textAlign: "center", 
					          editable: false ,
					          maxSize: new go.Size(74, NaN),
					          margin: new go.Margin(5, 0, 0, 0),
			                   wrap: go.TextBlock.WrapFit
					        },
					        new go.Binding("text").makeTwoWay()
					     )
	                )
                )
		    )

		  var subProcessGroupTemplateForPalette =
		  $(go.Group, "Vertical",
		     { locationObjectName: "SHAPE",
		       locationSpot: go.Spot.Center,
		       isSubGraphExpanded: false,
		       selectionAdorned: false
		     },
		    $(go.Panel, "Spot",
		      { name: "PANEL",
		          desiredSize: new go.Size(ActivityNodeWidth / palscale, ActivityNodeHeight / palscale)
		      },
		      $(go.Shape, "RoundedRectangle",  // the outside rounded rectangle
		            { name: "SHAPE",
		                fill: ActivityNodeFill, stroke: ActivityNodeStroke,
		              parameter1: 10 / palscale  // corner size (default 10)
		            },
		              new go.Binding("strokeWidth", "isCall", function(s) { return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth; })
		          ),
		      $(go.Shape, "RoundedRectangle",  // the inner "Transaction" rounded rectangle
		        { margin: 3,
		          stretch: go.GraphObject.Fill,
		            stroke: ActivityNodeStroke,
		          parameter1: 8 / palscale, fill: null, visible: false
		        },
		        new go.Binding("visible", "isTransaction")),
		        makeMarkerPanel(true, palscale) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
		      ), // end main body rectangles spot panel
		      $(go.TextBlock,  // the center text
		        { alignment: go.Spot.Center, textAlign: "center",font: "10px Arial,sans-serif", margin: 2 },
		        new go.Binding("text"))
		    );  // end go.Group
		  
		  var customGroupTemplateForPalette =
			  $(go.Group, "Spot",            
			    $(go.Panel,go.Panel.Auto,
			        $(go.Shape, "RoundedRectangle",
			            { 
			             strokeWidth: 0,
			             fill: "#cbe6fa", 
			             desiredSize: new go.Size(96, 96)
			            },
			            new go.Binding("stroke", "color")
			        ),
			        $(go.Panel, "Vertical",  
			            $(go.TextBlock,   // the name
			                 {
		            	         font: "10px Arial",
		                         maxSize: new go.Size(74, NaN),
			                     wrap: go.TextBlock.WrapFit,
		                         stroke: "#666"
			                 },
			                 new go.Binding("text", "nodeDisplay").makeTwoWay()
			            ),     
			            $(go.Placeholder,{ padding: 5})
			        ) 
			     )
			  )

			    var customNodeTemplateForPalette =
			  $(go.Node, "Auto",    
			     $(go.Shape, "RoundedRectangle",
			            { 
			             fill: "#a4dffe", 
			             strokeWidth:0, 
			             desiredSize: new go.Size(74, 50)
			            }
			     ), 
			     $(go.TextBlock,   // the name
		               {
		        	       font: "10px Arial",
		                   margin: new go.Margin(0, 0, 2, 0),
		                   stroke: "#666",
		                   maxSize: new go.Size(70, NaN),
		                   wrap: go.TextBlock.WrapFit
		                },
		                new go.Binding("text", "nodeDisplay").makeTwoWay()
			    )        
			  )
			  
 

   /*var customNodeTemplate =
	   $(go.Node, "Spot",
			     { locationObjectName: "SHAPE", locationSpot: go.Spot.Center,
			       resizable: false, resizeObjectName: "PANEL",
			       toolTip: tooltiptemplate,
			       selectionAdorned: false,  // use a Binding on the Shape.stroke to show selection
			       contextMenu: activityNodeMenu,
			       itemTemplate: boundaryEventItemTemplate,
			       doubleClick: function(e, node) {toEditView(e,node,myDiagram)}
			     },
			     new go.Binding("itemArray", "boundaryEventArray"),
			     new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			     // move a selected part into the Foreground layer, so it isn"t obscured by any non-selected parts
			     new go.Binding("layerName", "isSelected", function(s) { return s ? "Foreground" : ""; }).ofObject(),
			    $(go.Panel, "Auto",
			      { name: "PANEL",
			          minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
			          desiredSize: new go.Size(200, 80)
			      },
			      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
			       $(go.Panel, "Spot",
			        $(go.Shape, "RoundedRectangle",  // the outside rounded rectangle
			          { name: "SHAPE",
			              fill: ActivityNodeFill, stroke: ActivityNodeStroke,
			            parameter1: 10, // corner size
			            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
			            fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
			          },
			          new go.Binding("fill", "color"),
			          new go.Binding("fill", "state", nodeBgColor),
			          new go.Binding("strokeWidth", "isCall",
			               function(s) { return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth; })
			         ),

			        $(go.Shape, "BpmnTaskScript",    // will be None, Script, Manual, Service, etc via converter
			          { alignment: new go.Spot(0, 0, 5, 5), alignmentFocus: go.Spot.TopLeft,
			            width: 22, height: 22
			          },
			          new go.Binding("fill", "taskType", nodeActivityTaskTypeColorConverter),
			          new go.Binding("figure", "taskType", nodeActivityTaskTypeConverter)
			          ), // end Task Icon
			        makeMarkerPanel(false, 1) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
			        ),  // end main body rectangles spot panel
			        $(go.Panel,"Horizontal",
		                    {alignment: go.Spot.Left},
		                    $(go.Picture,
		                    	{
		                    	  desiredSize: new go.Size(30, 30),
		                    	  margin: new go.Margin(0, 0, 0, 10)},
		                    	  new go.Binding("source")
		                    ),
		                    $(go.Panel,"Table",
		                         {
		                            maxSize: new go.Size(150, 999),
		                            margin: new go.Margin(0, 10, 0, 3),
		                            defaultAlignment: go.Spot.Left
		                         },
		                         $(go.RowColumnDefinition, { column: 2, width: 4 }),
		                         $(go.TextBlock,  // the center text
				        { alignment: go.Spot.Top, textAlign: "center", margin: 12,
				          editable: false
				        },
				        new go.Binding("text","textKey").makeTwoWay()),
		                         $(go.TextBlock,  // the center text
				        		{ alignment: go.Spot.Center, textAlign: "left", 
					          editable: false,
					          font: "10px Segoe UI,sans-serif",
					          margin: new go.Margin(12,0,6,0)
					        },
						        new go.Binding("text","des").makeTwoWay())
		                    )
		               ),
					        $(go.Panel, "Horizontal",
						             {
						         	   alignment: go.Spot.BottomRight, alignmentFocus: go.Spot.TopRight
						             },
				                     $(go.TextBlock,  // the center text
						 		        {
						 		          editable: false
						 		        },
						 		        new go.Binding("text","",insFn)
						 		     )
						        )
			      )  // end Auto Panel
			    );
*/
			  
			  
			  var customNodeTemplate =
	          $(go.Node, "Spot",
      {doubleClick: function(e, node) {toEditView(e,node,myDiagram)}},  
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel,go.Panel.Auto,
         	{desiredSize: new go.Size(235, 70)},
            $(go.Shape, "RoundedRectangle",
               {
               	  strokeWidth:1,
        	      fill: "#4dc3ff",
        	      stroke: '#33b9f6',
        	      parameter1: 4,  
                  portId: "", 
                  fromLinkable: true, 
                  toLinkable: true,
                  cursor: "pointer",
                  fromSpot: go.Spot.RightSide, 
                  toSpot: go.Spot.LeftSide
        	   },
        	   new go.Binding("fill","state",nodeBgColor) 
            ),
            $(go.Panel,"Horizontal",
                {
                    alignment: go.Spot.Left,
                    margin: new go.Margin(0, 0, 0, 7),
                },
               $(go.Picture,
                	{
                	  desiredSize: new go.Size(55,55),
                	  margin: new go.Margin(0, 10, 0, 0)
                	},
                	new go.Binding("source")	   
               ),
               $(go.Panel,"Vertical",
                    $(go.TextBlock,   // the name
                     { 
                         font: "bold 12px Arial",
                         editable: false, 
                         alignment: go.Spot.Left,
                         stroke:"#fff"
                     },
                      new go.Binding("text", "nodeDisplay").makeTwoWay()
                   ),
                   /*$(go.TextBlock,
                        {
                         
                         editable: false,  
                         font: "10px Arial",
                         alignment: go.Spot.Left,
                         stroke:"#fff"
                        },
                       new go.Binding("text", "key",function(s){return "key:"+s}).makeTwoWay()
                  ),*/
                  $(go.TextBlock,
                       {
                         editable: false,  
                         font: "10px Arial",
                         alignment: go.Spot.Left,
                         stroke:"#fff"
                        },
                       new go.Binding("text", "des").makeTwoWay()
                   ),
                  $(go.TextBlock,  // label
			            { 
			    	       editable: false,  
                           font: "10px Arial",
                           alignment: go.Spot.Left,
                           stroke:"#fff"
	    			    },
			            new go.Binding("text","desc").makeTwoWay()
				   )
               	)
            )
         )
       )

		  //------------------------------------------  Event Node Template  ----------------------------------------------
          
		  var eventNodeTemplateForPalette =
			    $(go.Node, "Spot",  
                $(go.Panel,go.Panel.Auto,
                    $(go.Shape, "RoundedRectangle",
	                  {
	            	    fill: "#dfe2eb",
	            	    strokeWidth:0,
	            	    desiredSize: new go.Size(86, 70)
	            	  }
	                ),
	                $(go.Panel,"Vertical",
                        $(go.Panel, "Spot",
			                $(go.Shape, "Circle",  // Outer circle
					            { 
					              strokeWidth: 1,
					        	  fill:"#fff",
					              stroke:"#42bff8",
					              desiredSize: new go.Size(42, 42)
					            }
			                ),  
			                $(go.Shape, "Circle",  // Inner circle
				               { 
				              	 alignment: go.Spot.Center,
				                 desiredSize: new go.Size(34, 34), 
				                 strokeWidth: 2,
				                 stroke:"#42bff8",
				                 fill: null 
				               } 
			                ),
			                $(go.TextBlock,
					           { 
					          	 alignment: go.Spot.Center, 
					          	 font: "9px Arial",
					          	 stroke: "#38bbf7",
					          	 textAlign: "center" 
					           },
					           new go.Binding("text", "flowcontroltype",function(s){return s==1?"START":"END"})
					        )
			            ),
                        $(go.TextBlock,
					        { 
					          alignment: go.Spot.Center, 
					          font: "10px Arial",
					          textAlign: "center", 
					          margin: new go.Margin(5, 0, 0, 0)
					        },
					        new go.Binding("text").makeTwoWay()
					     )
	                )
                )
		    )
		  
		  var eventNodeTemplate =
		   $(go.Node, "Spot",  
          	{doubleClick: function(e, node) {toEditView(e,node,myDiagram)}},
          	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          $(go.Panel,"Vertical",
             $(go.Panel, "Spot",
	               $(go.Shape, "Circle",  // Outer circle
			            { 
			              strokeWidth: 1,
			        	  fill:"#fff",
			              stroke:"#42bff8",
			              desiredSize: new go.Size(62, 62),
			              portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
			              fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
			            },
	                    new go.Binding("fill", "state", nodeBgColor),
	                    new go.Binding("stroke", "state", function(val){return val?"#fff":"#42bff8"})
	                ),  
	                $(go.Shape, "Circle",  // Inner circle
		               { 
		              	 alignment: go.Spot.Center,
		                 desiredSize: new go.Size(50, 50), 
		                 strokeWidth: 2,
		                 stroke:"#42bff8",
		                 fill: null 
		               },
		                new go.Binding("stroke", "state", function(val){return val?"#fff":"#42bff8"}) 
	                ),
	                $(go.TextBlock,
			           { 
			          	 alignment: go.Spot.Center, 
			          	 font: "12px Arial",
			          	 stroke: "#38bbf7",
			          	 textAlign: "center",
			          	 editable: false 
			           },
			           new go.Binding("stroke", "state", function(val){return val?"#fff":"#38bbf7"}),
			           new go.Binding("text", "flowcontroltype",function(s){return s==1?"START":"END"})
                    )
			 )
	       )
		 )

		  //------------------------------------------  Gateway Node Template   ----------------------------------------------
		
		  function nodeGatewaySymbolTypeConverter(s) {
		    var tasks =  ["NotAllowed",
		                  "ThinCross",      // 1 - Parallel
		                  "Circle",         // 2 - Inclusive
		                  "AsteriskLine",   // 3 - Complex
		                  "ThinX",          // 4 - Exclusive  (exclusive can also be no symbol, just bind to visible=false for no symbol)
		                  "Pentagon",       // 5 - double cicle event based gateway
		                  "Pentagon",       // 6 - exclusive event gateway to start a process (single circle)
		                  "ThickCross"]     // 7 - parallel event gateway to start a process (single circle)
		    if (s < tasks.length) return tasks[s];
		    return "NotAllowed"; // error
		  }

		  // tweak the size of some of the gateway icons
		  function nodeGatewaySymbolSizeConverter(s) {
		    var size = new go.Size(GatewayNodeSymbolSize, GatewayNodeSymbolSize);
		    if (s === 4) {
		      size.width = size.width / 4 * 3;
		      size.height = size.height / 4 * 3;
		    }
		    else if (s > 4) {
		      size.width = size.width / 1.6;
		      size.height = size.height / 1.6;
		    }
		    return size;
		  }
		  function nodePalGatewaySymbolSizeConverter(s) {
		    var size = nodeGatewaySymbolSizeConverter(s);
		    size.width = size.width / 2;
		    size.height = size.height / 2;
		    return size;
		  }

		  var gatewayNodeTemplate =
		    $(go.Node, "Spot",  
         	{doubleClick: function(e, node) {toEditView(e,node,myDiagram)}},
         	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
         $(go.Panel, "Auto",
		        $(go.Shape, "Hexagon",  
		            { 
		            	strokeWidth: 1,
		        	    fill:"#fff",
		                name: "SHAPE",
		                stroke:"#42bff8",
		                desiredSize: new go.Size(62, 62),
		                portId: "", 
		                fromLinkable: true, 
		                toLinkable: true, 
		                cursor: "pointer",
		                fromSpot: go.Spot.BottomSide, 
		                toSpot: go.Spot.TopSide
		            },
		            new go.Binding("stroke", "",HexagonStrokeColorFn),
		            new go.Binding("fill", "", HexagonFillColorFn)
		        ),  
               $(go.Picture,
                	{ 
                	    desiredSize: new go.Size(34, 34)
                    },
                    new go.Binding("source","flowcontroltype",iconTypeFn)
			    )
		  )
	    )
		  //--------------------------------------------------------------------------------------------------------------

		  var gatewayNodeTemplateForPalette =
		    $(go.Node, "Spot",  
            $(go.Panel,go.Panel.Auto,
                    $(go.Shape, "RoundedRectangle",
	                  {
	            	    fill: "#dfe2eb",
	            	    strokeWidth:0,
	            	    desiredSize: new go.Size(86, 70)
	            	  }
	                ),
	                $(go.Panel,"Vertical",
                        $(go.Panel, "Spot",
					        $(go.Shape, "Hexagon",  
					            { 
					            	strokeWidth: 1,
					        	    fill:"#fff",
					                name: "SHAPE",
					                stroke:"#42bff8",
					                desiredSize: new go.Size(42, 42)
					            },
					            new go.Binding("stroke", "",HexagonStrokeColorFn),
					            new go.Binding("fill", "", HexagonFillColorFn)
					        ),  
                           $(go.Picture,
		                    	{ 
		                    	    desiredSize: new go.Size(20, 20)
	                            },
		                        new go.Binding("source","flowcontroltype",iconTypeFn)
						    )
			            ),
                        $(go.TextBlock,
					        { 
					          alignment: go.Spot.Center, 
					          font: "10px Arial",
					          textAlign: "center", 
					          margin: new go.Margin(5, 0, 0, 0) 
					        },
					        new go.Binding("text").makeTwoWay()
					     )
	                )
                )
		    )

		  //--------------------------------------------------------------------------------------------------------------

		  var annotationNodeTemplate =
		    $(go.Node, "Auto",
		      { background: GradientLightGray, locationSpot: go.Spot.Center },
		      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		      $(go.Shape, "Annotation", // A left bracket shape
		        { portId: "", fromLinkable: true, cursor: "pointer", fromSpot: go.Spot.Left, strokeWidth: 2, stroke: "gray" }),
		      $(go.TextBlock,
		        { margin: 5, editable: false },
		        new go.Binding("text").makeTwoWay())
		    );

		  var dataObjectNodeTemplate =
		    $(go.Node, "Vertical", 
		      { locationObjectName: "SHAPE", locationSpot: go.Spot.Center},
		      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		      $(go.Shape, "File",
		        { name: "SHAPE", portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
		          fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize)}),
		      $(go.TextBlock,
		        { margin: 5,
		    	  font: "10px Arial,sans-serif",
		          editable: false },
		          new go.Binding("text").makeTwoWay())
		    );

		  var dataStoreNodeTemplate =
		    $(go.Node, "Vertical", 
		      { locationObjectName: "SHAPE", locationSpot: go.Spot.Center},
		      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		      $(go.Shape, "Database",
		        { name: "SHAPE", portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
		          fill: DataFill, desiredSize: new go.Size(EventNodeSize, EventNodeSize) }),
		      $(go.TextBlock,
		        { margin: 5,font: "10px Arial,sans-serif", editable: false },
		        new go.Binding("text").makeTwoWay())
		    );

		  //------------------------------------------  private process Node Template Map   ----------------------------------------------

		  var privateProcessNodeTemplate =
		    $(go.Node, "Auto", 
		      { layerName: "Background", resizable: true, resizeObjectName: "LANE"},
		      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		      $(go.Shape, "Rectangle",
		        { fill: null }),
		      $(go.Panel, "Table",     // table with 2 cells to hold header and lane
		        { desiredSize: new go.Size(ActivityNodeWidth * 6, ActivityNodeHeight),
		          background: DataFill, name: "LANE", minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight * 0.667)
		        },
		        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
		        $(go.TextBlock,
		          { font: "10px Arial,sans-serif",row: 0, column: 0,
		            angle: 270, margin: 5,
		            editable: false, textAlign: "center"
		          },
		          new go.Binding("text").makeTwoWay()),
		        $(go.RowColumnDefinition, { column: 1, separatorStrokeWidth: 1, separatorStroke: "black" }),
		        $(go.Shape, "Rectangle",
		          { row: 0, column: 1,
		            stroke: null, fill: "transparent",
		            portId: "", fromLinkable: true, toLinkable: true,
		            fromSpot: go.Spot.TopBottomSides, toSpot: go.Spot.TopBottomSides,
		            cursor: "pointer", stretch: go.GraphObject.Fill })
		       )
		    );

		  var privateProcessNodeTemplateForPalette =
		    $(go.Node, "Vertical",
		      { locationSpot: go.Spot.Center },
		      $(go.Shape, "Process",
		        { fill: DataFill, desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 4) }),
		      $(go.TextBlock,
		        { margin: 5, font: "10px Arial,sans-serif",editable: false },
		        new go.Binding("text"))
		    );

		  var poolTemplateForPalette =
		    $(go.Group, "Vertical",
		      { locationSpot: go.Spot.Center,
		        isSubGraphExpanded: false
		      },
		      $(go.Shape, "Process",
		        { fill: "white", desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 4) }),
		      $(go.Shape, "Process",
		        { fill: "white", desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 4) }),
		      $(go.TextBlock,
		        { margin: 5, font: "10px Arial,sans-serif",editable: false },
		        new go.Binding("text"))
		    );

		  var swimLanesGroupTemplateForPalette =
		    $(go.Group, "Vertical" ); // empty in the palette

		  var subProcessGroupTemplate =
		    $(go.Group, "Spot",
		      { locationSpot: go.Spot.Center,
		        locationObjectName: "PH",
		        resizable: true, resizeObjectName: "PH",
		        //locationSpot: go.Spot.Center,
		        isSubGraphExpanded: false,
		        memberValidation: function(group, part) {
		          return !(part instanceof go.Group) ||
		                 (part.category !== "Pool" && part.category !== "Lane");
		        },
		        mouseDrop: function(e, grp) {
		          var ok = grp.addMembers(grp.diagram.selection, true);
		          if (!ok) grp.diagram.currentTool.doCancel();
		        },
		        contextMenu: activityNodeMenu,
		        itemTemplate: boundaryEventItemTemplate
		      },
		      new go.Binding("itemArray", "boundaryEventArray"),
		      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		      // move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
		      // new go.Binding("layerName", "isSelected", function (s) { return s ? "Foreground" : ""; }).ofObject(),
		      $(go.Panel, "Auto",
		        $(go.Shape, "RoundedRectangle",
		            {
		              name: "PH", fill: SubprocessNodeFill, stroke: SubprocessNodeStroke,
		              minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
		              portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
		              fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
		            },
		            new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
		            new go.Binding("strokeWidth", "isCall", function(s) { return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth; })
		           ),
		          $(go.Panel, "Vertical",
		            { defaultAlignment: go.Spot.Left },
		            $(go.TextBlock,  // label
		              { font: "10px Arial,sans-serif",margin: 3, editable: false },
		              new go.Binding("text", "text").makeTwoWay(),
		              new go.Binding("alignment", "isSubGraphExpanded", function(s) { return s ? go.Spot.TopLeft : go.Spot.Center; })),
		            // create a placeholder to represent the area where the contents of the group are
		            $(go.Placeholder,
		              { padding: new go.Margin(5, 5) }),
		            makeMarkerPanel(true, 1)  // sub-process,  loop, parallel, sequential, ad doc and compensation markers
		          )  // end Vertical Panel
		        )
		      );  // end Group
		  
		  
		  /*var customGroupTemplate =
			    $(go.Group, "Spot",
			      { locationSpot: go.Spot.Center,
			        locationObjectName: "PH",
			        resizable: true, resizeObjectName: "PH",
			        //locationSpot: go.Spot.Center,
			        isSubGraphExpanded: true,
			        memberValidation: function(group, part) {
			          return !(part instanceof go.Group) ||
			                 (part.category !== "Pool" && part.category !== "Lane"&& part.category !== "custom");
			        },
			        mouseDrop: function(e, grp) {
			          if(e.diagram.selection.Da.key.data.flowcontroltype==10){
			        	  grp.diagram.currentTool.doCancel();
			        	  return false;
			          }
			          var ok = grp.addMembers(grp.diagram.selection, true);
			          if (!ok) grp.diagram.currentTool.doCancel();
			        },
			        contextMenu: activityNodeMenu,
			        itemTemplate: boundaryEventItemTemplate
			      },
			      new go.Binding("itemArray", "boundaryEventArray"),
			      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			      // move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
			      // new go.Binding("layerName", "isSelected", function (s) { return s ? "Foreground" : ""; }).ofObject(),
			      $(go.Panel, "Auto",
			        $(go.Shape, "RoundedRectangle",
			            {
			              name: "PH", fill: SubprocessNodeFill, stroke: SubprocessNodeStroke,
			              minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
			              portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
			              fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
			            },
			            new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
			            new go.Binding("strokeWidth", "isCall", function(s) { return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth; }),
			            new go.Binding("fill", "state", nodeBgColor)
			           ),
			          $(go.Panel, "Vertical",
			            { defaultAlignment: go.Spot.Left },
			            $(go.TextBlock,  // label
			              { margin: 3, editable: false },
			              new go.Binding("text", "textKey").makeTwoWay(),
			              new go.Binding("alignment", "isSubGraphExpanded", function(s) { return s ? go.Spot.TopLeft : go.Spot.Center; })),
			            new go.Binding("background", "color"),   
			            $(go.Panel,"Horizontal",
			                        {alignment: go.Spot.Left},
			                        $(go.Picture,
		                            	{desiredSize: new go.Size(30, 30),
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
			                             $(go.TextBlock,  // label
					              { margin: 3, editable: false },
					              new go.Binding("text", "textKey").makeTwoWay(),
					              new go.Binding("alignment", "isSubGraphExpanded", function(s) { return s ? go.Spot.TopLeft : go.Spot.Center; })) 
			                            )
			                          ),
			            // create a placeholder to represent the area where the contents of the group are
			            $(go.Placeholder,
			              { padding: new go.Margin(10, 10) }),
			            makeMarkerPanel(true, 1),  // sub-process,  loop, parallel, sequential, ad doc and compensation markers
			            $(go.Panel, "Horizontal",
					             {
					         	   alignment: go.Spot.TopRight, alignmentFocus: go.Spot.TopRight
					             },
			                     $(go.TextBlock,  // the center text
					 		        {
					 		          editable: false
					 		        },
					 		        new go.Binding("text","",insFn)
					 		     )

					        )
			          )  // end Vertical Panel
			        )
			      ); */ // end Group
		  
		  var customGroupTemplate =
		  $(go.Group, "Spot", 
            { 
			   isSubGraphExpanded: true,
			   mouseDragEnter: function(e, grp, prev) {highlightGroup(e, grp, true); },
		       mouseDragLeave: function(e, grp, next) {highlightGroup(e, grp, false); },
			   mouseDrop: function(e, grp) {
		           if(e.diagram.selection.Da.key.data.flowcontroltype==10){
			        	    grp.diagram.currentTool.doCancel();
			        	    return false;
			            }
			            var ok = grp.addMembers(grp.diagram.selection, true);
			            if (!ok) grp.diagram.currentTool.doCancel();
			   },
			   doubleClick: function(e, node) {toEditView(e,node,myDiagram)}
			},
			new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			$(go.Panel, "Auto",
                 $(go.Shape, "Rectangle",
			            {
			              minSize: new go.Size(120, 80),
			              portId: "", 
			              fromLinkable: true, 
			              toLinkable: true, 
			              cursor: "pointer",
			              fromSpot: go.Spot.RightSide, 
			              toSpot: go.Spot.LeftSide,
			              strokeWidth:4,
			              stroke:"#ff916c"
			            },
			            new go.Binding("fill", "isHighlighted", function(h) { return h ? "#f9cff5" : "#fff"; }).ofObject(),
			            new go.Binding("stroke", "color")
			      ),
                 $(go.Panel, "Vertical",
                       $(go.Panel, "Horizontal",
                       	      { 
			                	 stretch: go.GraphObject.Horizontal, 
			                	 background: "#ff916c",
			                	 padding:5,
			                	 margin: 2
			                   },
			                   new go.Binding("background","state",nodeBgColor),
                             $(go.Picture,
	                              {
				    			      desiredSize: new go.Size(60, 60),
				    			      margin: new go.Margin(0, 5, 0, 0)
				    		      },
	                              new go.Binding("source")
				              ),
                             $(go.Panel,"Vertical",
                                 $(go.TextBlock,  // label
	  						            { 
	  						               font: "12px Arial",
	  						               stroke:"#fff",
	  				    			       editable: false 
	  				    			    },
	  						            new go.Binding("text","nodeDisplay").makeTwoWay(),
	  						            new go.Binding("alignment", "isSubGraphExpanded", function(s) { return s ? go.Spot.TopLeft : go.Spot.Center; })
	  						      ),
	  						      /*$(go.TextBlock,  // label
	  						            { 
	  						               font: "10px Arial",
	  				    			       editable: false ,
	  				    			       stroke:"#fff",
	  				    			       alignment: go.Spot.Left
	  				    			    },
	  						            new go.Binding("text","key",function(s){return "key:"+s}).makeTwoWay(),
	  						            new go.Binding("alignment", "isSubGraphExpanded", function(s) { return s ? go.Spot.TopLeft : go.Spot.Center; })
	  							   ),*/
	  							   $(go.TextBlock,  // label
	  						            { 
	  						               font: "10px Arial",
	  				    			       editable: false ,
	  				    			       stroke:"#fff",
	  				    			       alignment: go.Spot.Left
	  				    			    },
	  						            new go.Binding("text","des").makeTwoWay()
	  						           
	  							   ) 
                             )
                       	),
                       $(go.Placeholder,
				              { padding: new go.Margin(10, 10) }
				        ),
                       makeMarkerPanel(true, 1)
                 )
			 )
		  )
		    

		  function groupStyle() {  // common settings for both Lane and Pool Groups
		      return [
		        {
		            layerName: "Background",  // all pools and lanes are always behind all nodes and links
		            background: "transparent",  // can grab anywhere in bounds
		            movable: true, // allows users to re-order by dragging
		            copyable: false,  // can't copy lanes or pools
		            avoidable: false  // don't impede AvoidsNodes routed Links
		        },
		        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
		      ];
		  }

		    // hide links between lanes when either lane is collapsed
		  function updateCrossLaneLinks(group) {
		    group.findExternalLinksConnected().each(function(l) {
		          l.visible = (l.fromNode.isVisible() && l.toNode.isVisible());
		      });
		  }
		 
		  var laneEventMenu =  // context menu for each lane
		  $(go.Adornment, "Vertical",
		    $("ContextMenuButton",
		      $(go.TextBlock, "Add Lane"),
		      // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
		        {click: function(e, obj) { addLaneEvent(obj.part.adornedObject); } })
		   );

		    // Add a lane to pool (lane parameter is lane above new lane)
		  function addLaneEvent(lane) {
		      myDiagram.startTransaction("addLane");
		      if (lane != null && lane.data.category === "Lane") {
		          // create a new lane data object
		          var shape = lane.findObject("SHAPE");
		          var size = new go.Size(shape.width, MINBREADTH);
		          //size.height = MINBREADTH;
		          var newlanedata = {
		              category: "Lane",
		              text: "New Lane",
		              color: "white",
		              isGroup: true,
		              loc: go.Point.stringify(new go.Point(lane.location.x, lane.location.y + 1)), // place below selection
		              size: go.Size.stringify(size),
		              group: lane.data.group
		          };
		          // and add it to the model
		          myDiagram.model.addNodeData(newlanedata);
		      }
		      myDiagram.commitTransaction("addLane");
		  }

		  var swimLanesGroupTemplate =
		  $(go.Group, "Spot", groupStyle(),
		    {
		        name: "Lane",
		        contextMenu: laneEventMenu,
		        minLocation: new go.Point(NaN, -Infinity),  // only allow vertical movement
		        maxLocation: new go.Point(NaN, Infinity),
		        selectionObjectName: "SHAPE",  // selecting a lane causes the body of the lane to be highlit, not the label
		        resizable: true, resizeObjectName: "SHAPE",  // the custom resizeAdornmentTemplate only permits two kinds of resizing
		        layout: $(go.LayeredDigraphLayout,  // automatically lay out the lane's subgraph
		                  {
		                      isInitial: false,  // don't even do initial layout
		                      isOngoing: false,  // don't invalidate layout when nodes or links are added or removed
		                      direction: 0,
		                      columnSpacing: 10,
		                      layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
		                  }),
		        computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
		        computesBoundsIncludingLinks: false,  // to reduce occurrences of links going briefly outside the lane
		        computesBoundsIncludingLocation: true,  // to support empty space at top-left corner of lane
		        handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
		        mouseDrop: function(e, grp) {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
		            // don't allow drag-and-dropping a mix of regular Nodes and Groups
		          if (!e.diagram.selection.any(function(n) { return (n instanceof go.Group && n.category !== "subprocess") || (n instanceof go.Group && n.category !== "custom") || n.category === "privateProcess"; })) {
		                var ok = grp.addMembers(grp.diagram.selection, true);
		                if (ok) {
		                    updateCrossLaneLinks(grp);
		                    relayoutDiagram();
		                } else {
		                    grp.diagram.currentTool.doCancel();
		                }
		            }
		        },
		        subGraphExpandedChanged: function(grp) {
		            var shp = grp.resizeObject;
		            if (grp.diagram.undoManager.isUndoingRedoing) return;
		            if (grp.isSubGraphExpanded) {
		                shp.height = grp._savedBreadth;
		            } else {
		                grp._savedBreadth = shp.height;
		                shp.height = NaN;
		            }
		            updateCrossLaneLinks(grp);
		        }
		    },
		    //new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),

		    $(go.Shape, "Rectangle",  // this is the resized object
		        {name: "SHAPE", fill: "white", stroke: null },  // need stroke null here or you gray out some of pool border.
		      new go.Binding("fill", "color"),
		      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),

		   // the lane header consisting of a Shape and a TextBlock
		      $(go.Panel, "Horizontal",
		      {
		          name: "HEADER",
		          angle: 270,  // maybe rotate the header to read sideways going up
		          alignment: go.Spot.LeftCenter, alignmentFocus: go.Spot.LeftCenter
		      },
		        $(go.TextBlock,  // the lane label
		          {editable: false, font: "10px Arial,sans-serif",margin: new go.Margin(2, 0, 0, 8) },
		          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
		          new go.Binding("text", "text").makeTwoWay()),
		        $("SubGraphExpanderButton", { margin: 4, angle: -270 })  // but this remains always visible!
		       ),  // end Horizontal Panel
		      $(go.Placeholder,
		        { padding: 12, alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft }),
		    $(go.Panel, "Horizontal", { alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft },
		      $(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
		        {
		            name: "LABEL",font: "10px Arial,sans-serif",
		            editable: false, visible: false,
		            angle: 0, margin: new go.Margin(6, 0, 0, 20)
		        },
		          new go.Binding("visible", "isSubGraphExpanded", function(e) { return !e; }).ofObject(),
		        new go.Binding("text", "text").makeTwoWay())
		     )
		  );  // end swimLanesGroupTemplate

		    // define a custom resize adornment that has two resize handles if the group is expanded
		    //myDiagram.groupTemplate.resizeAdornmentTemplate =
		  swimLanesGroupTemplate.resizeAdornmentTemplate =
		    $(go.Adornment, "Spot", 
		      $(go.Placeholder),
		      $(go.Shape,  // for changing the length of a lane
		        {
		            alignment: go.Spot.Right,
		            desiredSize: new go.Size(7, 50),
		            fill: "lightblue", stroke: "dodgerblue",
		            cursor: "col-resize"
		        },
		        new go.Binding("visible", "", function(ad) { return ad.adornedPart.isSubGraphExpanded; }).ofObject()),
		      $(go.Shape,  // for changing the breadth of a lane
		        {
		            alignment: go.Spot.Bottom,
		            desiredSize: new go.Size(50, 7),
		            fill: "lightblue", stroke: "dodgerblue",
		            cursor: "row-resize"
		        },
		        new go.Binding("visible", "", function(ad) { return ad.adornedPart.isSubGraphExpanded; }).ofObject())
		    );

		 var poolGroupTemplate =
		    $(go.Group, "Auto", groupStyle(),
		      { // use a simple layout that ignores links to stack the "lane" Groups on top of each other
		          layout: $(PoolLayout, { spacing: new go.Size(0, 0) })  // no space between lanes
		      },
		      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		      $(go.Shape,
		        { fill: "white" },
		        new go.Binding("fill", "color")),
		      $(go.Panel, "Table",
		        { defaultColumnSeparatorStroke: "black" },
		        $(go.Panel, "Horizontal",
		          { column: 0, angle: 270 },
		          $(go.TextBlock,
		            { editable: false,font: "10px Arial,sans-serif", margin: new go.Margin(5, 0, 5, 0) },  // margin matches private process (black box pool)
		            new go.Binding("text").makeTwoWay())
		        ),
		        $(go.Placeholder,
		          { background: "darkgray", column: 1 })
		      )
		    ); // end poolGroupTemplate

		  //------------------------------------------  Template Maps  ----------------------------------------------

		  // create the nodeTemplateMap, holding main view node templates:
		  var nodeTemplateMap = new go.Map("string", go.Node);
		  // for each of the node categories, specify which template to use
		   nodeTemplateMap.add("subflow", subflowNodeTemplate);
		  nodeTemplateMap.add("activity", activityNodeTemplate);
		  nodeTemplateMap.add("event", eventNodeTemplate);
		  nodeTemplateMap.add("gateway", gatewayNodeTemplate);
		  nodeTemplateMap.add("annotation", annotationNodeTemplate);
		  nodeTemplateMap.add("dataobject", dataObjectNodeTemplate);
		  nodeTemplateMap.add("datastore", dataStoreNodeTemplate);
		  nodeTemplateMap.add("privateProcess", privateProcessNodeTemplate);
		  nodeTemplateMap.add("custom", customNodeTemplate);
		  // for the default category, "", use the same template that Diagrams use by default
		  // this just shows the key value as a simple TextBlock

		  var groupTemplateMap = new go.Map("string", go.Group);
		  groupTemplateMap.add("subprocess", subProcessGroupTemplate);
		  groupTemplateMap.add("Lane", swimLanesGroupTemplate);
		  groupTemplateMap.add("Pool", poolGroupTemplate);
		  groupTemplateMap.add("custom", customGroupTemplate);

		  // create the nodeTemplateMap, holding special palette "mini" node templates:
		  var palNodeTemplateMap = new go.Map("string", go.Node);
		  palNodeTemplateMap.add("subflow", activityNodeTemplateForPalette);
		  palNodeTemplateMap.add("activity", activityNodeTemplateForPalette);
		  palNodeTemplateMap.add("event", eventNodeTemplateForPalette);
		  palNodeTemplateMap.add("gateway", gatewayNodeTemplateForPalette);
		  palNodeTemplateMap.add("annotation", annotationNodeTemplate);
		  palNodeTemplateMap.add("dataobject", dataObjectNodeTemplate);
		  palNodeTemplateMap.add("datastore", dataStoreNodeTemplate);
		  palNodeTemplateMap.add("privateProcess", privateProcessNodeTemplateForPalette);
		  palNodeTemplateMap.add("custom", customNodeTemplateForPalette);

		  var palGroupTemplateMap = new go.Map("string", go.Group);
		  palGroupTemplateMap.add("subprocess", subProcessGroupTemplateForPalette);
		  palGroupTemplateMap.add("Pool", poolTemplateForPalette);
		  palGroupTemplateMap.add("Lane", swimLanesGroupTemplateForPalette);
		  palGroupTemplateMap.add("custom", customGroupTemplateForPalette);


		  //------------------------------------------  Link Templates   ----------------------------------------------

		  var sequenceLinkTemplate =
		    $(go.Link, 
		      { contextMenu:
		          $(go.Adornment, "Vertical"),
		           routing: go.Link.AvoidsNodes, 
		           curve: go.Link.JumpGap,
		            corner: 10,
		           //fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
		           reshapable: true, relinkableFrom: true, relinkableTo: true, toEndSegmentLength: 20
		      },
		      new go.Binding("points").makeTwoWay(),
		      $(go.Shape, { stroke: "#8191a7", strokeWidth: 2 }/*,new go.Binding("stroke", "state", nodeBgColor)*/),
		      $(go.Shape, { toArrow: "Triangle", scale: 1.2, fill: "#8191a7", stroke: null }/*,new go.Binding("stroke", "state", nodeBgColor)*/),
 
		      $(go.TextBlock, { // this is a Link label
		        name: "Label",font: "10px Arial", editable: isDelNode, text: "true", segmentOffset: new go.Point(-10, -10), visible: false
		        },
		        new go.Binding("text", "text").makeTwoWay(),
		        new go.Binding("visible", "visible").makeTwoWay())
		   );

		  // set Default Sequence Flow (backslash From Arrow)
		  function setSequenceLinkDefaultFlow(obj) {
		
		    myDiagram.startTransaction("setSequenceLinkDefaultFlow");
		    var model = myDiagram.model;
		    model.setDataProperty(obj.data, "isDefault", true);
		    // Set all other links from the fromNode to be isDefault=null
		    obj.fromNode.findLinksOutOf().each(function(link) {
		      if (link !== obj && link.data.isDefault) {
		        model.setDataProperty(link.data, "isDefault", null);
		      }
		    });
		    myDiagram.commitTransaction("setSequenceLinkDefaultFlow");
		  }

		  // set Conditional Sequence Flow (diamond From Arrow)
		  function setSequenceLinkConditionalFlow(obj) {

		    myDiagram.startTransaction("setSequenceLinkConditionalFlow");
		    var model = myDiagram.model;
		    model.setDataProperty(obj.data, "isDefault", false);
		    myDiagram.commitTransaction("setSequenceLinkConditionalFlow");
		  }
		  
		  var messageFlowLinkTemplate =
		     $(PoolLink, // defined in BPMNClasses.js
		       { routing: go.Link.Orthogonal, curve: go.Link.JumpGap, corner: 10,
		         fromSpot: go.Spot.TopBottomSides , toSpot: go.Spot.TopBottomSides,
		         reshapable: true, relinkableTo: true, toEndSegmentLength: 20 },
		       new go.Binding("points").makeTwoWay(),
		       $(go.Shape, { stroke: "black", strokeWidth: 1, strokeDashArray: [6, 2] },new go.Binding("stroke", "state", nodeBgColor)),
		       $(go.Shape, { toArrow: "Triangle", scale: 1, fill: "white", stroke: "black" },new go.Binding("stroke", "state", nodeBgColor)),
		       $(go.Shape, { fromArrow: "Circle", scale: 1, visible: true, stroke: "black", fill: "white" },new go.Binding("stroke", "state", nodeBgColor)),
		       $(go.TextBlock, {
		         editable: false, font: "10px Arial,sans-serif",text: "label"
		       }, // Link label
		       new go.Binding("text", "text").makeTwoWay())
		    );

		  var dataAssociationLinkTemplate =
		    $(go.Link,
		      { routing: go.Link.AvoidsNodes, curve: go.Link.JumpGap, corner: 10,
		        fromSpot: go.Spot.AllSides , toSpot: go.Spot.AllSides,
		        reshapable: true, relinkableFrom: true, relinkableTo: true },
		      new go.Binding("points").makeTwoWay(),
		      $(go.Shape, { stroke: "black", strokeWidth: 2, strokeDashArray: [1, 3] },new go.Binding("stroke", "state", nodeBgColor)),
		      $(go.Shape, { toArrow: "OpenTriangle", scale: 1, fill: null, stroke: "blue" })
		   );

		  var annotationAssociationLinkTemplate =
		    $(go.Link,
		      { reshapable: true, relinkableFrom: true, relinkableTo: true,
		        toSpot: go.Spot.AllSides,
		        toEndSegmentLength: 20, fromEndSegmentLength: 40 },
		      new go.Binding("points").makeTwoWay(),
		      $(go.Shape, { stroke: "black", strokeWidth: 1, strokeDashArray: [1, 3] },new go.Binding("stroke", "state", nodeBgColor)),
		      $(go.Shape, { toArrow: "OpenTriangle", scale: 1, stroke: "black" })
		   );   

		  var linkTemplateMap = new go.Map("string", go.Link);
		  linkTemplateMap.add("msg", messageFlowLinkTemplate);
		  linkTemplateMap.add("annotation", annotationAssociationLinkTemplate);
		  linkTemplateMap.add("data", dataAssociationLinkTemplate);
		  linkTemplateMap.add("", sequenceLinkTemplate);  // default


		  //------------------------------------------the main Diagram----------------------------------------------
		  
		  
		  window.myDiagram =
		    $(go.Diagram, "myDiagramDiv",
		      {
		        nodeTemplateMap: nodeTemplateMap,
		        linkTemplateMap: linkTemplateMap,
		        groupTemplateMap: groupTemplateMap,
                allowDelete:isDelNode,
    	        allowCopy:isDelNode,
    	        allowMove:isDelNode,
		        allowDrop: true,  // accept drops from palette
		        allowLink:isAllowLink,
		        commandHandler: new DrawCommandHandler(),  // defined in DrawCommandHandler.js
		        // default to having arrow keys move selected nodes
		        "commandHandler.arrowKeyBehavior": "move",

		        mouseDrop: function(e) {
		          // when the selection is dropped in the diagram's background,
		          // make sure the selected Parts no longer belong to any Group
		        	finishDrop(e, null);
		        },
		        linkingTool: new BPMNLinkingTool(), // defined in BPMNClasses.js
		        "SelectionMoved": relayoutDiagram,  // defined below
		        "SelectionCopied": relayoutDiagram
		      });
		  
	 
		  
		  function finishDrop(e, grp) {

			  if(e.diagram.selection.Da.key.data.flowcontroltype==0){
				  e.diagram.currentTool.doCancel();
			  }
			  
		        var ok = (grp !== null
		          ? grp.addMembers(grp.diagram.selection, true)
		          : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));

		        if (!ok){
		          e.diagram.currentTool.doCancel();
		          return;
		        };
		 
		   }
		  
		 
			 

		  myDiagram.toolManager.mouseDownTools.insertAt(0, new LaneResizingTool());

		  myDiagram.addDiagramListener("LinkDrawn", function(e) {
		 
		    if (e.subject.fromNode.category === "annotation") {
		      e.subject.category = "annotation"; // annotation association
		    } else if (e.subject.fromNode.category === "dataobject" || e.subject.toNode.category === "dataobject") {
		      e.subject.category = "data"; // data association
		    } else if (e.subject.fromNode.category === "datastore" || e.subject.toNode.category === "datastore") {
		      e.subject.category = "data"; // data association
		    }
		  });
		    
		//  uncomment this if you want a subprocess to expand on drop.  We decided we didn't like this behavior
		//  myDiagram.addDiagramListener("ExternalObjectsDropped", function(e) {
//		    // e.subject is the collection that was just dropped
//		    e.subject.each(function(part) {
//		        if (part instanceof go.Node && part.data.item === "end") {
//		          part.move(new go.Point(part.location.x  + 350, part.location.y))
//		        }
//		      });
//		    myDiagram.commandHandler.expandSubGraph();
		//  });

		  // change the title to indicate that the diagram has been modified
		  myDiagram.addDiagramListener("Modified", function(e) {
		   /* var currentFile = document.getElementById("currentFile");
		    var idx = currentFile.textContent.indexOf("*");
		    if (myDiagram.isModified) {
		      if (idx < 0) currentFile.textContent = currentFile.textContent + "*";
		    } else {
		      if (idx >= 0) currentFile.textContent = currentFile.textContent.substr(0, idx);
		    }*/
		  });

		 
		  //------------------------------------------  Palette   ----------------------------------------------

		    // Make sure the pipes are ordered by their key in the palette inventory
		    function keyCompare(a, b) {
		      var at = a.data.key;
		      var bt = b.data.key;
		      if (at < bt) return -1;
		      if (at > bt) return 1;
		      return 0;
		    }
		    
		    $scope.getPluginList=function(type,index,search){
		    	var pluginPromise=$http.get('/cloudui/ws/plugin/listPlugins'+'?v='+(new Date().getTime()),{
		    		params:{
		    			pageSize:0,
	 		            pageNum:0,
	 		            pluginName:search||'',
	 		            labelId:type  
		    		}
		    	}).success(function(data){
	 		          for(var i=0;i<data.rows.length;i++)
	 		          {
	 		               data.rows[i].category="activity";
	 		               data.rows[i].condition=true;
	 		               data.rows[i].flowcontroltype=9;
	 		               data.rows[i].text=data.rows[i].pluginName;
	 		               data.rows[i].nodeDisplay=data.rows[i].pluginName;
	 		               data.rows[i].textKey=data.rows[i].pluginName;
	 		               data.rows[i].taskType=8;
	 		               data.rows[i].eleType="plugin";
	 		               data.rows[i].color="#9ef5ee";
	 		               data.rows[i].ins=1;
	 		               data.rows[i].source="app/images/designer-icons/"+setPic.setPicFn(data.rows[i].text);
	 		          }
	 		         data.rows.push({
	                   	   type:type,
	                   	   index:index
	                   });
	 		    })	
	 		    return pluginPromise;
		    }
		    
		   // 搜素插件
			$scope.searchPlugin=function(type,index,search){
				$scope.getPluginList(type,index,search).then(function(res){
					$scope.resData=[];
		         	angular.forEach(res.data.rows,function(val,key){
		                if(val.pluginName){
		                    $scope.resData.push(val);
		                }
		         	 })
		            $scope['pluginModel'+index].model.nodeDataArray=$scope.resData;
				})
			}
			
			$scope.tempGroup=function(){
                 var tempPromise=$http.get('/cloudui/ws/blueprintconvert/getnewinfo_temp'+'?v='+(new Date().getTime()),{
                	 params:{
                		 bpName:$stateParams.templateName,
                		 resourceName:$scope.searchval||''
                	 }
                 }).success(function(data){
	 		          var data=data.nodeDataArray;
		 		         
	 		           for(var i=0;i<data.length;i++)
	 		          {
	 		        	  data[i].taskType=0;
	 		        	  data[i].eleType="flowcontrol";
	 		        	  data[i].textKey=data[i].text;
	 		        	  
	 		        	  
	 		        	  data[i].ins=1;
	 		        	  data[i].source="app/images/designer-icons/"+setPic.setPicFn(data[i].text);
	 		              if(data[i].isGroup){
	 		            	data[i].grouptype="mutlic";
	 		            	 data[i].category='custom';
	 		            	 data[i].isSubProcess=true;
	 		            	 if(data[i].pooltype=="1"){ // 静态资源池
	 		            		data[i].flowcontroltype=10; 
	 		            	 }
	 		              }else{
	 		            	data[i].category='custom';
	 		                data[i].flowcontroltype=0;
	 		              }   

	 		          }

	 	

	 		     })
	 		     
	 		     return tempPromise;
			}
		    
			// 搜素组件
			$scope.searchTemp=function(){
				$scope.tempGroup().then(function(res){
					$scope.resourceModel.model.nodeDataArray=res.data.nodeDataArray;
				})
			}
			
		    function leftMenu(){
			    if($stateParams.componentId){
			    	jQuery("#combar").accordion({
			    		collapsible:true,
			    		activate:function(event,ui,a){
			    			for(var i=0;i<$scope.cList.length;i++){
			    				$scope['plugins'+i].requestUpdate();
			    			}
			    		}
			    		
			    	});
			    }
		    	// 左侧菜单折叠
		    	jQuery("#accordion").accordion({
		    		  collapsible:true,
				      activate: function(event, ui) {
				    	  processControl.requestUpdate();
				          //plugin.requestUpdate();
				          resourceControl.requestUpdate();
				      },
				      heightStyle: "content"
				});
		    	
		    	if($stateParams.componentId){
		    		for(var i=0;i<$scope.cList.length;i++)
		    		{
		    			 var type=$scope.cList[i].type;
		    			 $scope.getPluginList(type,i).then(function(res){
		    				 $scope.resData=[];
		                 	 angular.forEach(res.data.rows,function(val,key){
		                        if(val.pluginName){
		                            $scope.resData.push(val);
		                        }else{
		                        	$scope.index=val.index;
		                        	$scope.type=val.type;
		                        }
		                 	 })
		    				 
		    				 
				    			$scope['plugins'+$scope.index] =
			 			        $(go.Palette, "plugins"+$scope.index,
			 			        {  
			 			          nodeTemplateMap: palNodeTemplateMap,
			 			          groupTemplateMap: palGroupTemplateMap,
			 			          layout: $(go.GridLayout,
			 			            {
			 			        	  cellSize: new go.Size(1, 1),
			 			              spacing: new go.Size(5, 5),
			 			              comparer: keyCompare
			 			            }
			 			          )
			 			        });
				 		         
				 		         $scope['plugins'+$scope.index].model = $(go.GraphLinksModel,
					 		     {
					 		       copiesArrays: true,
					 		       copiesArrayObjects: true,
					 		       nodeDataArray: $scope.resData 
					 		     }); 
				 		         
				 		        $scope['pluginModel'+$scope.index]=$scope['plugins'+$scope.index];
				 		        // $scope.pluginModel=plugin;
				    		})
		                
		    		}
		    		jQuery("#accordion").accordion({
					      		activate: function(event, ui) {
					    	  	processControl.requestUpdate();
					      		},
							    heightStyle: "content"
					});
		    	}

		    	// 资源列表
		    	if($stateParams.templateName){
		    		$scope.tempGroup().then(function(res){
		    			var resourceControl =
	 			        $(go.Palette, "resourceControl",
	 			        {  
	 			          nodeTemplateMap: palNodeTemplateMap,
	 			          groupTemplateMap: palGroupTemplateMap,
	 			          layout: $(go.GridLayout,
	 			            {
	 			        	  cellSize: new go.Size(1, 1),
	 			              spacing: new go.Size(5, 5),
	 			              comparer: keyCompare
	 			            }
	 			          )
	 			        });
		 		         
		 		         resourceControl.model = $(go.GraphLinksModel,
			 		     {
			 		       copiesArrays: true,
			 		       copiesArrayObjects: true,
			 		       nodeDataArray: res.data.nodeDataArray  
			 		     }); 
		 		         
		 		         $scope.resourceModel=resourceControl;
		 		         
		 		        jQuery("#accordion").accordion({
		 		        	  collapsible:true,
						      activate: function(event, ui) {
						    	  resourceControl.requestUpdate();
						          processControl.requestUpdate();
						      },
						      heightStyle: "content"
						});
		    		})
		    	}
		    	
	 		    // 流程列表
	 		    var processControl =
	 		      $(go.Palette, "processControl",
	 		        {  
	 		          nodeTemplateMap: palNodeTemplateMap,
	 		          groupTemplateMap: palGroupTemplateMap,
	 		          layout: $(go.GridLayout,
	 		                    {cellSize: new go.Size(1, 1),
	 		                     spacing: new go.Size(5, 5),
	 		                     comparer: keyCompare
	 		         })
	 		     });
		        
		         processControl.model = $(go.GraphLinksModel,
	 		    		{
 		    		      copiesArrays: true,
 		    		      copiesArrayObjects: true,
 		    		      nodeDataArray: [
 		    		        { key: 101,eleType:"flowcontrol",category: "event",text: "开始",nodeDisplay: "开始",textKey: "开始",customtype:'start',ins:1,flowcontroltype:1, eventType: 1, eventDimension: 1, item: "start"},
 		    		        { key: 132,eleType:"flowcontrol",category: "activity",text: "用户任务",nodeDisplay: "用户任务",textKey: "用户任务",customtype:'task',ins:1,flowcontroltype:3, item: "User task", taskType: 2},
 		    		        { key: 204,eleType:"flowcontrol",category: "gateway",text: "单一条件",text: "单一条件",nodeDisplay: "单一条件",customtype:'condition',ins:1,flowcontroltype:8, gatewayType: 4},
 		    		        { key: 301,eleType:"flowcontrol",category: "gateway",customtype:'polymerization',gatewayType: 2,ins:1,flowcontroltype:5, text: "聚合",nodeDisplay: "聚合",textKey: "聚合" },
 		    		        { key: 302,eleType:"flowcontrol",category: "gateway",customtype:'branch',gatewayType: 3,ins:1,flowcontroltype:12, text: "分支",nodeDisplay: "分支",textKey: "分支" },
 		    		        { key: 104,eleType:"flowcontrol",category: "event",customtype:'end',text: "结束",nodeDisplay: "结束",textKey: "结束",ins:1,flowcontroltype:2,eventType: 1, eventDimension: 8, item: "End"},
 		    		        { key: 108, category: "gateway", text: "立即结束",nodeDisplay: "立即结束", textKey: "立即结束",eventType: 13, eventDimension: 8, item: "Terminate",flowcontroltype:30}
 		    		      ]  
	 		    	});
		        
		    }  // end leftmenu

		 if($stateParams.componentId){
     	    $timeout(function(){
     	    	var isLoadLabelELe=[];
     	    	for(var i=0;i<$scope.cList.length;i++){
     	    		if(angular.element('#plugins'+i).length>0){
     	    			isLoadLabelELe.push(true);
     	    		}else{
     	    			isLoadLabelELe.push(false);
     	    		}
     	    	}
     	    		var isLoadLabel=$filter('filter')(isLoadLabelELe,false).length>0?false:true;
     	    		if(isLoadLabel){
     	    			if(jQuery("#accordion").length>0){
    				        leftMenu();
    		        	}
     	    		}
     	    		

     	    },100)
     	}else{
     		if(jQuery("#accordion").length>0){
    				        leftMenu();
    		 }
     	}
           
     
           $scope.$watch('flowInfo',function(newval,oldval){
        	   
        	   if(newval){
        		 
        		   $scope.load(newval);
        	   }
           },true)
		        
		} // end init


		//------------------------------------------  pools / lanes   ----------------------------------------------

		// swimlanes
		var MINLENGTH = 400;  // this controls the minimum length of any swimlane
		var MINBREADTH = 20;  // this controls the minimum breadth of any non-collapsed swimlane

		// some shared functions

		// this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
		function relayoutDiagram() {
		  myDiagram.layout.invalidateLayout();
		  myDiagram.findTopLevelGroups().each(function(g) { if (g.category === "Pool") g.layout.invalidateLayout(); });
		  myDiagram.layoutDiagram();
		}

		// compute the minimum size of a Pool Group needed to hold all of the Lane Groups
		function computeMinPoolSize(pool) {
		  // assert(pool instanceof go.Group && pool.category === "Pool");
		  var len = MINLENGTH;
		  pool.memberParts.each(function(lane) {
		    // pools ought to only contain lanes, not plain Nodes
		    if (!(lane instanceof go.Group)) return;
		    var holder = lane.placeholder;
		    if (holder !== null) {
		      var sz = holder.actualBounds;
		      len = Math.max(len, sz.width);
		    }
		  });
		  return new go.Size(len, NaN);
		}

		// compute the minimum size for a particular Lane Group
		function computeLaneSize(lane) {
		  // assert(lane instanceof go.Group && lane.category !== "Pool");
		  var sz = computeMinLaneSize(lane);
		  if (lane.isSubGraphExpanded) {
		    var holder = lane.placeholder;
		    if (holder !== null) {
		      var hsz = holder.actualBounds;
		      sz.height = Math.max(sz.height, hsz.height);
		    }
		  }
		  // minimum breadth needs to be big enough to hold the header
		  var hdr = lane.findObject("HEADER");
		  if (hdr !== null) sz.height = Math.max(sz.height, hdr.actualBounds.height);
		  return sz;
		}

		// determine the minimum size of a Lane Group, even if collapsed
		function computeMinLaneSize(lane) {
		  if (!lane.isSubGraphExpanded) return new go.Size(MINLENGTH, 1);
		  return new go.Size(MINLENGTH, MINBREADTH);
		}


		// define a custom ResizingTool to limit how far one can shrink a lane Group
		function LaneResizingTool() {
		  go.ResizingTool.call(this);
		}
		go.Diagram.inherit(LaneResizingTool, go.ResizingTool);

		LaneResizingTool.prototype.isLengthening = function() {
		  return (this.handle.alignment === go.Spot.Right);
		};

		/** @override */
		LaneResizingTool.prototype.computeMinSize = function() {
		  var lane = this.adornedObject.part;
		  // assert(lane instanceof go.Group && lane.category !== "Pool");
		  var msz = computeMinLaneSize(lane);  // get the absolute minimum size
		  if (this.isLengthening()) {  // compute the minimum length of all lanes
		    var sz = computeMinPoolSize(lane.containingGroup);
		    msz.width = Math.max(msz.width, sz.width);
		  } else {  // find the minimum size of this single lane
		    var sz = computeLaneSize(lane);
		    msz.width = Math.max(msz.width, sz.width);
		    msz.height = Math.max(msz.height, sz.height);
		  }
		  return msz;
		};

		/** @override */
		LaneResizingTool.prototype.canStart = function() {
		  if (!go.ResizingTool.prototype.canStart.call(this)) return false;

		  // if this is a resize handle for a "Lane", we can start.
		  var diagram = this.diagram;
		  if (diagram === null) return;
		  var handl = this.findToolHandleAt(diagram.firstInput.documentPoint, this.name);
		  if (handl === null || handl.part === null || handl.part.adornedObject === null || handl.part.adornedObject.part === null) return false;
		  return (handl.part.adornedObject.part.category === "Lane");
		}

		/** @override */
		LaneResizingTool.prototype.resize = function(newr) {
		  var lane = this.adornedObject.part;
		  if (this.isLengthening()) {  // changing the length of all of the lanes
		    lane.containingGroup.memberParts.each(function(lane) {
		      if (!(lane instanceof go.Group)) return;
		      var shape = lane.resizeObject;
		      if (shape !== null) {  // set its desiredSize length, but leave each breadth alone
		        shape.width = newr.width;
		      }
		    });
		  } else {  // changing the breadth of a single lane
		    go.ResizingTool.prototype.resize.call(this, newr);
		  }
		  relayoutDiagram();  // now that the lane has changed size, layout the pool again
		};
		// end LaneResizingTool class


		// define a custom grid layout that makes sure the length of each lane is the same
		// and that each lane is broad enough to hold its subgraph
		function PoolLayout() {
		  go.GridLayout.call(this);
		  this.cellSize = new go.Size(1, 1);
		  this.wrappingColumn = 1;
		  this.wrappingWidth = Infinity;
		  this.isRealtime = false;  // don't continuously layout while dragging
		  this.alignment = go.GridLayout.Position;
		  // This sorts based on the location of each Group.
		  // This is useful when Groups can be moved up and down in order to change their order.
		  this.comparer = function(a, b) {
		    var ay = a.location.y;
		    var by = b.location.y;
		    if (isNaN(ay) || isNaN(by)) return 0;
		    if (ay < by) return -1;
		    if (ay > by) return 1;
		    return 0;
		  };
		}
		go.Diagram.inherit(PoolLayout, go.GridLayout);

		/** @override */
		PoolLayout.prototype.doLayout = function(coll) {
		  var diagram = this.diagram;
		  if (diagram === null) return;
		  diagram.startTransaction("PoolLayout");
		  var pool = this.group;
		  if (pool !== null && pool.category === "Pool") {
		    // make sure all of the Group Shapes are big enough
		    var minsize = computeMinPoolSize(pool);
		    pool.memberParts.each(function(lane) {
		      if (!(lane instanceof go.Group)) return;
		      if (lane.category !== "Pool") {
		        var shape = lane.resizeObject;
		        if (shape !== null) {  // change the desiredSize to be big enough in both directions
		          var sz = computeLaneSize(lane);
		          shape.width = (isNaN(shape.width) ? minsize.width : Math.max(shape.width, minsize.width));
		          shape.height = (!isNaN(shape.height)) ? Math.max(shape.height, sz.height) : sz.height;
		          var cell = lane.resizeCellSize;
		          if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
		          if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
		        }
		      }
		    });
		  }
		  // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
		  go.GridLayout.prototype.doLayout.call(this, coll);
		  diagram.commitTransaction("PoolLayout");
		};
		// end PoolLayout class


		//------------------------------------------  Commands for this application  ----------------------------------------------

		// Add a port to the specified side of the selected nodes.   name is beN  (be0, be1)
		// evDim is 5 for Interrupting, 6 for non-Interrupting
		function addActivityNodeBoundaryEvent(evType, evDim) {
		  myDiagram.startTransaction("addBoundaryEvent");
		  myDiagram.selection.each(function(node) {
		    // skip any selected Links
		    if (!(node instanceof go.Node)) return;
		    if (node.data && (node.data.category === "activity" || node.data.category === "subprocess" || node.data.category === "custom")) {
		      // compute the next available index number for the side
		      var i = 0;
		      var defaultPort = node.findPort("");
		      while (node.findPort("be" + i.toString()) !== defaultPort) i++;           // now this new port name is unique within the whole Node because of the side prefix
		      var name = "be" + i.toString();
		      if (!node.data.boundaryEventArray) {myDiagram.model.setDataProperty(node.data, "boundaryEventArray", []);}       // initialize the Array of port data if necessary
		      // create a new port data object
		      var newportdata = {
		          portId: name,
		          eventType: evType,
		          eventDimension: evDim,
		          color: "white",
		          alignmentIndex: i
		          // if you add port data properties here, you should copy them in copyPortData above  ** BUG...  we don't do that.
		        };
		        // and add it to the Array of port data
		      myDiagram.model.insertArrayItem(node.data.boundaryEventArray, -1, newportdata);
		    }
		  });
		  myDiagram.commitTransaction("addBoundaryEvent");
		}

		// changes the item of the object
		function rename(obj) {
		  myDiagram.startTransaction("rename");
		  var newName = prompt("Rename " + obj.part.data.item + " to:");
		  myDiagram.model.setDataProperty(obj.part.data, "item", newName);
		  myDiagram.commitTransaction("rename");
		}

		// shows/hides gridlines
		// to be implemented onclick of a button
		function updateGridOption() {
		  myDiagram.startTransaction("grid");
		  var grid = document.getElementById("grid");
		  myDiagram.grid.visible = grid.checked;
		  myDiagram.commitTransaction("grid");
		}

		// enables/disables snapping tools, to be implemented by buttons
		function updateSnapOption() {
		  // no transaction needed, because we are modifying tools for future use
		  var snap = document.getElementById("snap");
		  if (snap.checked) {
		    myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
		    myDiagram.toolManager.resizingTool.isGridSnapEnabled = true;
		  } else {
		    myDiagram.toolManager.draggingTool.isGridSnapEnabled = false;
		    myDiagram.toolManager.resizingTool.isGridSnapEnabled = false;
		  }
		}

		// user specifies the amount of space between nodes when making rows and column
		function askSpace() {
		  var space = prompt("Desired space between nodes (in pixels):", "0");
		  return space;
		}

		var UnsavedFileName = "(Unsaved File)";

		 

		function newDocument() {
		  // checks to see if all changes have been saved
		  if (myDiagram.isModified) {
		    var save = confirm("Would you like to save changes to " + getCurrentFileName() + "?");
		    if (save) {
		      saveDocument();
		    }
		  }
		  setCurrentFileName(UnsavedFileName);
		  // loads an empty diagram
		  myDiagram.model = new go.GraphLinksModel();
		  resetModel();
		}

		function resetModel() {
		  myDiagram.model.undoManager.isEnabled = true;
		  myDiagram.model.linkFromPortIdProperty = "fromPort";
		  myDiagram.model.linkToPortIdProperty = "toPort";

		  myDiagram.model.copiesArrays = true;
		  myDiagram.model.copiesArrayObjects = true;
		  myDiagram.isModified = false;
		}

		function checkLocalStorage() {
		  return (typeof (Storage) !== "undefined") && (window.localStorage !== undefined);
		}

		// saves the current floor plan to local storage
		function saveDocument() {
		  if (checkLocalStorage()) {
		    var saveName = getCurrentFileName();
		    if (saveName === UnsavedFileName) {
		      saveDocumentAs();
		    } else {
		      saveDiagramProperties()
		      window.localStorage.setItem(saveName, myDiagram.model.toJson());
		      myDiagram.isModified = false;
		    }
		  }
		}

		// saves floor plan to local storage with a new name
		function saveDocumentAs() {
		  if (checkLocalStorage()) {
		    var saveName = prompt("Save file as...", getCurrentFileName());
		    if (saveName && saveName !== UnsavedFileName) {
		      setCurrentFileName(saveName);
		      saveDiagramProperties()

		      window.localStorage.setItem(saveName, myDiagram.model.toJson());
		      myDiagram.isModified = false;
		    }
		  }
		}
		
		function flowMonitor(monitorData) {
	        var model = myDiagram.model;
	        model.nodeDataArray=$scope.initModel.nodeDataArray;
	       /* model.linkDataArray=$scope.initModel.linkDataArray;*/
	        var nodeDataArr = model.nodeDataArray;
	       /* var linkDataArr=model.linkDataArray;*/
           
	        if(monitorData.rootNode||monitorData.type=='0'){
	        	var monitorParams={
		        	id:monitorData.id,
		            flowId:monitorData.flowId
		        }
	        }else{
	        	var monitorParams={
	        	    id:monitorData.instanceId,
	        	    flowId:monitorData.parentFlowId
	        	}
	        }
	        
	        $http.get('/cloudui/master/ws/monitor/getProcessMonitorInfo'+'?v='+(new Date().getTime()),{
		    	params:monitorParams
		     })
		    .success(function(data){
		    	 
		    	if(data.result){
		    		
		    		var curNodeDataArray=angular.fromJson(data.message).nodeDataArray;
		    		
		    		angular.forEach(nodeDataArr,function(val,key){ 
			    		 
			    		for(var i=0;i<curNodeDataArray.length;i++)
			    		{
			    			if(curNodeDataArray[i].key==val.key){
			    				val.state=curNodeDataArray[i].state;
			    				val.ins=curNodeDataArray[i].ins;
			    				val.successCount=curNodeDataArray[i].successCount; 
			    			}
			    		}
			    		 
			    		model.updateTargetBindings(val);
			    	})
		    	}else{
		    		$interval.cancel($scope.flowMinitorTimer);
		    	}
		    	

		    	/*for(var i=0;i<linkDataArr.length;i++)
		    	{
		    		for(var j=0;j<data.linkDataArray;j++)
		    		{
		    			var oriFrom=linkDataArr[i]['from'];
		    			var curFrom=data.linkDataArray[j]['from'];
		    			var oriTo=linkDataArr[i]['to'];
		    			var curTo=data.linkDataArray[j]['to']
		    			var formBoolean=(oriFrom==curFrom);
		    			var toBoolean=(oriTo==curTo);
		    			if(formBoolean&&toBoolean){
		    			   console.log(oriFrom);
		    			   console.log(curFrom);
		    			   console.log(oriTo);
		    			   console.log(curTo);
		    			   console.log(linkDataArr[i]);
		    			   console.log(data.linkDataArray[j]);
                           linkDataArr[i].state=data.linkDataArray[j].state;
                           model.updateTargetBindings(linkDataArr[i]);
		    			}
		    		}
		    	}*/
 
		    	 
		    }).error(function(){
		    	$interval.cancel($scope.flowMinitorTimer);
		    })
	   }
		
		
		
	   function loop(monitorData) {
		    $scope.flowMinitorTimer=$interval(function(){
		    	 
		    	flowMonitor(monitorData); 
		    },3000)
	    }
	   
	    if($scope.branch){
	    	 $scope.monitorData=$scope.branch;
	    	 
	    	 loop($scope.monitorData);
	    }

		
		// 保存流程
		$scope.save=function () {
			saveDiagramProperties();  // do this first, before writing to JSON
			if($stateParams.componentId){
               var issub=true;
		    }else if($stateParams.blueprintId){
		    	 
               var issub=false;
		    }
		    var saveModel=jQuery.parseJSON(myDiagram.model.toJson());
		    saveModel.issub=issub;
		    $scope.flowInfo=angular.toJson(saveModel,true);
		}

        
		
		 $scope.load=function (info) {
			    
			    if($scope.branch){
			    	if($scope.branch.rootNode||$scope.branch.type=='0'){
			        	var monitorParams={
				        	id:$scope.branch.id,
				            flowId:$scope.branch.flowId
				        }
			        }else{
			        	var monitorParams={
			        	    id:$scope.branch.instanceId,
			        	    flowId:$scope.branch.parentFlowId
			        	}
			        }
			    	$http.get('/cloudui/master/ws/monitor/getProcessMonitorInfo'+'?v='+(new Date().getTime()),{
		    	       params:monitorParams
		             })
		    	     .success(function(data){
		    	    	 if(data.result){
		    	    		 $scope.initModel=angular.fromJson(data.message);
		    	    		 myDiagram.model =  go.Model.fromJson(data.message);
						     loadDiagramProperties();
					 
		    	    	 }else{
		    	    		 $interval.cancel($scope.flowMinitorTimer); 
		    	    	 }
				    	
				    }).error(function(){
				    	$interval.cancel($scope.flowMinitorTimer);
				    })
			    }else{
			    	myDiagram.model = go.Model.fromJson(info);
				    loadDiagramProperties();
			    }
		 }

		 if($scope.branch){
			 $scope.load();
		 }
		 
		 // 组件添加流程
		
		 $scope.addComponentFlow=function(){
		 	$scope.isGo=true;
			 $scope.save();
			 ngDialog.open({
	            template: 'app/views/dialog/component-flow-add.html'+'?action='+(new Date().getTime()),
	            className: 'ngdialog-theme-default ngdialog-lg',
	            scope: $scope,
	            closeByDocument:false,
	            cache:false,
	            data:{flowInfo:$scope.flowInfo},
	            controller:'componentFlowCreateCtrl'
		    });
		 }
		 
		// 蓝图更新流程
		 $scope.updateFlow=function(url,data){
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
		    		if($stateParams.blueprintId){
		    			$state.go('app.blueprint_flow_manage',{templateName:$stateParams.templateName,blueprintId:$stateParams.blueprintId},{reload:true});
		    		}else if($stateParams.componentId){
		    			$state.go('app.component_flow_manage',{componentId:$stateParams.componentId},{reload:true});
		    		}
		    	}else{
		    		Notify.alert(
	                    '<em class="fa fa-check"></em> '+data.message ,
	                    {status: 'success'}
		            );
		    	}
	             
	        })
		 }
		 
		// 蓝图流程执行流程New
		 $scope.flowActionNew=function(){
           $http.post('/newflowservice/invoke',{
           	     cdFlowId:$stateParams.flowId,
            	 blueprintInstanceId:$stateParams.blueprintInsId
           })
		  .success(function(data){
                if(data.result)
		            {
		                 Notify.alert(
		                    '<em class="fa fa-check"></em> '+data.message ,
		                    {status: 'success'}
		                  );
		                 
		                 $state.go('app.blueprint_ins_log_manage',{INSTANCE_ID:$stateParams.blueprintInsId},{reload:true})
		                 
		            }else{
		                   Notify.alert(
		                      '<em class="fa fa-times"></em> '+data.message ,
		                      {status: 'danger'}
		                   );
		                   
		            }
           })
		 }
		 
		 // 蓝图流程执行
		 $scope.doFlowAction=function(){
			 $scope.disabled=true;
			 $http.get('/cloudui/master/ws/blueprint/executeBlueprintFlow'+'?v='+(new Date().getTime()),{
	            params:{
	            	cdFlowId:$stateParams.flowId,
	            	blueprintInstanceId:$stateParams.blueprintInsId
	            }
		     }).success(function(data){
		            if(data.result)
		            {
		                 Notify.alert(
		                    '<em class="fa fa-check"></em> '+data.message ,
		                    {status: 'success'}
		                  );
		                 
		                 $state.go('app.blueprint_ins_log_manage',{insName:$stateParams.insName,INSTANCE_ID:$stateParams.blueprintInsId},{reload:true})
		                 
		            }else{
		                   Notify.alert(
		                      '<em class="fa fa-times"></em> '+data.message ,
		                      {status: 'danger'}
		                   );
		                   
		            }
		    })
		 }
		 
		 
		 // 蓝图流程执行流程
		 $scope.flowAction=function(){
			 // 判断流程是否正在执行
			 $http.get('/cloudui/master/ws/blueprint/existRunningInstance'+'?v='+(new Date().getTime()),{
	            params:{
	            	cdFlowId:$stateParams.flowId,
	            	blueprintInstanceId:$stateParams.blueprintInsId
	            }
			 }).success(function(existRunningData){
				 if(existRunningData.result){ // 流程正在执行
					 ngDialog.openConfirm({
					       template:
					             '<p class="modal-header">该流程存在正在运行的实例，您确定要继续执行吗?</p>' +
					             '<div class="modal-body text-right">' +
					               '<button type="button" class="btn btn-default mr20"  ng-click="closeThisDialog(0)">取消' +
					               '<button type="button" class="btn btn-primary" ng-click="confirm(1)">确定' +
					             '</button></div>',
					      plain: true,
					      className: 'ngdialog-theme-default'
					 }).then(function(){
						// 确定继续执行
					    $scope.doFlowAction();
					 })
				 }else{ // 流程未执行
					 $scope.doFlowAction();
				 }
			 })
		 }
		 
		 // 组件更新流程
		 $scope.updateComponentFlow=function(){
		 	$scope.isGo=true;
			 $scope.save();
			 var url="/cloudui/master/ws/resource/updateNewFlowInfoByFlowId";
             var data={
            		cdFlowId:$stateParams.flowId, 
 	                flowInfo:$scope.flowInfo 
		     }
             
             $http.post(url,data)
             .success(function(data){
 	        	if(data.result){
 		    		Notify.alert(
 	                    '<em class="fa fa-check"></em> '+data.message ,
 	                    {status: 'success'}
 		            );
 		    		$state.go('app.component_flow_manage',{componentName:$stateParams.componentName,componentId:$stateParams.componentId},{reload:true});
 		    	}else{
 		    		Notify.alert(
 	                    '<em class="fa fa-check"></em> '+data.message ,
 	                    {status: 'success'}
 		            );
 		    	}
 	             
 	        })
		 }
		 
		// 蓝图更新流程
		 $scope.updateBlueprintFlow=function(){
		 	$scope.isGo=true;
			 $scope.save();
			 var url="/cloudui/ws/blueprintTemplate/updateBlueprintTemplateFlow";
             var data={
            		cdFlowId:$stateParams.flowId, 
             		flowInfoGroup:$scope.flowInfo 
		     }
             $scope.updateFlow(url,data);
		 }

		 // 蓝图添加流程
		 $scope.addBlueprintFlow=function(){
		 	$scope.isGo=true;
			 $scope.save();
			 ngDialog.open({
	            template: 'app/views/dialog/blueprint-flow-add.html'+'?action='+(new Date().getTime()),
	            className: 'ngdialog-theme-default ngdialog-lg',
	            scope: $scope,
	            closeByDocument:false,
	            cache:false,
	            data:{flowInfo:$scope.flowInfo},
	            controller:'blueprintFlowCreateCtrl'
		    });
		 }

		// checks to see if all changes have been saved -> shows the open HTML element
		function openDocument() {
		  if (checkLocalStorage()) {
		    if (myDiagram.isModified) {
		      var save = confirm("Would you like to save changes to " + getCurrentFileName() + "?");
		      if (save) {
		        saveDocument();
		      }
		    }
		    openElement("openDocument", "mySavedFiles");
		  }
		}

		// shows the remove HTML element
		function removeDocument() {
		  if (checkLocalStorage()) {
		    openElement("removeDocument", "mySavedFiles2");
		  }
		}

		// these functions are called when panel buttons are clicked
		 

		/*function loadJSON(file) {
		    jQuery.getJSON(file, function (jsondata) {
		      // set these kinds of Diagram properties after initialization, not now
		      myDiagram.addDiagramListener("InitialLayoutCompleted", loadDiagramProperties);  // defined below
		      // create the model from the data in the JavaScript object parsed from JSON text
		      //myDiagram.model = new go.GraphLinksModel(jsondata["nodes"], jsondata["links"]);
		      myDiagram.model = go.Model.fromJson(jsondata);
		      loadDiagramProperties();
		      myDiagram.model.undoManager.isEnabled = true;
		      myDiagram.isModified = false;
		    });
		  }*/

		// Store shared model state in the Model.modelData property
		// (will be loaded by loadDiagramProperties)
		function saveDiagramProperties() {
		  myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
		}

		// Called by loadFile and loadJSON.
		function loadDiagramProperties(e) {
		  // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
		  var pos = myDiagram.model.modelData.position;
		  if (pos) myDiagram.initialPosition = go.Point.parse(pos);
		}


		// deletes the selected file from local storage
		function removeFile() {
		  var listbox = document.getElementById("mySavedFiles2");
		  // get selected filename
		  var fileName = undefined;
		  for (var i = 0; i < listbox.options.length; i++) {
		    if (listbox.options[i].selected) fileName = listbox.options[i].text; // selected file
		  }
		  if (fileName !== undefined) {
		    // removes file from local storage
		    window.localStorage.removeItem(fileName);
		    // the current document remains open, even if its storage was deleted
		  }
		  closeElement("removeDocument");
		}

		function updateFileList(id) {
		  // displays cached floor plan files in the listboxes
		  var listbox = document.getElementById(id);
		  // remove any old listing of files
		  var last;
		  while (last = listbox.lastChild) listbox.removeChild(last);
		  // now add all saved files to the listbox
		  for (var key in window.localStorage) {
		    var storedFile = window.localStorage.getItem(key);
		    if (!storedFile) continue;
		    var option = document.createElement("option");
		    option.value = key;
		    option.text = key;
		    listbox.add(option, null);
		  }
		}

		function openElement(id, listid) {
		  var panel = document.getElementById(id);
		  if (panel.style.visibility === "hidden") {
		    updateFileList(listid);
		    panel.style.visibility = "visible";
		  }
		}

		// hides the open/remove elements when the "cancel" button is pressed
		function closeElement(id) {
		  var panel = document.getElementById(id);
		  if (panel.style.visibility === "visible") {
		    panel.style.visibility = "hidden";
		  }
		}

 

		function toEditView(e,node,myDiagram){
			
			
			
			var viewStateArr=['app.blueprint_ins_flow_view','app.blueprint_ins_flow_monitor','app.blueprint_ins_component_flow_monitor']
			
			var curState=$state.current.name;
			
			if(curState){
	    		 isView=$filter('filter')(viewStateArr,curState);
	        	 
	        	 if(isView.length>0){
	        		  return false;
	        	 } 
	    	 }
            
			if(node.data.eleType=="plugin"){
				  
		          // 编辑插件
		          ngDialog.open({
		            template: 'app/views/dialog/flow-plugin-configs.html'+'?action='+(new Date().getTime()),
		            className: 'ngdialog-theme-default ngdialog-sm',
		            scope: $scope,
		            data:{e:e,node:node,diagram:myDiagram},
		            cache:false,
		            closeByDocument:false,
		            controller:'pluginDialogCtrl'
		          });
		   }else if(node.data.flowcontroltype==0){
			       // 编辑子流程
			       ngDialog.open({
		            template: 'app/views/dialog/flow-subprocess-configs.html'+'?action='+(new Date().getTime()),
		            className: 'ngdialog-theme-default ngdialog-sm',
		            scope: $scope,
		            data:{e:e,node:node,diagram:myDiagram},
		            cache:false,
		            closeByDocument:false,
		            controller:'subprocessDialogCtrl'
		          });
		   }else if(node.data.customtype=="condition"||node.data.text=="单一条件") 
           {  
			  // 编辑条件
		       ngDialog.open({
	            template: 'app/views/dialog/flow-loopCount-configs.html'+'?action='+(new Date().getTime()),
	            className: 'ngdialog-theme-default',
	            scope: $scope,
	            data:{e:e,node:node,diagram:myDiagram},
	            cache:false,
	            closeByDocument:false,
	            controller:'loopCountDialogCtrl'
	          }); 
           }else if(node.data.customtype=="start"||node.data.text=="开始"){
        	   ngDialog.open({
   	            template: 'app/views/dialog/flow-start-configs.html'+'?action='+(new Date().getTime()),
   	            className: 'ngdialog-theme-default ngdialog-sm',
   	            scope: $scope,
   	            data:{e:e,node:node,diagram:myDiagram},
   	            cache:false,
   	            closeByDocument:false,
   	            controller:'startNodeCtrl'
   	          });
           }else if(node.data.isGroup&&node.data.grouptype){
        	   ngDialog.open({
      	            template: 'app/views/dialog/flow-resource-groupType.html'+'?action='+(new Date().getTime()),
      	            className: 'ngdialog-theme-default',
      	            scope: $scope,
      	            data:{e:e,node:node,diagram:myDiagram},
      	            cache:false,
      	            closeByDocument:false,
      	            controller:'groupType'
      	       });
           }
		}
}])

// 配置

// 编辑插件
flowDesignerMoudle.controller('pluginDialogCtrl',['$scope','$http','ngDialog',function($scope,$http,ngDialog){
    
     var myDiagram=$scope.ngDialogData.diagram;
     var node=$scope.ngDialogData.node;
     
     // 添加变量
     $scope.add=function(list){
  	      var obj={};
          $scope[list].push(obj);
      }
  	
     // 删除变量
     $scope.del=function(list,idx){
          $scope[list].splice(idx,1);
     }

     $scope.configParams=[]; // 所有配置
    
     $scope.commonConfigs=[]; // 通用配置
     $scope.advancedConfigs=[];// 高级配置
     /*$scope.newConfigs=[];// 新加配置*/ 

     angular.forEach(node.data.params,function(val,key){
    	 if(key=='forceContinue'||key=='forceEnd'||key=='gf_variable'){
    		 $scope.commonConfigs.push({key:key,value:val})
    	 }else{
    		 $scope.advancedConfigs.push({key:key,value:val})
    	 }
     })

     $scope.savePlugins=function(){

       var params={};

	   $scope.delWithPassword($scope.advancedConfigs, 'advancedConfigValue');
      
       $scope.configParams=$scope.commonConfigs.concat($scope.advancedConfigs);
      
       angular.forEach($scope.configParams,function(val,key){
          params[val.key]=val.value;
       })

       myDiagram.startTransaction('savePlugins');    
       myDiagram.model.setDataProperty(node.data,'params',params);
       myDiagram.commitTransaction('savePlugins');
       ngDialog.close();
     }
       
	 // 计算密码类checkbox是否选中,初始化input类型
	 $scope.passwordChecked=function(obj,inputId){
	   if(obj.value.substring(0,4)=='DEC(' && obj.value.substring(obj.value.length-1, obj.value.length)==')'){
		  document.getElementById(inputId).setAttribute('type','password');
		  obj.value = obj.value.substring(4, obj.value.length-1);
	   }
	   var type = document.getElementById(inputId).getAttribute('type');
	   if(type=='password'){
		  return true;
	   }
	   else{
		  return false;
	   }
     }

     // 切换input的type为text/password
     $scope.passwordTypeChange=function(obj,inputId){
	   var type = document.getElementById(inputId).getAttribute('type');
	   if(type=='password'){
		  document.getElementById(inputId).setAttribute('type','text');
	   }
	   else{
		  document.getElementById(inputId).setAttribute('type','password');
	   }
     }

     // 计算需要加密的参数
     $scope.delWithPassword=function(obj,inputId){
	   angular.forEach(obj,function(ele,index){
			var type=document.getElementById(inputId+index).getAttribute('type');
			if(type=='password'){
				ele.value='DEC('+ele.value+')';
			}	
	   })
     }
}])

// 编辑条件
flowDesignerMoudle.controller('loopCountDialogCtrl',['$scope','$http','ngDialog',function($scope,$http,ngDialog){
    
     var myDiagram=$scope.ngDialogData.diagram;
     var node=$scope.ngDialogData.node;
     
     $scope.varname=node.data.para||'';
     
     $scope.loopCount=node.data.expression||'';

     $scope.addLoopcountFn=function(){

       myDiagram.startTransaction('addLoopcount');    
       myDiagram.model.setDataProperty(node.data,'para',$scope.varname);
       myDiagram.model.setDataProperty(node.data,'expression',$scope.loopCount);
       myDiagram.commitTransaction('addLoopcount');
       ngDialog.close();
   }
}])


// 开始节点定义变量
flowDesignerMoudle.controller('startNodeCtrl',['$scope','ngDialog',function($scope,ngDialog){
    
     var myDiagram=$scope.ngDialogData.diagram;
     var node=$scope.ngDialogData.node;

     $scope.vararr=[];
     if(node.data.paras){
    	 angular.forEach(node.data.paras,function(val,key){
    		 var obj={};
    		 obj.val=val;
    		 obj.key=key;;
    		 $scope.vararr.push(obj);
    	 })
     } 
     
     // 添加变量
     $scope.add=function(list){
  	      var obj={};
          $scope[list].push(obj);
      }
  	
     // 删除变量
     $scope.del=function(list,idx){
          $scope[list].splice(idx,1);
     }

     $scope.addFlowVarFn=function(){
       
    	var varobj={};

       angular.forEach($scope.vararr,function(val,key){ 
    	   varobj[val.key]=val.val||'';
       })
     
       myDiagram.startTransaction('addFlowVarFn');    
       myDiagram.model.setDataProperty(node.data,'paras',varobj);
       myDiagram.commitTransaction('addFlowVarFn');
       ngDialog.close();
   }
}])
 
flowDesignerMoudle.controller('subprocessDialogCtrl',['$scope','$stateParams','$http','ngDialog','$filter',function($scope,$stateParams,$http,ngDialog,$filter){
	 
	var myDiagram=$scope.ngDialogData.diagram;
    var node=$scope.ngDialogData.node;
    var nodeDataArray=myDiagram.model.nodeDataArray;
    $scope.formData={};
     
    // 版本类型
    $scope.versionType=[
        {"text":"当前版本","value":"current"},
        {"text":"目标版本","value":"target"},
        {"text":"当前版本+目标版本","value":"current+target"}
    ]
    
    if(node.data.versionConfig&&"none"!=node.data.versionConfig){
    	 $scope.formData.versionType=node.data.versionConfig;
    }else{
    	$scope.formData.versionType="current";
    }
   

    // 从开始节点获取全局变量
    for(var i=0;i<nodeDataArray.length;i++)
    {
    	if(nodeDataArray[i].flowcontroltype==1){
    		$scope.fvarObj=nodeDataArray[i].paras;
    		$scope.fvarArr=[''];
    		if($scope.fvarObj){
    			angular.forEach($scope.fvarObj,function(val,key){
        			var obj={};
        			obj.key=key;
        			obj.val=val;
        			$scope.fvarArr.push(obj);
        		})
    		}
    		
    	}
    }
    
    var getChineseName= function(key){
		switch(key){
	          case 'deploy':
	          return "部署";
	          break;
	          case 'destroy':
	          return "卸载";
	          break;
	          case 'stop':
	          return "停止";
	          break;
	          case 'start':
	          return "启动";
	          break;
	          case 'upgrade':
	          return "升级";
	          break;
	          case 'snapshot':
	          return "备份";
	          break;
	          case 'rollback':
	          return "回滚";
	          break;
	          default:
	           return key;
	          break;
	       }
	}
    var getVersionName= function(key){
		switch(key){
	          case 'destroy':
	          return "current";
	          break;
	          case 'stop':
	          return "current";
	          break;
	          default:
	           return 'target';
	          break;
	       }
	}
    // 获取组件的操作类型及流程列表
    $http({
        method:'post',
        url:'/cloudui/master/ws/resource/getNewResourceOperationFlows',
        data: $.param({
        	resourceId:node.data.id
        }),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .success(function(data){
    	if(data.result){
    		$scope.doList=[{doName:'无'}];
    		var flowData=angular.fromJson(data.data);
        	angular.forEach(flowData,function(val,key){
        		var obj={};
        		obj.doChineseName= getChineseName(key);
        		obj.doName=key;
        		obj.doCont=val;
        		$scope.doList.push(obj);
        	})
         
            var filterdoFlow=$filter('filter')($scope.doList,node.data.cdFlowId)[0];
           
          	if(filterdoFlow){
          		$scope.formData.do=filterdoFlow;
    		}else{
    			$scope.formData.do=$scope.doList[0];
    		}
    	} 
	})
	
	// 根据组件流程操作类型获取流程列表
	 $scope.$watch('formData.do',function(newval,oldval){
    	if(newval){
    		if(!newval.doChineseName){
    			$scope.formData.versionType='current';
    		}else{
    			if(node.data.versionConfig){
					$scope.formData.versionType=node.data.versionConfig;
    			}else{
    				$scope.formData.versionType=getVersionName(newval.doName);
    			}
    		}
    		var filterFlow=$filter('filter')(newval.doCont,node.data.cdFlowId)[0]
    	   
    		if(filterFlow){
    			$scope.formData.flow=filterFlow; 
    		}else{
    			$scope.formData.flow=newval.doCont[0]; 
    		}
    	}
    })
    
    // 根据组件流程获取流程id
    $scope.$watch('formData.flow',function(newval,oldval){
    	 
    	if(newval){
    		 $scope.componentFlowId=newval.cdFlowId; 
    	}
    })
    
    // 根据流程id获取流程变量
    $scope.$watch('componentFlowId',function(newval,oldval){
    	 
    	if(newval){
    		$http({
                method:'post',
                url:'/cloudui/master/ws/resource/getNewFlowVarsByFlowId',
                dataType: "text",
                data:$.param({
                	cdFlowId:newval
                }),
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' } 
            })
            .success(function(data){
    			 if(data.result)
    			 {    
    				 $scope.childvarStr=data.data;
    				 
    				 $scope.childvarArr=$scope.childvarStr.split(';');
    				 
    				 // in/out变量默认值
				    if(node.data.input)
				    {
				    	angular.forEach(node.data.input,function(val,key){
				    		$scope.formData.inchildvar=key;
				    		$scope.formData.infvar=val;
				    	})
				    }
    				 
    				if(node.data.output)
    				{
				    	angular.forEach(node.data.output,function(val,key){
				    		$scope.formData.outfvar=key;
				    		$scope.formData.outchildvar=val;
				    	})
    				}
    				 
    			 }
    		 }) 
 
    	}
    })
    
 // 保存
    $scope.saveSubprocess=function(){

    	  
         var inVar={};

         if($scope.formData.inchildvar&&$scope.formData.infvar){
        	 inVar[$scope.formData.inchildvar]=$scope.formData.infvar;
         } 
         
         var outVar={};

         if($scope.formData.outfvar&&$scope.formData.outchildvar){
        	 outVar[$scope.formData.outfvar]=$scope.formData.outchildvar;
         }
         
         
         myDiagram.startTransaction('saveSubprocess');    
         myDiagram.model.setDataProperty(node.data,'versionConfig',$scope.formData.versionType);
         myDiagram.model.setDataProperty(node.data,'subflowName',$scope.formData.do.doName);
         myDiagram.model.setDataProperty(node.data,'cdFlowId',$scope.componentFlowId);
         /*myDiagram.model.setDataProperty(node.data,'flowName',$scope.formData.flow.flowName);*/
         
      
         myDiagram.model.setDataProperty(node.data,'desc',$scope.formData.do.doName+'：'+$scope.formData.flow.flowName);
          
         myDiagram.model.setDataProperty(node.data,'input',inVar);
         myDiagram.model.setDataProperty(node.data,'output',outVar);
         myDiagram.commitTransaction('saveSubprocess');
         ngDialog.close();
    }
    
}])

// 并发、轮循设置
flowDesignerMoudle.controller('groupType',['$scope','$http','ngDialog',function($scope,$http,ngDialog){
    
     var myDiagram=$scope.ngDialogData.diagram;
     var node=$scope.ngDialogData.node;
     
     $scope.groupTypeList=[
         {value:"mutlic",text:"并发"},
         {value:"loop",text:"轮循"}
     ]
     
     $scope.grouptype=node.data.grouptype;

     $scope.groupTypeFn=function(){
       myDiagram.startTransaction('groupTypeFn');    
       myDiagram.model.setDataProperty(node.data,'grouptype',$scope.grouptype);
       myDiagram.commitTransaction('groupTypeFn');
       ngDialog.close();
    }
}])