<script setup>
import { ref } from 'vue'

const props = defineProps({
    showTimestamp: {
        type: Boolean,
        default: true
    }
})

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

defineExpose({ addData, clearData })
</script>

<template>
    <div class="serial-monitor">
        <div class="monitor-content">
            <div v-for="line in serialData" :key="line.id" class="monitor-line">
                <span v-if="showTimestamp" class="timestamp">{{ line.timestamp }}</span>
                <span :class="['content', line.direction]">{{ line.content }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.serial-monitor {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.monitor-content {
    flex: 1;
    background-color: #4d4d4d;
    color: #fff;
    padding: 1rem;
    border-radius: 4px;
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
</style>