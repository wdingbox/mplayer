

$(function () {
    //console.log(NIV)
    $("#Bk_Chp_gen").on("click", function () {
        gen_bible_table()
    })

    const urlParams = new URLSearchParams(window.location.search);
    var bcv = urlParams.get('bcv');
    var txt = urlParams.get('txt')
    if (bcv) {
        play_param_bcv(bcv, txt)
    }
    else {
        gen_bible_table()
    }

    gvObj = document.getElementById('myAudio');
    //setTimeout(function () {
    //}, 1000)


});////////////////////////////////

function play_param_bcv(bcv, txt) {
    console.log("bcv=", bcv)
    bcv = bcv.replace(/\s/g, "")
    var mat = bcv.match("([0-9a-zA-Z]{3})([0-9]+)[\:]([0-9]+)")
    if (!mat) {
        return alert("bcv value invalid.")
    }
    console.log(mat)
    var Bk = mat[1]
    var Chp = mat[2]
    var Vrs = mat[3]
    var audsrc = Audio_Bible_Struct.findAudioUrlFolderPath(Bk, Chp)

    var BibleObj = VrsAudioRelativePosLen_NIV
    var relativePosi = BibleObj[Bk][Chp][Vrs]

    var dis = `${bcv} <br>${txt}`
    $("#playname").html(dis)
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
            var starttime = parseFloat(maxlen) * parseFloat(relativePosi)
            //gvObj.currentTime = starttime
            //gvObj.play()
            $("#start_float").val(starttime)
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

                tab += `<a src='${src}' title='${bcv} bcv='${bcv}' ${relativePosi}' relativePosi=${relativePosi} relativeLen='${relativeLen}' Bok='${Bk}' Chp='${Chp}' Vrs='${Vrs}'> ${Vrs}</a>,`;
            }
            tab = tab.replace(/,$/, "")
            tab += "</td></tr>"
        }
    }
    $("#myAudioFileNameSelect tbody").append(tab).find("a").on("click", function () {
        var audsrc = $(this).attr("src")

        var Bok = $(this).attr("Bok")
        var Chp = $(this).attr("Chp")
        var Vrs = $(this).attr("Vrs")
        var bcv = $(this).attr("bcv")
        var Txt = NIV[Bok][Chp][Vrs]

        var relativePosi = parseFloat($(this).attr("relativePosi"))
        var relativeLen = parseFloat($(this).attr("relativeLen"))
        $(".hili").removeClass("hili")
        $(this).addClass("hili")

        var title = $(this).attr("title")
        $("#playname").html(title + "<br>" + Txt)

        $("#filename").val(audsrc)

        gvObj = null
        gvObj = document.getElementById('myAudio');

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

                $("#start_float").val(starttime)
                $("#duration_float").val(duratime)

                $("#start_loop").trigger("click")
            }, 500)
        }, 0)



        //


    });
}