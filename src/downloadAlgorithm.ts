
import { Torrent } from './torrent.js';
import { Peer } from './peer.js';
import { WebSeed } from './webSeed.js';

/**
 * Represents a source for a torrent piece.
 */
interface Source {
	type: 'peer' | 'webSeed';
	source: Peer | WebSeed;
	speed: number; // Estimated download speed
	availability: number; // Number of available sources
}
// Todo: Implement Kademlia
/**
 * Efficiently downloads torrent pieces by ranking sources based on availability and speed.
 * @param torrent The Torrent object containing pieces and sources.
 */
export async function downloadTorrent(torrent: Torrent): Promise<void> {
	const pieceSourcesMap: Map<number, Source[]> = new Map();

	// For each piece, gather all available sources
	torrent.pieces.forEach((piece, index) => {
		const sources: Source[] = [];

		// Add peers that have the piece
		piece.peers.forEach(peer => {
			sources.push({
				type: 'peer',
				source: peer,
				speed: peer.estimatedSpeed,
				availability: peer.availablePieces.length
			});
		});

		// Add web seeds if available
		if (torrent.urlList) {
			torrent.urlList.forEach(url => {
				sources.push({
					type: 'webSeed',
					source: new WebSeed(url),
					speed: 1000, // Assume a default speed for web seeds
					availability: 1
				});
			});
		}

		pieceSourcesMap.set(index, sources);
	});

	// Download each piece starting from the best available source
	for (const [index, sources] of pieceSourcesMap.entries()) {
		// Rank sources based on availability (ascending) and speed (descending)
		sources.sort((a, b) => {
			if (a.availability !== b.availability) {
				return a.availability - b.availability;
			}
			return b.speed - a.speed;
		});

		// Attempt to download from the best source first
		let downloaded = false;
		for (const source of sources) {
			try {
				await downloadPiece(source.source, index);
				downloaded = true;
				break;
			} catch (error) {
				console.warn(`Failed to download piece ${index} from ${source.type}`);
			}
		}

		if (!downloaded) {
			throw new Error(`Failed to download piece ${index} from all sources`);
		}
	}
}

/**
 * Downloads a specific piece from a given source.
 * @param source The source to download the piece from.
 * @param index The index of the piece to download.
 */
async function downloadPiece(source: Peer | WebSeed, index: number): Promise<void> {
	// ...implementation for downloading the piece...
}