<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  // State management
  let barangDipinjam = [];
  let namaFilter = '';
  let token = '';
  let successMessage = '';
  let errorMessage = '';
  let loadingId = null;
  let loading = true;
  let isFilterLoading = false;

  // API base URL
  const API_BASE_URL = 'https://backend-peminjaman-barang-production.up.railway.app/api';

  // Clear messages setelah beberapa detik
  function autoClearMessage() {
    setTimeout(() => {
      successMessage = '';
      errorMessage = '';
    }, 3000); // 3 detik
  }

  onMount(async () => {
    // Check token dan redirect jika tidak ada
    token = localStorage.getItem('token');
    if (!token) {
      goto('/');
      return;
    }

    // Fetch data saat komponen dimount
    await fetchData();
  });

  // Format tanggal dengan lebih rapi
  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (error) {
      return dateString || '-';
    }
  }

  // Mengambil data barang yang dipinjam
  const fetchData = async () => {
    loading = true;
    errorMessage = '';
    
    try {
      const res = await axios.get(`${API_BASE_URL}/peminjaman/barang-dipinjam`, {
        params: { nama: namaFilter.trim() },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.data) {
        barangDipinjam = res.data.data;
      } else {
        barangDipinjam = [];
        console.warn('Format respon tidak sesuai yang diharapkan:', res.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      errorMessage = err.response?.data?.error || 'Gagal mengambil data. Silakan coba lagi.';
      autoClearMessage();
      barangDipinjam = [];
    } finally {
      loading = false;
    }
  };

  // Filter data berdasarkan nama
  const handleFilter = async () => {
    isFilterLoading = true;
    await fetchData();
    isFilterLoading = false;
  };

  // Handle tombol Enter pada input filter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  // Mengembalikan barang yang dipinjam
  const kembalikanBarang = async (id) => {
    if (!id) {
      errorMessage = 'ID barang tidak valid';
      autoClearMessage();
      return;
    }

    loadingId = id;
    
    try {
      const res = await axios.put(
        `${API_BASE_URL}/peminjaman/kembalikan/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      successMessage = res.data.message || 'Barang berhasil dikembalikan';
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error returning item:', err);
      errorMessage = err.response?.data?.message || 'Gagal mengembalikan barang. Silakan coba lagi.';
    } finally {
      loadingId = null;
      autoClearMessage();
    }
  };
</script>

<main class="max-w-4xl mx-auto mt-8 p-4">
  <h1 class="text-2xl font-bold text-gray-800 mb-6">Daftar Barang yang Dipinjam</h1>

  <!-- Filter Input -->
  <div class="flex flex-col sm:flex-row items-center gap-3 mb-6">
    <div class="relative w-full">
      <input
        type="text"
        bind:value={namaFilter}
        on:keydown={handleKeyDown}
        placeholder="Cari berdasarkan nama peminjam"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
    <button
      on:click={handleFilter}
      disabled={isFilterLoading}
      class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center justify-center disabled:bg-blue-400"
    >
      {#if isFilterLoading}
        <svg class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      {/if}
      Cari
    </button>
  </div>

  <!-- Messages Area -->
  {#if successMessage}
    <div in:fly={{ y: -10, duration: 300 }} class="bg-green-100 text-green-800 mb-4 px-4 py-3 rounded flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      {successMessage}
    </div>
  {/if}
  
  {#if errorMessage}
    <div in:fly={{ y: -10, duration: 300 }} class="bg-red-100 text-red-800 mb-4 px-4 py-3 rounded flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {errorMessage}
    </div>
  {/if}

  <!-- Data Table -->
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#if loading}
            {#each Array(3) as _, i}
              <tr class="animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-20"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-36"></div></td>
                <td class="px-4 py-3"><div class="h-8 bg-gray-200 rounded w-24"></div></td>
              </tr>
            {/each}
          {:else if barangDipinjam.length === 0}
            <tr>
              <td colspan="5" class="px-4 py-4 text-center text-sm text-gray-500">
                {namaFilter ? `Tidak ada data yang cocok dengan filter "${namaFilter}"` : 'Tidak ada barang yang sedang dipinjam'}
              </td>
            </tr>
          {:else}
            {#each barangDipinjam as item (item.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-800">{item.peminjam || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-medium">{item.nama_barang || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-800">{item.kategori || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-800">{formatDate(item.tanggal_pinjam)}</td>
                <td class="px-4 py-3 text-sm">
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
                      Proses...
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