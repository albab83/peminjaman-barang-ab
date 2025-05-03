<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  // Form states
  let nama_barang = '';
  let kategori = '';
  let stok = 0;

  // UI states
  let items = [];
  let loading = false;
  let fetching = false;
  let successMessage = '';
  let errorMessage = '';
  let token;

  // Ambil token & data barang saat mount
  onMount(() => {
    token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      fetchItems();
    }
  });

  const fetchItems = async () => {
    fetching = true;
    try {
      const res = await axios.get(
        'https://backend-peminjaman-barang-production.up.railway.app/api/items/barang',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      items = res.data.data;
    } catch (err) {
      errorMessage = 'Gagal memuat barang.';
      setTimeout(() => (errorMessage = ''), 3000);
    } finally {
      fetching = false;
    }
  };

  const tambahBarang = async () => {
    if (!nama_barang.trim()) {
      errorMessage = 'Nama barang harus diisi';
      return;
    }
    if (!kategori.trim()) {
      errorMessage = 'Kategori harus diisi';
      return;
    }
    if (!stok || stok <= 0) {
      errorMessage = 'Stok harus lebih dari 0';
      return;
    }

    loading = true;
    try {
      await axios.post(
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
      nama_barang = '';
      kategori = '';
      stok = 0;
      await fetchItems();
    } catch (err) {
      errorMessage = err.response?.data?.error || 'Terjadi kesalahan';
    } finally {
      loading = false;
      setTimeout(() => {
        successMessage = '';
        errorMessage = '';
      }, 3000);
    }
  };

  const hapusBarang = async (id) => {
    const konfirmasi = confirm('Yakin ingin menghapus barang ini?');
    if (!konfirmasi) return;

    try {
      await axios.delete(
        `https://backend-peminjaman-barang-production.up.railway.app/api/items/barang/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      successMessage = 'Barang berhasil dihapus!';
      await fetchItems();
    } catch (err) {
      errorMessage = 'Gagal menghapus barang.';
    } finally {
      setTimeout(() => {
        successMessage = '';
        errorMessage = '';
      }, 3000);
    }
  };
</script>

<main class="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow space-y-6">
  <h1 class="text-2xl font-bold text-gray-800">Manajemen Barang</h1>

  {#if successMessage}
    <div class="bg-green-100 text-green-800 p-2 rounded">{successMessage}</div>
  {/if}
  {#if errorMessage}
    <div class="bg-red-100 text-red-800 p-2 rounded">{errorMessage}</div>
  {/if}

  <!-- Form Tambah Barang -->
  <div class="space-y-4">
    <div>
      <label for="nama_barang" class="block text-sm font-medium">Nama Barang</label>
      <input bind:value={nama_barang} type="text" placeholder="Nama Barang"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
    </div>

    <div>
      <label for="kategori" class="block text-sm font-medium">Kategori</label>
      <input bind:value={kategori} type="text" placeholder="Kategori"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" />
    </div>

    <div>
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
  </div>

  <!-- Tabel Barang -->
  <div class="mt-6">
    <h2 class="text-lg font-semibold mb-2">Daftar Barang</h2>

    {#if fetching}
      <p class="text-gray-500">Memuat data barang...</p>
    {:else if items.length === 0}
      <p class="text-gray-500">Belum ada barang tersedia.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse mt-2">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left px-4 py-2">Nama</th>
              <th class="text-left px-4 py-2">Kategori</th>
              <th class="text-left px-4 py-2">Stok</th>
              <th class="text-left px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item}
              <tr class="border-t hover:bg-gray-50">
                <td class="px-4 py-2">{item.nama_barang}</td>
                <td class="px-4 py-2">{item.kategori}</td>
                <td class="px-4 py-2">{item.stok}</td>
                <td class="px-4 py-2">
                  <button
                    on:click={() => hapusBarang(item.id)}
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
  </div>
</main>
