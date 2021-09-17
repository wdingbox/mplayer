

$(function () {
    //console.log(NIV)
    $("#Bk_Chp_gen").on("click", function () {
        gen_bible_table()
    })

    const urlParams = new URLSearchParams(window.location.search);
    var bcv = urlParams.get('bcv');
    if (bcv) {
        play_param_bcv(bcv)
    }
    else {
        gen_bible_table()
    }

    gvObj = document.getElementById('myAudio');
    //setTimeout(function () {
    //}, 1000)


});////////////////////////////////

function play_param_bcv(bcv) {
    console.log("bcv=", bcv)
    bcv = bcv.replace(/\s/g, "")
    var mat = bcv.match("([0-9a-zA-Z]{3})([0-9]+)[\:]([0-9]+)")
    if(!mat){
        return alert("bcv value invalid.")
    }
    console.log(mat)
    var Bk = mat[1]
    var Chp = mat[2]
    var Vrs = mat[3]
    var audsrc = Audio_Bible_Struct.findAudioUrlFolderPath(Bk, Chp)

    var BibleObj = NIV
    var relativePosi = BibleObj[Bk][Chp][Vrs]

    var dis = `${bcv}  ${audsrc}`
    $("#playname").text(dis)

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
            gvObj.currentTime = maxlen * parseFloat(relativePosi)
            //gvObj.play()
            console.log(audsrc)
        }, 500)
    }, 0)
}

function gen_bible_table() {

    var BibleObj = NIV
    var tab = ""
    for (let Bk in BibleObj) {
        console.log(Bk)
        for (let Chp in BibleObj[Bk]) {
            //console.log(Bk)
            tab += `<tr><td>${Bk}${Chp}</td><td>`
            for (let Vrs in BibleObj[Bk][Chp]) {
                var relativePosi = BibleObj[Bk][Chp][Vrs]
                //console.log()
                var Chp3 = Chp.padStart(3, "0")
                var src = Audio_Bible_Struct.findAudioUrlFolderPath(Bk, Chp)
                var bcv = `${Bk}${Chp}:${Vrs}`

                tab += `<a src='${src}' title='${bcv} ${relativePosi}' relativePosi=${relativePosi}> ${Vrs}</a>,`;
            }
            tab = tab.replace(/,$/, "")
            tab += "</td></tr>"
        }
    }
    $("#myAudioFileNameSelect tbody").append(tab).find("a").on("click", function () {
        var audsrc = $(this).attr("src")
        var relativePosi = $(this).attr("relativePosi")
        $(".hili").removeClass("hili")
        $(this).addClass("hili")

        var title = $(this).attr("title")
        $("#playname").text(title)

        gvObj = null
        gvObj = document.getElementById('myAudio');

        setTimeout(function () {
            gvObj.src = audsrc
            //gvObj.play()
            gvObj.pause()
            setTimeout(function () {
                var maxlen = gvObj.duration;//(audio len in seconds)
                if (!maxlen) {
                    alert("try again")
                    return;
                }
                console.log("maxlen", maxlen)
                gvObj.currentTime = maxlen * parseFloat(relativePosi)
                gvObj.play()
                console.log(audsrc)
            }, 500)
        }, 0)



        //


    });
}