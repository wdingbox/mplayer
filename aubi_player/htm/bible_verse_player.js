

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

    gvObj = document.getElementById('myAudio');
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
function play_url_param_bcv(bcv) {
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
    var audsrc = Audio_Bible_Struct.findAudioUrlFolderPath(Bk, Chp)

    var BibleObj = VrsAudioRelativePosLen_NIV
    var relativePosi = BibleObj[Bk][Chp][Vrs][0]
    var relativeLen = BibleObj[Bk][Chp][Vrs][1]
    var txt = NIV[Bk][Chp][Vrs]

    append_playedItm(bcv, txt)

    $("#filename").val(audsrc)

    setTimeout(function () {

        gvObj.src = audsrc
        gvObj.muted = false;

        setTimeout(function () {
            var maxlen = gvObj.duration;//(audio len in seconds)
            if (!maxlen) {
                alert("try again")
                return;
            }
            console.log("maxlen", maxlen)
            var startime = parseFloat(maxlen) * parseFloat(relativePosi)
            var duratime = parseFloat(maxlen) * parseFloat(relativeLen)
            //gvObj.currentTime = starttime
            //gvObj.play()
            $("#start_float").val(startime.toFixed(4))
            $("#duration_float").val(duratime.toFixed(4))
            console.log(audsrc)
            $("#start_loop").trigger("click")
        }, 500)
    }, 0)
}

function gen_bible_table() {

    var BibleObj = VrsAudioRelativePosLen_NIV
    var tab = ""
    for (let Bk in BibleObj) {
        console.log(Bk)
        for (let Chp in BibleObj[Bk]) {
            //console.log(Bk)
            tab += `<tr><td>${Bk}${Chp}</td><td>`
            for (let Vrs in BibleObj[Bk][Chp]) {
                var relativePosi = BibleObj[Bk][Chp][Vrs][0]
                var relativeLen = BibleObj[Bk][Chp][Vrs][1]
                //console.log()
                var Chp3 = Chp.padStart(3, "0")
                var src = Audio_Bible_Struct.findAudioUrlFolderPath(Bk, Chp)
                var bcv = `${Bk}${Chp}:${Vrs}`

                tab += `<a class='vrsItm' src='${src}' title='${bcv}' bcv='${bcv}' relativePosi='${relativePosi}' relativeLen='${relativeLen}' Bok='${Bk}' Chp='${Chp}' Vrs='${Vrs}'> ${Vrs}</a>,`;
            }
            tab = tab.replace(/,$/, "")
            tab += "</td></tr>"
        }
    }
    $("#myAudioFileNameSelect tbody").append(tab).find(".vrsItm").on("click", function () {
        var audsrc = $(this).attr("src")

        var Bok = $(this).attr("Bok")
        var Chp = $(this).attr("Chp")
        var Vrs = $(this).attr("Vrs")
        var bcv = $(this).attr("bcv")
        var txt = NIV[Bok][Chp][Vrs]

        var relativePosi = parseFloat($(this).attr("relativePosi"))
        var relativeLen = parseFloat($(this).attr("relativeLen"))
        $(".hili").removeClass("hili")
        $(this).addClass("hili")


        var title = $(this).attr("title")


        append_playedItm(bcv, txt)

        $("#filename").val(audsrc)

        //gvObj = null
        //gvObj = document.getElementById('myAudio');

        setTimeout(function () {
            gvObj.src = audsrc
            //gvObj.play()
            //gvObj.pause()
            setTimeout(function () {
                var maxlen = parseFloat(gvObj.duration);//(audio len in seconds)
                if (!maxlen) {
                    alert("try again")
                    return;
                }
                console.log("maxlen", maxlen)
                var starttime = maxlen * relativePosi
                var duratime = maxlen * relativeLen

                //gvObj.currentTime = starttime
                //gvObj.play()
                console.log(audsrc)

                $("#start_float").val(starttime.toFixed(4))
                $("#duration_float").val(duratime.toFixed(4))

                $("#start_loop").trigger("click")
            }, 500)
        }, 0)



        //


    });
}

function playedItm_scroll2view() {
    var txt = $(this).text()
    var mat = txt.match(/([0-9a-zA-Z]{3}[0-9]+)[\:]*/)
    console.log(mat)
    var bkchp = mat[1]
    $(".hilihead").removeClass("hilihead")
    $(this).find(".playedItm").addClass("hilihead")
    $("#myAudioFileNameSelect td").each(function () {
        var itm = $(this).text().trim()
        if (itm === bkchp) {
            $(this)[0].scrollIntoView()
            $(this).addClass("hilihead")
            return
        }
    })
}