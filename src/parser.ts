import { Torrent } from './torrent.js';
import { Bencode } from './bencode.js';

/**
 * A regex-based magnet link parser that 
 * parses a magnet URI and returns a Torrent object.
 * @param sourcelink The magnet link to parse.
 * @returns The Torrent object.
 * @throws An error if the magnet link is invalid.
**/

export function parseMagnetLink(sourcelink: string): Torrent {
    // Extract the info hash from the magnet link
    // A unique identifier for the torrent
    const xtMatch = sourcelink.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
    if (!xtMatch) {
        throw new Error('Invalid magnet sourcelink: missing xt parameter');
    }
    const infoHash = xtMatch[1];

    // Extract the display name from the magnet link
    // The name of the torrent
    const displayNameMatch = sourcelink.match(/dn=([^&]+)/);
    const displayName = displayNameMatch ? decodeURIComponent(displayNameMatch[1]) : "Unknown";

    // Extract the announce URL from the magnet link
    // The primary tracker for the torrent
    // The tracker contains the IP address and port number of the server that coordinates the file distribution
    const announceMatch = sourcelink.match(/tr=([^&]+)/);
    const announce = announceMatch ? decodeURIComponent(announceMatch[1]) : undefined;

    // Extract the announce list from the magnet link
    // A list of backup trackers for the torrent
    // If the primary tracker fails, the client can use one of the backup trackers to find peers
    // The client can use these trackers to find peers/seeders for the torrent
    // Peers are other clients that are downloading/uploading the same torrent
    const announceListMatch = sourcelink.match(/tr=([^&]+)/g);
    const announceList = announceListMatch ? announceListMatch.map((match) => decodeURIComponent(match.substr(3))) : undefined;

    // Extract the size of the torrent from the magnet link
    // The size of the torrent in bytes
    const sizeMatch = sourcelink.match(/xl=([^&]+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : undefined;

    // Extract the URL list of the torrent from the magnet link
    // A list of web seeds or peer sources for the torrent
    // The client can use these URLs to download the torrent from a web server or another peer
    // This provides an alternative to downloading from peers and can help improve download speed and reliability, especially when there are few peers available.
    const urlListMatch = sourcelink.match(/ws=([^&]+)/);
    const urlList = urlListMatch ? [decodeURIComponent(urlListMatch[1])] : undefined;

    console.log("infoHash: " + infoHash);
    console.log("displayName: " + displayName);
    console.log("size: " + size);
    console.log("trackers: " + announceList);
    const torrent = new Torrent(infoHash, displayName, size, announce, announceList, urlList);

    // torrent.initializePieces(metadata.info);
    return torrent;
}

/**
 * A bencode parser that
 * parses a torrent file and returns a Torrent object.
 * @param rawData The raw data parsed as a string.
 * @returns The Torrent object.
 * @throws An error if the torrent file is invalid.
 */
export function parseTorrentFile(rawData: Buffer): Torrent {
    const bencode = new Bencode(rawData);
    const metadata = bencode.rawData;

    if (!metadata.info) {
        throw new Error("Invalid torrent file: missing 'info' dictionary");
    }

    const infoHash = bencode.createHash(metadata.info);

    const displayName = (metadata.info.name instanceof Buffer) ? metadata.info.name.toString('utf-8') : "Unknown";

    // Handle multi-file torrents
    let size: number | undefined = undefined;
    if (metadata.info.files && Array.isArray(metadata.info.files)) {
        size = metadata.info.files.reduce((acc: number, file: any) => acc + (file.length || 0), 0);
    } else {
        size = metadata.info.length;
    }

    const announce = metadata.announce ? (metadata.announce instanceof Buffer ? metadata.announce.toString('utf-8') : "Unknown") : undefined;
    const announceList = metadata['announce-list']
        ? metadata['announce-list'].map((tier: any[]) => tier.map((url: Buffer) => url.toString('utf-8'))).flat()
        : [];
    const urlList = metadata['url-list']
        ? (Array.isArray(metadata['url-list']) ? metadata['url-list'].map((url: Buffer) => url.toString('utf-8')) : [(metadata['url-list'] instanceof Buffer ? metadata['url-list'].toString('utf-8') : "")])
        : [];

    console.log("infoHash:", infoHash);
    console.log("displayName:", displayName);
    console.log("size:", size);
    console.log("announce:", announce);
    console.log("announceList:", announceList);
    console.log("urlList:", urlList);

    const torrent = new Torrent(infoHash, displayName, size, announce, announceList, urlList);

    // Additional initialization can be done here, e.g., initializing pieces

    return torrent;
}
