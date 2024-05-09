import WebTorrent from "webtorrent";

export default function downloadMagnet(magnetURI: string) {
	const client = new WebTorrent();

	client.add(magnetURI, { path: './downloads' }, torrent => {
		console.log('Downloading: ' + torrent.infoHash);
		// Get torrent progress
		torrent.on('download', bytes => {
			const percent = (torrent.progress * 100).toFixed(2);
			console.log('Downloaded: ' + percent + '%');
		});

		// Handle when the torrent has finished downloading
		torrent.on('done', () => {
			console.log('Download completed!');
			client.destroy();
			//exit process
			process.exit();
		});
	});
}