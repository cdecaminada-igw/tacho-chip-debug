class SerialHandler {

    port = null;
    dataCallback;
    reader = null;
    writer = null;
    isReading = false;

    constructor(lastPortInfo, monitorRef) {
        this.lastPortInfo = lastPortInfo;
        this.monitorRef = monitorRef;
        if (!('serial' in navigator)) {
            const errText = 'Web Serial API is not supported on this browser';
            this.monitorRef?.addData(errText, '')
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
            await this.port.open({ baudRate: 115200 });
            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();
            this.monitorRef?.addData('Serial connected', '')

        } catch (error) {
            this.monitorRef?.addData(error, '')
            throw error;
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
