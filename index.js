const path = require('path');
const execa = require('execa');

(async () => {

	const beforeAndAfterBufferTimeInSeconds = 3;

	const {stdout: filePath} = await execa(`osascript`, ['-e', 'tell application "VLC" to get path of current item']);

	let {stdout: currentTime} = await execa(`osascript`, ['-e', 'tell application "VLC" to get current time']);


	if (!filePath) {
		throw new Error('Nothing is being played in VLC!')
	}

	const durationInSeconds = 10;

	const startSplit = currentTime - beforeAndAfterBufferTimeInSeconds;
	const endSplit = startSplit + (durationInSeconds + beforeAndAfterBufferTimeInSeconds);

	const {
		dir: currentFileDirectory,
		ext: currentFileExtension,
		name: currentFileName
	} = path.parse(filePath);

	const newFileName = `${currentFileName} from ${startSplit}s to ${endSplit}s${currentFileExtension}`
	const newFilePath = path.join(currentFileDirectory, newFileName)


	const ffmpegCommand = [
		'ffmpeg',
		'-i',
		`"${filePath}"`,
		'-ss',
		`${startSplit}`,
		'-to',
		`${endSplit}`,
		'-c',
		'copy',
		`"${newFilePath}"`
	]

	console.log(ffmpegCommand.join(' '));

})();