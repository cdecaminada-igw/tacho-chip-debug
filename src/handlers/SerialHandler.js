import { bufferToString, bufferToHexString, stringToBuffer } from '../utils/hexUtils';

class SerialHandler {
    port;
    dataCallback;
    reader;
    writer;
    isReading;
    lastPortInfo;
    monitorRef;
    isText;
    lastDataTime;
    buffer;
    portInfoName;

    constructor(portInfoName, monitorRef) {
        // Inizializza tutte le proprietà private nel costruttore
        this.port = null;
        this.dataCallback = null;
        this.reader = null;
        this.writer = null;
        this.isReading = false;
        this.isText = true;
        this.portInfoName = portInfoName;
        this.lastPortInfo = localStorage.getItem(portInfoName);
        this.monitorRef = monitorRef;
        this.lastDataTime = null;
        this.buffer = [];

        if (!('serial' in navigator)) {
            const errText = 'Web Serial API is not supported on this browser';
            this.monitorRef?.addData(errText, '');
            throw new Error(errText);
        }
    }

    async disconnect() {
        if (this.port) {
            try {
                // Ferma il loop di lettura
                this.isReading = false;

                // Chiudi il reader se esiste
                await this.reader?.cancel();
                await this.reader?.releaseLock();
                this.reader = null;

                // Chiudi il writer se esiste
                await this.writer?.releaseLock();
                this.writer = null;

                // Ora possiamo chiudere la porta in sicurezza
                await this.port.close();
                this.port = null;
                this.monitorRef?.addData('Serial disconnected', '')
            } catch (error) {
                this.monitorRef?.addData(error, '')
                throw error;
            }
        }
    }

    async connect() {
        try {
            if (!('serial' in navigator)) {
                return;
            }
            if (this.lastPortInfo) {
                try {
                    // Prova a riconnettersi all'ultima porta
                    const ports = await navigator.serial.getPorts();
                    const lastPort = ports.find(port => {
                        // Confronta le informazioni della porta
                        const info = port.getInfo();
                        return JSON.stringify(info) === this.lastPortInfo;
                    });
                    if (lastPort) {
                        this.port = lastPort;
                    }
                } catch (error) {
                    this.monitorRef?.addData('Unabel to connect on last port: ' + error, '')
                }
            }

            // Se non abbiamo una porta valida, chiedi all'utente
            if (!this.port) {
                this.port = await navigator.serial.requestPort();
            }
            await this.port.open({ baudRate: 115200, bufferSize: 65536 });
            await this.setRTS(false);
            await this.setDTR(false);
            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();
            this.onData(async (data) => {
                if (this.isText) {
                    await this.onTextData(data);
                } else {
                    await this.onBinaryData(data);
                }
            });
            localStorage.setItem(this.portInfoName, JSON.stringify(this.port.getInfo()));
            this.monitorRef?.addData('Serial connected', '')

        } catch (error) {
            this.monitorRef?.addData(error, '')
            throw error;
        }
    }

    // Rendi privati i metodi interni
    async setRTS(value) {
        if (this.port) {
            await this.port.setSignals({ requestToSend: value });
            this.monitorRef?.addData(`RTS impostato a ${value}`, '');
        }
    }

    async setDTR(value) {
        if (this.port) {
            await this.port.setSignals({ dataTerminalReady: value });
            this.monitorRef?.addData(`DTR impostato a ${value}`, '');
        }
    }

    async write(buffer) {
        if (!this.port?.writable || !this.writer) {
            const errText = "Serial port not available for writing";
            this.monitorRef?.addData(errText, '')
            throw new Error(errText);
        }
        try {
            await this.writer.write(buffer);
            return buffer;
        } catch (error) {
            throw error;
        }
    }

    async onBinaryData(data) {
        // Aggiungi i nuovi dati al buffer
        this.buffer.push(...data)
        const timeElapsed = Date.now() - this.lastDataTime;
        if (timeElapsed > 100) {
            this.monitorRef?.addData(`${bufferToHexString(line)}`, 'rx')
        }
        this.lastDataTime = Date.now();
    }

    async onTextData(data) {
        // Aggiungi i nuovi dati al buffer
        this.buffer.push(...data)
        let newlineIndex = -1;
        do {
            // Cerca l'indice del carattere di invio
            newlineIndex = this.buffer.indexOf(0x0a)
            if (newlineIndex === -1) {
                newlineIndex = this.buffer.indexOf(0x0d)
            }
            // Se troviamo un invio
            if (newlineIndex !== -1) {
                // Estrai la linea completa fino all'invio
                const line = this.buffer.slice(0, newlineIndex)
                // Mostra la linea nel monitor
                if (line.length > 0)
                    this.monitorRef?.addData(`${bufferToString(line)}`, 'rx')
                // Rimuovi dal buffer i dati già mostrati (incluso l'invio)
                this.buffer = this.buffer.slice(newlineIndex + 1)
            }
        } while (newlineIndex !== -1)
    }

    async writeText(text) {
        this.isText = true
        this.monitorRef?.addData(`${text}`, 'tx');
        return await this.write(stringToBuffer(text));
    }

    async writeBinary(binary) {
        this.isText = false
        this.monitorRef?.addData(`${bufferToHexString(binary)}`, 'tx');
        return await this.write(binary);
    }

    onData(callback) {
        this.dataCallback = callback;
        if (this.reader)
            this.startReading();
    }

    async startReading() {
        this.isReading = true;
        while (this.isReading && this.port && this.port.readable) {
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done || !this.isReading) break;
                    if (value && this.dataCallback) {
                        this.dataCallback(value);
                    }
                }
            } catch (error) {
                throw error;
            } finally {
                if (this.reader) {
                    await this.reader.releaseLock();
                    this.reader = null;
                }
            }
        }
    }
}

export default SerialHandler;
