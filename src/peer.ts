import DHT from 'bittorrent-dht';
import axios from 'axios';
import dgram from 'dgram';
import { Bencode } from './bencode.js';
import crypto from 'crypto';
export class Peer {
	id: string;
	address: string;
	port: number;
	availablePieces: number[];
	estimatedSpeed: number;

	constructor(id: string, address: string, port: number, availablePieces: number[], estimatedSpeed: number) {
		this.id = id;
		this.address = address;
		this.port = port;
		this.availablePieces = availablePieces;
		this.estimatedSpeed = estimatedSpeed;
	}

	// ...methods to communicate with the peer...
}

/**
 * A DHT-based peer discovery function that
 * finds peers for a given info hash.
 * @param infoHash The info hash of the torrent.
 * @returns A list of peers found via DHT.
 * @throws An error if no peers are found.
 **/

export function getPeersFromDHT(infoHash: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const dht = new DHT();
		let peerList: string[] = [];

		dht.listen(6881, () => console.log("DHT listening on port 6881"));

		dht.lookup(infoHash);
		dht.on('peer', (peer: { host: string; port: string; }, infoHash: any) => {
			console.log("Found peer:", peer.host + ":" + peer.port);
			peerList.push(peer.host + ":" + peer.port);
		});

		setTimeout(() => {
			dht.destroy();
			resolve(peerList);
		}, 15000); // Wait 15 seconds for peers
	});
}

export async function getPeersFromHTTPTracker(tracker: string, infoHash: string): Promise<string[]> {
	try {
		// Build all required query parameters
		const params = new URLSearchParams();
		params.append('info_hash', encodeURIComponent(Buffer.from(infoHash, 'hex').toString('binary')));
		params.append('peer_id', generatePeerID());
		params.append('port', '6881');
		params.append('uploaded', '0');
		params.append('downloaded', '0');
		params.append('left', '0');
		params.append('compact', '1'); // ask for binary 'compact' peers

		// Send HTTP request to tracker
		const response = await axios.get(tracker, {
			params,
			responseType: 'arraybuffer' // we need raw bytes
		});

		// Use your custom Bencode class:
		const bencodeParser = new Bencode(response.data);
		const data = bencodeParser.rawData; // Access the decoded dictionary

		const peers = [];
		// If 'peers' is a buffer, we have a 'compact' peer list
		if (data.peers && Buffer.isBuffer(data.peers)) {
			for (let i = 0; i < data.peers.length; i += 6) {
				const ip = `${data.peers[i]}.${data.peers[i + 1]}.${data.peers[i + 2]}.${data.peers[i + 3]}`;
				const port = data.peers.readUInt16BE(i + 4);
				peers.push(`${ip}:${port}`);
			}
		}
		return peers;
	} catch (error) {
		console.error(`Failed to fetch from HTTP tracker: ${tracker}`, error);
		return [];
	}
}

// Example peer ID generator
function generatePeerID() {
	const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	return `-AP0001-${Array.from({ length: 12 }, () => charset[Math.floor(Math.random() * charset.length)]).join('')}`;
}


export async function getPeersFromUDPTracker(tracker: string, infoHash: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const socket = dgram.createSocket("udp4");
		const parsedURL = new URL(tracker);

		const trackerHost = parsedURL.hostname;
		const trackerPort = parseInt(parsedURL.port, 10) || 80;
		const transactionId = crypto.randomUUID().slice(0, 4);

		const connectionRequest = Buffer.alloc(16);
		connectionRequest.writeUInt32BE(0x417, 0); // Magic constant
		connectionRequest.writeUInt32BE(0x27101980, 4); // Magic constant
		connectionRequest.writeUInt32BE(0, 8); // Action: Connect
		connectionRequest.write(transactionId, 12, "hex");

		socket.send(connectionRequest, trackerPort, trackerHost, (err) => {
			if (err) return reject(err);
		});

		socket.on("message", (msg) => {
			if (msg.length < 16) return;

			const action = msg.readUInt32BE(0);
			const receivedTransactionId = msg.slice(4, 8).toString("hex");
			if (action === 0 && receivedTransactionId === transactionId) {
				// Connection Response - Extract Connection ID
				const connectionId = msg.slice(8, 16);

				// Create Announce Request
				const announceRequest = Buffer.alloc(98);
				connectionId.copy(announceRequest, 0);
				announceRequest.writeUInt32BE(1, 8); // Action: Announce
				announceRequest.write(transactionId, 12, "hex");
				Buffer.from(infoHash, "hex").copy(announceRequest, 16);
				announceRequest.write(Buffer.alloc(20).toString("hex"), 36, "hex"); // Peer ID (Random)
				announceRequest.writeUInt32BE(0, 56); // Downloaded
				announceRequest.writeUInt32BE(0, 64); // Left
				announceRequest.writeUInt32BE(0, 72); // Uploaded
				announceRequest.writeUInt32BE(0, 80); // Event
				announceRequest.writeUInt32BE(0, 84); // IP Address
				announceRequest.writeUInt32BE(0, 88); // Key
				announceRequest.writeInt32BE(-1, 92); // Num Want
				announceRequest.writeUInt16BE(6881, 96); // Port

				socket.send(announceRequest, trackerPort, trackerHost, (err) => {
					if (err) return reject(err);
				});
			} else if (action === 1 && receivedTransactionId === transactionId) {
				// Announce Response - Extract Peer List
				const peerList: string[] = [];
				for (let i = 20; i < msg.length; i += 6) {
					const ip = `${msg[i]}.${msg[i + 1]}.${msg[i + 2]}.${msg[i + 3]}`;
					const port = msg.readUInt16BE(i + 4);
					peerList.push(`${ip}:${port}`);
				}
				resolve(peerList);
			}
		});

		setTimeout(() => {
			socket.close();
			reject("UDP tracker timeout");
		}, 5000);
	});
}