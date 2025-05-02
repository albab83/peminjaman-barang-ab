<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let token;
  let items = [];
  let id_barang = '';
  let peminjam = '';
  let successMessage = '';
  let errorMessage = '';
  let loading = false;

  onMount(async () => {
    token = localStorage.getItem('token');
    await fetchItems();
  });

  const fetchItems = async () => {
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/items/barang', {
        headers: { Authorization: `Bearer ${token}` }
      });

      items = res.data.data;  
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  const pinjamBarang = async () => {
    if (!id_barang) {
      errorMessage = 'Pilih barang yang ingin dipinjam';
      successMessage = '';
      return;
    }
    if (!peminjam.trim()) {
      errorMessage = 'Nama peminjam harus diisi';
      successMessage = '';
      return;
    }

    loading = true;
    try {
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
      id_barang = '';
      peminjam = '';
      await fetchItems();
    } catch (err) {
      successMessage = "";
      errorMessage = err.response.data.message;
    } finally {
      loading = false;
    }
  };

</script>

<div class="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
  <h2 class="text-xl font-semibold mb-4 text-center">Form Peminjaman Barang</h2>

  <form on:submit|preventDefault={pinjamBarang} class="space-y-4">
    <div>
      <label for="id_barang" class="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
      <select bind:value={id_barang} class="w-full border rounded px-3 py-2">
        <option value="">-- Pilih Barang --</option>
        {#each items as item}
          <option value={item.id}>{item.nama_barang} ({item.stok})</option>
        {/each}
      </select>
    </div>    

    <div>
      <label for="peminjam" class="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
      <input
        type="text"
        bind:value={peminjam}
        placeholder="Masukkan nama"
        class="w-full border rounded px-3 py-2"
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
</div>
