import { downloadTorrent } from './tcpclient.js';
import { existsSync } from 'fs';
import { parseMagnetLink, Torrent } from './bencodeparser.js';
import downloadFile from './torrent_file.js';
import downloadMagnet from './magnet_link.js';

const arg: string = process.argv[2];


switch (arg) {
	case '-h':
		console.log('Usage: node src/index.js -- -t [torrent file path]');
		console.log('Usage: node src/index.js -- -m [magnet link]');
		break;
	case '-v':
		console.log('Version: 1.0.0');
		break;
	case '-m':
		const link: string = process.argv[3];
		if (link.startsWith('magnet')) {
			downloadMagnet(link);
		}
		else throw new Error('Invalid magnet link provided');
		break;
	case '-t':
		const file: string = process.argv[3];
		if (existsSync(file)) {
			downloadFile(file);
		}
		else throw new Error('Invalid torrent file provided');
		break;
	default:
		console.log('Invalid argument provided\n');
		console.log('Usage: npm run bdown -- -t [torrent file path]\n OR \nUsage: node src/index.js -- -m [magnet link]');
		break;
}

