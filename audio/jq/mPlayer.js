       
        
var gvObj=null;

function momnent_millisecond_to_hhmmss(vtime){
        var tms2=parseFloat(vtime)*1000.0;
                    function paddingInt(val){
                        val=""+val;
                        while(val.length<2) val="0"+val;
                        return val;
                    }
                    function paddingFloat(val){
                        val=""+val;
                        while(val.indexOf(".")<2) val="0"+val;
                        return val;
                    }     
                    var hhmmss2=moment.duration(tms2,0);
                    var ms=(""+(hhmmss2._data.milliseconds)*1000.0).substr(0,3);
                    var ss=hhmmss2._data.seconds;
                    var mm=hhmmss2._data.minutes;
                    var hh=hhmmss2._data.hours; 
                    return paddingInt(hh)+":"+paddingInt(mm)+":"+paddingInt(ss)+"."+ms;                    
}; 
 

function show_current_time()  {
			    var curTime = gvObj.currentTime;
                console.log(curTime);
                var hhmmss2=moment.duration(curTime,0); 
                var hhmmss=momnent_millisecond_to_hhmmss(curTime);
                
                $("#currTime").text(curTime+"="+hhmmss);
 
}



function gen_audio_sel(mPlayerResrs, vobj){
	var pathfileArr=[];

  var optns="<option></option>";
  for (var path in mPlayerResrs) {
		console.log("path:"+path);
		optns +="<optgroup  label='"+path+"'>";
		for (var filename in mPlayerResrs[path]){
			var key=path+filename;
			optns+="<option value='"+key+"' path='"+path+"' filename='"+filename+"'>"+filename+"</option>";
			console.log(key);
			pathfileArr.push(key);
		}
		optns +="</optgroup>";
  };

  vobj.m_srcArr=pathfileArr;
  vobj.m_srcIdx=0;

  $("#myAudioFileNameSelect").html(optns);
};


function gen_file_info_table(pathfilename, mPlayerResrs){
	var ilast=1+pathfilename.lastIndexOf("/");
	var path=pathfilename.substr(0,ilast);
	var file=pathfilename.substr(ilast);
	var caption="<caption>"+file+"<caption>";
	console.log(file);
	var trs="<tr><td>start</td><td>desc</td></tr>";
	var obj=mPlayerResrs[path][file];
	console.log(obj);
	for (var key in obj) {
		trs+="<tr><td onclick='hhmmss2input(this)'>"+key+"</td><td>"+obj[key]+"</td></tr>";
		console.log(key);
	};
	$("#tabinfor").html(caption+trs);
}


function hhmmss2input(_THIS){
	var hhmmss=$(_THIS).text();
	$("#start_hhmmss").val(hhmmss);
}


    
$(function () {
    gvObj = document.getElementById('myAudio');     
    gvObj.addEventListener('ended',function(){
    	if (!!gvObj.m_srcArr){
            
            if(gvObj.m_srcArr.length>gvObj.m_srcIdx){
            	gvObj.m_srcIdx++;
            }
            else{
                gvObj.m_srcIdx=0;
            }
            gvObj.src=gvObj.m_srcArr[gvObj.m_srcIdx];
            gvObj.playbackRate=parseFloat($("#speed").text());
            gvObj.play();


            var pathfile=gvObj.m_srcArr[gvObj.m_srcIdx];
            var ilast=1+pathfile.lastIndexOf("/");
			var path=pathfile.substr(0,ilast);
			var file=pathfile.substr(ilast);
            $("#myAudioFileNameSelect").val(file);

            console.log(pathfile);
            gen_file_info_table(pathfile,mPlayerResources);
    	}//fi

    });


	gen_audio_sel(mPlayerResources, gvObj);
     

	 
	 
	 
	 $("#myAudioFileNameSelect").change(function(){
		var filename=$(this).val();
		gvObj.src=filename;
		gvObj.play();
		$("#speed").text(gvObj.playbackRate);
		gen_file_info_table(filename, mPlayerResources);
	 });
	 
	 $("#play").click(function(){
        
        gvObj.currentTime=parseFloat($("#start_float").val());
        gvObj.play();
     });
    $("#stop").click(function(){
            gvObj.pause();
			show_current_time();
			
			$("#start_float").val(gvObj.currentTime);
     });
	 $("#currTime").click(function(){            
            var ct=$(this).text();
			var arr=ct.split("=");
			$("#start_float").val(arr[0]);
			$("#start_hhmmss").val(arr[1]);
     });

     


        


    $("#speedup").click(function(){
        gvObj.playbackRate+=0.25;
        $("#speedrate").text(gvObj.playbackRate);
		$("#speed").text(gvObj.playbackRate);
     });
    $("#speeddn").click(function(){
        gvObj.playbackRate-=0.25;
        $("#speedrate").text(gvObj.playbackRate);
		$("#speed").text(gvObj.playbackRate);
     });
     
     


	$("#hhmmssToDecimal").click(function(){
		var hhmmss=$("#start_hhmmss").val();
		console.log(hhmmss);
		var v=moment.duration(hhmmss).asSeconds();
		console.log(v);
		$("#start_float").val(v);
	
	});
	
	
	$("#minus_seconds").click(function(){
		var time=$("#start_float").val();
		var itime=parseFloat(time)-1.0;
		$("#start_float").val(itime);
	});
	
	
	$("#playback1s").click(function(){
		gvObj.pause();
        gvObj.currentTime -= 5.0;
        if(gvObj.currentTime<0) gvObj.currentTime=0;
        gvObj.play();
		
		show_current_time();
	});
	
	
	$("#playforward1s").click(function(){
		gvObj.pause();
        gvObj.currentTime += 1.0;
        if(gvObj.currentTime<0) gvObj.currentTime=0;
        gvObj.play();
		
		show_current_time();
	});
	

	$("#videoSize").click(function(){
		var width=100+parseInt($("#myAudio").attr("width"));
		if(width>888){
			width=100;
		}
		$("#myAudio").attr("width",width);
	});
	
});////////////////////////////////
     
    
 
