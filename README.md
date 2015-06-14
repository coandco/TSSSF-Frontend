TSSSFF-Generator
================

## Using
A live example can be found on [my website](http://ripppo.me/TSSSFF-Beta/) and is free to use for all Safe for work cards.

The tool is hopefull self explanatory:
 * Click and type on each field to edit them.
 * Hover over the Icons to get to change them.
 * Card types can be changed by hovering the card type on the left of the card.
 * Special symbols can be added with escapes such as `{earth}` A full list is given below and on the page.

##Credits and thanks.
 * Majority of code is written by [Ripp_ AKA chao-master](https://github.com/chao-master)
 * The LZW compression code used for encoding the card data is by [pieroxy](https://github.com/pieroxy/lz-string)
 * The backend system is modified off the offical code by
   * [Horrible People](https://github.com/HorriblePeople)
   * Based off a fork by [Coandco](https://github.com/coandco)
   * With help from [Latent Logic](https://github.com/Latent-Logic)
 * Special thanks also go to
   * [Coandco](https://github.com/coandco) Again for helpful bug reports and
   * [MrQuallzin](https://github.com/MrQuallzin) For bug reports and helping with the pony power quick inserts.


## Forking
You are welcome to fork the project and run your own instance in terms with the LICENSE.

It would be nice if improvments are feed back into the main project with Pull requests but it is not nessesery to do so.

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
    'card pony female earthpony',
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
 * [earth}
 * [unicorn}
 * [pegasus}
 * [alicorn}
 * {male}
 * {female}
 * {malefemale}
 * {postapocalypse}
 * {ship}

In the database these are saved as the unicode symbols the modified fonts use.
