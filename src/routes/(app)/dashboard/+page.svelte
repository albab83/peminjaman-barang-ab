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
  <div class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
{:else}
  <div class="px-12">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Dashboard Admin</h1>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="p-4 bg-blue-100 rounded-xl shadow">
          <h2 class="font-semibold text-lg">Total Barang</h2>
          <p class="text-blue-800 text-xl mt-2">{totalBarang}</p>
        </div>
        <div class="p-4 bg-green-100 rounded-xl shadow">
          <h2 class="font-semibold text-lg">Dipinjam</h2>
          <p class="text-green-800 text-xl mt-2">{totalDipinjam}</p>
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
