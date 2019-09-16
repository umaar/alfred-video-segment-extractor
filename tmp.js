const path = require('path');
const alfy = require('alfy');
const execa = require('execa');

// https://stackoverflow.com/a/37096512/3510288
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

const beforeAndAfterBufferTimeInSeconds = 3;

const {stdout: filePath} = await execa(`osascript`, ['-e', 'tell application "VLC" to get path of current item']);

let {stdout: currentTime} = await execa(`osascript`, ['-e', 'tell application "VLC" to get current time']);

if (!filePath) {
	throw new Error('Nothing is being played in VLC!')
}

if (filePath.includes(' ')) {
	throw new Error(`This workflow can't handle spaces in files yet!`)
}

const {
	dir: currentFileDirectory,
	ext: currentFileExtension,
	name: currentFileName
} = path.parse(filePath);

const outputItems = [];

const secondsToTrim = parseInt(alfy.input)

if (alfy.input && Number.isInteger(secondsToTrim)) {
	const startSplit = currentTime - beforeAndAfterBufferTimeInSeconds;
	const endSplit = startSplit + (secondsToTrim + beforeAndAfterBufferTimeInSeconds);

	const {
		ext: currentFileExtension,
		name: currentFileName
	} = path.parse(filePath);

	const newFileName = `${currentFileName}-from-${startSplit}s-to-${endSplit}s${currentFileExtension}`
	const newFileDirectory = `/Users/umarhansa/Movies/GooglePhotos`
	const newFilePath = path.join(newFileDirectory, newFileName)

	const ffmpegCommand = [
		'/usr/local/bin/ffmpeg',
		'-i',
		`${filePath}`,
		'-ss',
		`${startSplit}`,
		'-to',
		`${endSplit}`,
		'-c',
		'copy',
		`${newFilePath}`
	]

	// alfy.log(ffmpegCommand.join(' '));

	outputItems.push({
		title: `Begin Extracting ${secondsToHms(secondsToTrim)}`,
		subtitle: `Starting @ ${secondsToHms(currentTime)} from ${currentFileName}`,
		arg: ffmpegCommand.join(' ')
	});
} else {
	outputItems.push({
		title: 'Trim 10 seconds',
		subtitle: `Starting @ ${secondsToHms(currentTime)}`,
		autocomplete: 10
	});

	outputItems.push({
		title: 'Trim 60 seconds',
		subtitle: `Starting @ ${secondsToHms(currentTime)}`,
		autocomplete: 60
	});
}

alfy.output(outputItems);

