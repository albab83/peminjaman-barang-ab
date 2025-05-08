<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import axios from 'axios';

  let token;
  let totalBarang = 0;
  let totalDipinjam = 0;
  let pinjamanTerbaru = [];
  let loading = true;
  let username = '';
  let searchQuery = '';
  let filterDate = '';

  onMount(async () => {
    token = localStorage.getItem('token');
    if (!token) {
      goto('/');
    }
    
    try {
      const userRes = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/user/profile', {
        headers: { Authorization: Bearer ${token} }
      });
      username = userRes.data.nama || 'Admin';
    } catch (err) {
      console.error('Gagal mengambil profil:', err.message);
    }

    await fetchRingkasan();
    await fetchPinjamanTerbaru();
    loading = false;
  });

  const fetchRingkasan = async () => {
    try {
      const res = await fetch('https://backend-peminjaman-barang-production.up.railway.app/api/dashboard/ringkasan', {
        headers: { Authorization: Bearer ${token} }
      });

      if (res.ok) {
        const data = await res.json();
        totalBarang = data.total_barang;
        totalDipinjam = data.total_dipinjam;
      } else {
        console.error('Gagal ambil data ringkasan');
      }
    } catch (error) {
      console.error('Error saat mengambil ringkasan:', error);
    }
  };

  const fetchPinjamanTerbaru = async () => {
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/barang-dipinjam?limit=10', {
        headers: { Authorization: Bearer ${token} }
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

  const filteredPinjaman = () => {
    if (!searchQuery && !filterDate) return pinjamanTerbaru;
    
    return pinjamanTerbaru.filter(item => {
      const matchesSearch = !searchQuery || 
        item.peminjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = !filterDate || 
        new Date(item.tanggal_pinjam).toLocaleDateString() === new Date(filterDate).toLocaleDateString();
      
      return matchesSearch && matchesDate;
    });
  }

  function formatDate(dateString) {
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  function getStatusColor(item) {
    const daysPassed = Math.floor((new Date() - new Date(item.tanggal_pinjam)) / (1000 * 60 * 60 * 24));
    if (daysPassed > 7) return 'text-red-600';
    if (daysPassed > 3) return 'text-yellow-600';
    return 'text-green-600';
  }
</script>

<div class="min-h-screen bg-gray-50">

  {#if loading}
  <div class="px-4 sm:px-6 py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Skeleton Cards -->
      <div class="grid gap-6 grid-cols-1 md:grid-cols-4 mb-8">
        {#each Array(4) as _}
          <div class="p-6 bg-white rounded-xl shadow-md animate-pulse">
            <div class="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
            <div class="h-8 bg-gray-400 rounded w-2/5"></div>
          </div>
        {/each}
      </div>

      <!-- Skeleton Table -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="bg-gray-100 px-6 py-4">
          <div class="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
        </div>
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full animate-pulse">
              <thead>
                <tr>
                  {#each Array(5) as _}
                    <th class="px-6 py-3">
                      <div class="h-4 bg-gray-200 rounded w-24"></div>
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each Array(5) as _}
                  <tr>
                    {#each Array(5) as _}
                      <td class="px-6 py-4">
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
    </div>
  </div>

  {:else}
  <div class="px-4 sm:px-6 py-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p class="text-gray-600 mt-1">Pantau dan kelola peminjaman barang secara efektif</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow-md rounded-xl border-l-4 border-blue-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Barang</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{totalBarang}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-md rounded-xl border-l-4 border-green-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Sedang Dipinjam</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{totalDipinjam}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-md rounded-xl border-l-4 border-purple-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Tersedia</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{totalBarang - totalDipinjam}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-md rounded-xl border-l-4 border-yellow-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Tingkat Pemakaian</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{totalBarang ? Math.round((totalDipinjam / totalBarang) * 100) : 0}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid justify-center gap-6 grid-cols-1 md:grid-cols-3">
        <div class="bg-white overflow-hidden shadow-md rounded-xl">
          <div class="p-5">
            <h3 class="text-lg font-medium text-gray-900">Tambah Barang Baru</h3>
            <p class="mt-1 text-sm text-gray-500">Tambahkan barang baru ke dalam inventaris</p>
            <div class="mt-4">
              <a href="http://peminjaman-barang-ab.vercel.app/tambah-barang" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Barang
              </a>
            </div>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden shadow-md rounded-xl">
          <div class="p-5">
            <h3 class="text-lg font-medium text-gray-900">Catat Peminjaman</h3>
            <p class="mt-1 text-sm text-gray-500">Daftarkan peminjaman barang baru</p>
            <div class="mt-4">
              <a href="/peminjaman" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Catat Peminjaman
              </a>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-md rounded-xl">
          <div class="p-5">
            <h3 class="text-lg font-medium text-gray-900">Barang Sedang Dipinjam</h3>
            <p class="mt-1 text-sm text-gray-500">Lihat peminjaman barang</p>
            <div class="mt-4">
              <a href="/barang-dipinjam" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="-ml-1 mr-2 h-5 w-5 size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>                
                Kembalikan Barang
              </a>
            </div>
          </div>
        </div>  

      <div class="bg-white overflow-hidden shadow-md rounded-xl">
        <div class="p-5">
          <h3 class="text-lg font-medium text-gray-900">Riwayat Peminjaman</h3>
          <p class="mt-1 text-sm text-gray-500">Lihat riwayat peminjaman barang</p>
          <div class="mt-4">
            <a href="/riwayat" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Lihat Riwayat
            </a>
          </div>
        </div>
      </div>  
      </div>

    <!-- Pinjaman Terbaru Table -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 class="text-lg font-semibold text-gray-800">Barang yang Sedang Dipinjam</h2>
          <div class="mt-3 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Cari peminjam atau barang..." 
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="date" 
              bind:value={filterDate}
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barang</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredPinjaman() as item, index}
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-blue-700 font-medium">{item.peminjam.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{item.peminjam}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama_barang}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.kategori}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.tanggal_pinjam)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center text-sm font-medium ${getStatusColor(item)}`} ${getStatusColor(item)}}>
                    <svg class="mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Dipinjam
                  </span>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Tidak ada data yang ditemukan</p>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right text-sm">
        <a href="/peminjaman" class="text-blue-600 hover:text-blue-800 font-medium">Lihat semua peminjaman →</a>
      </div>
    </div>
  </div>

  

  <!-- Footer -->
  <footer class="bg-white mt-12 py-6 border-t">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Sistem Peminjaman Barang. All rights reserved.
      </p>
    </div>
  </footer>
  {/if}
</div>