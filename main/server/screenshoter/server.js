/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

const imagejs = require('image-js');
const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'main/shared/screenshoter/config.json'));

let weaponImages=[];
let componentsImages=[];

if(config.enable){

	console.log("[Realistic Weapons] Greenscreen Screenshot is enabled! This should only be enabled during setup!");

	StartResource("fivem-greenscreener");

	let resourcePath=GetResourcePath(GetCurrentResourceName());
	const mainSavePath = `${resourcePath}/data/images`;

	try {
		if (!fs.existsSync(mainSavePath)) {
			fs.mkdirSync(mainSavePath);
		}

		if(fs.existsSync(mainSavePath+"/objects/weapons")){
			fs.readdirSync(mainSavePath+"/objects/weapons").forEach(file => {
				weaponImages.push(file.replaceAll(".png",""));
			});
		}

		if(fs.existsSync(mainSavePath+"/objects/components")){
			fs.readdirSync(mainSavePath+"/objects/components").forEach(file => {
				componentsImages.push(file.replaceAll(".png",""));
			});
		}

		onNet('takeScreenshot', async (filename, type, subtype) => {
			let savePath = `${mainSavePath}/${type}`;
			if(subtype) savePath+=`/${subtype}`;
			if (!fs.existsSync(savePath)) {
				fs.mkdirSync(savePath);
			}
			exports['screenshot-basic'].requestClientScreenshot(
				source,
				{
					fileName: savePath + '/' + filename + '.png',
					encoding: 'png',
					quality: 1.0,
				},
				async (err, fileName) => {
					let image = await imagejs.Image.load(fileName);
					const coppedImage = image.crop({ x: image.width / 4.5, width: image.height });

					image.data = coppedImage.data;
					image.width = coppedImage.width;
					image.height = coppedImage.height;

					for (let x = 0; x < image.width; x++) {
						for (let y = 0; y < image.height; y++) {
							const pixelArr = image.getPixelXY(x, y);
							const r = pixelArr[0];
							const g = pixelArr[1];
							const b = pixelArr[2];

							if (g > r + b) {
								image.setPixelXY(x, y, [255, 255, 255, 0]);
							}
						}
					}

					image.save(fileName);
				}
			);
		});
	} catch (error) {
		console.error(error.message);
	}

	onNet('tgm:scrapper:request:data', () => {
		console.log("source: " + source);
		emitNet('tgm:scrapper:data', source, weaponImages, componentsImages);
	});
}

