<template>
    <div class="confirmation-modal-overlay" v-if="showModal">
        <div class="confirmation-modal">
            <div class="confirmation-modal-content">
                <h2>Excluir Endereço?</h2>
                <div class="confirmation-buttons">
                    <button class="confirm-button blue-button" @click="emitConfirmEvent">Sim</button>
                    <button class="cancel-button green-button" @click="emitCancelEvent">Não</button>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
  export default {
    props: ['showModal'],
    emits: ['confirmed', 'cancelled'],
    methods: {
        emitConfirmEvent() {
            this.$emit('confirmed');
        },
        emitCancelEvent() {
            this.$emit('cancelled');
        }
    }
  };
</script>
  
<style scoped>
    .confirmation-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .confirmation-modal {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        max-width: 400px;
        width: 100%;
    }

    .confirmation-modal-content {
        text-align: center;
    }

    .confirmation-modal h2 {
        margin-bottom: 10px;
    }

    .confirmation-buttons {
        margin-top: 40px;
        display: flex;
        justify-content: center;
    }

    .confirm-button,
    .cancel-button {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }

    .confirm-button {
        background-color: red;
        color: white;
        margin-right: 10px;
    }

    .cancel-button {
        background-color: black;
        color: white;
    }

    @media (max-width: 414px) {
        .confirmation-modal {
            padding: 15px;
        }
        .confirmation-modal h2 {
            font-size: 18px;
        }
        .confirmation-buttons {
            margin-top: 20px;
        }
        .confirm-button,
        .cancel-button {
            padding: 8px 12px;
        }
    }
</style>
  