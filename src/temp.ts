
// const parseTrackerResponse = (response: any) => {
// 	// Extract the peer list from the response (assuming response is in Bencode format)
// 	const peerListStart = response.indexOf('peers') + 5;
// 	const peerListEnd = response.indexOf(']', peerListStart) + 1;
// 	const peerList = response.substring(peerListStart, peerListEnd);

// 	// Split the peer list into individual peers
// 	const peers = [];
// 	for (let i = 0; i < peerList.length; i += 6) {
// 		const ip = peerList.slice(i, i + 4).split('').map(char => char.charCodeAt(0)).join('.');
// 		const port = peerList.slice(i + 4, i + 6).reduce((acc, val) => acc * 256 + val);
// 		peers.push({ ip, port });
// 	}

// 	return peers;
// };

// // const connectToPeers = (peers, infoHash) => {
// //   peers.forEach(peer => {
// //     const { ip, port } = peer;

// //     const client = net.createConnection({ host: ip, port }, () => {
// //       console.log('Connected to peer:', ip + ':' + port);

// //       // Send the initial handshake to the peer
// //       client.write(createHandshake(infoHash));
// //     });

// //     client.on('data', data => {
// //       // Handle data received from the peer
// //       // Implement the protocol logic for downloading the files

// //       // For example, you can save the received data as a file
// //       fs.writeFileSync(downloadPath + '/' + infoHash + '.txt', data);

// //       // Close the connection to the peer
// //       client.end();
// //     });

// //     client.on('end', () => {
// //       console.log('Disconnected from peer:', ip + ':' + port);
// //     });

// //     client.on('error', err => {
// //       console.error('Error connecting to peer:', ip + ':' + port, err);
// //     });
// //   });
// // };

// // // Create the handshake message for the peer
// // const createHandshake = infoHash => {
// //   const handshake = Buffer.alloc(68);

// //   // Set the protocol name
// //   handshake.writeUInt8(19, 0);
// //   handshake.write('BitTorrent protocol', 1);

// //   // Set the reserved bytes
// //   handshake.writeUInt32BE(0, 20);
// //   handshake.writeUInt32BE(0, 24);

// //   // Set the info hash
// //   Buffer.from(infoHash, 'hex').copy(handshake, 28);

// //   // Set the peer ID (optional)
// //   // Replace the following with your desired peer ID
// //   const peerId = '-MY-PEER-ID-';
// //   Buffer.from(peerId).copy(handshake, 48);

// //   return handshake;
// // };