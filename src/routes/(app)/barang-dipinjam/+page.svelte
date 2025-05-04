<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  let barangDipinjam = [];
  let namaFilter = '';
  let token;
  let successMessage = '';
  let errorMessage = '';
  let loadingId = null;
  let loading = true; // state untuk menandakan data sedang dimuat

  onMount(() => {
    token = localStorage.getItem('token');
    if (!token) {
      goto('/'); // Redirect otomatis
      return;
    }

    fetchData();
  });

  const fetchData = async () => {
    loading = true; // mulai loading saat data diambil
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/barang-dipinjam', {
        params: { nama: namaFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      barangDipinjam = res.data.data;
    } catch (err) {
      errorMessage = err.response?.data?.error || 'Gagal mengambil data';
    } finally {
      loading = false; // set loading ke false setelah data selesai
    }
  };

  const kembalikanBarang = async (id) => {
    loadingId = id;
    try {
      const res = await axios.put(
        `https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/kembalikan/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      successMessage = res.data.message;
      errorMessage = '';
      await fetchData();
    } catch (err) {
      successMessage = '';
      errorMessage = err.response?.data?.message || 'Gagal mengembalikan barang';
    }
    loadingId = null;
  };
</script>


<main class="max-w-4xl mx-auto mt-10 p-2">

  <h1 class="text-2xl font-bold text-gray-800 mb-4">Daftar Barang yang Dipinjam</h1>

  <!-- Filter Input -->
  <div class="flex items-center gap-4">
    <input
      type="text"
      bind:value={namaFilter}
      placeholder="Cari berdasarkan nama peminjam"
      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
    />
    <button
      on:click={fetchData}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
    >
      Cari
    </button>
  </div>

  <!-- Display Success/Error Messages -->
  {#if successMessage}
    <div in:fly={{ y: -10, duration: 300 }} class="bg-green-100 text-green-800 mt-4 px-4 py-4 rounded">
      {successMessage}
    </div>
  {/if}
  {#if errorMessage}
    <div in:fly={{ y: -10, duration: 300 }} class="bg-red-100 text-red-800 mt-4 px-4 py-2 rounded">
      {errorMessage}
    </div>
  {/if}

  <!-- Data Table -->
  <div class="mt-8 m-10 max-w-4xl mx-auto">
    <h2 class="text-xl font-semibold mb-4 pl-5">Barang yang Sedang Dipinjam</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Peminjam</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Barang</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Kategori</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Tanggal Pinjam</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            {#each Array(5) as _}
              <tr class="border-t animate-pulse">
                <td class="px-4 py-2">
                  <div class="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td class="px-4 py-2">
                  <div class="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td class="px-4 py-2">
                  <div class="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td class="px-4 py-2">
                  <div class="h-4 bg-gray-200 rounded w-36"></div>
                </td>
                <td class="px-4 py-2">
                  <div class="h-8 bg-gray-300 rounded w-24"></div>
                </td>
              </tr>
            {/each}
          {:else if barangDipinjam.length === 0}
            <tr>
              <td colspan="5" class="text-center px-4 py-2 text-sm text-gray-500">Tidak ada data</td>
            </tr>
          {:else}
            {#each barangDipinjam as item}
              <tr class="border-t">
                <td class="px-4 py-2 text-sm text-gray-800">{item.peminjam}</td>
                <td class="px-4 py-2 text-sm text-gray-800">{item.nama_barang}</td>
                <td class="px-4 py-2 text-sm text-gray-800">{item.kategori}</td>
                <td class="px-4 py-2 text-sm text-gray-800">
                  {new Date(item.tanggal_pinjam).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    dateStyle: 'medium',
                    timeStyle: 'medium'
                  })}
                </td>
                <td class="px-4 py-2 text-sm">
                  <button
                    on:click={() => kembalikanBarang(item.id)}
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition flex items-center justify-center disabled:opacity-70"
                    disabled={loadingId === item.id}
                  >
                    {#if loadingId === item.id}
                      <svg class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Loading...
                    {:else}
                      Kembalikan
                    {/if}
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
        
      </table>
    </div>
  </div>
</main>
