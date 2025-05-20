# Weapons Scrapper (Fetcher)

This script serves as **development/support tool** for obtaining all weapons in a FiveM server with respective components and meta/information related to said.

# Examples / Use cases
My [Weapons Shop and Loadout](https://forum.cfx.re/t/realistic-weapons-shop-loadout-weapon-on-back-standalone/5327516) script uses this scrapper as a basis to generate it's config and UI.

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

**It is recommended you have the 'asset download' indicator turned off when taking screenshots**
If you notice that certain weapons/components are missing from the images folder, you can ``refresh`` and restart the script, and execute the commands again, it will go through the weapons that don't already have screenshots.

## Default GTA Weapons

Place default GTA Weapons .meta files in data/default/(dlc_patch)/

To find the files for a DLC, usually they are located in GTA Files (open with RPF Explorer or OpenIV) at ``update\update.rpf\dlc_patch\[dlc_patch_name]\common\data\ai``.

Add the file paths to ``processResources`` in weaponConfigGenerator.js 
