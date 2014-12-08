<?php
    if ($_SERVER["SERVER_NAME"] == "ripppo.me"){
        $URL_BASE = "https://sucs.org/~ripp_/TSSSFF-Generator/dbInterface.php";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        if ($_SERVER['REQUEST_METHOD'] === 'POST'){
            curl_setopt($ch,CURLOPT_URL,$URL_BASE);
            curl_setopt($ch,CURLOPT_POST,true);
            curl_setopt($ch,CURLOPT_POSTFIELDS,$_POST);
        } else {
            $saveId = urlencode($_GET["id"]);
            curl_setopt($ch,CURLOPT_URL,$URL_BASE."?id=".$saveId);
        }
        curl_exec($ch);
        die();
    }

    //TODO ADOdb

    if ($_SERVER['REQUEST_METHOD'] === 'GET'){ #Get a card from the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_ user=ripp_");
        if(!$conn)
        {
            die ("Error connecting to PostGresSQL: " . pg_last_error());
        }
        
        if(!array_key_exists("id",$_GET)){
            die ("No Id given");
        }
        
        $id = pg_escape_string($_GET["id"]);
        $query = "SELECT * FROM tsssff_savedcards WHERE cardid = $id";
        $result = pg_query($query) or die('Query failed: ' . pg_last_error());
        $row = pg_fetch_row($result);
        
        if (!$row){
            $query = "SELECT * FROM tsssff_savedcards WHERE cardid = -1";
            $result = pg_query($query) or die('Query failed: ' . pg_last_error());
            $row = pg_fetch_row($result);
        }
        
        print json_encode($row);
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST'){ #Save a card to the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_ user=ripp_");
        if(!$conn)
        {
            die ("Error connecting to PostGresSQL: " . pg_last_error());
        }
        $classes = pg_escape_string($_POST["classes"]);
        $name = pg_escape_string($_POST["name"]);
        $attr = pg_escape_string($_POST["attr"]);
        $effect = pg_escape_string($_POST["effect"]);
        $flavour = pg_escape_string($_POST["flavour"]);
        $image = pg_escape_string($_POST["image"]);
        
        $query = "INSERT INTO tsssff_savedcards VALUES (
            default,E'$classes',E'$name',E'$attr',E'$effect',E'$flavour',E'$image'
        ) RETURNING cardid;";
        
        $result = pg_query($query) or die('Query failed: ' . pg_last_error());
        $row = pg_fetch_row($result);
        print json_encode($row);
    }
?>
