# b: A tiny [BitTorrent](https://en.wikipedia.org/wiki/BitTorrent) client written in typescript

[bittorrent](https://bittorrent.org) is a peer-to-peer file sharing protocol, used to distribute files over the Internet. Peer-to-peer means that clients do not need to connect to a central server to retrieve or distribute files. Instead, each client connects directly to other clients. This is the basis for the BitTorrent protocol.

[Introduction to BitTorrent](https://www.bittorrent.org/introduction.html)

A torrent file/ magnet link usually contains the following: -
- `xt`: The type of the file being shared, in this case a BitTorrent info hash.
- `urn`: The namespace of the hash function used to calculate the info hash.
- `btih`: The actual info hash of the file being shared.
- `dn`: The display name of the file being shared.
- `tr`: The URL of the tracker server(s) that the client should use to find peers.
- `xl`: The length of the file in bytes.

, but, is not limited to the above.
Read more about the [magent link](https://en.wikipedia.org/wiki/Magnet_URI_scheme).

A magnet link is encoded in bencode(pronounced Bee-encode) format, which is a way to serialize data structures. Read more about [bencode](https://en.wikipedia.org/wiki/Bencode).