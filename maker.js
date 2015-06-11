//After a page is updated this stores the edit key so we can modify it again
var EDIT_KEY = null;

//Display error
function mayError(errObj){
    if (errObj.error){
        $("#error strong").text(errObj.error);
        $("#error em").text(errObj.details);
        $("#error").show()
        return 1;
    } else {
        return 0;
    }
}

//Blanks the cards
function newCard(){
    $(".card").attr("class","card pony maleFemale unicorn s0");
    $(".card .name").val("");
    $(".card .attrs").val("");
    $(".card .effect").val("").change();
    $(".card .flavour").val("").change();
    $(".card .copyright").val("");
    EDIT_KEY = null;
    document.location.hash = "";
    $("#editUrl,#shareUrl,#image").val("").change().addClass("empty")
    $("#error").hide();
}

//Loads a card
function load(kind,id){
    var o={};o[kind]=id
    $.get("dbInterface.php",o,function(r){
        var d = JSON.parse(r);
        EDIT_KEY = null;
        if(mayError(d)) {return;}
        $(".card button").each(function(){
            $(".card").removeClass($(this).attr("value"))
        })
        $(".card").addClass(d.classes);
        $(".card .name").val(d.name);
        $(".card .attrs").val(d.attr);
        $(".card .effect").val(d.effect);
        $(".card .flavour").val(d.flavour);
        $("#image").val(d.image);
        $(".card .copyright").val(d.copyright);
        $("#image").change();
        $(".card textarea").change();

        document.location.hash = "."
        document.location.hash = ""

        $("#editUrl,#shareUrl").removeClass("empty") //Bodge fix for placeholder overlay

        $("#shareUrl").val(document.location+"view:"+d["viewkey"]);
        if(d.editkey){
            $("#editUrl").val(document.location+"edit:"+d["editkey"]);
            document.location.hash = "edit:"+d["editkey"]
            EDIT_KEY = d["editkey"];
        } else {
            $("#editUrl").val("Cannot edit");
            document.location.hash = "view:"+d["viewkey"]
        }
    })
}

//Saves a card
function save(){
    $.post("dbInterface.php",{
        editkey:EDIT_KEY,
        classes:$(".card").attr("class"),
        name:$(".card .name").val(),
        attr:$(".card .attrs").val(),
        effect:$(".card .effect").val(),
        flavour:$(".card .flavour").val(),
        copyright:$(".card .copyright").val(),
        image:$("#image").val()
    },function(r){
        var d = JSON.parse(r);
        if(mayError(d)) {return;}
        document.location.hash = "."
        document.location.hash = ""
        $("#editUrl").val(document.location+"edit:"+d["editkey"]);
        $("#shareUrl").val(document.location+"view:"+d["viewkey"]);
        $("#editUrl,#shareUrl").removeClass("empty") //Bodge fix for placeholder overlay
        EDIT_KEY = d["editkey"];
        document.location.hash = "edit:"+d["editkey"]
    })
}

function exportCard(toShipbooru){
    $.post("../CardMachine/TSSSF/ponyimage.php",{
        classes:$(".card").attr("class"),
        name:$(".card .name").val(),
        attr:$(".card .attrs").val(),
        effect:$(".card .effect").val(),
        flavour:$(".card .flavour").val(),
        copyright:$(".card .copyright").val(),
        image:$("#image").val()
    },function(r){
        var d = JSON.parse(r);
        if(mayError(d)) {return;}
        /*if(toShipbooru){
            var data = new FormData();
            data.append("upload",new Blob([d.img_url],{type:"image/png"}))
            data.append("title",$(".card .name").val());
            data.append("attr",$(".card .attrs").val());
            data.append("rating","q");
            data.append("submit","Upload");
            $.ajax({
                url:"http://secretshipfic.booru.org/index.php?page=post&s=list",
                type:"POST",
                data: data,
                processData: false,
                contentType: false,
                xhrFields: {
                    withCredentials: true
                },
                complete:function(n,c,d){
                    console.log(n,c,d)
                }
            })
        } else {*/
        open("data:image/png;base64,"+d.img_url);
        //}
    })
}

function cardSetup(){
    //On card button clicks, remove other classes and add new ones.
    //Unless it is changeling, special case, just toggle.
    $(".card button").click(function(){
        if ($(this).attr("value") == "changeling"){
            $(".card").toggleClass($(this).attr("value"));
        } else {
            $(this).parent().children("button").each(function(){
                if ($(this).attr("value") != "changeling"){
                    $(".card").removeClass($(this).attr("value"));
                }
            })
            $(".card").addClass($(this).attr("value"));
        }
    })

    //On Window resize we use css transformation to scale the card to fix
    //Yes it seems horrible but the alternative was somehting even more horrible!
    $(window).resize(function(){
        var f = ($(".cardwrapper").width())/788;
        $(".card").css("transform","scale("+f+")")
        $(".cardwrapper").height(1088*f);
    });

    //Constant infomation for special escape code handling.
    var SPECIAL_REGEX = /\\(malefemale|unicorn|pegasus|earth|alicorn|goal|time|female|male|ship|replace|swap|draw|newgoal|search|copy|changeling)/g
    var SPECIAL_REPLACE = {
        "\\male":"\u2642",
        "\\female":"\u2640",
        "\\malefemale":"\u26A4",
        "\\ship":"\u2764",
        "\\earth":"\uE000",
        "\\unicorn":"\uE001",
        "\\pegasus":"\uE002",
        "\\alicorn":"\uE003",
        "\\time":"\uE004",
        "\\replace":"(Replace): While in your hand, you may discard a Pony card from the grid and play this card in its place. This power cannot be copied.",
        "\\swap":"(Swap): You may swap 2 Pony cards on the shipping grid.",
        "\\draw":"(Draw): You may draw a card from the Ship or Pony deck.",
        "\\newgoal":"(New Goal): You may discard a Goal and draw a new one to replace it.",
        "\\search":"(Search): You may search the Ship or Pony discard pile for a card of your choice and play it.",
        "\\copy":"(Copy): You may copy the power of any Pony card currently on the shipping grid, except for Changelings.",
        "\\changeling":"Gains the name, keywords and symbols of any single [race] of your choice until the end of the turn. If this card is moved to a new place on the grid, the current player must select a new disguise that will last until the end of their turn, even if other cards say its power would not activate."
    }

    //Replace special escape codes when an input is updated
    $(".card input[type=text], .card textarea").on("change",function(){
        var txt = $(this).val();
        txt = txt.replace(SPECIAL_REGEX,function(t){
            return SPECIAL_REPLACE[t];
        });
        $(this).val(txt)
    })

    //Replace and create tooltip hints
    $.each(SPECIAL_REPLACE,function(key,replace){
        console.log([key,replace,"dt[data-original-title='\\"+key+"']",$("dt[data-original-title='\\"+key+"']")]);
        $("dt[data-original-title='\\"+key+"']").attr("data-original-title",replace).tooltip();
    })

    //When a text editor is updated resize it's helper to clone back the height.
    //This is because CSS Really hates working vertically
    $(".card textarea").on("change keyup paste",function(){
        var t = $(this),
            o = $(".cardHelper ." + t.attr("class"));
        o.text(t.val());
        t.height(o.height());
    });

    //Update image
    $("#image").change(function(){
        $(".card .image").css("background-image","url('"+$(this).val()+"')")
    })

    //Save, New & Export buttons
    $("#save").click(save)
    $("#new").click(newCard)
    $("#export").click(exportCard)
    //$("#exportTo").click(function(){exportCard(1)})

    //Log number of ajax events for the spinner
    var AJAX_EVENTS = 0

    $( document ).ajaxSend(function(){
        AJAX_EVENTS++;
        $("#working").show();
        $("#error").hide();
    }).ajaxComplete(function() {
        if ( --AJAX_EVENTS == 0 ) {
            $("#working").hide();
        }
    });

    //Inital call setup functions
    $(window).resize();
    $(".card textarea").change();

    //Check the hash to see if we are loading something
    if(document.location.hash){
        hs = document.location.hash.substr(1).split(":")
        if (hs.length==2 && (hs[0] == "view" || hs[0] == "edit")){
            load(hs[0],hs[1]);
        } else {
            document.location.hash = ""
        }
    }
};
