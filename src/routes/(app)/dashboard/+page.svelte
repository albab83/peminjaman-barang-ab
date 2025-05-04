<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';

  let token;
  let totalBarang = 0;
  let totalDipinjam = 0;
  let pinjamanTerbaru = [];
  let loading = true;

  onMount(async () => {
    token = localStorage.getItem('token');
    if (!token) {
      goto('/');
    }

    await fetchRingkasan();
    await fetchPinjamanTerbaru();
    loading = false;
  });

  const fetchRingkasan = async () => {
    const res = await fetch('https://backend-peminjaman-barang-production.up.railway.app/api/dashboard/ringkasan', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      totalBarang = data.total_barang;
      totalDipinjam = data.total_dipinjam;
    } else {
      console.error('Gagal ambil data ringkasan');
    }
  };

  const fetchPinjamanTerbaru = async () => {
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/barang-dipinjam?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      pinjamanTerbaru = res.data.data;
    } catch (err) {
      console.error('Gagal ambil data pinjaman terbaru:', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    goto('/');
  };
</script>

{#if loading}
{#if loading}
<div class="px-4 sm:px-6 flex justify-center">
  <div class="max-w-4xl w-full">
    <!-- Skeleton Cards -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-6">
      {#each Array(2) as _}
        <div class="p-4 bg-gray-100 rounded-xl shadow animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div class="h-6 bg-gray-400 rounded w-1/3"></div>
        </div>
      {/each}
    </div>

    <!-- Skeleton Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="bg-gray-100 px-4 py-2">
        <div class="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div>
      <table class="min-w-full animate-pulse">
        <thead>
          <tr>
            {#each Array(5) as _}
              <th class="px-4 py-2">
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each Array(5) as _}
            <tr>
              {#each Array(5) as _}
                <td class="px-4 py-2">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{:else}
<div class="flex items-center justify-center px-4 sm:px-6">
  <div class="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Dashboard Admin</h1>
    </div>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <div class="p-4 bg-blue-100 rounded-xl shadow">
        <h2 class="font-semibold text-base sm:text-lg">Total Barang</h2>
        <p class="text-blue-800 text-lg sm:text-xl mt-2">{totalBarang}</p>
      </div>
      <div class="p-4 bg-green-100 rounded-xl shadow">
        <h2 class="font-semibold text-base sm:text-lg">Dipinjam</h2>
        <p class="text-green-800 text-lg sm:text-xl mt-2">{totalDipinjam}</p>
      </div>
    </div>
  </div>
</div>



  <div class="mt-8 m-10 max-w-4xl mx-auto">
    <h2 class="text-xl font-semibold mb-4 pl-5">10 Barang yang Sedang Dipinjam</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">No</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Peminjam</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Barang</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Kategori</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Tanggal Pinjam</th>
          </tr>
        </thead>
        <tbody>
          {#each pinjamanTerbaru as item, index}
            <tr class="border-t">
              <td class="px-4 py-2 text-sm text-gray-800">{index + 1}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{item.peminjam}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{item.nama_barang}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{item.kategori}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{ new Date(item.tanggal_pinjam).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'medium',
                timeStyle: 'medium'
              })}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="text-center px-4 py-2 text-sm text-gray-500">Tidak ada data</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
