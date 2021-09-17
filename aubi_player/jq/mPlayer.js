

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
	},
	HeadersWidthAdjustment: function () {//** Width adjustment.
		$("table tbody tr:eq(0)").find("td").each(function (i) {
			var w = $(this).width();
			$(`thead th:eq(${i})`).css("width", w);
			w = $(`thead th:eq(${i})`).width();
			$(this).css("width", w);
			console.log(w);
		});
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

	var len= gvObj.duration;//(audio len in seconds)
	console.log("audio len:",len, Util.convert_seconds_to_hhmmss(len))
}



function play_forward(fdlt) {
	gvObj.pause();
	gvObj.currentTime += fdlt;
	if (gvObj.currentTime < 0) gvObj.currentTime = 0;
	if (0 != fdlt) gvObj.play();

	show_current_time();
}
function start_play(filename) {
	gvObj.src = filename;
	gvObj.play();
	$("#myAudioFileNameSelect caption").text(filename);
	gen_file_info_table(filename, mPlayerResources);
}

function hhmmss2input(_THIS) {
	var hhmmss = $(_THIS).text();
	$("#start_hhmmss").val(hhmmss);
}

function speedup(fval) {
	gvObj.playbackRate += fval;
	$("#speed").text(gvObj.playbackRate);
}