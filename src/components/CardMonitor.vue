<script setup>
import { ref } from 'vue'

const cardData = ref([])

const addData = (data, direction = '') => {
    cardData.value.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        content: data,
        direction: direction
    })
}

const clearData = () => {
    cardData.value = []
}

defineExpose({ addData, clearData })
</script>

<template>
    <div class="card-monitor">
        <div class="monitor-content">
            <div v-for="line in cardData" :key="line.id" class="monitor-line">
                <span class="timestamp">{{ line.timestamp }}</span>
                <span :class="['content', line.direction]">{{ line.content }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-monitor {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.monitor-content {
    flex: 1;
    background-color: #F5F5DC;
    color: #1e1e1e;
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