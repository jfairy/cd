function toEditView(e,node,myDiagram){
  console.log(e)
  console.log(node)
  console.log(node.data)
console.log(111)
     jQuery.ajax({
           type:"get",
           url:"../server/versionList"+'?v='+(new Date().getTime()),
           success:function(data){
              var versionList=eval(data);
               $("#st").html('');
               
               for(var i=0;i<versionList.length;i++)
               {

                   $("#st").append("<option value='"+versionList[i].id+"'>"+versionList[i].versionName+"</option>");
               }  

           }
    })


    jQuery.ajax({
           type:"get",
           dataType:"json",
           url:"../server/input",
           success:function(data){

              if(node.data.pro){
                 var inputList=node.data.pro;
              }else{
                var inputList=data.input;
              }
             
              /*var inputList=data.input;

              console.log(inputList);
              console.log(node.data.pro);*/
              var inputkeyval=[];

              for (x in inputList)
              {
                var obj={};
                obj.key=x;
                obj.val=inputList[x];
                inputkeyval.push(obj);
               }
 
              var elestr='';
              console.log(inputkeyval);
              $('#tbody').html('');

              for(var i=0;i<inputkeyval.length;i++)
              {
                 elestr+='<tr><td>'+inputkeyval[i].key+'</td><td><input type="text" key='+inputkeyval[i].key+' value='+inputkeyval[i].val+'></td></tr>'
              }
              
               
               $("#tbody").append($(elestr))
           }
    })
   
     $('#ins').val(node.data.ins);
     
    
  $(function() {
     $( "#dialog" ).dialog({ 
           buttons: { "Ok": function() {
              var probj={};
              console.log($("input"));
             $("#tbody input").each(function(){
               var value = $(this).val(); 
               console.log($(this).attr('key'))
               probj[$(this).attr('key')]=$(this).val()
           });
             console.log(probj);
            myDiagram.startTransaction('toEditView');
             
             myDiagram.model.setDataProperty(node.data,'ins',$('#ins').val())
             myDiagram.model.setDataProperty(node.data,'version',$('#st').val())
             myDiagram.model.setDataProperty(node.data,'pro',probj)
             myDiagram.commitTransaction('toEditView');
            $(this).dialog("close"); 
            
            
           /* save();
            load();*/
        } }  
      });
   });
}