import { existsSync, readFileSync } from 'fs';
import { parseMagnetLink, parseTorrentFile } from './parser.js';
import { Torrent } from './torrent.js';
import { exit } from 'process';
import { State } from './torrent.js';

const arg: string = process.argv[2];

/**
 * Handle command line arguments
 * -h: Help
 * -v: Version
 * -m: Magnet link
 * -t: Torrent file
 */

switch (arg) {
	case '-h':
		console.info('Usage: bee -- -t [torrent file path]');
		console.info('Usage: bee -- -m [magnet link]');
		break;
	case '-v':
		console.log('Version: 0.0.1');
		break;
	// Handle magnet link
	case '-m':
		try {
			const link: string = process.argv[3];
			if (link.startsWith('magnet')) {
				// Decode the magnet link
				// Create a new Torrent object with the extracted information
				const torrent: Torrent = parseMagnetLink(link);
				// Initialize pieces based on the torrent metadata
				// This will be done dynamically for magnet links
				// Pieces are parts of the file(s) that are downloaded
				torrent.initializePieces();

				// Pre-processing function 
				const state: State = torrent.initializeDownload(torrent);

				// Download the torrent
				await torrent.download(torrent, state);
			}
			else throw new Error('Invalid magnet link provided');
			break;
		}
		catch (error) {
			console.error(error);
			exit(1);
		}
	case '-t':
		const filePath: string = process.argv[3];
		try {
			if (existsSync(filePath)) {
				const rawData: Buffer = readFileSync(filePath);
				// Handle decoding of torrent file
				// Create a new Torrent object with the extracted information
				const torrent: Torrent = parseTorrentFile(rawData);
				// The torrent file contains metadata about the torrent
				// This metadata contains information about the file(s) in the torrent
				// And the pieces that make up the file(s)
				torrent.initializePieces();

				// Pre-processing function
				const state: State = torrent.initializeDownload(torrent);

				// Download the torrent
				await torrent.download(torrent, state);

			}
			else throw new Error('Invalid torrent file provided');
			break;
		}
		catch (error) {
			console.error(error);
			exit(1);
		}
	default:
		console.log('Invalid argument provided\n');
		console.log('Usage: npm run bdown -- -t [torrent file path]\n OR \nUsage: node src/index.js -- -m [magnet link]');
		break;
}