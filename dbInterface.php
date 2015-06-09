<?php
    error_reporting(E_ALL ^ E_WARNING);

    function uniqueKey($start,$field){
        $key = substr(hash("sha2",start),0,32);
        $tries = 0;
        while(pg_query("SELECT COUNT(1) FROM tsssff_savedcards2 WHERE $field='$key'")){
            $key = substr(hash("sha2",start+$tries),0,32);
            $tries++;
        }
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
        $query = "SELECT * FROM tsssff_savedcards WHERE ${mode}Key = $key";
        $result = $pg_query($query) or dieError("Query error getting card",pg_last_error());
        return pg_fetch_array($result,PGSQL_ASSOC)
    }

    function putCard($editkey,$classes,$name,$attr,$effect,$flavour,$image){
        if (is_null($editkey)){
            $editKey = uniqueKey(serialize($_POST),"editKey");
            $viewKey = uniqueKey($editKey,"viewKey");
        } else {
            if (!preg_match("/^[0-9a-fA-F]{1,32}$/")){
                dieError("Invalid paramater","editKey was not valid or is a restricted key");
            }
            $editKey = pg_escape_string($editKey);
        }

        if($viewKey){
            $query =
                "INSERT INTO tsssff_savedcards VALUES (
                    E'$editKey',E'$viewKey',E'$classes',E'$name',E'$attr',E'$effect',E'$flavour',E'$image'
                ) RETURNING (
                    editKey,viewKey
                );";
        } else {
            $query =
                "UPDATE tsssff_savedcards2 SET
                    classes = '$classes',
                    name = '$name',
                    attr = '$attr',
                    effect = '$effect',
                    flavour = '$flavour',
                    image = '$image'
                WHERE
                    editKey = '$editKey'
                RETURNING (editKey,viewKey);"
                ;""
        }

        $result = pg_query($query) or die(json_encode(Array(
            "error"=>'Putting card failed',
            "details"=>pg_last_error()
        )));
        return pg_fetch_array($result,PGSQL_ASSOC);


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

        $card = getCard($mode,$_GET[$mode]) or getCard($view,"SPC-404");
        print json_encode($card);

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

        if(!array_key_exists("saveAs",$_POST)){
            $editKey = pg_escape_string($_POST["editKey"]);
        } else {
            $editKey = null;
        }

        print json_encode(putCard($editKey,$classes,$name,$attr,$effect,$flavour,$image));
    }
?>
