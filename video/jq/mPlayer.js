

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
}



function gen_audio_sel(mPlayerResrs, vobj) {
	var pathfileArr = [];

	var path = mPlayerResrs.path;
	var trs = "";
	var idx = 0;
	for (var filename in mPlayerResrs.files) {
		var key = path + filename;
		trs += `<tr><td>${++idx}</td>`;
		trs += `<td class="src" onclick="start_play('${key}');" value='${key}' path='${path}'>${filename}</td>`;
		trs += `<td>${mPlayerResrs.files[filename]['00:00:00.0']}</td>`;
		console.log(key);

		trs += "</tr>";
		pathfileArr.push(key);
	};

	vobj.m_srcArr = pathfileArr;
	vobj.m_srcIdx = 0;

	$("#myAudioFileNameSelect tbody").html(trs).find(".src").bind("click", function () {
		$(".hili").removeClass("hili");
		$(this).toggleClass("hili");
	});
	Util.HeadersWidthAdjustment();
};


function gen_file_info_table(pathfilename, mPlayerResrs) {
	var arr = pathfilename.split("/");
	var path = arr[0];
	var file = arr[arr.length - 1];
	var caption = "<caption>" + pathfilename + "<caption>";
	console.log(file);
	var trs = "<tr><td>start</td><td>desc</td></tr>";
	var obj = mPlayerResrs.files[file];
	console.log(obj);
	for (var key in obj) {
		trs += "<tr><td onclick='hhmmss2input(this)'>" + key + "</td><td>" + obj[key] + "</td></tr>";
		console.log(key);
	};
	$("#tabinfor").html(caption + trs);
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
	$("#tabinfor caption").text(filename);
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
			$("#myAudioFileNameSelect caption").text(file);

			console.log(pathfile);
			gen_file_info_table(pathfile, mPlayerResources);
		}//fi
	});


	gen_audio_sel(mPlayerResources, gvObj);


	$("#play").click(function () {
		gvObj.currentTime = parseFloat($("#start_float").val());
		gvObj.play();
	});


	$("#videoSize").click(function () {
		var width = 100 + parseInt($("#myAudio").attr("width"));
		if (width > 888) {
			width = 100;
		}
		$("#myAudio").attr("width", width);
	});


	$("#jsondata").click(function () {
		var str = $("#txta").val();
		var pos = 1 + str.lastIndexOf("=");
		str = str.substr(pos);
		mPlayerResources = JSON.parse(str);
		gen_audio_sel(mPlayerResources, gvObj);
	})

});////////////////////////////////
