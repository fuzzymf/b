import { existsSync } from 'fs';
import { parseMagnetLink } from './parser.js';
import { Torrent } from './torrent.js';

const arg: string = process.argv[2];


switch (arg) {
	case '-h':
		console.info('Usage: bee -- -t [torrent file path]');
		console.info('Usage: bee -- -m [magnet link]');
		break;
	case '-v':
		console.log('Version: 1.1.0');
		break;
	case '-m':
		try {
			const link: string = process.argv[3];
			if (link.startsWith('magnet')) {
				const torrent: Torrent = parseMagnetLink(link);
				// torrent.download();
			}
			else throw new Error('Invalid magnet link provided');
			break;
		} catch (error) {
			console.error(error);
		}
	case '-t':
		const filePath: string = process.argv[3];
		try {
			if (existsSync(filePath)) {
				// Handle decoding of torrent file
				// const torrent: Torrent = parseTorrentFile(filePath);
				// torrent.download();
			}
			else throw new Error('Invalid torrent file provided');
			break;
		}
		catch (error) {
			console.error(error);
		}
	default:
		console.log('Invalid argument provided\n');
		console.log('Usage: npm run bdown -- -t [torrent file path]\n OR \nUsage: node src/index.js -- -m [magnet link]');
		break;
}

