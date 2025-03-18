<script setup>
import { ref, onMounted, watch } from 'vue'

// Definizione delle props
const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    defaultText: {
        type: String,
        default: 'Selezionare una voce dal menu'
    },
    items: {
        type: Array,
        default: () => []
    },
    sendButton: {
        type: Boolean,
        default: false
    }
})

const selectedItem = ref(props.modelValue)
const emit = defineEmits(['update:modelValue', 'item-selected', 'item-send'])

watch(() => props.modelValue, (newValue) => {
    selectedItem.value = newValue
})

const handleSelect = (event) => {
    const item = props.items.find(i => i.id === Number(event.target.value))
    if (item) {
        selectedItem.value = item
        //emit('update:modelValue', item)
    }
    emit('item-selected', item)
}

const handleSend = () => {
    if (selectedItem.value) {
        emit('item-send', selectedItem.value)
    }
}

</script>

<template>
    <div class="item-select">
        <div class="select-container">
            <select @change="handleSelect" :value="selectedItem?.id">
                <option value="">{{ props.defaultText }}</option>
                <option v-for="item in props.items" :key="item.id" :value="item.id" v-html="item.name">
                </option>
            </select>
            <button class="resend-button" @click="handleSend" v-if="sendButton" :disabled="!selectedItem"
                title="Reinvia">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.item-select {
    width: 100%;
}

.select-container {
    display: flex;
    gap: 8px;
    width: 100%;
}

.item-select select {
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

.item-select select:hover {
    border-color: #42b883;
}

.item-select select:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
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

.resend-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>