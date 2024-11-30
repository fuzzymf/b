import { Peer } from './peer.js';
// import { WebSeed } from './webSeed';

export class Torrent {
	public readonly infoHash: string;
	public readonly displayName: string;
	public readonly trackers?: string[];
	public readonly urlList?: string[];
	public readonly announce?: string;
	public readonly announceList?: string[][];
	public readonly size?: number;
	public pieces: Piece[];

	constructor(infoHash: string, displayName: string, size?: number, announce?: string, trackers?: string[], urlList?: string[]) {
		this.infoHash = infoHash;
		this.displayName = displayName;
		this.trackers = trackers;
		this.urlList = urlList;
		this.announce = announce;
		this.size = size;
		this.pieces = []; // Initialize pieces
	}

	/**
	 * Initializes pieces based on the torrent metadata.
	 */
	initializePieces(metadata: any): void {
		metadata.pieces.forEach((pieceInfo: any, index: number) => {
			const piece = new Piece(index, pieceInfo.hash);
			piece.peers = this.getPeersWithPiece(index);
			this.pieces.push(piece);
		});
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