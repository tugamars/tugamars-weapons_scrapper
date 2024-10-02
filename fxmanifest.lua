fx_version 'cerulean'
game 'gta5'

name 'Tugamars Weapon Scrapper'
version '1.0.0'
description 'Get information about all the weapons started on your server'
author 'tugamars'

shared_scripts {
    '@ox_lib/init.lua',
}

client_scripts {
    'main/client/**/*.js'
}

server_scripts {
    'main/server/**/*.js'
}

files {
    'nui/**/*',
    'nui/**/*.html',
    'nui/**/*.png',
    'nui/**/*.jpg',
    'nui/**/*.css',
    'nui/**/*.js',
    'stream/**/*.ydr',
    'stream/**/*.ytd',
    'stream/**/*.ytyp',
    'locales/**/*.json',
    'main/shared/**/*.json',
    'data/**/*.json',
}

lua54 'yes'