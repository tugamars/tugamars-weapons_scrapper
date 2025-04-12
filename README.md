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
