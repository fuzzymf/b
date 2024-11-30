
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