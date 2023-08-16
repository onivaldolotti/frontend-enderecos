<template>
    <div class="address-list">
        <div class="title-container">
            <h1 class="title">Lista de Endereços</h1>
            <div class="search-container">
                <input ref="searchInput" v-model="searchQuery" placeholder="Digite o CEP ou Logradouro" class="search-input" :class="{ 'search-input-empty': searchQueryEmpty && searchButtonClicked }"/>
                <button class="search-button" @click="searchAddress"> <font-awesome-icon icon="search" /> </button>
                <button class="add-button" @click="openAddModal">Novo Endereço</button>
                <button class="list-button" @click="fetchAddresses">Listar Endereços</button>
            </div>
        </div>

        <div class="cards-container">
            <div class="address-card" v-for="address in filteredAddresses" :key="address.id">
                <div class="address-card-content">
                    <div class="address-card-row">{{ address.street }}</div>
                    <div class="address-card-row">{{ address.district }}</div>
                    <div class="address-card-row">{{ address.city }} - {{ address.uf }}</div>
                    <div class="address-card-row">{{ String(address.cep).slice(0, 5) + '-' +  String(address.cep).slice(5) }}</div>
                </div>
                <div class="address-card-buttons">
                    <button class="edit-button" @click="openEditModal(address)">Editar</button>
                    <button class="delete-button" @click="openConfirmationModal(address.id)">Excluir</button>
                </div>
            </div>
        </div>

        <AddressModal 
            :show-modal="showAddModal" 
            :modal-title="modalTitle" 
            :is-edit-mode="false" 
            @close="closeAddModal"
            @save="addNewAddress"
        />
        <AddressModal 
            :show-modal="showEditModal" 
            :modal-title="modalTitle" 
            :initialFormData="editFormData" 
            :is-edit-mode="true"  
            @close="closeEditModal" 
            @edit="updateAddressList"
        />
        <ConfirmationModal
            :show-modal="showConfirmationModal"
            @confirmed="deleteConfirmed"
            @cancelled="deleteCancelled"
        />
    </div>

    <div class="loader-overlay" v-if="loading">
        <div class="loader-content">
            Carregando...
        </div>
    </div>
</template>
  
<script>
    import AddressModal from './AddressModal.vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import ConfirmationModal from './ConfirmationModal.vue';

    export default {
        components: {
            AddressModal,
            ConfirmationModal
        },
        watch: {
            searchQuery(newQuery) {
                if (this.searchButtonClicked) {
                    this.searchQueryEmpty = newQuery.trim() === '';
                }
            },
        },
        data() {
            return {
                showAddModal: false,
                showEditModal: false,
                editFormData: {},
                modalTitle: 'Salvar Novo Endereço',
                modalActionStatus: '',
                searchModalVisible: false,
                searchQuery: '',
                filteredAddresses: [],
                loading: false,
                showLoader: false,
                searchButtonClicked: false,
                searchQueryEmpty: false,
                addressToDelete: null,
                showConfirmationModal: false,                
            };
        },
        mounted() {
            this.fetchAddresses();
        },
        methods: {
            addNewAddress(newAddress) {
                this.filteredAddresses.unshift(newAddress);
            },
            updateAddressList(editedAddress) {
                const index = this.filteredAddresses.findIndex(address => address.id === editedAddress.id);
                if (index !== -1) {
                    this.filteredAddresses[index] = editedAddress;
                }
            },
            openEditModal(address) {
                this.editFormData = { ...address };
                this.modalTitle = 'Editar Endereço';
                this.showEditModal = true;
            },
            closeEditModal() {
                this.showEditModal = false;
                this.editFormData = {};
            },
            async deleteAddress() {
                try {
                    this.loading = true;
                    await fetch(`http://localhost/api/address/${this.addressToDelete}`, {
                    method: 'DELETE'});

                    this.filteredAddresses = this.filteredAddresses.filter(address => address.id !== this.addressToDelete);

                    toast.success("Endereço excluido com sucesso", {
                        autoClose: 1000,
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                } catch (error) {
                    console.error('Error saving address:', error);
                    toast.error("Erro ao excluir o Endereço.", {
                        autoClose: 1000,
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                } finally {
                    this.loading = false; 
                }
            },
            openAddModal() {
                this.showAddModal = true;
            },
            closeAddModal() {
                this.showAddModal = false;
            },
            async fetchAddresses() {
                try {
                    this.loading = true;
                    const response = await fetch('http://localhost/api/address');
                    const data = await response.json();
                    this.filteredAddresses = data;
                    this.filteredAddresses.reverse();
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                } finally {
                    this.loading = false; 
                }
            },
            async searchAddress() {
                if (this.searchQuery.trim() === '') {
                    this.searchButtonClicked = true;
                    this.$refs.searchInput.focus();
                    this.searchQuery = '';
                    return;
                }

                const addressesArray = [...this.filteredAddresses];
                const lowerSearchQuery = this.searchQuery.toLowerCase();
                const partialMatches = addressesArray.filter(address => {
                    
                    return (
                        String(address.cep).includes(lowerSearchQuery) ||
                        address.street.toLowerCase().includes(lowerSearchQuery)
                    );
                });

                if (partialMatches?.length > 0) {
                    this.filteredAddresses = partialMatches;
                    this.isSearchEmpty = false;
                    toast.success("Endereço encontrado com sucesso", {
                        autoClose: 1000,
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                    this.searchQuery = '';
                    return;
                }

                try {

                    const cleanedCep = this.searchQuery.replace(/-/g, '');
                    const cepRegex = /^\d{8}$/;
                    if (!cepRegex.test(cleanedCep)) {
                        toast.warning("Endereço não encontrado", {
                            autoClose: 1000,
                            position: toast.POSITION.BOTTOM_RIGHT,
                        });
                        return;
                    }

                    this.loading = true;
                    
                    this.filteredAddresses = [];

                    const response = await fetch(`http://localhost/api/address/${cleanedCep}`);
                    if (!response.ok) {
                        toast.warning("Endereço não encontrado.", {
                            autoClose: 1000,
                            position: toast.POSITION.BOTTOM_RIGHT,
                        });
                        this.fetchAddresses();
                        return;
                    }
                    const data = await response.json();

                    this.filteredAddresses = [data];
                    this.isSearchEmpty = false;
                    toast.success("Endereço encontrado com sucesso", {
                        autoClose: 1000,
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                } catch (error) {
                    console.error('Error saving address:', error);
                    toast.error("Erro ao buscar o endereço.", {
                        autoClose: 1000,
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                    this.filteredAddresses = [];
                } finally {
                    this.loading = false; 
                    this.searchQuery = '';
                }
            },
            deleteConfirmed() {
                this.deleteAddress();
                this.showConfirmationModal = false;
            },
            deleteCancelled() {
                this.addressToDelete = null;
                this.showConfirmationModal = false;
            },
            openConfirmationModal(id) {
                this.showConfirmationModal = true;
                this.addressToDelete = id; 
            },
        }
    }
</script>

  
<style scoped>
/* -------------------------- card css ---------------------------------------------*/
    .cards-container {
        margin-top: 20px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: center;
        align-items: stretch;
        justify-content: space-evenly;
    }
    .address-list {
        display: flex;
        flex-direction: column;
    }

    .address-card-title {
        background-color: #f0f0f0;
        font-weight: bold;
        }
    
    .address-card {
        max-width: 350px;
        background-color: #f0f0f0;
        padding: 20px;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
        min-width: 350px;
        margin-bottom: 20px;
    }
    
    .address-card-content {
        flex: 1;
    }
    
    .address-card-row {
        margin-bottom: 10px;
    }
    
    .address-card-buttons {
        display: flex;
        flex-direction: column;
    }
/* -------------------------- bar css ---------------------------------------------*/
    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    .title {
        margin-bottom: 0;
        margin-left: 40px;
        padding-bottom: 15px;
    }

    .search-container {
        display: flex;
        align-items: center;
    }
    .search-input {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 25px 0 0 25px;
    }

    .search-button {
        padding: 11px;
        border: none;
        border-radius: 0 25px 25px 0;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        margin-right: 10px;
    }
    .add-button {
        padding: 11px 20px;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 25px;
        cursor: pointer;
        margin-right: 10px;
    }

    .add-button:hover {
        background-color: #0056b3;
    }
    
    .edit-button,
    .delete-button {
        margin-top: 10px;
        padding: 5px 10px;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }
  
    .edit-button {
        background-color: #ffc107;
        margin-bottom: 5px;
    }

    
    .search-input-empty {
        border: 1px solid red;
    }

    .list-button {
        padding: 11px 20px;
        border: none;
        background-color: #28a745; 
        color: white;
        border-radius: 25px;
        cursor: pointer;
    }

    .list-button:hover {
        background-color: #218838; 
    }

/* -------------------------- loadder css ---------------------------------------------*/
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

/* -------------------------- media css ---------------------------------------------*/
    @media (min-width: 1366px) {
        .title-container {
            margin-bottom: 40px;
        }
    }

    @media (min-width: 1920px) {
        .title-container {
            margin-bottom: 60px;
        }
    }

    @media (max-width: 650px) {
        .title-container {
            flex-direction: column; 
            margin-bottom: 20px; 
            display: flex;
            flex-wrap: wrap;
        }
        .search-container {
            flex-direction: row; 
            flex-wrap: wrap;
            justify-content: center;
        }

        .search-input {
            border-radius: 25px 0 0 25px;
            margin-right: 0;
            margin-bottom: 20px;
            flex-basis: 80%;
        }

        .search-button {
            border-radius: 0 25px 25px 0;
            margin-bottom: 20px;
        }

        .title {
            margin-bottom: 20px;
            margin-left: 10px;
            padding-bottom: 0px;
        }
    }
</style>