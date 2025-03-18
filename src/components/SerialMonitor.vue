<script setup>
import { ref } from 'vue'
import { vAutoScroll } from '../directives/autoScroll'

const props = defineProps({
    showTimestamp: {
        type: Boolean,
        default: true
    },
    serialHandler: {
        type: Object,
        default: null
    },
    title: {
        type: String,
        required: false
    }
})

const connected = ref(false)
const rtsEnabled = ref(false)
const dtrEnabled = ref(false)
const emit = defineEmits(['connection-change', 'rts-change', 'dtr-change'])

const serialData = ref([])

const addData = (data, direction = '') => {
    serialData.value.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        content: data,
        direction: direction
    })
}

const clearData = () => {
    serialData.value = []
}

const toggleConnection = async () => {
    connected.value = !connected.value
    try {
        if (props.serialHandler) {
            if (connected.value) {
                await props.serialHandler.connect()
            } else {
                await props.serialHandler.disconnect()
            }
        }
        emit('connection-change', connected.value)
    } catch (error) {
        console.error(error)
    }
}

const toggleRTS = async () => {
    rtsEnabled.value = !rtsEnabled.value
    if (props.serialHandler) {
        await props.serialHandler.setRTS(rtsEnabled.value)
    }
    emit('rts-change', rtsEnabled.value)
}

const toggleDTR = async () => {
    dtrEnabled.value = !dtrEnabled.value
    if (props.serialHandler) {
        await props.serialHandler.setDTR(dtrEnabled.value)
    }
    emit('dtr-change', dtrEnabled.value)
}

defineExpose({ addData, clearData })
</script>

<template>
    <div class="serial-monitor">
        <div class="monitor-header">
            <span class="monitor-title">{{ title }}</span>
            <div class="signal-controls">
                <button class="signal-button" :class="{ active: connected }" @click="toggleConnection"
                    title="Connetti seriale">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                </button>
                <button class="signal-button" :class="{ active: rtsEnabled }" @click="toggleRTS"
                    title="Request To Send">
                    RTS
                </button>
                <button class="signal-button" :class="{ active: dtrEnabled }" @click="toggleDTR"
                    title="Data Terminal Ready">
                    DTR
                </button>
                <button class="signal-button clear-button" @click="clearData" title="Pulisci Serial monitor">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor">
                        <path
                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="monitor-content" v-auto-scroll>
            <div v-for="line in serialData" :key="line.id" class="monitor-line">
                <span v-if="showTimestamp" class="timestamp">{{ line.timestamp }}</span>
                <span :class="['content', line.direction]">{{ line.content }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.serial-monitor {
    height: calc(100vh - 3.5rem);
    width: 100%;
    display: flex;
    flex-direction: column;
}

.monitor-content {
    flex: 1;
    background-color: #333;
    color: #fff;
    padding: 1rem;
    border-radius: 0 0 4px 4px;
    font-family: monospace;
    overflow-y: auto;
    text-align: left;
}

.monitor-line {
    margin-bottom: 4px;
    line-height: 1.4;
}

.timestamp {
    color: #888;
    margin-right: 8px;
}

.content {
    color: #42b883;
}

.tx {
    color: cornflowerblue;
}

.rx {
    color: red;
}

.monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    border-radius: 4px 4px 0 0;
    padding: 8px;
}

.monitor-title {
    color: #fff;
    font-weight: bold;
}

.signal-controls {
    display: flex;
    gap: 8px;
}

.signal-button {
    min-width: 50px;
    padding: 4px 8px;
    border: 1px solid #666;
    background-color: #4d4d4d;
    color: #888;
    border-radius: 4px;
    cursor: pointer;
    font-family: monospace;
    transition: all 0.3s ease;
}

.signal-button:hover {
    background-color: #555;
    border-color: #888;
}

.signal-button.active {
    background-color: #42b883;
    color: white;
    border-color: #42b883;
}

.clear-button:hover {
    background-color: #c82333;
    color: white;
}
</style>