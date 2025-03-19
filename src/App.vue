<script setup>
import { ref, onMounted } from 'vue'
import SelectableList from './components/SelectableList.vue'
import CardMonitor from './components/CardMonitor.vue'
import CardHandler from './handlers/CardHandler.js';
import CmdSerialHandler from './handlers/CmdSerialHandler.js'
import SerialHandler from './handlers/SerialHandler.js'
import itemsData from '/data/config.json'
import SerialMonitor from './components/SerialMonitor.vue'
import config from '/data/config.json'
import { hexStringToBuffer } from './utils/hexUtils.js';

const cmdSerialMonitor = ref(null)
const cmdSerialHandler = ref(null)

const dbgSerialMonitor = ref(null)
const dbgSerialHandler = ref(null)

const cardMonitor = ref(null)
const cardHandler = ref(null)

const canSerialMonitor = ref(null)
const canSerialHandler = ref(null)

const mecFleetCommands = ref([])
const tachoChipCommands = ref([])
const cards = ref([])

// Modifica questa riga
let selectedCard = ref(
  localStorage.getItem('lastCard')
    ? JSON.parse(localStorage.getItem('lastCard'))
    : null
)

const showCardMonitor = ref(localStorage.getItem('showCardMonitor') !== 'false')
const showCmdMonitor = ref(localStorage.getItem('showCmdMonitor') !== 'false')
const showDbgMonitor = ref(localStorage.getItem('showDbgMonitor') !== 'false')
const showCanMonitor = ref(localStorage.getItem('showCanMonitor') !== 'false')

onMounted(() => {
  mecFleetCommands.value = itemsData.mecFleetCommands
  tachoChipCommands.value = itemsData.tachoChipCommands
  cards.value = itemsData.cardManager.cards

  /* cardHandler */
  cardHandler.value = new CardHandler(config.cardManager.host, cardMonitor)
  handleCardSelected(selectedCard.value)

  /* cmdSerialHandler */
  cmdSerialHandler.value = new CmdSerialHandler(cmdSerialMonitor, cardHandler)
  /*
  cmdSerialHandler.value.on('authenticationComplete', (success) => {
  })
  cmdSerialHandler.value.on('downloadComplete', (success) => {
  })
  */

  /* dbgSerialHandler */
  dbgSerialHandler.value = new SerialHandler('lastDbgSerialPort', dbgSerialMonitor)

  /* canSerialHandler */
  canSerialHandler.value = new SerialHandler('lastCanSerialPort', canSerialMonitor)
})

// Funzione per aggiornare localStorage quando cambia la visibilità
const updateMonitorVisibility = (monitorName, value) => {
  localStorage.setItem(monitorName, value)
}

// Funzione per cancellare localStorage
const clearLocalStorage = () => {
  localStorage.clear()
  // Ripristina i valori di default
  showCardMonitor.value = false
  showCmdMonitor.value = true
  showDbgMonitor.value = true
  showCanMonitor.value = false
  selectedCard.value = null
}

const handleCardSelected = async (card) => {
  if (card) {
    selectedCard.value = card
    localStorage.setItem('lastCard', JSON.stringify(card));
    if (cardHandler?.value) {
      cardHandler.value.setCard(card)
    }
  } else {
    selectedCard.value = null
    localStorage.clear('lastCard')
    if (cardHandler?.value) {
      cardHandler.value.setCard(null)
    }
  }
}

const handleCmdSelected = async (item) => {
  try {
    if (item.command === 'sendTachoChipApp') {
      await cmdSerialHandler.value.sendTachoChipApp()
      return
    }
    if (item.command === '') {
      await cmdSerialHandler.value.writeText(item.data)
      return
    }
    await cmdSerialHandler.value.writeCommand(item.command, hexStringToBuffer(item.data))
  } catch (error) {
    console.error(error)
  }
}

const handleDbgSelected = async (item) => {
  try {
    await dbgSerialHandler.value.writeText(item.data)
  } catch (error) {
    console.error(error)
  }
}

const handleCanSelected = async (item) => {
  try {
    await canSerialHandler.value.writeText(item.data)
  } catch (error) {
    console.error(error)
  }
}

</script>

<template>
  <div class="app-container">

    <div class="sidebar">

      <div class="toggle-buttons">
        <button class="toggle-button" :class="{ active: showCardMonitor }"
          @click="showCardMonitor = !showCardMonitor; updateMonitorVisibility('showCardMonitor', showCardMonitor)">
          Card Monitor
        </button>
        <button class="toggle-button" :class="{ active: showCmdMonitor }"
          @click="showCmdMonitor = !showCmdMonitor; updateMonitorVisibility('showCmdMonitor', showCmdMonitor)">
          Commands Monitor
        </button>
        <button class="toggle-button" :class="{ active: showDbgMonitor }"
          @click="showDbgMonitor = !showDbgMonitor; updateMonitorVisibility('showDbgMonitor', showDbgMonitor)">
          Debug Monitor
        </button>
        <button class="toggle-button" :class="{ active: showCanMonitor }"
          @click="showCanMonitor = !showCanMonitor; updateMonitorVisibility('showCanMonitor', showCanMonitor)">
          CAN Monitor
        </button>
      </div>

      <button class="clear-storage-button" @click="clearLocalStorage" title="Ripristina Impostazioni">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>

    <div class="main-content">

      <div class="monitors-container">

        <div class="monitor-wrapper" v-show="showCardMonitor">
          <div class="button-container">
            <div class="monitor-title no-padding">
              <SelectableList v-model="selectedCard" :items="cards" @item-selected="handleCardSelected" />
            </div>
          </div>
          <CardMonitor ref="cardMonitor" :cardHandler="cardHandler" />
        </div>

        <div class="monitor-wrapper" v-show="showCmdMonitor">
          <div class="button-container">
            <div class="monitor-title no-padding">
              <SelectableList @item-selected="handleCmdSelected" @item-send="handleCmdSelected"
                defaultText="Comandi TachoChip" :items="tachoChipCommands" :sendButton=true />
            </div>
          </div>
          <SerialMonitor ref="cmdSerialMonitor" :serialHandler="cmdSerialHandler" />
        </div>

        <div class="monitor-wrapper" v-show="showDbgMonitor">
          <div class="button-container">
            <div class="monitor-title no-padding">
              <SelectableList @item-selected="handleDbgSelected" @item-send="handleDbgSelected"
                defaultText="Debug TachoChip" :items="mecFleetCommands" :sendButton=true />
            </div>
          </div>
          <SerialMonitor ref="dbgSerialMonitor" :serialHandler="dbgSerialHandler" :showTimestamp="false" />
        </div>

        <div class="monitor-wrapper" v-show="showCanMonitor">
          <div class="button-container">
            <div class="monitor-title no-padding">
              <SelectableList @item-selected="handleCanSelected" @item-send="handleCanSelected"
                defaultText="CAN TachoChip" :items="mecFleetCommands" :sendButton=true />
            </div>
          </div>
          <SerialMonitor ref="canSerialMonitor" :serialHandler="canSerialHandler" :showTimestamp="false" />
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
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-right: 1px solid #777;
  height: 100%;
}

.main-content {
  flex: 1;
}

.monitors-container {
  height: 100%;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  overflow: hidden;
}

.monitor-wrapper {
  flex: 1;
  min-width: 300px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.clear-storage-button {
  width: 100%;
  padding: 8px;
  margin-top: auto;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.clear-storage-button:hover {
  background-color: #c82333;
}

.clear-storage-button svg {
  width: 16px;
  height: 16px;
}

.toggle-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1rem;
}

.toggle-button {
  padding: 16px 8px;
  border: 1px solid #4281b8;
  border-radius: 4px;
  background-color: white;
  color: #4281b8;
  cursor: pointer;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-button:hover {
  background-color: #f0f9f6;
}

.toggle-button.active {
  background-color: #4281b8;
  color: white;
}

.button-container {
  display: flex;
  gap: 8px;
  margin-bottom: .1rem;
  flex-shrink: 0;
}

.monitor-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #666;
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
