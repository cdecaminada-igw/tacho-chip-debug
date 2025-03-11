import SerialHandler from './SerialHandler.js'
import { saveToFile } from '../utils/fileUtils'
import { bufferToHexString, decToHexString, hexStringToBuffer, calculateChecksum, addByteToBuffer } from '../utils/hexUtils';

export default class CmdSerialHandler {
    constructor(cmdSerialMonitorRef, cardHandler, cardMonitorRef) {
        this.cmdSerialMonitorRef = cmdSerialMonitorRef
        this.cardMonitorRef = cardMonitorRef
        this.cardHandler = cardHandler
        this.cmdSerialHandle = null
        this.cmdSerialBuffer = []
        this.fileData = new Uint8Array()
        this.filename = ''
        this.eventListeners = {
            authenticationComplete: [],
            downloadComplete: []
        }
    }

    async connect() {
        // Prova a recuperare l'ultima porta usata
        const lastPortInfo = localStorage.getItem('lastCmdSerialPort');
        this.cmdSerialHandle = new SerialHandler(lastPortInfo, this.cmdSerialMonitorRef)
        await this.cmdSerialHandle.connect()
        // Salva le informazioni della nuova porta
        localStorage.setItem('lastCmdSerialPort', JSON.stringify(this.cmdSerialHandle.port.getInfo()));
        this.cmdSerialHandle.onData(async (data) => {
            await this.handleResponse(data)
        })
    }

    async disconnect() {
        await this.cmdSerialHandle.disconnect()
    }

    async handleResponse(data) {
        this.cmdSerialBuffer.push(...data)
        while (this.cmdSerialBuffer.length >= 5) {
            if (this.cmdSerialBuffer[0] !== 0x55) {
                this.cmdSerialBuffer.shift()
                continue
            }
            const command = this.cmdSerialBuffer[1]
            const length = this.cmdSerialBuffer[2] | (this.cmdSerialBuffer[3] << 8)
            if (this.cmdSerialBuffer.length < 5 + length) break
            const payload = this.cmdSerialBuffer.slice(4, 4 + length)
            const checksum = this.cmdSerialBuffer[4 + length]
            const calculatedChecksum = calculateChecksum(this.cmdSerialBuffer.slice(0, 4 + length))

            if (checksum === calculatedChecksum) {
                await this.handleCommand(command, payload)
            }

            this.cmdSerialMonitorRef?.addData(`<-: ${bufferToHexString(this.cmdSerialBuffer)}`, 'rx')
            this.cmdSerialBuffer = this.cmdSerialBuffer.slice(5 + length)
        }
    }

    async handleCommand(command, payload) {
        switch (command) {
            case 0xA1:
                await this.handleA1Command(payload)
                break
            case 0xA2:
                await this.handleA2Command(payload)
                break
            case 0xB0:
                await this.handleB0Command()
                break
            case 0xB1:
                await this.handleB1Command(payload)
                break
        }
    }

    async handleA1Command(payload) {
        let command = bufferToHexString(payload)
        this.cardMonitorRef?.addData(`->: ${command}`, 'tx')
        const response = await this.cardHandler.sendRequest(command, 0)
        const responsePayload = hexStringToBuffer(response)
        this.cardMonitorRef?.addData(`<-: ${bufferToHexString(responsePayload)}`, 'rx')
        const buffer = await this.write(0x21, responsePayload)
        this.cmdSerialMonitorRef?.addData(`->: ${bufferToHexString(buffer)}`, 'tx')
    }

    // Aggiungi questo nuovo metodo per gestire gli eventi
    on(eventName, callback) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].push(callback)
        }
    }

    // Aggiungi questo nuovo metodo per emettere eventi
    emit(eventName, data) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => callback(data))
        }
    }
    async handleA2Command(payload) {
        if (payload.length > 1) {
            switch (payload[0]) {
                case 0x40:
                    this.cmdSerialMonitorRef?.addData(`Autenticazione conclusa`, '')
                    this.emit('authenticationComplete', payload[1])
                    break;
                case 0x80:
                    this.cmdSerialMonitorRef?.addData(`Download concluso`, '')
                    this.emit('downloadComplete', payload[1])
                    break;
            }
        }
    }

    async handleB0Command() {
        if (this.fileData.length > 0) {
            saveToFile(this.fileData, this.filename)
        }
        this.fileData = new Uint8Array()
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        this.filename = `payload-${timestamp}.ddd`
        this.cmdSerialMonitorRef?.addData(`File generato: ${this.filename}`, '')
    }

    async handleB1Command(payload) {
        const extractedPayload = payload.slice(5)
        const newBuffer = new Uint8Array(this.fileData.length + extractedPayload.length)
        newBuffer.set(this.fileData)
        newBuffer.set(extractedPayload, this.fileData.length)
        this.fileData = newBuffer
        this.cmdSerialMonitorRef?.addData(`${this.filename} aggiornato ${this.fileData.length} bytes`, '')
    }

    async write(command, payload) {
        const hexString = bufferToHexString(payload);
        const text = '55 ' + decToHexString(command) + ' ' + decToHexString(payload.length) + ' 00 ' + hexString;
        let cmdBuffer = hexStringToBuffer(text);
        const checksum = calculateChecksum(cmdBuffer);
        cmdBuffer = addByteToBuffer(cmdBuffer, checksum);
        this.cmdSerialMonitorRef?.addData(`->: ${bufferToHexString(cmdBuffer)}`, 'tx');
        return await this.cmdSerialHandle.write(cmdBuffer);
    }
}