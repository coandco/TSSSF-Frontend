TSSSFF-Generator
================

## Using
A live example can be found on [my website](http://ripppo.me/TSSSFF-Beta/) and is free to use for all Safe for work cards.

The tool is hopefully self explanatory:
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

It would be nice if improvements are feed back into the main project with Pull requests but it is not necessary to do so.

##Misc

###Special symbols.
The following escapes are valid on the editor to create the special symbols:
 * Gender
  * {male}
  * {female}
  * {malefemale}
 * Race
  * {earth}
  * {unicorn}
  * {pegasus}
  * {alicorn}
 * Other
  * {ship}
  * {postapocalypse}
 * Rules
  * {replace}
  * {swap}
  * {3swap}
  * {draw}
  * {goal}
  * {search}
  * {copy}
  * {hermaphrodite}
  * {double pony}
  * {love poison}
  * {keyword change}
  * {gender change}
  * {race change}
  * {timeline change}
  * {play from discard}

In the editor Gender/Race/Other symbols are displayed via the unicode symbols from the modified font.
The Rules are automatically expanded, and then collapsed back for storage for the saved URL as long as their portion of the text hasn't been changed.
