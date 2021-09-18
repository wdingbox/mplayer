

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
    console.log("bcv=", bcv)
    bcv = bcv.replace(/\s/g, "")
    var mat = bcv.match("([0-9a-zA-Z]{3})([0-9]+)[\:]([0-9]+)")
    if (!mat) {
        return alert("?bcv= value invalid.")
    }
    console.log(mat)
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
    //init_ui_audio(audinfo)
}
function init_ui_audio(audinfo) {
    function init_ui(audinfo){
        var maxlen = gvObj.duration;//(audio len in seconds)
        if (!maxlen) {
            alert("duration failed:" + audinfo.audsrc)
            return;
        }
        console.log("maxlen", maxlen)
        var startime = parseFloat(maxlen) * parseFloat(audinfo.relativePos)
        var duratime = parseFloat(maxlen) * parseFloat(audinfo.relativeLen)
        //gvObj.currentTime = starttime
        //gvObj.play()
        $("#start_float").val(startime.toFixed(4))
        $("#durat_float").val(duratime.toFixed(4))
        console.log(audinfo.audsrc)

        setTimeout(function(){
            $("#start_loop").focus()
            $("#start_loop").trigger("click")
        },100)
    }

    if (!gvObj) {
        gvObj = document.getElementById('myAudio');
    }
    $("#filename").val(audinfo.audsrc)
    setTimeout(function () {

        gvObj.src = audinfo.audsrc
        gvObj.pause()
        //gvObj.muted = false;
        

        if(gvObj.onplay){
            gvObj.onplay(function () {
            
            })
        }
        
        setTimeout(function () {
            init_ui(audinfo);
        }, 1500)
    }, 0)
}
function gen_bible_table() {

    var BibleObj = VrsAudioRelativePosLen_NIV
    var trs = ""
    for (let Bk in BibleObj) {
        console.log(Bk)
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