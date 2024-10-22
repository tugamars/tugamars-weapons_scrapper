/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

function beforeLast (value, delimiter) {
	value = value || ''

	if (delimiter === '') {
		return value
	}

	const substrings = value.split(delimiter)

	return substrings.length === 1
		? value // delimiter is not part of the string
		: substrings.slice(0, -1).join(delimiter)
}
function afterLast (value, delimiter) {
	value = value || ''

	return delimiter === ''
		? value
		: value.split(delimiter).pop()
}



const imagejs = require('image-js');
const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'main/shared/screenshoter/config.json'));

let weaponImages=[];
let componentsImages=[];

if(config.enable){

	async function trimTransparentBorders(imagePath, outputPath) {
		// Load the image
		const image = await imagejs.Image.load(imagePath);

		// Get image dimensions

		// Find the boundaries of non-transparent pixels
		let top = null, left = null, right = null, bottom = null;

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

		for (let y = 0; y <  image.height; y++) {
			for (let x = 0; x < image.width; x++) {
				const alpha = image.getPixelXY(x, y)[3]; // Get the alpha channel (4th value in RGBA)

				if (alpha > 0) { // If pixel is not transparent
					if (top === null) top = y;
					if (left === null || x < left) left = x;
					if (right === null || x > right) right = x;
					bottom = y;
				}
			}
		}

		// If the image is fully transparent, we don't need to crop
		if (top === null) {
			console.log("Image is fully transparent. No cropping applied.");
			return;
		}

		// Define the cropped area
		const croppedWidth = right - left + 1;
		const croppedHeight = bottom - top + 1;

		// Crop the image
		const croppedImage = image.crop({ x: left, y: top, width: croppedWidth, height: croppedHeight });

		// Save the cropped image
		await croppedImage.save(outputPath).catch((err)=>{ console.log(err); });
		console.log(`Cropped image saved to ${outputPath}`);
	}

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

			if (!fs.existsSync(savePath+"/hd")) {
				fs.mkdirSync(savePath+"/hd");
			}

			if (!fs.existsSync(savePath+"/square")) {
				fs.mkdirSync(savePath+"/square");
			}

			exports['screenshot-basic'].requestClientScreenshot(
				source,
				{
					fileName: savePath + '/' + filename + '.png',
					encoding: 'png',
					quality: 1.0,
				},
				async (err, fileName) => {
					const originalFileName=fileName;
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

					const path=beforeLast(fileName,"/");
					const nameFile=afterLast(fileName,"/");

					await trimTransparentBorders(originalFileName, path + "/hd/" + nameFile);
					image.save(path+"/square/"+nameFile);
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

