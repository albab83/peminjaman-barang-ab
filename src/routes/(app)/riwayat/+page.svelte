<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { goto } from '$app/navigation';

  let riwayat = [];
  let filterNama = '';
  let filterStatus = '';
  let token = '';
  let loading = true;
  let successMessage = '';
  let errorMessage = '';

  const fetchRiwayat = async () => {
    loading = true;
    successMessage = '';
    errorMessage = '';
    
    try {
      const params = {};
      if (filterNama) params.nama = filterNama;
      if (filterStatus) params.status = filterStatus;

      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/riwayat', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      riwayat = res.data.data;
      successMessage = 'Data berhasil dimuat!';
      setTimeout(() => successMessage = '', 3000);
    } catch (err) {
      console.error('Gagal mengambil riwayat:', err);
      errorMessage = 'Gagal memuat riwayat, coba lagi nanti.';
      setTimeout(() => errorMessage = '', 2000);
    } finally {
      loading = false;
    }
  };

  const handleFilter = () => {
    fetchRiwayat();
  };

  onMount(() => {
    token = localStorage.getItem('token');
    if (!token) {
      goto('/');
      return;
    }
    fetchRiwayat();
  });
</script>


{#if loading}
  <div class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
{/if}

{#if !loading}
  <main class="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow space-y-6">

    <h1 class="text-2xl font-bold text-gray-800">Riwayat Peminjaman</h1>

    <!-- Filter Input -->
    <div class="flex items-center gap-4 mb-4">
      <input
        bind:value={filterNama}
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        placeholder="Cari nama peminjam..."
      />
      <select
        bind:value={filterStatus}
        class="w-full md:w-1/4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">Semua Status</option>
        <option value="dipinjam">Dipinjam</option>
        <option value="dikembalikan">Dikembalikan</option>
      </select>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        on:click={handleFilter}
      >
        Cari
      </button>
    </div>

    <!-- Success or Error Messages -->
    {#if successMessage}
      <div class="bg-green-100 text-green-800 px-4 py-2 rounded">
        {successMessage}
      </div>
    {/if}
    {#if errorMessage}
      <div class="bg-red-100 text-red-800 px-4 py-2 rounded">
        {errorMessage}
      </div>
    {/if}

    <!-- Table to Display History -->
    <div class="overflow-x-auto">
      <table class="w-full table-auto mt-4 border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-4 py-2">Nama Barang</th>
            <th class="px-4 py-2">Peminjam</th>
            <th class="px-4 py-2">Tanggal Pinjam</th>
            <th class="px-4 py-2">Tanggal Kembali</th>
            <th class="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each riwayat as item}
            <tr class="border-t hover:bg-gray-100">
              <td class="px-4 py-2">{item.nama_barang}</td>
              <td class="px-4 py-2">{item.peminjam}</td>
              <td class="px-4 py-2">{ new Date(item.tanggal_pinjam).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'medium',
                timeStyle: 'medium'
              })}</td>
              <td class="px-4 py-2">
                {item.tanggal_kembali
                  ? new Date(item.tanggal_kembali).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'medium',
                timeStyle: 'medium'
              })
                  : 'Belum dikembalikan'}            
              </td>
              <td class="px-4 py-2">{item.status}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="text-center px-4 py-2">Tidak ada data</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </main>
{/if}
