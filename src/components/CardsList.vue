<script setup>
import { ref, onMounted, watch } from 'vue'
import config from '/data/config.json'

const cards = ref([])
const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    }
})

const selectedCard = ref(props.modelValue)
const emit = defineEmits(['update:modelValue', 'card-selected'])

onMounted(() => {
    cards.value = config.cardManager.cards
})

watch(() => props.modelValue, (newValue) => {
    selectedCard.value = newValue
})

const handleCardSelect = (card) => {
    selectedCard.value = card
    emit('update:modelValue', card)
    emit('card-selected', card)
}

const handleSelect = (event) => {
    const card = cards.value.find(i => i.id === Number(event.target.value))
    if (card) {
        handleCardSelect(card)
    }
}

</script>

<template>
    <div class="command-select">
        <div class="select-container">
            <select @change="handleSelect" :value="selectedCard?.id">
                <option value="">SMARCARD AZIENDALI</option>
                <option v-for="card in cards" :key="card.id" :value="card.id" v-html="card.name">
                </option>
            </select>
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