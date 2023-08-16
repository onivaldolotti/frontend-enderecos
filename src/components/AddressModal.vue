<template>
    <div class="modal-overlay" v-if="showModal">
      <div class="modal">
        <div class="modal-content">
          <h2>{{ modalTitle }}</h2>
          <form @submit.prevent="isEditMode ? saveEditAddress() : saveAddress()">
            <div class="input-container">
              <label for="cep">CEP</label>
              <input type="text" v-model="formData.cep" required class="form-input" />
            </div>
            
            <div class="input-container">
              <label for="street">Logradouro</label>
              <input type="text" v-model="formData.street" required class="form-input" />
            </div>
            
            <div class="input-container">
              <label for="district">Bairro</label>
              <input type="text" v-model="formData.district" required class="form-input" />
            </div>
            
            <div class="input-container">
              <label for="city">Cidade</label>
              <input type="text" v-model="formData.city" required class="form-input" />
            </div>
            
            <div class="input-container">
              <label for="uf">UF</label>
              <input type="text" v-model="formData.uf" :maxlength="2" required class="form-input" />
            </div>
            
            <div class="modal-buttons">
              <button class="save-button" type="submit">Salvar</button>
              <button class="cancel-button" @click="cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="loader-overlay" v-if="loadingModal">
        <div class="loader-content">
           Carregando...
        </div>
    </div>
  </template>

  <script>
  import { toast } from 'vue3-toastify';
  import 'vue3-toastify/dist/index.css';

  export default {
    props: ['showModal', 'modalTitle', 'initialFormData', 'isEditMode'],
    emits: ['close', 'edit', 'save'],
    data() {
        return {
            formData: { ...this.initialFormData },
            loadingModal: false,
        };
    },
    watch: {
        initialFormData(newValue) {
            this.formData = { ...newValue };
        },
    },
    methods: {
      async saveAddress() {
        try {
            this.loadingModal = true;

            const response = await fetch('http://localhost/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData)
            });
            if (response.ok) {
              this.$emit('save', this.formData);
              this.closeModal();
                toast.success("Endereço salvo com sucesso", {
                    autoClose: 1000,
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            } else {
                const data = await response.json();
                const message = data?.message || 'Erro ao salvar o endereço';
                toast.warning(message.toUpperCase(), {
                    autoClose: 1000,
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            }
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error("Erro ao salvar o Endereço.", {
                autoClose: 1000,
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        } finally {
            this.loadingModal = false;
        }
        this.closeModal();
      },
      async saveEditAddress() {
        try {
            this.loadingModal = true;

            const response = await fetch(`http://localhost/api/address/${this.formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData)
            });

            if (response.ok) {
                this.closeModal();
                this.$emit('edit', this.formData);
                toast.success("Endereço editado com sucesso", {
                    autoClose: 1000,
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            } else {
              const data = await response.json();
              const message = data?.message || 'Erro ao editar o endereço';
              toast.warning(message.toUpperCase(), {
                  autoClose: 1000,
                  position: toast.POSITION.BOTTOM_RIGHT,
              });
            }
        } catch (error) {
            console.error('Error saving edited address:', error);
            toast.error("Erro ao editar o Endereço.", {
                    autoClose: 1000,
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
        } finally {
            this.loadingModal = false;
        }
      },
      cancel() {
        this.formData = {...this.initialFormData};
        this.closeModal();
      },
      closeModal() {
        this.formData = {...this.initialFormData};
        this.$emit('close');
      },
    }
  };
  </script>
  
<style scoped>
    .modal-overlay {
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

    .modal {
        background-color: white;
        border-radius: 5px;
        box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: 100%;
    }

    .modal-content {
        padding: 20px;
    }
  
    .modal-buttons {
        text-align: right;
        margin-top: 10px;
    }

    .input-container {
        margin-bottom: 15px;
    }

    .form-input {
        width: 95%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    
    .save-button,
    .cancel-button {
        padding: 5px 10px;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .cancel-button {
        background-color: #e21111;
        margin-left: 10px;
    }

    .loader-overlay {
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

    .loader-content {
        text-align: center;
    }

    @media (min-width: 1366px) {
        .modal {
            max-width: 600px; 
        }
    }

    @media (min-width: 1920px) {
        .modal {
            max-width: 700px; 
        }
    }

    @media (max-width: 414px) {
        .modal {
            padding: 15px; 
            max-width: 250px; 
            height: 70%;
        }
    }
</style>
  