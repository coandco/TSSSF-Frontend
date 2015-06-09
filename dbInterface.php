<?php
    error_reporting(E_ALL ^ E_WARNING);

    function uniqueKey(start,field){
        $key = substr(hash("sha2",start),0,32);
        $tries = 0;
        while(pg_query("SELECT COUNT(1) FROM tsssff_savedcards2 WHERE $field='$key'")){
            $key = substr(hash("sha2",start+$tries),0,32);
            $tries++;
        }
        return $key;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET'){ #Get a card from the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_ user=ripp_");
        if(!$conn) {
            die (json_encode(Array(
                "error"=>"Error connecting to PostGresSQL",
		        "details"=>pg_last_error()
		    )));
        }

        if(!array_key_exists("id",$_GET)) {
            die (json_encode(Array(
                "error"=>"No Id given"
            )));
        }

        $id = pg_escape_string($_GET["id"]);
        $query = "SELECT * FROM tsssff_savedcards WHERE cardid = $id";
        $result = pg_query($query) or die(json_encode(Array(
            "error"=>'Query failed: ',
            "details"=>pg_last_error()
        )));
        $row = pg_fetch_row($result);

        if (!$row){
            $query = "SELECT * FROM tsssff_savedcards WHERE cardid = -1";
            $result = pg_query($query) or die(json_encode(Array(
                "error"=>'Query failed: ',
                "details"=>pg_last_error()
            )));
            $row = pg_fetch_row($result);
        }
        print json_encode($row);

    } else if ($_SERVER['REQUEST_METHOD'] === 'POST'){ #Save a card to the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_ user=ripp_");
        if(!$conn){
            die(json_encode(Array(
                "error"=>"Error connecting to PostGresSQL",
                "details"=>pg_last_error()
            )));
        }
        if(!array_key_exists("saveAs",$_POST)){
            $editKey = pg_escape_string($_POST["editKey"]);
        } else {
            $editKey = uniqueKey(serialize($_POST),"editKey");
            $viewKey = uniqueKey($editKey,"viewKey");
        }

        $classes = pg_escape_string($_POST["classes"]);
        $name = pg_escape_string($_POST["name"]);
        $attr = pg_escape_string($_POST["attr"]);
        $effect = pg_escape_string($_POST["effect"]);
        $flavour = pg_escape_string($_POST["flavour"]);
        $image = pg_escape_string($_POST["image"]);

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
                    cardclasses = '$classes',
                    cardname = '$name',
                    cardattr = '$attr',
                    cardeffect = '$effect',
                    cardflavour = '$flavour',
                    cardimage = '$image'
                WHERE
                    editKey = '$editKey'
                RETURNING (editKey,viewKey);"
                ;""
        }

        $result = pg_query($query) or die(json_encode(Array(
            "error"=>'Query failed: ',
            "details"=>pg_last_error()
        )));
        $row = pg_fetch_row($result);
        print json_encode($row);
    }
?>
