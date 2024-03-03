import { EncodeToBase32 as EncodeA, DecodeBase32 as DecodeA } from "./base32a";
import { EncodeToBase32 as EncodeB, DecodeBase32 as DecodeB } from "./base32b";

if (process.env.MOD === "1") {
	DecodeA(EncodeA(crypto.getRandomValues(new Uint8Array(641))));
}


Start();


function Start() {
	for (let bytes = 0; bytes < 1000; bytes++) {
		if (bytes > 641) {
			console.log("no error at 641 :)");
			process.exit(0);
		}

		const input = crypto.getRandomValues(new Uint8Array(bytes));

		const encodedA = EncodeA(input, false);
		const encodedB = EncodeB(input, false);
		if (encodedA !== encodedB) {
			DumpError(bytes, input, "encoding", "compact", encodedA, encodedB);
		}

		const decodedB_byA = DecodeA(encodedB);
		const decodedB_byB = DecodeB(encodedB);
		if (decodedB_byA.toString() !== decodedB_byB.toString()) {
			DumpError(bytes, input, "decoding", "B", decodedB_byA, decodedB_byB);
		}
	}
}


function FormatByte(b: number){
	return b.toString(16).toUpperCase().padStart(2, "0");
}


function DumpError(bytes: number, input: Uint8Array, operation: "encoding", variant: "padding" | "compact", a: string, b: string): never;
function DumpError(bytes: number, input: Uint8Array, operation: "decoding", variant: "A" | "B", a: Uint8Array, b: Uint8Array): never;
function DumpError(bytes: number, input: Uint8Array, ...[operation, variant, a, b]: ["encoding", "padding" | "compact", string, string] | ["decoding", "A" | "B", Uint8Array, Uint8Array]) {
	console.error(`A <> B ${operation} (${variant}) mismatch for base32 of ${bytes} bytes`);
	console.error();

	switch (operation) {
		case "encoding": {
			console.error(`  "${a}" <> ${b}`)
		} break;

		case "decoding": {
			console.error(`  EncodeA(I): ${EncodeA(input).slice(0, 30)}... EncodeB(I): ${EncodeB(input).slice(0, 30)}...`);
			console.error(`  EncodeA(A): ${EncodeA(a).slice(0, 30)}... EncodeB(A): ${EncodeB(a).slice(0, 30)}...`);
			console.error(`  EncodeA(B): ${EncodeA(b).slice(0, 30)}... EncodeB(B): ${EncodeB(b).slice(0, 30)}...`);
			console.error();
			console.error(`  Hex(I): ${[...input.values()].map(b => FormatByte(b)).slice(0, 30).join(" ")}`);
			console.error(`  Hex(A): ${[...a.values()].map(b => FormatByte(b)).slice(0, 30).join(" ")}`);
			console.error(`  Hex(B): ${[...b.values()].map(b => FormatByte(b)).slice(0, 30).join(" ")}`);
			console.error();
			for (let i = 0; i < Math.min(a.byteLength, b.byteLength); i++) {
				if (a[i] !== b[i]) {
					console.error(`  byte #${i} mistmatch: (A: ${FormatByte(a[i])}) <> (B: ${FormatByte(b[i])})`)
				}
			}
		} break;
	}

	console.error();
	process.exit(0);
}
