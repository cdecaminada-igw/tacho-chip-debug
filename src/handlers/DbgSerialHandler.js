import SerialHandler from './SerialHandler.js'
import { bufferToString } from '../utils/hexUtils'

export default class DbgSerialHandler {
    constructor(dbgSerialMonitorRef) {
        this.dbgSerialMonitorRef = dbgSerialMonitorRef
        this.dbgSerialHandle = null
        this.buffer = []
    }

    async connect() {
        // Prova a recuperare l'ultima porta usata
        const lastPortInfo = localStorage.getItem('lastDbgSerialPort');
        this.dbgSerialHandle = new SerialHandler(lastPortInfo, this.dbgSerialMonitorRef)
        await this.dbgSerialHandle.connect()
        localStorage.setItem('lastDbgSerialPort', JSON.stringify(this.dbgSerialHandle.port.getInfo()));
        this.dbgSerialHandle.onData(async (data) => {
            await this.handleResponse(data)
        })
    }

    async disconnect() {
        await this.dbgSerialHandle.disconnect()
    }

    async handleResponse(data) {
        // Aggiungi i nuovi dati al buffer
        this.buffer.push(...data)

        // Cerca l'indice del carattere di invio
        const newlineIndex = this.buffer.indexOf(0x0d)
        // Se troviamo un invio
        if (newlineIndex !== -1) {
            // Estrai la linea completa fino all'invio
            const line = this.buffer.slice(0, newlineIndex)
            // Mostra la linea nel monitor
            this.dbgSerialMonitorRef?.addData(`${bufferToString(line)}`, 'rx')
            // Rimuovi dal buffer i dati già mostrati (incluso l'invio)
            this.buffer = this.buffer.slice(newlineIndex + 1)
        }
    }
}