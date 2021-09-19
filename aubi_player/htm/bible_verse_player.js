

$(function () {
    //console.log(NIV)
    $("#Bk_Chp_gen").on("click", function () {
        $(this).addClass(".hili").hide()
        gen_bible_table()
    })

    const urlParams = new URLSearchParams(window.location.search);
    var bcv = urlParams.get('bcv');
    if (bcv) {
        play_url_param_bcv(bcv)
    }
    else {
        gen_bible_table()
    }


    //setTimeout(function () {
    //}, 1000)


});////////////////////////////////

function append_playedItm(bcv, txt) {
    var nExist = $("#playedBoard").find(`.playedItm[bcv='${bcv}']`).length
    if (!nExist) {
        var dis = $(`<div><a class='playedItm' bcv='${bcv}'>${bcv}</a><br><a>${txt}</a></div>`).on("click", playedItm_scroll2view)
        $("#playedBoard").append(dis)
    }
}
function get_audio_info(bcv) {
    //console.log("bcv=", bcv)
    bcv = bcv.replace(/\s/g, "")
    var mat = bcv.match("([0-9a-zA-Z]{3})([0-9]+)[\:]([0-9]+)")
    if (!mat) {
        return alert(bcv + ": invalid.")
    }
    //console.log(mat)
    var Bk = mat[1]
    var Chp = mat[2]
    var Vrs = mat[3]
    this.audsrc = Audio_Bible_Struct.findAudioUrlFolderPath(Bk, Chp)
    this.BkChp = Bk + Chp

    var BibleObj = VrsAudioRelativePosLen_NIV
    this.relativePos = BibleObj[Bk][Chp][Vrs][0]
    this.relativeLen = BibleObj[Bk][Chp][Vrs][1]
    this.txt = NIV[Bk][Chp][Vrs]
}
function play_url_param_bcv(bcv) {
    var audinfo = new get_audio_info(bcv)
    append_playedItm(bcv, audinfo.txt)
    init_ui_audio(audinfo)
}
function gen_bible_table() {

    var BibleObj = VrsAudioRelativePosLen_NIV
    var trs = ""
    for (let Bk in BibleObj) {
        //console.log(Bk)
        for (let Chp in BibleObj[Bk]) {
            //console.log(Bk)
            trs += `<tr><td>${Bk}${Chp}</td><td>`
            for (let Vrs in BibleObj[Bk][Chp]) {
                var bcv = `${Bk}${Chp}:${Vrs}`
                trs += `<a class='vrsItm' title='${bcv}' bcv='${bcv}'> ${Vrs}</a>,`;
            }
            trs = trs.replace(/[\,]$/, "")
            trs += "</td></tr>"
        }
    }
    $("#myAudioFileNameSelect tbody").append(trs).find(".vrsItm").on("click", function () {
        var bcv = $(this).attr("bcv")
        var audinfo = new get_audio_info(bcv)

        $(".hili").removeClass("hili")
        $(this).addClass("hili")

        append_playedItm(bcv, audinfo.txt)
        init_ui_audio(audinfo)
    });
}

function playedItm_scroll2view() {
    var bcv = $(this).text()
    var audinfo = new get_audio_info(bcv)

    $(".hilihead").removeClass("hilihead")
    $(this).find(".playedItm").addClass("hilihead")
    $("#myAudioFileNameSelect td").each(function () {
        var itm = $(this).text().trim()
        if (itm === audinfo.BkChp) {
            $(this)[0].scrollIntoView()
            $(this).addClass("hilihead")
            return
        }
    })

    init_ui_audio(audinfo)
}

function init_ui_audio(audinfo) {
    if (!gvObj) {
        gvObj = document.getElementById('myAudio');
    }
    $("#filename").val(audinfo.audsrc)

    gvObj.src = audinfo.audsrc
    gvObj.muted = true;
    var stop_time = -1, start_time = -1
    gvObj.oncanplaythrough = function () {
        var maxlen = gvObj.duration;//(audio len in seconds)
        $("#dbg").append(`<br>oncanplaythrough maxlen=${maxlen}`);
    }
    gvObj.onplay = function () {
        var maxlen = gvObj.duration;//(audio len in seconds)
        $("#dbg").append(`onplay maxlen=${maxlen}`);
        if (!maxlen) {
            alert(maxlen + "duration failed:" + audinfo.audsrc)
            return;
        }

        var startime = parseFloat(maxlen) * parseFloat(audinfo.relativePos)
        var duratime = parseFloat(maxlen) * parseFloat(audinfo.relativeLen)
        var offsettime = parseFloat($("#offset_star").val())
        var offsetspan = parseFloat($("#offset_span").val())

        $("#start_float").val(startime.toFixed(4))
        $("#durat_float").val(duratime.toFixed(4))

        
        $("#start_float").addClass("readyplay")
        $("#durat_float").addClass("readyplay")

        start_time = startime + offsettime
        stop_time = start_time + duratime + offsetspan

        gvObj.currentTime = start_time
        gvObj.muted = false;
        //gvObj.play()
    }

    gvObj.onended = (event) => {
        $("#dbg").append('<br>Video stopped either because 1) it was over, ' + 'or 2) no further data is available.');
        if (gvObj.m_loop_bPaused === true) return
        setTimeout(function () {
            if (start_time > 0) {
                gvObj.play()
            }
        }, 3000)
    };
    gvObj.onemptied = (event) => {
        $("#dbg").append('<br>Uh oh. The media is empty. Did you call load()?');
        var maxlen = gvObj.duration;//(audio len in seconds)
        $("#dbg").append(`onplay maxlen=${maxlen}`);
    };
    gvObj.onpause = (event) => {
        var maxlen = gvObj.duration;//(audio len in seconds)
        $("#dbg").append(`<br>onpaused maxlen=${maxlen}`);

        var txt = "" + gvObj.currentTime
        txt += " = " + Util.convert_seconds_to_hhmmss(txt)
        $("#show_stop_time").text(txt)
    };
    gvObj.ontimeupdate = function () {
        if (-1 === stop_time) return
        if (gvObj.currentTime >= stop_time) {
            gvObj.pause()
            
            ////// loop after 3s. 
            if (gvObj.m_loop_bPaused === true) return
            setTimeout(function () {
                if (start_time > 0) {
                    gvObj.play()
                }
            }, 3000)
        }
    }
}
function loop_start() {
    var offsetime = parseFloat($("#offset_star").val())
    var startTime = $("#start_float").val()
    if ("0.0" === startTime) {
        alert("not init yet.")
    }

    var start_time = offsetime + parseFloat(startTime)

    $("#dbg").append("<br>loop_start: start_time=" + start_time)

    gvObj.src = $("#filename").val()
    gvObj.muted = false;
    gvObj.currentTime = start_time
    gvObj.m_loop_bPaused = false
}