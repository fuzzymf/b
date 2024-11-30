import { Torrent } from './torrent.js';

/**
 * A simple regex-based magnet link parser that 
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
    return new Torrent(infoHash, displayName, size, announce, announceList, urlList);
}
// "magnet:?xt=urn:btih:247EB3694D3E3E4A8879F1C4B85A33D1876283B0&dn=Ratiborus+KMS+Tools+v01.06.2021+%28Activate+Windows+and+MS+Office%29&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"