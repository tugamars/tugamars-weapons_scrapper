const fs = require("fs"), path = require("path");
const glob = require('tiny-glob');
const { Parser, parseStringPromise } = require('xml2js');
const xpath = require("xml2js-xpath");

const useDefaultWeaponsMeta=true;

function getPathToResources(fullPath) {
    // Use a regular expression to capture everything up to and including "resources"
    const match = fullPath.match(/.*resources[\/\\]?/);
    // Return the match if found, or an empty string
    return match ? match[0] : '';
}

let resourcePath=GetResourcePath(GetCurrentResourceName());
const resourcesDir=getPathToResources(resourcePath);


function getLastPart(path) {
    // Split the path by both forward and backward slashes, and get the last element
    return path.split(/[/\\]/).pop();
}
// Function to recursively search for `fxmanifest.lua` files
async function findFxManifests(dir) {
    let manifests = [];
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            const nestedManifests = await findFxManifests(filePath);
            manifests = manifests.concat(nestedManifests);
        } else if (file.name === 'fxmanifest.lua') {
            const resourceName=getLastPart(dir);
            if(GetResourceState(resourceName) === "started" ){
                manifests.push(filePath);
            }
        }
    }
    return manifests;
}

function matchPattern(filePath, pattern) {
    // Convert pattern to a regular expression
    const regexPattern = pattern
        .replace(/\\/g, '/')        // Normalize slashes for Windows paths
        .replace(/\[\w+\]/g, '[^/]+')  // Convert "[test]" and "[weapons]" to match folder names
        .replace(/\*\*/g, '.*')     // Convert "**" to match any directory structure
        .replace(/\*/g, '[^/]*')    // Convert "*" to match any file name
        .replace(/\./g, '\\.');     // Escape dot for ".meta"

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filePath.replace(/\\/g, '/'));  // Normalize file path and test
}

// Recursively search through directories and find matching files
/*function findFiles(dir, pattern) {
    let results = [];

    // Read through the current directory
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            // Recurse into subdirectories
            results = results.concat(findFiles(fullPath, pattern));
        } else if (file.isFile()) {
            // If it's a file, check if it matches the pattern
            if (matchPattern(fullPath, pattern)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}*/

async function findFiles(dir,pattern){

    let files = await glob(pattern, {cwd:dir});

    return files;
}


// Function to parse the `fxmanifest.lua` file and extract paths for `WEAPONCOMPONENTSINFO_FILE` and `WEAPONINFO_FILE`
function parseFxManifest(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const weaponComponentMatches = fileContent.match(/data_file 'WEAPONCOMPONENTSINFO_FILE' '(.*)'/i);
    const weaponInfoMatches = fileContent.match(/data_file 'WEAPONINFO_FILE' '(.*)'/i);

    const paths = {};
    if (weaponComponentMatches) paths['WEAPONCOMPONENTSINFO_FILE'] = weaponComponentMatches[1];
    if (weaponInfoMatches) paths['WEAPONINFO_FILE'] = weaponInfoMatches[1];

    return paths;
}


// Main function to iterate through fxmanifest.lua files and process weapon data files
async function processResources() {
    let listFiles={
        "WEAPONINFO_FILE":[
        ],
        "WEAPONCOMPONENTSINFO_FILE":[
        ]
    };

    if(useDefaultWeaponsMeta){
        listFiles["WEAPONINFO_FILE"]=[
            path.resolve(resourcePath+ "/data/default/weapons.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_bullpuprifle_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_doubleaction.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_marksmanrifle_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_pumpshotgun_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_revolver_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_snspistol_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weapons_specialcarbine_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weapons_assaultrifle_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weapons_carbinerifle_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weapons_combatmg_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weapons_heavysniper_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weapons_pistol_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weapons_smg_mk2.meta"),
            path.resolve(resourcePath+ "/data/default/hipster/weapondagger.meta"),
            path.resolve(resourcePath+ "/data/default/hipster/weaponvintagepistol.meta"),
            path.resolve(resourcePath+ "/data/default/mp2023_01/weapon_tecpistol.meta"),
            path.resolve(resourcePath+ "/data/default/mp2023_02/weapon_battlerifle.meta"),
            path.resolve(resourcePath+ "/data/default/mp2023_02/weapon_hackingdevice.meta"),
            path.resolve(resourcePath+ "/data/default/mp2023_02/weapon_snowlauncher.meta"),
            path.resolve(resourcePath+ "/data/default/mpapartment/weaponrevolver.meta"),
            path.resolve(resourcePath+ "/data/default/mpapartment/weaponswitchblade.meta"),
            path.resolve(resourcePath+ "/data/default/mpbattle/weaponstonehatchet.meta"),
            path.resolve(resourcePath+ "/data/default/mpbeach/weaponbottle.meta"),
            path.resolve(resourcePath+ "/data/default/mpbeach/weaponsnspistol.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponautoshotgun.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponbattleaxe.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponcompactlauncher.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponminismg.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponpipebomb.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponpoolcue.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponwrench.meta"),
            path.resolve(resourcePath+ "/data/default/mpbusiness/weaponheavypistol.meta"),
            path.resolve(resourcePath+ "/data/default/mpbusiness/weaponspecialcarbine.meta"),
            path.resolve(resourcePath+ "/data/default/mpbusiness2/weaponbullpuprifle.meta"),
            path.resolve(resourcePath+ "/data/default/mphalloween/weaponflashlight.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist/weaponflaregun.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist/weapongarbagebag.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist/weaponhandcuffs.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist3/weapon_ceramicpistol.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist3/weapon_hazardcan.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist3/weapon_navyrevolver.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist3/weapon_tranquilizer.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist4/weapon_combatshotgun.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist4/weapon_gadgetpistol.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist4/weapon_militaryrifle.meta"),
            path.resolve(resourcePath+ "/data/default/mpindependence/weaponfirework.meta"),
            path.resolve(resourcePath+ "/data/default/mpindependence/weaponmusket.meta"),
            path.resolve(resourcePath+ "/data/default/mplowrider/weaponmachete.meta"),
            path.resolve(resourcePath+ "/data/default/mplowrider/weaponmachinepistol.meta"),
            path.resolve(resourcePath+ "/data/default/mplowrider2/weaponcompactrifle.meta"),
            path.resolve(resourcePath+ "/data/default/mplowrider2/weapondbshotgun.meta"),
            path.resolve(resourcePath+ "/data/default/mplts/weaponheavyshotgun.meta"),
            path.resolve(resourcePath+ "/data/default/mplts/weaponmarksmanrifle.meta"),
            path.resolve(resourcePath+ "/data/default/mpluxe/weaponcombatpdw.meta"),
            path.resolve(resourcePath+ "/data/default/mpluxe2/weaponknuckle.meta"),
            path.resolve(resourcePath+ "/data/default/mpluxe2/weaponmarksmanpistol.meta"),
            path.resolve(resourcePath+ "/data/default/mpsum2/weapon_metaldetector.meta"),
            path.resolve(resourcePath+ "/data/default/mpsum2/weapon_precisionrifle.meta"),
            path.resolve(resourcePath+ "/data/default/mpsum2/weapon_tacticalrifle.meta"),
            path.resolve(resourcePath+ "/data/default/security/weapons_heavyrifle.meta"),
            path.resolve(resourcePath+ "/data/default/security/weapon_fertilizercan.meta"),
            path.resolve(resourcePath+ "/data/default/security/weapon_stungun_mp.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas2/weaponhominglauncher.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas2/weaponproxmine.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas2/weaponsnowball.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas3/weapon_acidpackage.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas3/weapon_candycane.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas3/weapon_pistolxm3.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas3/weapon_railgunxm3.meta"),
            path.resolve(resourcePath+ "/data/default/mpvalentines/weapongusenberg.meta"),
            path.resolve(resourcePath+ "/data/default/spupgrade/weaponhatchet.meta"),
        ];

        listFiles["WEAPONCOMPONENTSINFO_FILE"]=[
            path.resolve(resourcePath+ "/data/default/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/christmas2017/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/gunrunning/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/hipster/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mp2023_01/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mp2023_02/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpbeach/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpbiker/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpbusiness/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpbusiness2/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mphalloween/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mplts/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpluxe/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpluxe2/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist3/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpheist4/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpindependence/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mplowrider/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mplowrider2/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpsum2/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/security/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpapartment/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas3/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpvalentines/weaponcomponents.meta"),
            path.resolve(resourcePath+ "/data/default/mpchristmas2/weaponcomponents.meta"),
        ];
    }

    try {
        const manifests = await findFxManifests(resourcesDir);
        console.log(`Found ${manifests.length} fxmanifest.lua files.`);

        for (const manifest of manifests) {
            console.log(`Processing: ${manifest}`);
            const paths = parseFxManifest(manifest);

            if (Object.keys(paths).length > 0) {
                for (const [key, relativePath] of Object.entries(paths)) {
                    let pattern = path.join(path.dirname(manifest), relativePath);

                    // Replace * with glob wildcard pattern
                    if (pattern.includes('*')) {
                        const matchedFiles = await findFiles(path.dirname(manifest),relativePath);
                        if (matchedFiles.length > 0) {
                            console.log(`Found ${matchedFiles.length} files for pattern: ${pattern}`);
                            matchedFiles.forEach(file => {
                                listFiles[key].push(path.join(path.dirname(manifest), file));
                            });
                        } else {
                            //console.log(`No files matched for pattern: ${pattern}`);
                        }
                    } else {
                        if (fs.existsSync(pattern)) {
                            console.log(`Found file: ${pattern}`);
                            listFiles[key].push(pattern);
                        } else {
                            console.log(`File not found: ${pattern}`);
                        }
                    }
                }
            } else {
                //console.log(`No relevant entries found in: ${manifest}`);
            }
        }
    } catch (error) {
        console.error('Error processing resources:', error);
    }

    return listFiles;
}

async function parseMetaFiles(){
    const metaFiles=await processResources();
    console.log("Processing meta files");

    let components = {};
    let weapons= {};

    for (const file of metaFiles["WEAPONCOMPONENTSINFO_FILE"]) {
        try {
            const data = fs.readFileSync(file, 'utf8');

            let xmlarr=data.split('\n');
            xmlarr.splice(0,1);

            let finaltext="<root>" + xmlarr.join('\n') + "</root>";
            let componentsMeta = await parseStringPromise(finaltext);

            const componentItems = xpath.find(componentsMeta, "//Item");

            // Extract components details
            componentItems.forEach((item) => {
                const name = xpath.find(item, "/Name")[0] || '';
                const attachBone = xpath.find(item, "/AttachBone")[0] || '';
                const weaponAttachBone = xpath.find(item, "/WeaponAttachBone")[0] || '';
                const model = xpath.find(item, "/Model")[0] || '';
                const locName = xpath.find(item, "/LocName")[0] || '';
                const locDesc = xpath.find(item, "/LocDesc")[0] || '';


                const meta = {
                    clipSize: xpath.find(item, "/ClipSize") && xpath.find(item, "/ClipSize").hasOwnProperty(0) && xpath.find(item, "/ClipSize")[0].hasOwnProperty("$") ? parseInt(xpath.find(item, "/ClipSize")[0]["$"].value) : null,
                    hud:{
                        damage: xpath.find(item, "/HudDamage") && xpath.find(item, "/HudDamage").hasOwnProperty(0) && xpath.find(item, "/HudDamage")[0].hasOwnProperty("$")  ? parseInt(xpath.find(item, "/HudDamage")[0]["$"].value) : 0,
                        speed: xpath.find(item, "/HudSpeed") && xpath.find(item, "/HudSpeed").hasOwnProperty(0) && xpath.find(item, "/HudSpeed")[0].hasOwnProperty("$")   ? parseInt(xpath.find(item, "/HudSpeed")[0]["$"].value) : 0,
                        capacity: xpath.find(item, "/HudCapacity") && xpath.find(item, "/HudCapacity").hasOwnProperty(0) && xpath.find(item, "/HudCapacity")[0].hasOwnProperty("$")   ? parseInt(xpath.find(item, "/HudCapacity")[0]["$"].value) : 0,
                        accuracy: xpath.find(item, "/HudAccuracy") && xpath.find(item, "/HudAccuracy").hasOwnProperty(0) && xpath.find(item, "/HudAccuracy")[0].hasOwnProperty("$")   ? parseInt(xpath.find(item, "/HudAccuracy")[0]["$"].value) : 0,
                        range: xpath.find(item, "/HudRange") && xpath.find(item, "/HudRange").hasOwnProperty(0) && xpath.find(item, "/HudRange")[0].hasOwnProperty("$")   ? parseInt(xpath.find(item, "/HudRange")[0]["$"].value) : 0,
                    }
                }

                if (!attachBone) {
                    components[name] = {};
                } else {
                    components[name] = {
                        bone: attachBone,
                        weaponBone: weaponAttachBone,
                        objectName: model,
                        locale:{
                          title: locName,
                          desc: locDesc,
                        },
                        type: item.$.type.toLowerCase(),
                        meta: meta
                    };
                }
            });
        } catch (err) {
            console.error(err);
        }

    }

    for (const file of metaFiles["WEAPONINFO_FILE"]) {
        try {
            const data = fs.readFileSync(file, 'utf8');

            let xmlarr=data.split('\n');
            xmlarr.splice(0,1);

            let finaltext="<root>" + xmlarr.join('\n') + "</root>";

            const options = {
                mergeAttrs: true,
                explicitArray: false,
                trim: true,
                normalizeTags: true,
                normalize: true,
                ignoreAttrs: false,
                childkey: false,
                xmlns: false,
                explicitChildren: false,
                attrkey:'@'
            };

            const parser= new Parser(options);

            let componentsMeta = await parser.parseStringPromise(finaltext);

            //console.log(componentsMeta);


            const weaponItem = xpath.find(componentsMeta, "//cweaponinfoblob/infos/item/infos//item");

            // Extract components details
            weaponItem.forEach((item) => {
                if(item.type==="CWeaponInfo" && !item.name.includes("VEHICLE_") && item.model !== ""){

                    const name=item.name;
                    const model=item.model;
                    const group=item.group;
                    const damagetype=item.damagetype.toLowerCase();
                    const ammo=item.ammoinfo.ref.toLowerCase().replaceAll("ammo_","");

                    const meta={
                        clipSize: item.clipsize && item.clipsize.value ? parseInt(item.clipsize.value) : null,
                        damage: item.damage && item.damage.value ? parseFloat(item.damage.value) : null,
                        penetration: item.penetration && item.penetration.value ? parseFloat(item.penetration.value) : null,
                        hud:{
                            damage:item.huddamage && item.huddamage.value ? parseInt(item.huddamage.value) : 0,
                            speed:item.hudspeed && item.hudspeed.value ? parseInt(item.hudspeed.value) : 0,
                            capacity:item.hudcapacity && item.hudcapacity.value ? parseInt(item.hudcapacity.value) : 0,
                            accuracy:item.hudaccuracy && item.hudaccuracy.value ? parseInt(item.hudaccuracy.value) : 0,
                            range:item.hudrange && item.hudrange.value ? parseInt(item.hudrange.value) : 0,
                        },
                        flags: item.weaponflags ? item.weaponflags.split(" ") : {}
                    };


                    let attachments={};
                    const attachpoints=xpath.find(item,"//attachpoints/item");

                    attachpoints.forEach( (ap) => {

                        const bone=ap.attachbone;
                        const comp=xpath.find(ap, "//components/item");

                        comp.forEach((c) => {
                            const compname=c.name;
                            if(!components.hasOwnProperty(compname) || typeof components[compname] === "undefined"){
                                attachments[compname]={};
                                console.log(">>>>>>>>>>> Component not found: " + compname);
                            } else {
                                console.log(">>>> Component found " + compname);
                                if(!components[compname].hasOwnProperty("bone")){
                                    attachments[compname]={};
                                } else {
                                    attachments[compname]=components[compname];
                                    attachments[compname].bone=bone;
                                }

                            }

                        });
                    });

                    weapons[name]={
                        spawnName:name,
                        model:model,
                        group:group,
                        damageType: damagetype,
                        ammo:ammo,
                        meta: meta,
                        attachments:attachments,
                    };
                }
            });

        } catch (err) {
            console.error(err);
        }

    }




    try {
        fs.writeFileSync(resourcePath+"/data/generated/components.json", JSON.stringify(components));
        console.log('JSON data saved to file successfully.');
    } catch (error) {
        console.error('Error writing JSON data to file:', error);
    }

    try {
        fs.writeFileSync(resourcePath+"/data/generated/weapons.json", JSON.stringify(weapons));
        console.log('JSON data saved to file successfully.');
    } catch (error) {
        console.error('Error writing JSON data to file:', error);
    }
}

RegisterCommand('tgmweapons:obtain', (source, args, raw) => {
    if(IsDuplicityVersion()){
        parseMetaFiles().then((r)=>{});
    }
}, false);