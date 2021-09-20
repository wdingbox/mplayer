var gvObj = null

var gOffsetsObj = null

var test = typeof (VrsAudioOffsets_NIV)


var localStorage_playOffsets = {
    save_all:function(){
        this.save_offsets()
        this.save_playedList()
    },
    load_offsets: function () {
        var vrs1 = VrsAudioOffsets_NIV["Gen"]["1"]["1"]
        var str = localStorage.getItem("VrsAudioOffsets_NIV")
        if (str) {
            VrsAudioOffsets_NIV = JSON.parse(str)
        }
        var vrs2 = VrsAudioOffsets_NIV["Gen"]["1"]["1"]
    },
    save_offsets: function () {
        var str = JSON.stringify(VrsAudioOffsets_NIV)
        localStorage.setItem("VrsAudioOffsets_NIV", str)

        var str = JSON.stringify(VrsAudioOffsets_NIV, null, 4)
        $("#txa").val(str)
    },

    save_playedList:function(){
        var ary = []
        $("#playedBoard").find(`.playedbcv`).each(function(){
            var bcv = $(this).text()
            ary.push(bcv)
        })
        localStorage.setItem("playedList", ary)
    },
    load_playedList:function(){
        var ary = localStorage.getItem("playedList")
        if(!ary) return
        ary.split(",").sort(function(a, b) {
            return a.localeCompare(b); //natural-sort
          }).forEach(function(bcv){
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

}
get_audio_meta.prototype.offsetary = function (ar) {
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
}
function appendToPlayBoard(bcv) {
    var audinfo = new get_audio_meta(bcv)
    var nExist = $("#playedBoard").find(`.playedbcv[bcv='${bcv}']`).length
    if (!nExist) {
        var dis = $(`<tr class='playedItem'><td class='playedbcv' bcv='${bcv}'>${bcv}</td><td>${audinfo.txt}</td></tr>`);
        $(dis).find(".playedbcv").on("click", onclk_playedItm)

        $("#playedBoard").append(dis)
    }

    $("#playedBoard").find(".playingvrs").removeClass("playingvrs")
    $("#playedBoard").find(`.playedbcv[bcv='${bcv}']`).addClass("playingvrs")

}
function play_url_param_bcv(bcv) {
    var audinfo = new get_audio_meta(bcv)
    appendToPlayBoard(bcv, audinfo.txt)
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


        $(this).toggleClass("hili")

        appendToPlayBoard(bcv, audinfo.txt)
        create_audio_uictr(audinfo)
    });
}
function search_table_item_scroll2view(tabRowHead) {
    $(".hiliscrollview").removeClass("hiliscrollview")
    $("#myAudioFileNameSelect td").each(function () {
        var itm = $(this).text().trim()
        if (itm === tabRowHead) {
            $(this)[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }) //relative scrollintoview.
            $(this).addClass("hiliscrollview")
            return
        }
    })
}
function onclk_playedItm() {
    var bcv = $(this).text()
    var audinfo = new get_audio_meta(bcv)


    $("#playedBoard").find(".playingvrs").removeClass("playingvrs")
    $(this).addClass("playingvrs")

    $("#DeletePlayingItem").show("slide");
    $("#search_BkChp").val(bcv)

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
    gvObj.m_audinfo.offsetary([x, y])
}