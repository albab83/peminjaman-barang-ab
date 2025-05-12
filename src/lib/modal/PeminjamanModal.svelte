<script>
  import { createEventDispatcher } from 'svelte';     
  export let open = false;
  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }
  
    // ... seluruh isi script kamu tetap di sini
  import { onMount } from 'svelte';
  import Select from 'svelte-select';
  import axios from 'axios';

  let token;
  let items = [];
  let id_barang = '';
  let selectedItem = null;
  let peminjam = '';
  let successMessage = '';
  let errorMessage = '';
  let loading = false;
  let loadingOptions = true;

  onMount(async () => {
    token = localStorage.getItem('token');
    await fetchItems();
  });

  function autoClearMessage() {
    setTimeout(() => {
      successMessage = '';
      errorMessage = '';
    }, 3000);
  }

  const fetchItems = async () => {
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/items/barang', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data.data.filter(item => !item.is_deleted);
      options = data.map(item => ({
        label: `${item.nama_barang}`,
        value: item.id
      }));
    } catch (err) {
      console.error('Gagal memuat data barang:', err);
    } finally {
      loadingOptions = false;
    }
  };

  const pinjamBarang = async () => {
    if (!selectedItem) {
      errorMessage = 'Pilih barang yang ingin dipinjam';
      successMessage = '';
      autoClearMessage();
      return;
    }

    if (!peminjam.trim()) {
      errorMessage = 'Nama peminjam harus diisi';
      successMessage = '';
      autoClearMessage();
      return;
    }

    loading = true;
    try {
      id_barang = selectedItem.value;

      const res = await axios.post(
        'https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/tambah',
        { id_barang, peminjam },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      successMessage = res.data.message;
      errorMessage = '';
      selectedItem = null;
      peminjam = '';
      await fetchItems();
    } catch (err) {
      successMessage = '';
      errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
    } finally {
      autoClearMessage();
      loading = false;
    }
  };

  // Ubah data ke format yang dibutuhkan oleh svelte-select
  $: options = items.map(item => ({
    label: `${item.nama_barang} (${item.stok})`,
    value: item.id
  }));
  </script>
  
  {#if open}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          on:click={onClose}
        >
          ✕
        </button>
        <!-- Tempelkan seluruh isi form di sini -->
        <form on:submit|preventDefault={pinjamBarang} class="space-y-4">
          <div>
            <label for="id_barang" class="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
            {#if loadingOptions}
              <div class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm">
                Memuat daftar barang...
              </div>
              {:else}
              <Select
                items={options}
                bind:value={selectedItem}
                placeholder="Cari dan pilih barang"
                clearable={true}
                class="w-full"
                inputClass="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                menuClass="bg-white border border-gray-200 mt-1 rounded shadow-lg z-10"
                optionClass="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              />
            {/if}
          </div>    
      
          <div>
            <label for="peminjam" class="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
            <input
              type="text"
              bind:value={peminjam}
              placeholder="Masukkan nama"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
      
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            disabled={loading}
          >
            {#if loading}
              Meminjam...
            {:else}
              Pinjam Barang
            {/if}
          </button>
        </form>
      
        {#if successMessage}
          <p class="mt-4 text-green-600 text-center">{successMessage}</p>
        {/if}
        {#if errorMessage}
          <p class="mt-4 text-red-600 text-center">{errorMessage}</p>
        {/if}
        <!-- Form yang kamu tulis di atas -->
      </div>
    </div>
  {/if}
  