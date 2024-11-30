import * as crypto from 'crypto';

export class Bencode {
	private data: any;
	private index: number;
	private buffer: Buffer;

	constructor(rawData: Buffer) {
		this.buffer = rawData;
		this.index = 0;
		this.data = this.decode();
	}

	/**
	 * Get the decoded data
	 */
	get rawData(): any {
		return this.data;
	}

	/**
	 * Decode the entire buffer
	 */
	private decode(): any {
		if (this.index >= this.buffer.length) {
			throw new Error("Unexpected end of data");
		}

		const byte = this.buffer[this.index];

		if (byte === 0x69) { // 'i'
			return this.decodeInteger();
		} else if (byte === 0x6C) { // 'l'
			return this.decodeList();
		} else if (byte === 0x64) { // 'd'
			return this.decodeDictionary();
		} else if (byte >= 0x30 && byte <= 0x39) { // '0' - '9'
			return this.decodeString();
		} else {
			throw new Error(`Invalid bencode format at position ${this.index}`);
		}
	}

	/**
	 * Decode a byte string
	 */
	private decodeString(): Buffer | string {
		const colon = this.buffer.indexOf(':', this.index);
		if (colon === -1) {
			throw new Error("Invalid string: missing ':' separator");
		}

		const lengthStr = this.buffer.toString('utf-8', this.index, colon);
		const length = parseInt(lengthStr, 10);
		if (isNaN(length)) {
			throw new Error(`Invalid string length at position ${this.index}`);
		}

		this.index = colon + 1;
		const str = this.buffer.slice(this.index, this.index + length);
		if (str.length !== length) {
			throw new Error("Invalid string: length mismatch");
		}

		this.index += length;

		// Decide whether to return Buffer or string based on context
		// For simplicity, return Buffer for all strings
		return str;
	}

	/**
	 * Decode an integer
	 */
	private decodeInteger(): number {
		if (this.buffer[this.index] !== 0x69) { // 'i'
			throw new Error(`Invalid integer start at position ${this.index}`);
		}
		this.index++; // skip 'i'

		const end = this.buffer.indexOf(0x65, this.index); // 'e'
		if (end === -1) {
			throw new Error("Invalid integer: missing 'e' terminator");
		}

		const intStr = this.buffer.toString('utf-8', this.index, end);
		if (!/^(-)?\d+$/.test(intStr)) {
			throw new Error(`Invalid integer value at position ${this.index}`);
		}

		const num = parseInt(intStr, 10);
		this.index = end + 1; // skip 'e'
		return num;
	}

	/**
	 * Decode a list
	 */
	private decodeList(): any[] {
		if (this.buffer[this.index] !== 0x6C) { // 'l'
			throw new Error(`Invalid list start at position ${this.index}`);
		}
		this.index++; // skip 'l'

		const list: any[] = [];
		while (this.buffer[this.index] !== 0x65) { // 'e'
			list.push(this.decode());
			if (this.index >= this.buffer.length) {
				throw new Error("Invalid list: missing 'e' terminator");
			}
		}

		this.index++; // skip 'e'
		return list;
	}

	/**
	 * Decode a dictionary
	 */
	private decodeDictionary(): { [key: string]: any } {
		if (this.buffer[this.index] !== 0x64) { // 'd'
			throw new Error(`Invalid dictionary start at position ${this.index}`);
		}
		this.index++; // skip 'd'

		const dict: { [key: string]: any } = {};
		while (this.buffer[this.index] !== 0x65) { // 'e'
			const keyBuffer = this.decodeString();
			if (!(keyBuffer instanceof Buffer)) {
				throw new Error("Dictionary keys must be strings");
			}
			const key = keyBuffer.toString('utf-8');
			if (dict.hasOwnProperty(key)) {
				throw new Error(`Duplicate dictionary key: ${key}`);
			}
			dict[key] = this.decode();
			if (this.index >= this.buffer.length) {
				throw new Error("Invalid dictionary: missing 'e' terminator");
			}
		}

		this.index++; // skip 'e'
		return dict;
	}

	/**
	 * Encode JavaScript data into bencode Buffer
	 * Supports strings (Buffer or string), numbers, arrays, and objects
	 */
	encode(data: any = this.data): Buffer {
		if (typeof data === 'number') {
			return Buffer.from(`i${data}e`, 'utf-8');
		} else if (typeof data === 'string') {
			const strBuffer = Buffer.from(data, 'utf-8');
			return Buffer.concat([Buffer.from(`${strBuffer.length}:`, 'utf-8'), strBuffer]);
		} else if (Buffer.isBuffer(data)) {
			return Buffer.concat([Buffer.from(`${data.length}:`, 'utf-8'), data]);
		} else if (Array.isArray(data)) {
			const buffers = [Buffer.from('l', 'utf-8')];
			for (const item of data) {
				buffers.push(this.encode(item));
			}
			buffers.push(Buffer.from('e', 'utf-8'));
			return Buffer.concat(buffers);
		} else if (typeof data === 'object' && data !== null) {
			// Dictionaries must have keys sorted lexicographically
			const keys = Object.keys(data).sort();
			const buffers = [Buffer.from('d', 'utf-8')];
			for (const key of keys) {
				const keyBuffer = Buffer.from(key, 'utf-8');
				buffers.push(this.encode(keyBuffer));
				buffers.push(this.encode(data[key]));
			}
			buffers.push(Buffer.from('e', 'utf-8'));
			return Buffer.concat(buffers);
		} else {
			throw new Error(`Unsupported data type for encoding: ${typeof data}`);
		}
	}

	/**
	 * Create SHA-1 hash of the encoded info dictionary
	 * @param data The info dictionary to hash
	 * @returns The SHA-1 hash as a hex string
	 */
	createHash(data: any): string {
		const infoBuffer = this.encode(data);
		const hash = crypto.createHash('sha1').update(infoBuffer).digest('hex');
		return hash;
	}
}
