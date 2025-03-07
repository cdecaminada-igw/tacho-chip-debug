<script setup>
import { ref, onMounted } from 'vue'
import itemsData from '../data/config.json'

const items = ref([])
const selectedItem = ref(null)
const emit = defineEmits(['item-selected'])

onMounted(() => {
    items.value = itemsData.commands
})

const handleSelect = (event) => {
    const item = items.value.find(i => i.id === Number(event.target.value))
    if (item) {
        selectedItem.value = item
        //emit('item-selected', item)
    }
}

const resendSelected = () => {
    if (selectedItem.value) {
        emit('item-selected', selectedItem.value)
    }
}
</script>

<template>
    <div class="command-select">
        <div class="select-container">
            <select @change="handleSelect" :value="selectedItem?.id">
                <option value="">COMANDI TACHO CHIP</option>
                <option v-for="item in items" :key="item.id" :value="item.id" v-html="item.name">
                </option>
            </select>
            <button class="resend-button" @click="resendSelected" :disabled="!selectedItem" title="Reinvia comando">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.command-select {
    width: 100%;
}

.select-container {
    display: flex;
    gap: 8px;
    width: 100%;
}

.command-select select {
    flex: 1;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 18px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    text-align: center;
}

.command-select select:hover {
    border-color: #42b883;
}

.command-select select:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

/* Stile per le opzioni */
.command-select option {
    padding: 8px;
}

/* Supporto per HTML nelle opzioni (non funziona in tutti i browser) */
.command-select option:checked {
    background-color: #42b883;
    color: white;
}

.resend-button {
    padding: 8px;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.resend-button:hover {
    background-color: #3aa876;
}

.resend-button:active {
    background-color: #359469;
}

.resend-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>