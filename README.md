TSSSFF-Generator
================

## Using
A live example can be found on [my website](http://ripppo.me/TSSSFF-Beta/) and is free to use for all Safe for work cards.

The tool is hopefull self explanatory:
 * Click and type on each field to edit them.
 * Hover over the Icons to get to change them.
 * Card types can be changed by hovering the card type on the left of the card.
 * Special symbols can be added with escapes such as `\earth` A full list is given below and on the page.

##Credits and thanks.
 * Majority of code is Written by [Ripp_ AKA chao-master](https://github.com/chao-master)
 * The backend system is modified off the offical code by
   * [Horrible People](https://github.com/HorriblePeople)
   * Based off a fork by [Coandco](https://github.com/coandco)
   * With help from [Latent Logic](https://github.com/Latent-Logic)
 * Special thanks also go to
   * [Coandco](https://github.com/coandco) Again for helpful bug reports and
   * [MrQuallzin](https://github.com/MrQuallzin) For bug reports and helping with the pony power quick inserts.

## Forking
You are welcome to fork the project and run your own instance in terms with the LISENCE.

It would be nice if improvments are feed back into the main project with Pull requests but it is not nessesery to do so.

To setup your own instance of the system you will need to read the **Creating the table** and **Adding Special cards** sections below.

The system runs using psql and apache.

### Creating the table
At current the code is setup to use a psql database connection.

The connection is currentlly hard coded in dbInterface.php to my connection details
But this is easily changable

The table exists with the following schema
```
CREATE TABLE tsssff_savedcards2 (
    editkey character(32) NOT NULL UNIQUE,
    viewkey character(32) NOT NULL UNIQUE,
    classes character varying(50) NOT NULL,
    name character varying(50) NOT NULL,
    attr character varying(50),
    effect text NOT NULL,
    flavour text NOT NULL,
    image text NOT NULL,
    copyright text NOT NULL,

    CONSTRAINT effect CHECK ((effect <> ''::text)),
    CONSTRAINT flavour CHECK ((flavour <> ''::text)),
    CONSTRAINT image CHECK ((image <> ''::text)),
    CONSTRAINT copyright CHECK ((copyright <> ''::text)),
    CONSTRAINT name CHECK (((name)::text <> ''::text)),
    CONSTRAINT classes CHECK (((classes)::text <> ''::text)),
    CONSTRAINT editkey CHECK (((editkey)::text <> ''::text)),
    CONSTRAINT viewkey CHECK (((viewkey)::text <> ''::text))

);
```
*(The table is called tsssff_savedcards2 due to historic reasons,
namely I overhauled the structure and still have the old legacy cards,
feel free to change it a later commit at a milestone point proably will)*

### Adding Special cards
The creator can only save cards with hexidecimal editkeys and viewkeys
this allows for non hexidecimal keys to be used for special cards that are
impossible for anyone to edit even if they extract the editkey from the code.
Such a key `SPC-404` is used for the special 404 card.

However such keys must be added manuall to the database,
here is an example for the SPC-404, refrenced in code.

```
INSERT INTO tsssff_savedcards2 VALUES (
    'SPC-404',
    'SPC-404',
    'card pony female earthPony',
    'Card Not Found',
    '404 Error, Pinkie Pie, Not a card',
    'Oh Look aint this a fun way to show an error message. Yep your card wasnt found. Unless you wanted this.',
    '"Argh no no no no! How can we play the game if the cards have all gone missing", "I dont think they are under the... wait pinkie thats the ground how did you"    -Impossible Games night',
    'https://derpicdn.net/img/view/2013/2/17/246336.jpeg',
    'Art: sirzi, Card:Ripp_');
```

Alternatlly a card can be created with the editor when the `UPDATE` command used to modify the editkey and viewkey in the database as nessesery.

##Misc

###Special symbols.
The following escapes are valid on the editor to create the spcial symbols:
 * \earth
 * \unicorn
 * \pegasus
 * \alicorn
 * \male
 * \female
 * \malefemale
 * \time
 * \ship

In the database these are saved as the unicode symbols the modified fonts use.
