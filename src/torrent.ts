import { Peer } from './peer.js';
import { WebSeed } from './webSeed.js';
import fs from 'fs';

export enum State {
	INITIALIZING = 'INITIALIZING',
	DOWNLOADING = 'DOWNLOADING',
	PAUSED = 'PAUSED',
	RESUME = 'RESUME',
	COMPLETE = 'COMPLETE',
	ERROR = 'ERROR'
}


export class Torrent {
	public readonly infoHash: string;
	public readonly displayName: string;
	public readonly trackers?: string[];
	public readonly urlList?: string[];
	public readonly announce?: string;
	public readonly announceList?: string[][];
	public readonly size?: number;
	public readonly info?: any;
	public pieces: Piece[];

	constructor(infoHash: string, displayName: string, size?: number, announce?: string, trackers?: string[], urlList?: string[], info?: any) {
		this.infoHash = infoHash;
		this.displayName = displayName;
		this.trackers = trackers;
		this.urlList = urlList;
		this.announce = announce;
		this.size = size;
		this.pieces = []; // Initialize pieces
		this.info = info ? info : undefined;
	}

	/**
	* Pre-processing function that initializes the download.
	* @param size 
	* @param displayName 
	*/
	public initializeDownload(torrent: Torrent): State {
		const { size, displayName } = torrent;
		console.log(`Downloading ${displayName}...`);
		console.log(`Size: ${size}`);
		fs.mkdirSync('./downloads', { recursive: true });
		const downloadPath: string = `./downloads/${displayName}`;
		if (fs.existsSync(downloadPath)) {

			// if the folder is empty, this is a new download
			const files = fs.readdirSync(downloadPath);
			if (files.length === 0) {
				return State.INITIALIZING;
			} else {
				// Verify the hash
				// Verify the file is not being downloaded by another process
				// Check if the size of the file is greater than the available space on the disk
				// If any of the above conditions are met, throw an error
				// return State.ERROR;
				// else, proceed with the download
				return State.RESUME;
			}
		} else {
			// Create a new file
			fs.writeFileSync(downloadPath, '');
			return State.INITIALIZING;
		}
	}

	/**
	 * Downloads the torrent.
	 * @param torrent The Torrent object containing pieces and sources.
	 * @param state The current state of the download.
	 */
	public async download(torrent: Torrent, state: State): Promise<void> {
		switch (state) {
			case State.INITIALIZING:
				// Initialize the download
				// Download the pieces
				await this.downloadTorrent(torrent);
				break;
			case State.RESUME:
				// Resume the download
				// Download the remaining pieces
				await this.downloadTorrent(torrent);
				break;
			case State.DOWNLOADING:
				// Continue downloading the torrent
				await this.downloadTorrent(torrent);
				break;
			case State.PAUSED:
				// Pause the download
				break;
			case State.COMPLETE:
				// Download complete
				console.log('Download complete');
				break;
			case State.ERROR:
				// Error occurred
				console.error('An error occurred during the download');
				break;
			default:
				break;
		}
	}


	/**
	 * Downloads torrent pieces by ranking sources based on availability and speed.
	 * @param torrent The Torrent object containing pieces and sources.
	 * @returns A Promise that resolves when the download is complete.
	 * @throws An error if the download fails.
	 * @throws An error if all sources fail to download a piece.
	 * @throws An error if a piece is not available from any source.
	 */
	private async downloadTorrent(torrent: Torrent): Promise<void> {
		// pending implementation
		// console.log('Downloading torrent...');
		return new Promise((resolve, reject) => {
			resolve();
		}
		);
	}


	/**
	 * Initializes pieces based on the torrent metadata.
	 */
	initializePieces(): void {
		//check if info is defined
		// if it is, then initialize pieces based on the info dictionary
		// else, the torrent is a magnet link and pieces will be initialized dynamically
		// use DHT and announce to find peers and initialize pieces

		// this.metadata.pieces.forEach((pieceInfo: any, index: number) => {
		// 	const piece = new Piece(index, pieceInfo.hash);
		// 	piece.peers = this.getPeersWithPiece(index);
		// 	this.pieces.push(piece);
		// });
	}

	/**
	 * Retrieves peers that have a specific piece.
	 * @param index The index of the piece.
	 * @returns An array of peers that have the piece.
	 */
	getPeersWithPiece(index: number): Peer[] {
		return [];
	}
}

/**
 * Represents a single piece of the torrent.
 */
class Piece {
	index: number;
	hash: string;
	peers: Peer[];

	constructor(index: number, hash: string) {
		this.index = index;
		this.hash = hash;
		this.peers = [];
	}
}