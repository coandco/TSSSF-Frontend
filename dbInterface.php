<?php
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
        );";
        
        pg_query($query) or die('Query failed: ' . pg_last_error());
        var_dump($row);
    }
?>
