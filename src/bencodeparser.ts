import * as fs from 'fs';
export class Torrent {
    public readonly infoHash: string;
    public readonly displayName?: string;
    public readonly trackers?: string[];
    public readonly urlList?: string[];
    public readonly announce?: string;
    public readonly announceList?: string[][];
    public readonly size?: number;

    constructor(infoHash: string, displayName?: string, trackers?: string[], urlList?: string[], announce?: string, announceList?: string[][], size?: number) {
        this.infoHash = infoHash;
        this.displayName = displayName;
        this.trackers = trackers;
        this.urlList = urlList;
        this.announce = announce;
        this.announceList = announceList;
        this.size = size;
    }
}
export function parseMagnetLink(sourcelink: string): Torrent {
    console.log("sourcelink: " + sourcelink + "\n+" + sourcelink.startsWith('magnet'));
    if (sourcelink.startsWith('magnet')) {
        const xtMatch = sourcelink.match(/xt=urn:btih:([a-fA-F0-9]{40})/);
        if (!xtMatch) {
            throw new Error('Invalid magnet sourcelink: missing xt parameter');
        }
        const infoHash = xtMatch[1];

        const displayNameMatch = sourcelink.match(/dn=([^&]+)/);
        const displayName = displayNameMatch ? decodeURIComponent(displayNameMatch[1]) : undefined;

        const announceMatch = sourcelink.match(/tr=([^&]+)/);
        const announce = announceMatch ? decodeURIComponent(announceMatch[1]) : undefined;

        const announceListMatch = sourcelink.match(/tr=([^&]+)/g);
        const announceList = announceListMatch ? announceListMatch.map((match) => decodeURIComponent(match.substr(3))) : undefined;

        const sizeMatch = sourcelink.match(/xl=([^&]+)/);
        const size = sizeMatch ? parseInt(sizeMatch[1]) : undefined;

        const trackerMatches = sourcelink.match(/tr=([^&]+)/g);
        const trackers = trackerMatches ? trackerMatches.map((match) => decodeURIComponent(match.substr(3))) : undefined;

        const urlListMatch = sourcelink.match(/ws=([^&]+)/);
        const urlList = urlListMatch ? [decodeURIComponent(urlListMatch[1])] : undefined;
        console.log("infoHash: " + infoHash);
        console.log("displayName: " + displayName);
        console.log("trackers: " + trackers);
        return new Torrent(infoHash, displayName, trackers, urlList);
    } else {
        throw new Error('Invalid magnet link provided');
    }
}
// "magnet:?xt=urn:btih:247EB3694D3E3E4A8879F1C4B85A33D1876283B0&dn=Ratiborus+KMS+Tools+v01.06.2021+%28Activate+Windows+and+MS+Office%29&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"