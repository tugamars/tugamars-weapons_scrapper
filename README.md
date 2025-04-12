# Weapons Scrapper (Fetcher)

This script serves as **development/support tool** for obtaining all weapons in a server with respective components, tints and meta/information related to said.

## Scrapper
The script runs through all scripts with weapon files mentioned in the fxmanifest.lua and parses their meta files to get the  weapons in question. 
The command (server) to trigger the fetching of weapons is: ``tgmweapons:obtain``

It will generate two files in: data/generated, weapons.json and components.json.
The script works with ADDON Weapons as long as the metafiles are properly created and references..

## Screenshoter

The code for screenshoter is a modification of https://github.com/Bentix-cs/fivem-greenscreener and all credits go to Bentix-cs. 
For the screenshoter to work as intended you should also have Bentix's fivem-greenscreener resource started, which adds the greenscreen at LSIA.


## Steps to run

1) Start this resource
2) Write, in the server console, ``tgmweapons:obtain``.
3) Once the process concludes, make sure the files weapons.json and components.json were created and have information. (if they weren't you might need to create the data/generated folder manually)
4) After confirming it do ``refresh`` and restart the script. Start fivem-greenscreener
5) Join the server through FiveM client
6) Do ``/screenshotweapons`` and let the process run. Don't touch your game.
7) Do ``/screenshotcomponents`` and let the process run. Don't touch your game.
If you notice that certain weapons/components are missing from the images folder, you can ``refresh`` and restart the script, and execute the commands again, it will go through the weapons that don't already have screenshots.

