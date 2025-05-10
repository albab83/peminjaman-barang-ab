<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  // Form states
  let nama_barang = '';
  let kategori = '';
  let stok = 0;
  let editMode = false;
  let currentItemId = null;

  // Filter states
  let searchQuery = '';
  let filterKategori = '';

  // UI states
  let items = [];
  let categories = [];
  let loading = false;
  let fetching = false;
  let successMessage = '';
  let errorMessage = '';
  let token;
  let showConfirmDialog = false;
  let itemToDelete = null;

  // Base URL untuk API
  const API_BASE_URL = 'https://backend-peminjaman-barang-production.up.railway.app/api/items';

  // Validasi token dan cek autentikasi
  onMount(() => {
    checkAuth();
  });

  const checkAuth = () => {
    token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  // Fetch data barang dari API
  const fetchItems = async () => {
    if (!checkAuth()) return;
    
    fetching = true;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/all-barang`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const activeItems = res.data.data.filter(item => !item.is_deleted);
      items = activeItems;
      
      // Ekstrak kategori unik untuk filter
      const uniqueCategories = [...new Set(activeItems.map(item => item.kategori))];
      categories = uniqueCategories;
    } catch (err) {
      showError('Gagal memuat data barang');
      console.error('Error fetching items:', err);
    } finally {
      fetching = false;
    }
  };

  // Filter items berdasarkan pencarian dan kategori
  $: filteredItems = items.filter(item => {
    const matchesSearch = searchQuery ? 
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true;
    
    const matchesCategory = filterKategori ? 
      item.kategori === filterKategori : 
      true;
    
    return matchesSearch && matchesCategory;
  });

  // Tampilkan pesan error dengan timeout
  const showError = (message) => {
    errorMessage = message;
    setTimeout(() => (errorMessage = ''), 3000);
  };

  // Tampilkan pesan sukses dengan timeout
  const showSuccess = (message) => {
    successMessage = message;
    setTimeout(() => (successMessage = ''), 3000);
  };

  // Reset form ke kondisi awal
  const resetForm = () => {
    nama_barang = '';
    kategori = '';
    stok = 0;
    editMode = false;
    currentItemId = null;
  };

  // Validasi input form
  const validateForm = () => {
    if (!nama_barang.trim()) {
      showError('Nama barang harus diisi');
      return false;
    }
    if (!kategori.trim()) {
      showError('Kategori harus diisi');
      return false;
    }
    if (!stok || stok <= 0) {
      showError('Stok harus lebih dari 0');
      return false;
    }
    return true;
  };

  // Tambah barang baru
  const tambahBarang = async () => {
    if (!validateForm()) return;

    loading = true;
    try {
      await axios.post(
        `${API_BASE_URL}/tambah-barang`,
        { nama_barang, kategori, stok },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      showSuccess('Barang berhasil ditambahkan!');
      resetForm();
      await fetchItems();
    } catch (err) {
      showError(err.response?.data?.error || 'Terjadi kesalahan saat menambahkan barang');
      console.error('Error adding item:', err);
    } finally {
      loading = false;
    }
  };

  // Set form untuk edit barang
  const editBarang = (item) => {
    nama_barang = item.nama_barang;
    kategori = item.kategori;
    stok = item.stok;
    editMode = true;
    currentItemId = item.id;
    
    // Scroll ke form
    document.querySelector('#form-container').scrollIntoView({ behavior: 'smooth' });
  };

  // Update barang yang sudah ada
  const updateBarang = async () => {
    if (!validateForm()) return;

    loading = true;
    try {
      await axios.put(
        `${API_BASE_URL}/update/${currentItemId}`,
        { nama_barang, kategori, stok },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      showSuccess('Barang berhasil diperbarui!');
      resetForm();
      await fetchItems();
    } catch (err) {
      showError(err.response?.data?.error || 'Terjadi kesalahan saat memperbarui barang');
      console.error('Error updating item:', err);
    } finally {
      loading = false;
    }
  };

  // Konfirmasi penghapusan barang
  const confirmDelete = (item) => {
    itemToDelete = item;
    showConfirmDialog = true;
  };

  // Batalkan penghapusan
  const cancelDelete = () => {
    itemToDelete = null;
    showConfirmDialog = false;
  };

  // Hapus barang
  const hapusBarang = async () => {
    if (!itemToDelete) return;
    
    try {
      await axios.delete(
        `${API_BASE_URL}/hapus/${itemToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showSuccess('Barang berhasil dihapus!');
      await fetchItems();
    } catch (err) {
      showError('Gagal menghapus barang');
      console.error('Error deleting item:', err);
    } finally {
      showConfirmDialog = false;
      itemToDelete = null;
    }
  };

  // Submit handler untuk form
  const handleSubmit = () => {
    if (editMode) {
      updateBarang();
    } else {
      tambahBarang();
    }
  };

  // Fetch data saat komponen dimuat
  onMount(() => {
    fetchItems();
  });
</script>

<main class="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow space-y-6">
  <h1 class="text-3xl font-bold text-gray-800">Manajemen Barang</h1>

  <!-- Alert Messages -->
  {#if successMessage}
    <div class="bg-green-100 text-green-800 p-3 rounded-lg flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      {successMessage}
    </div>
  {/if}
  
  {#if errorMessage}
    <div class="bg-red-100 text-red-800 p-3 rounded-lg flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {errorMessage}
    </div>
  {/if}

  <!-- Form Container -->
  <div id="form-container" class="bg-gray-50 p-5 rounded-xl shadow-sm">
    <h2 class="text-xl font-semibold mb-4">{editMode ? 'Edit Barang' : 'Tambah Barang Baru'}</h2>
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="nama_barang" class="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
        <input 
          bind:value={nama_barang} 
          type="text" 
          id="nama_barang"
          placeholder="Masukkan nama barang"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
        />
      </div>

      <div>
        <label for="kategori" class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <input 
          bind:value={kategori} 
          type="text" 
          id="kategori"
          placeholder="Masukkan kategori"
          list="category-options"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
        />
        
        <!-- Datalist untuk sugesti kategori yang sudah ada -->
        <datalist id="category-options">
          {#each categories as category}
            <option value={category}/>
          {/each}
        </datalist>
      </div>

      <div>
        <label for="stok" class="block text-sm font-medium text-gray-700 mb-1">Stok</label>
        <input 
          bind:value={stok} 
          type="number" 
          id="stok"
          min="1"
          placeholder="Masukkan jumlah stok"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
        />
      </div>

      <div class="flex gap-3">
        <button
          type="submit"
          class="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {#if loading}
            <svg class="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {editMode ? 'Menyimpan...' : 'Menambahkan...'}
          {:else}
            {editMode ? 'Simpan Perubahan' : 'Tambah Barang'}
          {/if}
        </button>
        
        {#if editMode}
          <button
            type="button"
            on:click={resetForm}
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Batal
          </button>
        {/if}
      </div>
    </form>
  </div>

  <!-- Search and Filter -->
  <div class="flex flex-col md:flex-row gap-4 mt-6">
    <div class="flex-1">
      <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Cari Barang</label>
      <div class="relative">
        <input 
          bind:value={searchQuery} 
          type="text" 
          id="search"
          placeholder="Cari berdasarkan nama..."
          class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
    
    <div class="flex-1">
      <label for="filter-kategori" class="block text-sm font-medium text-gray-700 mb-1">Filter Kategori</label>
      <select 
        bind:value={filterKategori} 
        id="filter-kategori"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Semua Kategori</option>
        {#each categories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>
    
    <div class="flex items-end">
      <button
        on:click={() => { searchQuery = ''; filterKategori = ''; }}
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
      >
        Reset Filter
      </button>
    </div>
  </div>

  <!-- Table Header -->
  <div class="flex justify-between items-center mt-6">
    <h2 class="text-xl font-semibold">Daftar Barang</h2>
    <button
      on:click={fetchItems}
      class="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </button>
  </div>

  <!-- Tabel Barang -->
  {#if fetching}
    <div class="flex justify-center items-center h-32">
      <svg class="w-8 h-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  {:else if items.length === 0}
    <div class="bg-gray-50 p-8 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-600">Belum ada barang tersedia.</p>
      <p class="text-gray-500 text-sm mt-1">Tambahkan barang dengan mengisi form di atas.</p>
    </div>
  {:else if filteredItems.length === 0}
    <div class="bg-gray-50 p-8 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-gray-600">Tidak ada barang yang sesuai dengan filter.</p>
      <p class="text-gray-500 text-sm mt-1">Coba ubah kriteria pencarian Anda.</p>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-gray-300">
      <table class="w-full table-auto border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left px-4 py-3 text-gray-700">Nama</th>
            <th class="text-left px-4 py-3 text-gray-700">Kategori</th>
            <th class="text-left px-4 py-3 text-gray-700">Stok</th>
            <th class="text-right px-4 py-3 text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredItems as item}
            <tr class="border-t border-gray-300 hover:bg-gray-50">
              <td class="px-4 py-3">{item.nama_barang}</td>
              <td class="px-4 py-3">{item.kategori}</td>
              <td class="px-4 py-3">{item.stok}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button
                  on:click={() => editBarang(item)}
                  class="text-blue-600 hover:text-blue-800 transition"
                >
                  Edit
                </button>
                <button
                  on:click={() => confirmDelete(item)}
                  class="text-red-600 hover:text-red-800 transition"
                >
                  Hapus
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  
  <div class="text-center text-gray-500 text-sm pt-4">
    Total barang: {items.length} | Ditampilkan: {filteredItems.length}
  </div>
</main>

<!-- Konfirmasi Hapus Modal -->
{#if showConfirmDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 class="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
      <p class="mb-6">Apakah Anda yakin ingin menghapus barang "{itemToDelete?.nama_barang}"?</p>
      <div class="flex justify-end gap-3">
        <button
          on:click={cancelDelete}
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Batal
        </button>
        <button
          on:click={hapusBarang}
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
{/if}