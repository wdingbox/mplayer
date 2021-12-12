var gvObj = null

var gOffsetsObj = null

var test = typeof (VrsAudioOffsets_NIV)


var localStorage_playOffsets = {
    clear_all: function () {
        localStorage.setItem("VrsAudioOffsets_NIV", '')
        localStorage.setItem("playedList", '')
    },
    save_all: function (b) {
        this.save_offsets()
        this.save_playedList()
    },
    load_offsets: function () {
        var vrs1 = VrsAudioOffsets_NIV["Gen"]["1"]["1"]
        var str = localStorage.getItem("VrsAudioOffsets_NIV")
        if (str) {
            VrsAudioOffsets_NIV = JSON.parse(str)
        }
        if (!VrsAudioOffsets_NIV) {
            alert("error load local storage")
        }
        //var vrs2 = VrsAudioOffsets_NIV["Gen"]["1"]["1"]
    },
    save_offsets: function () {
        var str = JSON.stringify(VrsAudioOffsets_NIV)
        localStorage.setItem("VrsAudioOffsets_NIV", str)

        var str = JSON.stringify(VrsAudioOffsets_NIV, null, 4)
        $("#txa").val("var VrsAudioOffsets_NIV=" + str)
    },

    save_playedList: function () {
        var ary = []
        $("#playedBoard").find(`.playedbcv`).each(function () {
            var bcv = $(this).text()
            ary.push(bcv)
        })
        localStorage.setItem("playedList", ary)
    },
    load_playedList: function () {
        var ary = localStorage.getItem("playedList")
        if (!ary) return
        ary.split(",").sort(function (a, b) {
            return a.localeCompare(b); //natural-sort
        }).forEach(function (bcv) {
            appendToPlayBoard(bcv)
        })

    }
}



$(function () {
    $("#DeletePlayingItem").hide()
    localStorage_playOffsets.load_offsets()
    localStorage_playOffsets.load_playedList()
    //console.log(NIV)
    $("#Bk_Chp_gen").on("click", function () {

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

    $("#maxlen").on("click", function () {
        var maxlen = parseInt($(this).text())
        $("#offset_span").val(maxlen)
        update_offsets_data()
    })

});////////////////////////////////


function Audio_Info(bcv) {
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

}
Audio_Info.prototype.offsetary = function (ar) {
    var Bok = this.Bok
    var Chp = this.Chp
    var Vrs = this.Vrs
    if ("object" === typeof (ar) && ar.length > 1) {//set
        VrsAudioOffsets_NIV[Bok][Chp][Vrs] = ar
    } else {//get
        var itme = VrsAudioOffsets_NIV[Bok][Chp][Vrs]
        var styp = typeof (itme)
        if ("object" === styp) {
            return VrsAudioOffsets_NIV[Bok][Chp][Vrs]
        } else {
            return null
        }
    }
}




function RemovePlayingItemFromPlayedBoard() {
    $("#playedBoard").find(".playingvrs").parent().hide("slide").empty()

    $("#DeletePlayingItem").hide("slide");
    //$("#search_BkChp").val("")
    loop_stop()
}
function appendToPlayBoard(bcv) {
    var audinfo = new Audio_Info(bcv)
    var nExist = $("#playedBoard").find(`.playedbcv[bcv='${bcv}']`).length
    if (!nExist) {
        var dis = $(`<tr class='playedItem'><td class='playedbcv' bcv='${bcv}'>${bcv}</td><td>${audinfo.txt}</td></tr>`);
        $(dis).find(".playedbcv").on("click", onclk_playedItm)

        $("#playedBoard").append(dis)
    }

    $("#playedBoard").find(".playingvrs").removeClass("playingvrs")
    $("#playedBoard").find(`.playedbcv[bcv='${bcv}']`).addClass("playingvrs")[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
}
function play_url_param_bcv(bcv) {
    var audinfo = new Audio_Info(bcv)
    appendToPlayBoard(bcv, audinfo.txt)
    Reset_Audio_Ctrl(audinfo)
}
function gen_bible_table() {
    $("#Bk_Chp_gen").hide()

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
        var audinfo = new Audio_Info(bcv)


        $(this).toggleClass("hili")

        appendToPlayBoard(bcv, audinfo.txt)
        Reset_Audio_Ctrl(audinfo)
    });
}
function search_table_item_scroll2view(BkChp) {
    var idx = BkChp.indexOf(":")
    if (idx >= 0) {
        BkChp = BkChp.substr(0, idx)
    }
    if (BkChp.length === 3) BkChp += "1"
    $(".hiliscrollview").removeClass("hiliscrollview")
    //$("#myAudioFileNameSelect td").each(function () {
    //    var itm = $(this).text().trim()
    //    if (itm === BkChp) {
    //        $("#myAudioFileNameSelect").find("td:contains('Rev22')")[0].scrollIntoView()
    //        
    //        $(this)[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }) //relative scrollintoview.
    //        
    //        setTimeout(function(){
    //            $("body")[0].scrollIntoView()
    //        },1000)
    //        
    //        $(this).addClass("hiliscrollview")
    //        return
    //    }
    //})
}
function onclk_playedItm() {
    var bcv = $(this).text()
    var audinfo = new Audio_Info(bcv)


    $("#playedBoard").find(".playingvrs").removeClass("playingvrs")
    $(this).addClass("playingvrs")

    $("#DeletePlayingItem").show("slide");
    $("#search_BkChp").val(bcv)

    //search_table_item_scroll2view(audinfo.BkChp)
    //$("body")[0].scrollIntoView(true)
    Reset_Audio_Ctrl(audinfo)

}

function Reset_Audio_Ctrl(audinfo) {
    if (!gvObj) {
        gvObj = document.getElementById('myAudio');
    }
    $("#txa").val(audinfo.audsrc)
    gvObj.m_audinfo = audinfo;

    gvObj.src = audinfo.audsrc
    gvObj.muted = true;
    gvObj.playbackRate = parseFloat($("#speed").text())

    var stop_time = -1, start_time = -1
    gvObj.oncanplaythrough = function () {
        var maxlen = gvObj.duration;//(audio len in seconds)
        $("#dbg").append(`<br>oncanplaythrough maxlen=${maxlen}`);
        $("#maxlen").text(1 + parseInt(maxlen))
    }
    gvObj.onplay = function () {
        var maxlen = gvObj.duration;//(audio len in seconds)
        $("#dbg").append(`<br>onplay maxlen=${maxlen}`);
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
            $("#offset_star").addClass("hili_offsets")
            $("#offset_span").addClass("hili_offsets")
        } else {
            audinfo.offsetary([offsettime, offsetspan])
            $("#offset_star").removeClass("hili_offsets")
            $("#offset_span").removeClass("hili_offsets")
        }

        $("#start_float").val(startime.toFixed(4))
        $("#durat_float").val(duratime.toFixed(4))


        $("#start_float").addClass("hili_offsets")
        $("#durat_float").addClass("hili_offsets")

        start_time = startime + offsettime
        stop_time = start_time + duratime + offsetspan

        gvObj.currentTime = start_time
        gvObj.muted = false;
        //gvObj.play()
    }

    gvObj.onended = (event) => {
        $("#dbg").append('<br>Video stopped either because 1) it was over, or 2) no further data is available.');
        if (gvObj.m_loop_bPaused === true) return
        setTimeout(function () {
            if (start_time >= 0) {
                gvObj.play()
            }
        }, 3000)
    };
    gvObj.onemptied = (event) => {
        $("#dbg").append('<br>The media is empty. Did you call load()?');
        var maxlen = gvObj.duration;// (audio len in seconds)
        $("#dbg").append(`<br>onemptied maxlen=${maxlen}`);
    };
    gvObj.onpause = (event) => {
        var maxlen = gvObj.duration;// (audio len in seconds)
        $("#dbg").append(`<br>onpaused maxlen=${maxlen}`);

        var txt = "" + gvObj.currentTime
        txt += " = " + TimeFormatConverter.convert_seconds_to_hhmmss(txt)
        $("#show_stop_time").text(gvObj.m_audinfo.bcv + " @ " + txt)
    };
    gvObj.ontimeupdate = function () {
        gvObj.playbackRate = parseFloat($("#speed").text())
        if (-1 === stop_time) return
        if (gvObj.currentTime > stop_time) {
            gvObj.pause()

            ////// loop after 3s. 
            if (gvObj.m_loop_bPaused === true) return
            setTimeout(function () {
                if (start_time >= 0) {
                    gvObj.play()
                }
            }, 3000)
        }
    }
}




function get_ui_start_time() {
    var offsetime = parseFloat($("#offset_star").val())
    var startTime = $("#start_float").val()
    if ("0.0" === startTime) {
        alert("not init yet.")
    }

    var start_time = offsetime + parseFloat(startTime)

    $("#dbg").append("<br>loop_start: start_time=" + start_time)
    return parseFloat(startTime)
}
function get_ui_span_time() {
    var offsetime = parseFloat($("#offset_span").val())
    var durat_float = $("#durat_float").val()
    if ("0.0" === durat_float) {
        alert("not init yet.")
    }

    durat_float = offsetime + parseFloat(durat_float)

    $("#dbg").append("<br>loop_start: start_time=" + durat_float)
    return parseFloat(durat_float)
}
function delta_offset(ioffstart, ioffspan) {
    var x = parseInt($("#offset_star").val()) + ioffstart
    var y = parseInt($("#offset_span").val()) + ioffspan
    $("#offset_star").val(x)
    $("#offset_span").val(y)
    var retary = gvObj.m_audinfo.offsetary([x, y])
    var star = get_ui_start_time()
    if (0 === ioffstart) {
        star += get_ui_span_time()
        gvObj.currentTime = (star - 5)
    }
    if (0 === ioffspan) {
        loop_start(star - 3)
    }
}

function loop_start(startime) {
    gvObj.src = $("#txa").val()
    gvObj.muted = false;
    gvObj.currentTime = (null === startime) ? get_ui_start_time() : startime
    gvObj.m_loop_bPaused = false
    //gvObj.play()
}
function loop_stop() {
    gvObj.pause()
    gvObj.m_loop_bPaused = true
    $(".hili_offsets").removeClass("hili_offsets")
}
function store_offsets_data() {

}

function update_offsets_data() {
    var x = parseInt($("#offset_star").val())
    var y = parseInt($("#offset_span").val())
    gvObj.m_audinfo.offsetary([x, y])
}