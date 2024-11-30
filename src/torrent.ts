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