<script setup>
import { ref } from 'vue'
import SelectableList from './components/SelectableList.vue'
import CardsList from './components/CardsList.vue'
import CmdSerialMonitor from './components/CmdSerialMonitor.vue'
import DbgSerialMonitor from './components/DbgSerialMonitor.vue'
import CardMonitor from './components/CardMonitor.vue'
import CardHandler from './handlers/CardHandler.js';
import CmdSerialHandler from './handlers/CmdSerialHandler.js'
import DbgSerialHandler from './handlers/DbgSerialHandler.js'

const cmdSerialMonitorRef = ref(null)
const cmdSerialHandler = ref(null)
const cmdSerialConnected = ref(false)

const dbgSerialMonitorRef = ref(null)
const dbgSerialHandler = ref(null)
const dbgSerialConnected = ref(false)

const cardMonitorRef = ref(null)
const cardHandle = ref(null)
const cardConnected = ref(false)

// Modifica questa riga
let selectedCard = ref(
  localStorage.getItem('lastCard')
    ? JSON.parse(localStorage.getItem('lastCard'))
    : null
)

import config from './data/config.json'
import { hexStringToBuffer } from './utils/hexUtils.js';

const handleItemSelected = async (item) => {
  if (!cmdSerialHandler.value) {
    handleCmdSerialConnect()
    return
  }
  try {
    await cmdSerialHandler.value.write(item.command, hexStringToBuffer(item.data))
  } catch (error) {
    console.error(error)
  }
}

const handleCardSelected = async (card) => {
  selectedCard.value = card
  localStorage.setItem('lastCard', JSON.stringify(card));
  if (cardConnected.value) {
    await handleCardDisconnect()
  }
}

const handleDbgSerialConnect = async () => {
  try {
    dbgSerialHandler.value = new DbgSerialHandler(dbgSerialMonitorRef)
    await dbgSerialHandler.value.connect()
    dbgSerialConnected.value = true
  } catch (error) {
    console.error(error)
  }
}

const handleDbgSerialDisconnect = async () => {
  try {
    if (dbgSerialConnected.value) {
      dbgSerialConnected.value = false
      await dbgSerialHandler.value.disconnect()
    }
  } catch (error) {
    console.error(error)
  }
}

const handleCmdSerialConnect = async () => {
  try {
    cmdSerialHandler.value = new CmdSerialHandler(cmdSerialMonitorRef, cardMonitorRef, cardHandle)
    await cmdSerialHandler.value.connect()
    cmdSerialConnected.value = true
  } catch (error) {
    console.error(error)
  }
}

const handleCmdSerialDisconnect = async () => {
  try {
    if (cmdSerialConnected.value) {
      cmdSerialConnected.value = false
      await cmdSerialHandler.value.disconnect()
    }
  } catch (error) {
    console.error(error)
  }
}

const handleCardConnect = async () => {
  try {
    if (selectedCard.value === null) {
      cardMonitorRef.value?.addData('Seleziona una smartcard', '')
      return
    }
    cardHandle.value = new CardHandler(config.cardManager.host, selectedCard.value, cardMonitorRef);
    await cardHandle.value.connect()
    cardConnected.value = true
  } catch (error) {
    console.error(error)
  }
}
const handleCardDisconnect = async () => {
  try {
    if (cardConnected.value) {
      cardConnected.value = false
      await cardHandle.value.disconnect();
    }
  } catch (error) {
    console.error(error)
  }
}

</script>

<template>
  <div class="app-container">
    <div class="main-content">
      <div class="monitors-container">
        <div class="monitor-wrapper">
          <div class="button-container">

            <button class="connect-button" v-if="!cardConnected" @click="handleCardConnect" title="Connetti smartcard">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>

            <button class="connect-button disconnect" v-if="cardConnected" @click="handleCardDisconnect"
              title="Disconnetti smartcard">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3" />
                <line x1="16" y1="5" x2="8" y2="19" stroke-width="2" />
              </svg>
            </button>

            <div class="monitor-title no-padding">
              <CardsList v-model="selectedCard" @card-selected="handleCardSelected" />
            </div>

            <button class="clear-button" @click="cardMonitorRef?.clearData()" title="Pulisci Card monitor">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

          </div>
          <CardMonitor ref="cardMonitorRef" />
        </div>
        <div class="monitor-wrapper">
          <div class="button-container">

            <button class="connect-button" v-if="!cmdSerialConnected" @click="handleCmdSerialConnect"
              title="Connetti seriale">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>

            <button class="connect-button disconnect" v-if="cmdSerialConnected" @click="handleCmdSerialDisconnect"
              title="Disconnetti seriale">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3" />
                <line x1="16" y1="5" x2="8" y2="19" stroke-width="2" />
              </svg>
            </button>

            <div class="monitor-title no-padding">
              <SelectableList @item-selected="handleItemSelected" />
            </div>

            <button class="clear-button" @click="cmdSerialMonitorRef?.clearData()" title="Pulisci Serial monitor">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

          </div>
          <CmdSerialMonitor ref="cmdSerialMonitorRef" />
        </div>

        <div class="monitor-wrapper">
          <div class="button-container">

            <button class="connect-button" v-if="!dbgSerialConnected" @click="handleDbgSerialConnect"
              title="Connetti seriale debug">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>

            <button class="connect-button disconnect" v-if="dbgSerialConnected" @click="handleDbgSerialDisconnect"
              title="Disconnetti seriale">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3" />
                <line x1="16" y1="5" x2="8" y2="19" stroke-width="2" />
              </svg>
            </button>

            <div class="monitor-title">
              DEBUG TACHO CHIP
            </div>

            <button class="clear-button" @click="dbgSerialMonitorRef?.clearData()" title="Pulisci Serial monitor">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

          </div>
          <DbgSerialMonitor ref="dbgSerialMonitorRef" :showTimestamp="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 250px;
  padding: 1rem;
  border-right: 1px solid #ddd;
  height: 100%;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.logos {
  display: flex;
  justify-content: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.connect-button {
  width: 40px;
  /* Ridotto per corrispondere al clear-button */
  height: 40px;
  padding: 8px;
  margin-bottom: .1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connect-button svg {
  width: 24px;
  height: 24px;
}

.connect-button:hover {
  background-color: #3aa876;
}

.connect-button:active {
  background-color: #359469;
}

.connect-button.disconnect {
  background-color: #fd7e14;
  /* Arancione */
}

.connect-button.disconnect:hover {
  background-color: #e8710d;
}

.connect-button.disconnect:active {
  background-color: #d66a0c;
}

.button-container {
  display: flex;
  gap: 8px;
  margin-bottom: .1rem;
}

.clear-button {
  width: 40px;
  height: 40px;
  padding: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  background-color: #c82333;
}

.clear-button:active {
  background-color: #bd2130;
}

.clear-button svg {
  width: 16px;
  height: 16px;
}

.monitors-container {
  height: 100%;
  display: flex;
  gap: 1rem;
}

.monitor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.monitor-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #666;
  padding: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-title.no-padding {
  padding: 0;
}
</style>
