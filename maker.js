//After a page is updated this stores the edit key so we can modify it again
var EDIT_KEY = null;
var HASH_TO_LOAD = null;
var HASH_TYPE = "v1";

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
    $(".card").attr("class","card pony malefemale unicorn");
    $(".card .nameInput").val("");
    $(".card .attrs").val("");
    $(".card .effect").val("").change();
    $(".card .flavour").val("").change();
    $(".card .copyright").val("");
    EDIT_KEY = null;
    document.location.hash = "";
    $("#shortUrl,#longUrl,#image").val("").change().addClass("empty")
    $("#error").hide();
}

function shorten_url(url, callback){
    $.ajax({
        url: "http://v.gd/create.php",
        type: "POST",
        dataType: 'text',
        data: {format:"json", url:window.location.href},
        success: function(r,s,t) 
        {
            var d = JSON.parse(r);
            callback(d["shorturl"]);
        }
    });
}

//Saves a card
function save(){
    shorten_url(location.href, function(shorturl){
        $("#shortUrl").val(shorturl);
        $("#longUrl").val(document.location.href);
        $("#shortUrl,#longUrl").removeClass("empty"); //Bodge fix for placeholder overlay
    });
}

function doReplace(repl, str) {
  var regexStr = Object.keys(repl).map(function(s) {
    return s.replace(/([^\w\s])/g, '\\$1');
  }).join('|');
  return str.replace(new RegExp(regexStr, 'g'), function(m) {
    return repl[m]; 
  });
}

function sanitize(str){
    var SPECIAL_REPLACE = {
        "While in your hand, you may discard a Pony card from the grid and play this card in its place. This power cannot be copied.": "{replace}",
        "You may swap 2 Pony cards on the shipping grid.": "{swap}",
        "You may swap up to 3 Pony cards on the grid.": "{3swap}",
        "You may draw a card from the Ship or Pony deck.": "{draw}",
        "You may discard a Goal and draw a new one to replace it.": "{goal}",
        "You may search the Ship or Pony discard pile for a card of your choice and play it.": "{search}",
        "You may copy the power of any Pony card currently on the shipping grid, except for Changelings.": "{copy}",
        "May count as either \u2642 or \u2640 for all Goals, Ships, and powers.": "{hermaphrodite}",
        "This card counts as 2 Ponies.": "{double pony}",
        "Instead of playing this ship with a Pony card from your hand, or connecting two ponies already on the grid, take a Pony card from the shipping grid and reattach it elsewhere with this Ship. That card's power activates.": "{love poison}",
        "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card counts as having any one keyword of your choice, except pony names.": "{keyword change}",
        "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card becomes the opposite gender.": "{gender change}",
        "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card becomes a race of your choice. This cannot affect Changelings.": "{race change}",
        "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card counts as \uE004.": "{timeline change}",
        "You may choose to play the top card on the Pony discard pile with this Ship, rather than use a Pony card from your hand.": "{play from discard}",
        "\u2642":"{male}",
        "\u2640":"{female}",
        "\u26A4":"{malefemale}",
        "\u2764":"{ship}",
        "\uE000":"{earthpony}",
        "\uE001":"{unicorn}",
        "\uE002":"{pegasus}",
        "\uE003":"{alicorn}",
        "\uE004":"{postapocalypse}",
        "`":""
    };
    str = doReplace(SPECIAL_REPLACE, str);
    str = str.replace("\r\n", "\\n");
    return str.replace("\n", "\\n");
}


function search_classes(element, search_array){
    var i;
    for (i = 0; i < search_array.length; i++) {
        if (element.hasClass(search_array[i]))
            return search_array[i];
    }
    return "";
}


function html_to_pycard(){
    var html_element = $(".card"),
        html_name = $(".card .nameInput").val(),
        html_keywords = $(".card .attrs").val(),
        html_body = $(".card .effect").val(),
        html_flavor = $(".card .flavour").val(),
        html_copyright = $(".card .copyright").val(),
        html_art = $("#image").val(),
        pycard_type, pycard_art, pycard_symbols, pycard_name,
        pycard_keywords, pycard_body, pycard_flavor, pycard_copyright,
        race, gender, points, outstr;

        pycard_type = search_classes(html_element, 
                                     ["pony", "ship", "goal", "start"]);
        //Types are case-sensitive and must be capitalized
        pycard_type = pycard_type[0].toUpperCase() + pycard_type.slice(1);
        pycard_art = sanitize(html_art);
        pycard_name = sanitize(html_name);
        pycard_keywords = sanitize(html_keywords);
        pycard_body = sanitize(html_body);
        pycard_flavor = sanitize(html_flavor);
        pycard_copyright = sanitize(html_copyright);
        pycard_symbols = [];
        gender = search_classes(html_element, ["male", "female", "malefemale"]);
        if (gender != "")
            pycard_symbols.push(gender);
        race = search_classes(html_element,
                              ["unicorn", "pegasus", "earthpony", "alicorn"]);
        if (race != "") {
            if (html_element.hasClass("changeling"))
                race = "changeling" + race;
            pycard_symbols.push(race)
        }
        if (html_element.hasClass("time"))
            pycard_symbols.push("dystopian");
        if (pycard_type === "Ship")
            pycard_symbols = ["ship"];
        else if (pycard_type === "Goal"){
            pycard_symbols = ["goal"];
            points = search_classes(html_element,
                                    ["s0", "s1", "s2", "s3", "s2-3", "s3-4"]);
            if (points != "")
                pycard_symbols.push(points.slice(1));
            else
                pycard_symbols.push("0");
        }

        //Last two are "expansion" and "client", which we don't support yet
        outstr = pycard_type + "`" + pycard_art + "`" + pycard_symbols.join("!")
                 + "`" + pycard_name + "`" + pycard_keywords + "`" + pycard_body
                 + "`" + pycard_flavor + "``" + pycard_copyright;
        return outstr;
}

function generate_hash(hashtype){
    var tmphash = '';
    switch(hashtype) {
        case "raw":
            tmphash = html_to_pycard();
            break;
        case "v1":
            tmphash = LZString.compressToBase64(html_to_pycard());
            break;
        default:
            hashtype = "v1";
            tmphash = LZString.compressToBase64(html_to_pycard());
    }
    return "#" + hashtype + ":" + tmphash;
}

function cardChanged(){
    var tmphash;
    if (typeof(HASH_TO_LOAD) === "string") {
        tmphash = HASH_TO_LOAD;
        HASH_TO_LOAD = null;
        load_with_hash_type(tmphash);
    } else {
        //We don't want this change to trigger our load
        $(window).off('hashchange', hashChanged);
        document.location.hash = generate_hash(HASH_TYPE);
        $(window).on('hashchange', hashChanged);
    }
    $("#shortUrl").val();
    $("#longUrl").val();
}

function hashChanged(){
    var hs, i;
    hs = document.location.hash.slice(1)
    i = hs.indexOf(":");
    if (i != -1) {
        HASH_TYPE = hs.slice(0,i);
        load_with_hash_type(hs.slice(i+1));
    }
}

function load_with_hash_type(loadstr){
    switch(HASH_TYPE) {
        case "rawtov1":
            HASH_TYPE = "v1";
            //intentionally falling through here
        case "raw":
            pycard_to_html(loadstr);
            break;
        case "v1toraw":
            HASH_TYPE = "raw";
            //intentionally falling through here
        case "v1":
            pycard_to_html(LZString.decompressFromBase64(loadstr));
            break;
        default:
            HASH_TYPE="v1";
            HASH_TO_LOAD = null;
    }
    cardChanged();
}

function pycard_to_html(pycard_str){
    var pycard_arr, 
        pycard_symbols,
        i,
        card_element = $('.card');

    //If there was a problem decompressing the hash, we may get passed a null
    if (typeof(pycard_str) != "string")
        return;

    //Temporarily disable URL updating
    $(".card input[type=text], .card textarea, #image").off("change paste", 
                                                            cardChanged);
    
    pycard_arr = pycard_str.replace("\\n", "\n").split("`");

    if (pycard_arr.length < 7)
        return;
    
    //Remove existing non-card classes
    card_element.attr({"class": "card"});
    
    // Card type = [0]
    card_element.addClass(pycard_arr[0].toLowerCase());
    // Card art = [1]
    $("#image").val(pycard_arr[1]).change();
    // Card symbols = [2]
    pycard_symbols = pycard_arr[2].toLowerCase().replace(" ", "").split("!");
    for (i = 0; i < pycard_symbols.length; i++) {
        if (pycard_symbols[i].indexOf("changeling") === 0) {
            card_element.addClass("changeling");
            card_element.addClass(pycard_symbols[i].substr("changeling".length))
        } else if (pycard_symbols[i][0] >= '0' && pycard_symbols[i][0] <= '9') {
            // If it starts with a number, it's a goal symbol
            card_element.addClass("s" + pycard_symbols[i]);
        } else if (pycard_symbols[i] === "dystopian") {
            card_element.addClass("time");
        } else {
            card_element.addClass(pycard_symbols[i]);
        }
    }
    // Add in "empty" symbols
    if ($('.card:not(.male,.female,.malefemale)').length > 0)
        card_element.addClass("G");
    if ($('.card:not(.earthpony,.unicorn,.pegasus,.alicorn)').length > 0)
        card_element.addClass("R");
    // Card title = [3]
    $(".card .nameInput").val(pycard_arr[3]).change();
    // Card keywords = [4]
    $(".card .attrs").val(pycard_arr[4]).change();
    // Card body = [5]
    $(".card .effect").val(pycard_arr[5]).change();
    // Card flavor = [6]
    $(".card .flavour").val(pycard_arr[6]).change();
    // Card expansion symbol = [7]
    // Unused
    // Card copyright string = [8]
    $(".card .copyright").val(pycard_arr[8]).change();
    //Re-enable URL updating
    $(".card input[type=text], .card textarea, #image").on("change paste",
                                                          cardChanged);
}

function exportCard(id){
    $.post("/TSSSF/ponyimage.php",{
        pycard:html_to_pycard(),
        returntype:"encoded_url",
        imagetype: "vassal"
    },function(r){
        var d = JSON.parse(r);
        if(mayError(d)) {return;}
        $('.preview-lightbox img').attr('src', d["image"]);
        $.featherlight($('.preview-lightbox'));
    });
}

function imgurWrapper(){
    if ($('.featherlight-content input[value="linkthis"]').is(":checked")) {
        shorten_url(generate_hash("v1"), function(s_url){
            saveCardToImgur(s_url);
        });
    } else {
        saveCardToImgur();
    }
}

function saveCardToImgur(my_url){
    if (typeof my_url === "undefined")
        my_url = "";
    $.post("/TSSSF/ponyimage.php", {
        pycard:html_to_pycard(),
        returntype:"imgur",
        imagetype:"cropped",
        my_url: my_url
    }, function(r){
        var d = JSON.parse(r);
        if(mayError(d)) {return;}
        $('.featherlight-content input[type="text"]').removeClass("empty");
        $('.featherlight-content input[type="text"]').val(d["image"]);
        open(d["image"]);
    });
}

function cardSetup(){
    //Check the hash to see if we are loading something
    if(document.location.hash){
        console.log("Document hash is currently " + document.location.hash);
        hs = document.location.hash.substr(1)
        i = hs.indexOf(":");
        if (i != -1) {
            HASH_TYPE = hs.slice(0,i);
            HASH_TO_LOAD = hs.slice(i+1);
        }
    }

    //On card button clicks, remove other classes and add new ones.
    //Unless it is changeling, special case, just toggle.
    $(".card button").on("click", function(){
        var oldClass = "";
        var newClass = $(this).attr("value");
        if (newClass == "changeling"){
            $(".card").toggleClass($(this).attr("value"));
        } else {
            $(this).parent().children("button").each(function(){
                if ($(this).attr("value") != "changeling"){
                    if ($(".card").hasClass($(this).attr("value"))) {
                        oldClass = $(this).attr("value");
                    }
                    $(".card").removeClass($(this).attr("value"));
                }
            });
            $(".card").addClass(newClass);
            if ((oldClass == "ship" || oldClass == "goal") &&
                (newClass == "pony" || newClass == "start")) {
                $(".card").addClass("malefemale");
                $(".card").addClass("unicorn");
            } else if (oldClass != "goal" && newClass == "goal") {
                $(".card").addClass("s0");
            }
        }
    });

    //On Window resize we use css transformation to scale the card to fix
    //Yes it seems horrible but the alternative was somehting even more horrible!
    $(window).resize(function(){
        var f = ($(".cardwrapper").width())/788;
        $(".card").css("transform","scale("+f+")")
        $(".cardwrapper").height(1088*f);
    });

    //Constant infomation for special escape code handling.
    var SPECIAL_REPLACE = {
        "{male}":"\u2642",
        "{female}":"\u2640",
        "{malefemale}":"\u26A4",
        "{ship}":"\u2764",
        "{earth}":"\uE000",
        "{unicorn}":"\uE001",
        "{pegasus}":"\uE002",
        "{alicorn}":"\uE003",
        "{postapocalypse}":"\uE004",
        "{replace}": "While in your hand, you may discard a Pony card from the grid and play this card in its place. This power cannot be copied.",
        "{swap}": "You may swap 2 Pony cards on the shipping grid.",
        "{3swap}": "You may swap up to 3 Pony cards on the grid.",
        "{draw}": "You may draw a card from the Ship or Pony deck.",
        "{goal}": "You may discard a Goal and draw a new one to replace it.",
        "{search}": "You may search the Ship or Pony discard pile for a card of your choice and play it.",
        "{copy}": "You may copy the power of any Pony card currently on the shipping grid, except for Changelings.",
        "{hermaphrodite}": "May count as either \u2642 or \u2640 for all Goals, Ships, and powers.",
        "{double pony}": "This card counts as 2 Ponies.",
        "{love poison}": "Instead of playing this ship with a Pony card from your hand, or connecting two ponies already on the grid, take a Pony card from the shipping grid and reattach it elsewhere with this Ship. That card's power activates.",
        "{keyword change}": "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card counts as having any one keyword of your choice, except pony names.",
        "{gender change}": "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card becomes the opposite gender.",
        "{race change}": "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card becomes a race of your choice. This cannot affect Changelings.",
        "{timeline change}": "When you attach this card to the grid, you may choose one Pony card attached to this Ship. Until the end of your turn, that Pony card counts as \uE004.",
        "{play from discard}": "You may choose to play the top card on the Pony discard pile with this Ship, rather than use a Pony card from your hand."
    };

    //Replace special escape codes when an input is updated
    $(".card input[type=text], .card textarea").on("change",function(){
        var txt = $(this).val();
        txt = doReplace(SPECIAL_REPLACE, txt);
        $(this).val(txt)
    });

    //Replace and create tooltip hints
    $.each(SPECIAL_REPLACE,function(key,replace){
        console.log([key,replace,"dt[data-original-title='"+key+"']",$("dt[data-original-title='"+key+"']")]);
        $("dt[data-original-title='"+key+"']").attr("data-original-title",replace).tooltip();
    });

    //When a text editor is updated resize its helper to clone back the height.
    //This is because CSS Really hates working vertically
    $(".card textarea").on("change keyup paste",function(){
        var t = $(this),
            o = $(".cardHelper ." + t.attr("class"));
        o.text(t.val());
        t.height(o.height());
    });

    //We also use a similar system for the name, but since we don't need manual
    //line breaks it gets easier
    $(".card .nameInput").on("change keyup paste",function(){
        var t = $(this),
            o = $(".card .name");
        o.toggleClass("small",t[0].scrollWidth > t.width()+1)
        o.text(t.val());
    });

    //Update image
    $("#image").change(function(){
        var regex_arr = [/^https?:\/\/i\.imgur\.com\//,
                         /^https?:\/\/img\.booru\.org\/secretshipfic\//,
                         /^https?:\/\/derpicdn.net\//],
            regex_matched = false,
            i;
        for (i = 0; i < regex_arr.length; i++) {
            if (regex_arr[i].test($(this).val())) {
                regex_matched = true;
                break;
            }
        }
        if (regex_matched === true)
            $(".card .image").css("background-image","url('"+$(this).val()+"')")
        else
            $(".card .image").css("background-image","url('')")
    });

    //Trigger URL update
    $(".card input[type=text], .card textarea, #image").on("change paste",
                                                           cardChanged);
    $(".card button").on("click", cardChanged);
    $(window).on('hashchange', hashChanged);


    //Save, New & Export buttons
    $("#save").click(save);
    $("#new").click(newCard);
    $("#export").click(exportCard);
    $("#save_imgur").click(imgurWrapper);
    //$("#exportTo").click(function(){exportCard(1)})

    //Log number of ajax events for the spinner
    var AJAX_EVENTS = 0;

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
}
