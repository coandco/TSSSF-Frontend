<?php
    #error_reporting(0);
    error_reporting(ALL);

    function uniqueKey($start,$field){
        $key = substr(md5($start),0,32);
        $tries = 0;
        #while(pg_fetch_row(pg_query("SELECT COUNT(1) FROM tsssff_savedcards2 WHERE $field='$key'"))){
        #    $key = substr(hash("sha2",$start+$tries),0,32);
        #    $tries++;
        #}
        return $key;
    }

    function dieError($error,$details){
        die(json_encode(Array(
            "error"=>$error,
            "details"=>$details
        )));
    }

    function getCard($mode,$key){
        $key = pg_escape_string($key);
        $query = "SELECT * FROM tsssff_savedcards2 WHERE ${mode}Key = '$key';";
        $result = pg_query($query) or dieError("Query error getting card",pg_last_error());
        $card = pg_fetch_assoc($result);
        if ($card){
            foreach($card as &$v){
                $v = trim($v);
            }
        }
        return $card;
    }

    function getRange($minViewKey,$amount){
        $minViewKey = pg_escape_string($minViewId);
        $amount = pg_escape_string($amount);
        $query = "SELECT viewKey,classes,name,attr,image,copyright FROM tsssff_savedcards2 WHERE viewKey >= '$minViewKey' ORDER BY viewKey LIMIT $amount;";
        $result = pg_query($query) or dieError("Query error getting cards",pg_last_error());
        $cards = pg_fetch_all($result);
        if (!$cards){
            dieError("Query error getting cards",pg_last_error());
        }
        return $cards;
    }

    function putCard($editKey,$classes,$name,$attr,$effect,$flavour,$image,$copyright){
        if (is_null($editKey) or $editKey == ''){
            $editKey = uniqueKey(rand(),"editkey");
            $viewKey = uniqueKey($editKey,"viewkey");
        } else {
            if (!preg_match("/^[0-9a-f]+$/",$editKey)){
                dieError("Invalid paramater","editKey ($editKey) was not valid or is a reserved key");
            }
            $editKey = pg_escape_string($editKey);
        }

        if($viewKey){
            $query =
                "INSERT INTO tsssff_savedcards2 VALUES (
                    E'$editKey',E'$viewKey',E'$classes',E'$name',E'$attr',E'$effect',E'$flavour',E'$image',E'$copyright'
                ) RETURNING editKey, viewKey;";
        } else {
            $query =
                "UPDATE tsssff_savedcards2 SET
                    classes = E'$classes',
                    name = E'$name',
                    attr = E'$attr',
                    effect = E'$effect',
                    flavour = E'$flavour',
                    image = E'$image',
                    copyright = E'$copyright'
                WHERE
                    editKey = E'$editKey'
                RETURNING editKey,viewKey;";
        }
        $result = pg_query($query) or die(json_encode(Array(
            "error"=>'Putting card failed',
            "details"=>pg_last_error()
        )));
        return pg_fetch_assoc($result);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET'){ #Get a card from the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_ user=ripp_");
        if(!$conn) {
            dieError("Error connecting to PostGresSQL",pg_last_error());
        }

        $mode="";

        if(array_key_exists("edit",$_GET)) {
            $mode = "edit";
        }
        if(array_key_exists("view",$_GET)) {
            if ($mode){
                dieError("Invalid request","Both edit and view paramaters given");
            }
            $mode = "view";
        }
        if(!$mode){
            dieError("Invalid request","One of edit or view paramaters must be given");
        }

        if (array_key_exists("amount",$_GET)){
            if ($mode == "view"){
                print json_encode(getRange($view,$_GET["amount"]));
            } else {
                dieError("amount paramater only valid with view paramater");
            }
        } else {
            $card = getCard($mode,$_GET[$mode]);
            if (!$card){
                $card = getCard("view","SPC-404");
            }
            if ($mode != "edit" or $card["editkey"] != $_GET[$mode]){
                unset($card["editkey"]);
            }
            print json_encode($card);
        }

    } else if ($_SERVER['REQUEST_METHOD'] === 'POST'){ #Save a card to the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_ user=ripp_");
        if(!$conn){
            dieError("Error connecting to PostGresSQL",pg_last_error());
        }

        $classes = pg_escape_string($_POST["classes"]);
        $name = pg_escape_string($_POST["name"]);
        $attr = pg_escape_string($_POST["attr"]);
        $effect = pg_escape_string($_POST["effect"]);
        $flavour = pg_escape_string($_POST["flavour"]);
        $image = pg_escape_string($_POST["image"]);
        $copyright = pg_escape_string($_POST["copyright"]);

        if(array_key_exists("editkey",$_POST)){
            $editKey = pg_escape_string($_POST["editkey"]);
        } else {
            $editKey = null;
        }

        print json_encode(putCard($editKey,$classes,$name,$attr,$effect,$flavour,$image,$copyright));
        print pg_last_error();
    }
?>
