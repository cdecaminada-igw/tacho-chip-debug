// import fetch from 'node-fetch';
// import { logger } from './../utils/logger.js'

export default class CardHandler {

    card_session = null;
    sequence_number = null;
    response = null;
    retry = 4;
    cardHost = '';
    monitorRef = null;
    card = null;

    constructor(cardHost, monitorRef) {
        this.cardHost = cardHost
        this.monitorRef = monitorRef
    }

    async setCard(card) {
        this.disconnect()
        this.card = card
        this.card_session = null
        this.sequence_number = null
        this.response = null
        this.retry = 4
    }

    getCard() {
        return this.card
    }

    async connect() {
        try {
            await this.getMySession()
            this.monitorRef.addData(`Session ${this.card_session._id} established`, '')
        } catch (error) {
            this.monitorRef.addData(error, '')
            throw error
        }
        return this.card_session
    }

    async disconnect() {
        try {
            if (await this.releaseCardSession()) {
                this.monitorRef.addData(`Session released`, '')
                this.monitorRef.setConnection(false)
            }
        } catch (error) {
            this.monitorRef.addData(error, '')
            throw error
        }
    }

    async requestNewCardSession() {
        try {
            if (!this.card)
                return null
            const url = this.cardHost + "/cards/detain"
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    group: parseInt(this.card.group) || null,
                    tag: this.card.tag || null,
                    timeout: 60
                })
            })

            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            return data.card

        } catch (error) {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                this.monitorRef?.addData('Errore: Impossibile connettersi al server ' + this.cardHost, 'error')
            } else {
                this.monitorRef?.addData(`Errore: ${error.message}`, 'error')
            }
            return null
        }
    }

    async getMySession() {

        if (this.card_session)
            return this.card_session

        let new_card_session = await this.requestNewCardSession()

        if (new_card_session) {
            this.card_session = new_card_session
            return this.card_session
        }

        this.retry -= 1

        if (!this.retry)
            return null

        return new Promise((resolve) => {
            setTimeout(async () => {
                resolve(await this.getMySession())
            }, 15 * 1000)
        })
    }

    async alreadySentApduSequence(sequence_number) {
        return (this.sequence_number == sequence_number);
    }

    async sendRequest(apdu, sequence_number) {
        try {
            /*let session = await this.getMySession()
            if (!session)
                return null*/

            if (!this.card_session)
                return null

            let res = await fetch(this.cardHost + "/hubs/" + this.card_session.hub + "/sessions/" + this.card_session.session, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apdu: apdu.replace(/\s+/g, '')
                })
            })

            let response = (await res.json()).response

            if (res.status > 300 || !response || response == '544d4f') {
                this.sequence_number = null;
                this.card_session = null;
                return await this.sendRequest(apdu, sequence_number)
            }
            this.sequence_number = sequence_number;
            this.response = response;

            return response
        } catch (error) {
            //logger.error(err.message)
            this.monitorRef.addData(error, '')
            return null
        }
    }

    async releaseCardSession() {
        try {
            let session = this.card_session;

            if (!session)
                return false

            await fetch(this.cardHost + "/hubs/" + session.hub + "/sessions/" + session.session, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return true
        } catch (error) {
            //logger.error(err.message)
            this.monitorRef.addData(error, '')
            return false
        }
    }


}
