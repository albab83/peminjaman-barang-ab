<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let nama_barang = '';
  let kategori = '';
  let stok = 0;
  let successMessage = '';
  let errorMessage = '';
  let loading = false;

  let token;

  onMount(() => {
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
    }
  });

  const tambahBarang = async () => {
    // Validasi input
    if (!nama_barang.trim()) {
      errorMessage = 'Nama barang harus diisi';
      successMessage = '';
      return;
    }
    if (!kategori.trim()) {
      errorMessage = 'Kategori harus diisi';
      successMessage = '';
      return;
    }
    if (!stok || stok <= 0) {
      errorMessage = 'Stok harus diisi dan lebih dari 0';
      successMessage = '';
      return;
    }

    loading = true;

    try {
      const response = await axios.post(
        'https://backend-peminjaman-barang-production.up.railway.app/api/items/tambah-barang',
        { nama_barang, kategori, stok },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      successMessage = 'Barang berhasil ditambahkan!';
      errorMessage = '';
      nama_barang = '';
      kategori = '';
      stok = 0;
    } catch (err) {
      successMessage = '';
      errorMessage = err.response?.data?.error || 'Terjadi kesalahan';
    } finally {
      loading = false;
    }
  };
</script>

<main class="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow space-y-4">
  <h1 class="text-2xl font-bold text-gray-800">Tambah Barang</h1>

  {#if successMessage}
    <div class="bg-green-100 text-green-800 p-2 rounded">{successMessage}</div>
  {/if}
  {#if errorMessage}
    <div class="bg-red-100 text-red-800 p-2 rounded">{errorMessage}</div>
  {/if}

  <div class="space-y-2">
    <label for="nama_barang" class="block text-sm font-medium">Nama Barang</label>
    <input bind:value={nama_barang} type="text" placeholder="Nama Barang"
      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
  </div>

  <div class="space-y-2">
    <label for="kategori" class="block text-sm font-medium">Kategori</label>
    <input bind:value={kategori} type="text" placeholder="Kategori"
      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
  </div>

  <div class="space-y-2">
    <label for="stok" class="block text-sm font-medium">Stok</label>
    <input bind:value={stok} type="number" placeholder="Stok"
      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
  </div>

  <button
    on:click={tambahBarang}
    class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60"
    disabled={loading}
  >
    {#if loading}
      <svg class="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Menambahkan...
    {:else}
      Tambah Barang
    {/if}
  </button>
</main>
