var gvObj = null

$(function () {
    //console.log(NIV)
    $("#Bk_Chp_gen").on("click", function () {
        $(this).hide()
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
        var dis = $(`<div><a class='playedItm' bcv='${bcv}'>${bcv}</a><br><a>${txt}</a></div>`);
        $(dis).find(".playedItm").on("click", playedItm_scroll2view)
        $("#playedBoard").append(dis)
    }

    $("#playedBoard").find(`.playedItm[bcv='${bcv}']`).addClass("hili")

}
function get_audio_meta(bcv) {
    //console.log("bcv=", bcv)
    this.bcv = bcv
    bcv = bcv.replace(/\s/g, "")
    var mat = bcv.match("([0-9a-zA-Z]{3})([0-9]+)[\:]([0-9]+)")
    if (!mat) {
        return alert(bcv + ": invalid.")
    }
    //console.log(mat)
    var Bok = mat[1]
    var Chp = mat[2]
    var Vrs = mat[3]
    this.audsrc = Audio_Bible_Struct.findAudioUrlFolderPath(Bok, Chp)
    this.BkChp = Bok + Chp

    this.Bok = Bok
    this.Chp = Chp
    this.Vrs = Vrs

    var BibleObj = VrsAudioRelativePosLen_NIV
    this.relativePos = BibleObj[Bok][Chp][Vrs][0]
    this.relativeLen = BibleObj[Bok][Chp][Vrs][1]
    this.txt = NIV[Bok][Chp][Vrs]

    if ("array" === typeof (bible_verse_playoffsets[Bok][Chp][Vrs])) {
        this.offset_Star = bible_verse_playoffsets[Bok][Chp][Vrs][0]
        this.offset_Span = bible_verse_playoffsets[Bok][Chp][Vrs][1]
    }
}
get_audio_meta.prototype.offsetary = function (ar) {
    var Bok = this.Bok
    var Chp = this.Chp
    var Vrs = this.Vrs
    if ("object" === typeof (ar) && ar.length > 1) {//set
        bible_verse_playoffsets[Bok][Chp][Vrs] = ar
    } else {//get
        if ("object" === typeof (bible_verse_playoffsets[Bok][Chp][Vrs])) {
            return bible_verse_playoffsets[Bok][Chp][Vrs]
        } else {
            return null
        }
    }
}
get_audio_meta.prototype.offsets_export = function () {
    var str = JSON.stringify(bible_verse_playoffsets,4)
    $("#dbg").html(str)
}
function play_url_param_bcv(bcv) {
    var audinfo = new get_audio_meta(bcv)
    append_playedItm(bcv, audinfo.txt)
    create_audio_uictr(audinfo)
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
        var audinfo = new get_audio_meta(bcv)

        $(".hili").removeClass("hili")
        $(this).addClass("hili")

        append_playedItm(bcv, audinfo.txt)
        create_audio_uictr(audinfo)
    });
}
function search_table_item_scroll2view(tabRowHead) {
    $("#myAudioFileNameSelect td").each(function () {
        var itm = $(this).text().trim()
        if (itm === tabRowHead) {
            $(this)[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }) //relative scrollintoview.
            $(this).addClass("hilihead")
            return
        }
    })
}
function playedItm_scroll2view() {
    var bcv = $(this).text()
    var audinfo = new get_audio_meta(bcv)

    $(".hilihead").removeClass("hilihead")
    $(this).parentsUntil("#playedBoard").find(".playedItm").addClass("hilihead")

    search_table_item_scroll2view(audinfo.BkChp)
    //$("body")[0].scrollIntoView(true)
    create_audio_uictr(audinfo)
}

function create_audio_uictr(audinfo) {
    if (!gvObj) {
        gvObj = document.getElementById('myAudio');
    }
    $("#filename").val(audinfo.audsrc)
    gvObj.m_audinfo = audinfo;

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


        var offary = audinfo.offsetary()
        if (offary && offary.length > 1) {
            offsettime = offary[0]
            offsetspan = offary[1]
            $("#offset_star").val(offsettime)
            $("#offset_span").val(offsetspan)
            $("#offset_star").addClass("readyplay")
            $("#offset_span").addClass("readyplay")
        } else {
            audinfo.offsetary([offsettime, offsetspan])
            $("#offset_star").removeClass("readyplay")
            $("#offset_span").removeClass("readyplay")
        }

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
        txt += " = " + TimeFormatConverter.convert_seconds_to_hhmmss(txt)
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

function store_offsets_data() {

}

function update_offsets_data() {
    var x = parseInt($("#offset_star").val())
    var y = parseInt($("#offset_span").val())
    gvObj.m_audinfo.offsetary([x,y])
}