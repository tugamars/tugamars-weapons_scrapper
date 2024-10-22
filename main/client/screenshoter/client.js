/// <reference types="@citizenfx/client" />

const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'main/shared/screenshoter/config.json'));

const weapons=JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'data/generated/weapons.json'));
const weaponComponents=JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'data/generated/components.json'));

const Delay = (ms) => new Promise((res) => setTimeout(res, ms));

if(config.enable){

	console.log("[Realistic Weapons] Greenscreen Screenshot is enabled! This should only be enabled during setup!");

	let cam;
	let camInfo;
	let ped;
	let interval;
	const playerId = PlayerId();
	let weaponImages=[];
	let componentImages=[];

	async function takeScreenshotForObject(object, hash, type) {

		setWeatherTime();

		await Delay(500);

		if (cam) {
			DestroyAllCams(true);
			DestroyCam(cam, true);
			cam = null;
		}

		let [[minDimX, minDimY, minDimZ], [maxDimX, maxDimY, maxDimZ]] = GetModelDimensions(GetEntityModel(object));
		let modelSize = {
			x: maxDimX - minDimX,
			y: maxDimY - minDimY,
			z: maxDimZ - minDimZ
		}

		let fov = Math.min(Math.max(modelSize.x, modelSize.z, modelSize.y) / 0.20 * 10, 80);
		console.log(fov);



		const [objectX, objectY, objectZ] = GetEntityCoords(object, false);
		const [fwdX, fwdY, fwdZ] = GetEntityForwardVector(object);

		const center = {
			x: objectX + (minDimX + maxDimX) / 2,
			y: objectY + (minDimY + maxDimY) / 2,
			z: objectZ + (minDimZ + maxDimZ) / 2,
		}

		const fwdPos = {
			x: center.x + fwdX * 1.2 + Math.max(modelSize.x, modelSize.z) / 2,
			y: center.y + fwdY * 1.2 + Math.max(modelSize.x, modelSize.z) / 2,
			z: center.z + fwdZ,
		};

		console.log(modelSize.x, modelSize.z)

		cam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', fwdPos.x, fwdPos.y, fwdPos.z, 0, 0, 0, fov, true, 0);

		PointCamAtCoord(cam, center.x, center.y, center.z);
		SetCamActive(cam, true);
		RenderScriptCams(true, false, 0, true, false, 0);

		await Delay(50);

		emitNet('takeScreenshot', `${hash}`, 'objects', type);

		await Delay(2000);

		return;

	}

	function SetPedOnGround() {
		const [x, y, z] = GetEntityCoords(ped, false);
		const [retval, ground] = GetGroundZFor_3dCoord(x, y, z, 0, false);
		SetEntityCoords(ped, x, y, ground, false, false, false, false);

	}

	function setWeatherTime() {
		if (config.debug) console.log(`DEBUG: Setting Weather & Time`);
		SetRainLevel(0.0);
		SetWeatherTypePersist('EXTRASUNNY');
		SetWeatherTypeNow('EXTRASUNNY');
		SetWeatherTypeNowPersist('EXTRASUNNY');
		NetworkOverrideClockTime(18, 0, 0);
		NetworkOverrideClockMillisecondsPerGameMinute(1000000);
	}

	function stopWeatherResource() {
		if (config.debug) console.log(`DEBUG: Stopping Weather Resource`);
		if ((GetResourceState('qb-weathersync') == 'started') || (GetResourceState('qbx_weathersync') == 'started')) {
			TriggerEvent('qb-weathersync:client:DisableSync');
			return true;
		} else if (GetResourceState('weathersync') == 'started') {
			TriggerEvent('weathersync:toggleSync')
			return true;
		} else if (GetResourceState('esx_wsync') == 'started') {
			SendNUIMessage({
				error: 'weathersync',
			});
			return false;
		} else if (GetResourceState('cd_easytime') == 'started') {
			TriggerEvent('cd_easytime:PauseSync', false)
			return true;
		} else if (GetResourceState('vSync') == 'started' || GetResourceState('Renewed-Weathersync') == 'started') {
			TriggerEvent('vSync:toggle', false)
			return true;
		}
		return true;
	};

	function startWeatherResource() {
		if (config.debug) console.log(`DEBUG: Starting Weather Resource again`);
		if ((GetResourceState('qb-weathersync') == 'started') || (GetResourceState('qbx_weathersync') == 'started')) {
			TriggerEvent('qb-weathersync:client:EnableSync');
		} else if (GetResourceState('weathersync') == 'started') {
			TriggerEvent('weathersync:toggleSync')
		} else if (GetResourceState('cd_easytime') == 'started') {
			TriggerEvent('cd_easytime:PauseSync', true)
		} else if (GetResourceState('vSync') == 'started' || GetResourceState('Renewed-Weathersync') == 'started') {
			TriggerEvent('vSync:toggle', true)
		}
	}

	async function spawnObjectAndScreenshot(modelName,type, rot){
		let modelHash = isNaN(Number(modelName)) ? GetHashKey(modelName) : Number(modelName);
		const ped = PlayerPedId();

		let isWeapon=false;

		if (IsWeaponValid(modelHash)) {
			isWeapon=true;
			RequestWeaponAsset(modelHash)
			if(!type) type="weapons";
			while(!HasWeaponAssetLoaded(modelHash)){
				await Delay(100);
			}
		}

		if (!stopWeatherResource()) return;

		DisableIdleCamera(true);

		await Delay(100);

		if (IsModelValid(modelHash) && !isWeapon) {
			if (!HasModelLoaded(modelHash)) {
				RequestModel(modelHash);
				while (!HasModelLoaded(modelHash)) {
					await Delay(100);
				}
			}
		} else {
			console.log('ERROR: Invalid object model');
			if(!isWeapon) return;
		}


		SetEntityCoords(ped, config.greenScreenHiddenSpot.x, config.greenScreenHiddenSpot.y, config.greenScreenHiddenSpot.z, false, false, false);

		SetPlayerControl(playerId, false);

		if (config.debug) console.log(`DEBUG: Spawning Object ${modelName}`);

		object=null;

		if(!isWeapon) object = CreateObjectNoOffset(modelHash, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, false, true, true);
		if(isWeapon) object = CreateWeaponObject(modelHash, 30, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, true, 1.0, 0);

		SetEntityRotation(object, config.greenScreenRotation.x, config.greenScreenRotation.y, config.greenScreenRotation.z, 0, false);

		FreezeEntityPosition(object, true);

		DisplayRadar(false);

		await Delay(50);

		await takeScreenshotForObject(object, modelName,type);


		DisplayRadar(true);
		DeleteEntity(object);
		SetPlayerControl(playerId, true);
		SetModelAsNoLongerNeeded(modelHash);
		startWeatherResource();
		DestroyAllCams(true);
		DestroyCam(cam, true);
		RenderScriptCams(false, false, 0, true, false, 0);
		cam = null;
	}

	RegisterCommand('screenshotobject', async (source, args) => {
		spawnObjectAndScreenshot(args[0]);
	});

	RegisterCommand('screenshotweapons', async (source, args) => {

		const totalWeapons=Object.keys(weapons).filter( (name) => { return !weaponImages.includes(name); }  ).length;
		let current=0;

		emit("ox_lib:notify", {
			title:`Total ${totalWeapons} weapons from ${Object.keys(weapons).length} that need screenshots`,
			type:'info',
		});

		for(const k in weapons){
			if(weaponImages.includes(k)) continue;
			await spawnObjectAndScreenshot(k,"weapons");
			current++;
			emit("ox_lib:notify", {
				title:`${current} of ${totalWeapons} weapons screenshoted`,
				type:'success',
			});
		}

	});

	RegisterCommand('screenshotcomponents', async (source, args) => {
		const weaponcomps=Object.values(weaponComponents).filter( (comp) => { return comp.hasOwnProperty("objectName") && comp.objectName }  );
		const totalWeapons=weaponcomps.filter( (comp) => { return !componentImages.includes(comp.objectName) && !componentImages.includes(comp.objectName.toLowerCase()); }  ).length;
		let current=0;

		if(config.debug){
			console.log("Components without screenshot");
			console.log(weaponcomps.filter( (comp) => { return !componentImages.includes(comp.objectName) && !componentImages.includes(comp.objectName.toLowerCase()); }  ));
		}


		emit("ox_lib:notify", {
			title:`Total ${totalWeapons} components from ${Object.keys(weaponcomps).length} that need screenshots`,
			type:'info',
		});

		for(const k in weaponComponents){
			const comp=weaponComponents[k];
			if(!comp || !comp.hasOwnProperty('objectName')) continue;
			if(componentImages.includes(comp.objectName) || componentImages.includes(comp.objectName.toLowerCase()) || comp.objectName==="") continue;
			await spawnObjectAndScreenshot(comp.objectName,"components");
			current++;
			emit("ox_lib:notify", {
				title:`${current} of ${totalWeapons} components screenshoted`,
				type:'success',
			});
		}

	});



	setImmediate(() => {
		emit('chat:addSuggestions', [
			{
				name: '/screenshotweapons',
				help: 'generate weapons screenshots'
			},
			{
				name: '/screenshotcomponents',
				help: 'generate components screenshots'
			},
		])
	});

	on('onResourceStop', (resName) => {
		if (GetCurrentResourceName() != resName) return;

		startWeatherResource();
		clearInterval(interval);
		SetPlayerControl(playerId, true);
		FreezeEntityPosition(ped, false);
	});

	onNet('tgm:scrapper:data', (w,c) => {
		weaponImages=w;
		componentImages=c;
	});

	on('onResourceStart', (resName) => {
		if (GetCurrentResourceName() != resName) return;
		emitNet('tgm:scrapper:request:data');
	});


	on('playerSpawned', ()=>{
		emitNet('tgm:scrapper:request:data');
	});
}
