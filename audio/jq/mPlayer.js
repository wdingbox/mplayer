

var gvObj = null;


Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
}
Date.prototype.addMilliseconds = function (mils) {
	var date = new Date(this.valueOf());
	var uuuu = date.getTime();//return in milliseconds value of date. 
	date.setTime(uuuu + mils);
	return date;
}
var Util = {
	convert_seconds_to_hhmmss: function (snd) {
		var mlis = parseFloat(snd) * 1000.0;
		var dt0 = new Date(0, 0, 0, 0, 0, 0, 0);
		var dt = dt0.addMilliseconds(mlis);
		var yy = dt.getYear().toString().padStart(2, "0");
		var mn = dt.getMonth().toString().padStart(2, "0");
		var dd = dt.getDate().toString().padStart(2, "0");
		var hh = dt.getHours().toString().padStart(2, "0");
		var mm = dt.getMinutes().toString().padStart(2, "0");
		var ss = dt.getSeconds().toString().padStart(2, "0");
		var uu = dt.getMilliseconds().toString().padStart(2, "0");
		console.log(`${yy}-${mn}-${dd} ${hh}:${mm}:${ss}.${uu}`);
		return `${hh}:${mm}:${ss}.${uu}`;
	},
	convert_hhmmss_to_seconds: function (hhmmss) {
		var arr = hhmmss.split(":");
		for (var i = 0; i < arr.length; i++) {
			arr[i] = parseInt(arr[i]);
		}
		return arr[0] * 3600 + arr[1] * 60 + arr[2];
	}
}

Util.convert_seconds_to_hhmmss(59.123);//second
Util.convert_seconds_to_hhmmss(159.123);//second



function show_current_time() {
	var curTime = gvObj.currentTime;
	console.log(curTime);

	var hhmmss = Util.convert_seconds_to_hhmmss(curTime);

	$("#start_float").val(curTime);
	$("#start_hhmmss").val(hhmmss);

}



function gen_audio_sel(mPlayerResrs, vobj) {
	var pathfileArr = [];

	var optns = "<option></option>";
	for (var path in mPlayerResrs) {
		console.log("path:" + path);
		optns += "<optgroup  label='" + path + "'>";
		for (var filename in mPlayerResrs[path]) {
			var key = path + filename;
			optns += "<option value='" + key + "' path='" + path + "' filename='" + filename + "'>" + filename + "</option>";
			console.log(key);
			pathfileArr.push(key);
		}
		optns += "</optgroup>";
	};

	vobj.m_srcArr = pathfileArr;
	vobj.m_srcIdx = 0;

	$("#myAudioFileNameSelect").html(optns);
};


function gen_file_info_table(pathfilename, mPlayerResrs) {
	var ilast = 1 + pathfilename.lastIndexOf("/");
	var path = pathfilename.substr(0, ilast);
	var file = pathfilename.substr(ilast);
	var caption = "<caption>" + file + "<caption>";
	console.log(file);
	var trs = "<tr><td>start</td><td>desc</td></tr>";
	var obj = mPlayerResrs[path][file];
	console.log(obj);
	for (var key in obj) {
		trs += "<tr><td onclick='hhmmss2input(this)'>" + key + "</td><td>" + obj[key] + "</td></tr>";
		console.log(key);
	};
	$("#tabinfor").html(caption + trs);
}


function hhmmss2input(_THIS) {
	var hhmmss = $(_THIS).text();
	$("#start_hhmmss").val(hhmmss);
}



$(function () {
	gvObj = document.getElementById('myAudio');
	gvObj.addEventListener('ended', function () {
		if (!!gvObj.m_srcArr) {

			if (gvObj.m_srcArr.length > gvObj.m_srcIdx) {
				gvObj.m_srcIdx++;
			}
			else {
				gvObj.m_srcIdx = 0;
			}
			gvObj.src = gvObj.m_srcArr[gvObj.m_srcIdx];
			gvObj.playbackRate = parseFloat($("#speed").text());
			gvObj.play();


			var pathfile = gvObj.m_srcArr[gvObj.m_srcIdx];
			var ilast = 1 + pathfile.lastIndexOf("/");
			var path = pathfile.substr(0, ilast);
			var file = pathfile.substr(ilast);
			$("#myAudioFileNameSelect").val(file);

			console.log(pathfile);
			gen_file_info_table(pathfile, mPlayerResources);
		}//fi

	});


	gen_audio_sel(mPlayerResources, gvObj);





	$("#myAudioFileNameSelect").change(function () {
		var filename = $(this).val();
		gvObj.src = filename;
		gvObj.play();
		$("#speed").text(gvObj.playbackRate);
		gen_file_info_table(filename, mPlayerResources);
	});

	$("#play").click(function () {

		gvObj.currentTime = parseFloat($("#start_float").val());
		gvObj.play();
	});
	$("#stop").click(function () {
		gvObj.pause();
		show_current_time();

		$("#start_float").val(gvObj.currentTime);
	});








	$("#speedup").click(function () {
		gvObj.playbackRate += 0.25;
		$("#speedrate").text(gvObj.playbackRate);
		$("#speed").text(gvObj.playbackRate);
	});
	$("#speeddn").click(function () {
		gvObj.playbackRate -= 0.25;
		$("#speedrate").text(gvObj.playbackRate);
		$("#speed").text(gvObj.playbackRate);
	});




	$("#hhmmssToDecimal").click(function () {
		var hhmmss = $("#start_hhmmss").val();
		console.log(hhmmss);
		var v = Util.convert_hhmmss_to_seconds(hhmmss);
		console.log(v);
		$("#start_float").val(v);

	});


	$("#minus_seconds").click(function () {
		var time = $("#start_float").val();
		var itime = parseFloat(time) - 1.0;
		$("#start_float").val(itime);
	});


	$("#playback1s").click(function () {
		gvObj.pause();
		gvObj.currentTime -= 5.0;
		if (gvObj.currentTime < 0) gvObj.currentTime = 0;
		gvObj.play();

		show_current_time();
	});


	$("#playforward1s").click(function () {
		gvObj.pause();
		gvObj.currentTime += 1.0;
		if (gvObj.currentTime < 0) gvObj.currentTime = 0;
		gvObj.play();

		show_current_time();
	});


	$("#videoSize").click(function () {
		var width = 100 + parseInt($("#myAudio").attr("width"));
		if (width > 888) {
			width = 100;
		}
		$("#myAudio").attr("width", width);
	});

});////////////////////////////////



