import { Torrent } from './torrent.js';
import { Bencode } from './bencode.js';
import axios from 'axios';

import { getPeersFromDHT, getPeersFromUDPTracker, getPeersFromHTTPTracker } from './peer.js';

/**
 * A regex-based magnet link parser that 
 * parses a magnet URI and returns a Torrent object.
 * @param sourcelink The magnet link to parse.
 * @returns The Torrent object.
 * @throws An error if the magnet link is invalid.
**/

export async function parseMagnetLink(sourcelink: string): Promise<Torrent> {
    // Extract the info hash from the magnet link
    // A unique identifier for the torrent
    const xtMatch = sourcelink.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
    if (!xtMatch) {
        throw new Error('Invalid magnet sourcelink: missing xt parameter');
    }
    const infoHash = xtMatch[1];

    // Extract the display name from the magnet link
    // The name of the torrent
    const displayNameMatch: RegExpMatchArray | null
        = sourcelink.match(/dn=([^&]+)/);
    const displayName: string | undefined
        = displayNameMatch ? decodeURIComponent(displayNameMatch[1]) : undefined;

    // Extract the announce URL from the magnet link
    // The primary tracker for the torrent
    // The tracker contains the IP address and port number of the server that coordinates the file distribution
    const announceMatch: RegExpMatchArray | null
        = sourcelink.match(/tr=([^&]+)/);
    const announce: string | undefined
        = announceMatch ? decodeURIComponent(announceMatch[1]) : undefined;

    // Extract the announce list from the magnet link
    // A list of backup trackers for the torrent
    // If the primary tracker fails, the client can use one of the backup trackers to find peers
    // The client can use these trackers to find peers/seeders for the torrent
    // Peers are other clients that are downloading/uploading the same torrent
    const announceListMatch: RegExpMatchArray | null
        = sourcelink.match(/tr=([^&]+)/g);
    const announceList: string[] = announceListMatch ? announceListMatch.map((match) => decodeURIComponent(match.substr(3))) : [];

    // Extract the size of the torrent from the magnet link
    // The size of the torrent in bytes
    const sizeMatch: RegExpMatchArray | null = sourcelink.match(/xl=([^&]+)/);
    const size: number | undefined = sizeMatch ? parseInt(sizeMatch[1]) : undefined;

    // Extract the URL list of the torrent from the magnet link
    // A list of web seeds for the torrent 
    // The client can use these URLs to download the torrent from a web server 
    // This provides an alternative to downloading from peers and can help improve download speed and reliability, especially when there are few peers available.
    const urlListMatch: RegExpMatchArray | null
        = sourcelink.match(/ws=([^&]+)/);
    const urlList: string[] = urlListMatch ? [decodeURIComponent(urlListMatch[1])] : [];

    // Use DHT to find peers if no tracker is available and
    // Create a info dictionary with the extracted information

    // Create a new Torrent object with the extracted information

    console.log("infoHash: ", infoHash);
    console.log("displayName: ", displayName);
    console.log("size: ", size);
    console.log("announce: ", announce);
    console.log("announceList: ", announceList);
    console.log("urlList: ", urlList);
    const torrent: Torrent = new Torrent(infoHash, displayName || "Unknown", size, announce, announceList, urlList);

    // Try to get peers from announce list(trackers)
    let peers: string[] = [];
    for (const tracker of announceList) {
        try {
            // check if the tracker is a valid HTTP URL or UDP URL
            if (tracker.startsWith("http://") || tracker.startsWith("https://")) {
                // Implement HTTP tracker protocol
                const httpPeers = await getPeersFromHTTPTracker(tracker, infoHash);
                peers.push(...httpPeers);
            } else if (tracker.startsWith("udp://")) {
                console.log("UDP tracker found:", tracker);
                // Implement UDP tracker protocol
                const udpPeers = await getPeersFromUDPTracker(tracker, infoHash);
                peers.push(...udpPeers);
            } else {
                throw new Error("Invalid tracker URL");
            }

        } catch (error) {
            console.error(`Error getting peers from tracker: ${tracker}:`, error);
            continue;
        }
    }
    // If no peers found via trackers, fallback to DHT
    if (peers.length === 0) {
        console.log("No peers found via trackers. Falling back to DHT...");
        peers = await getPeersFromDHT(infoHash);
    }

    console.log("Discovered Peers:", peers);
    return torrent;
}

/**
 * A parser that
 * parses a torrent file and returns a Torrent object.
 * @param rawData The raw data parsed as a string.
 * @returns The Torrent object.
 * @throws An error if the torrent file is invalid.
 */
export function parseTorrentFile(rawData: Buffer): Torrent {
    // A torrent file is encoded in bencode format
    // Bencode is a simple encoding format used by BitTorrent and is 
    // composed of dictionaries, lists, integers, and byte strings
    const bencode = new Bencode(rawData);
    // metadata is the top-level dictionary in the torrent file

    const metadata = bencode.rawData;

    if (!metadata.info) {
        throw new Error("Invalid torrent file: missing 'info' dictionary");
    }

    // The info hash is a SHA-1 hash of the 'info' dictionary in the torrent file
    const infoHash = bencode.createHash(metadata.info);

    const displayName = (metadata.info.name instanceof Buffer) ? metadata.info.name.toString('utf-8') : "Unknown";

    // Handle multi-file torrents
    // The size of the torrent is the sum of the sizes of all files in the torrent
    let size: number | undefined = undefined;
    if (metadata.info.files && Array.isArray(metadata.info.files)) {
        size = metadata.info.files.reduce((acc: number, file: any) => acc + (file.length || 0), 0);
    } else {
        size = metadata.info.length;
    }

    //build the info object
    const info: Buffer = metadata.info;


    // Extract the announce URL from the magnet link
    // The primary tracker for the torrent
    // The tracker contains the IP address and port number of the server that coordinates the file distribution
    const announce: string
        = metadata.announce ? (metadata.announce instanceof Buffer ? metadata.announce.toString('utf-8') : "Unknown") : undefined;

    // Extract the announce list from the magnet link
    // A list of backup trackers for the torrent
    // If the primary tracker fails, the client can use one of the backup trackers to find peers
    // The client can use these trackers to find peers/seeders for the torrent
    // Peers are other clients that are downloading/uploading the same torrent
    const announceList: string[]
        = metadata['announce-list']
            ? metadata['announce-list'].map((tier: any[]) => tier.map((url: Buffer) => url.toString('utf-8'))).flat()
            : [];


    // Extract the URL list of the torrent from the torrent file
    // A list of web seeds for the torrent 
    // The client can use these URLs to download the torrent from a web server 
    // This provides an alternative to downloading from peers and can help improve download speed and reliability, especially when there are few peers available.
    const urlList: string[]
        = metadata['url-list']
            ? (Array.isArray(metadata['url-list']) ? metadata['url-list'].map((url: Buffer) => url.toString('utf-8')) : [(metadata['url-list'] instanceof Buffer ? metadata['url-list'].toString('utf-8') : "")])
            : [];

    console.log("infoHash:", infoHash);
    console.log("displayName:", displayName);
    console.log("size:", size);
    console.log("announce:", announce);
    console.log("announceList:", announceList);
    console.log("urlList:", urlList);

    const torrent: Torrent = new Torrent(infoHash, displayName, size, announce, announceList, urlList, info);

    return torrent;
}
