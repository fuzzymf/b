import { Torrent } from './bencodeparser';
import crypto from 'crypto';
import net from 'net';
import { createWriteStream, existsSync, mkdirSync } from 'fs';

if (!existsSync('./downloads')) {
  mkdirSync('./downloads');
}

const getPeersFromHTTPTracker = (tracker: string, infoHash: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const [host, port] = tracker.split(':');
    console.log('Connecting to host, port:', host, port);

    const client = net.createConnection({ host, port: parseInt(port) }, () => {
      console.log('Connected to tracker:', tracker);
      client.write(Buffer.from('GET /announce?info_hash=' + infoHash + ' HTTP/1.1\r\n\r\n'));
    });

    client.on('data', data => {
      const response = data.toString();
      console.log('Tracker response:', response);
      const peers: string[] = [];
      // const peers: any = parseTrackerResponse(response);
      resolve(peers);
    });

    client.on('end', () => {
      console.log('Disconnected from tracker:', tracker);
    });

    client.on('error', err => {
      console.error('Error connecting to tracker:', tracker, err);
      reject(err);
    });
  });
};

const getPeersFromUDPTracker = (tracker: string, infoHash: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const [host, port] = tracker.split(':');
    console.log('Connecting to host, port:', host, port);

    const client = net.createConnection({ host, port: parseInt(port) }, () => {
      console.log('Connected to tracker:', tracker);
      client.write(Buffer.from('GET /announce?info_hash=' + infoHash + ' HTTP/1.1\r\n\r\n'));
    });

    client.on('data', data => {
      const response = data.toString();
      console.log('Tracker response:', response);
      const peers: string[] = [];
      // const peers: any = parseTrackerResponse(response);
      resolve(peers);
    });

    client.on('end', () => {
      console.log('Disconnected from tracker:', tracker);
    });

    client.on('error', err => {
      console.error('Error connecting to tracker:', tracker, err);
      reject(err);
    });
  });
};


export const downloadTorrent: any = async (torrent: Torrent) => {
  const infoHash: string = torrent.infoHash;
  const trackers: string[] = torrent.trackers || [];
  const displayName: string = torrent.displayName || 'Unknown';

  const peerList: string[][] = [];

  if (trackers.length) {
    for (let i = 0; i < trackers.length; i++) {
      let tracker = trackers[i];

      // 'udp://tracker.coppersurfer.tk:6969/announce',
      // 'udp://tracker.openbittorrent.com:6969/announce',
      // 'udp://tracker.opentrackr.org:1337',
      // check if the tracker is a UDP tracker

      if (tracker.startsWith('udp')) {
        tracker = tracker.replace('udp://', '');
        const peers = await getPeersFromUDPTracker(tracker, infoHash);
        peerList.push(peers);
      } else {
        const peers = await getPeersFromHTTPTracker(tracker, infoHash);
        peerList.push(peers);
      }
      // tracker = tracker.replace(/(^\w+:|^)\/\//, '');

      // const peers = await getPeersFromTracker(tracker, infoHash);
      // peerList.push(peers);
    }
    // console.log('Peers:', peerList);
    // connectToPeers(peers, infoHash);

    console.log('Downloading torrent:', displayName);
  } else {
    throw new Error('No trackers found for torrent');
  }

}
