export function stringToHex(str) {
    return str.split('')
        .map(char => '0x' + char.charCodeAt(0).toString(16).toUpperCase())
        .join(' ');
}

export function hexToString(hex, padding = 2) {
    const hexString = String(hex);
    const bytes = hexString.replace(/0x/g, '')
        .split(' ')
        .map(byte => byte.padStart(padding, '0'));
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
}

export function calculateChecksum(buffer) {
    const sum = buffer.reduce((acc, byte) => acc + byte, 0);
    const lsb = sum & 0xFF;
    const checksum = ((~lsb + 1) & 0xFF);
    return checksum;
}

export function hexStringToBuffer(hexString) {
    const cleanHex = hexString.replace(/0x/g, '').replace(/\s/g, '');
    const bytes = new Uint8Array(
        cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    return bytes;
}

export function bufferToHexString(buffer, padding = 2) {
    return Array.from(buffer)
        .map(byte => byte.toString(16).toUpperCase().padStart(padding, '0'))
        .join(' ');
}

export function bufferToString(buffer) {
    return Array.from(buffer)
        .map(byte => {
            // Converti solo caratteri stampabili (ASCII 32-126)
            if (byte >= 32 && byte <= 126) {
                return String.fromCharCode(byte);
            }
            // Sostituisci caratteri non stampabili con un punto
            return '.';
        })
        .join('');
}

export function decToHexString(decimal, padding = 2) {
    const hex = decimal.toString(16).toUpperCase();
    return hex.padStart(padding, '0');
}

export function addByteToBuffer(buffer, byte) {
    const newBuffer = new Uint8Array(buffer.length + 1);
    newBuffer.set(buffer);
    newBuffer[buffer.length] = byte;
    return newBuffer;
}
