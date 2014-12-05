<?php
    if ($_SERVER['REQUEST_METHOD'] === 'GET'){ #Get a card from the database
        $conn = pg_connect("host=/var/run/postgresql/ dbname=ripp_");
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
        print json_encode($result);
    }
?>
