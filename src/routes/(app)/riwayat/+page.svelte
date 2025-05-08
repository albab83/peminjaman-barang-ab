<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';

  // State management
  let riwayat = [];
  let filterNama = '';
  let filterStatus = '';
  let filterStartDate = '';
  let filterEndDate = '';
  let token = '';
  let loading = true;
  let isFilterLoading = false;
  let successMessage = '';
  let errorMessage = '';
  
  // Pagination
  let currentPage = 1;
  let totalPages = 1;
  let totalItems = 0;
  let itemsPerPage = 10;

  // API base URL
  const API_BASE_URL = 'https://backend-peminjaman-barang-production.up.railway.app/api';

  // Format tanggal dengan rapi
  function formatDate(dateString) {
    if (!dateString) return 'Belum dikembalikan';
    
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || '-';
    }
  }

  // Format status dengan tampilan yang lebih baik
  function formatStatus(status) {
    if (!status) return '-';
    
    const statusMapping = {
      'dipinjam': { text: 'Dipinjam', class: 'bg-yellow-100 text-yellow-800' },
      'dikembalikan': { text: 'Dikembalikan', class: 'bg-green-100 text-green-800' }
    };
    
    return statusMapping[status.toLowerCase()] || { text: status, class: 'bg-gray-100 text-gray-800' };
  }

  // Clear messages setelah beberapa detik
  function autoClearMessage(type = 'both', delay = 3000) {
    setTimeout(() => {
      if (type === 'success' || type === 'both') successMessage = '';
      if (type === 'error' || type === 'both') errorMessage = '';
    }, delay);
  }

  // Mengambil data riwayat dari API
  const fetchRiwayat = async () => {
    loading = true;
    successMessage = '';
    errorMessage = '';
    
    try {
      // Prepare parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (filterNama.trim()) params.nama = filterNama.trim();
      if (filterStatus) params.status = filterStatus;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      // Fetch data from API
      const res = await axios.get(`${API_BASE_URL}/peminjaman/riwayat`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      // Process response
      if (res.data && res.data.data) {
        riwayat = res.data.data;
        totalItems = res.data.total || 0;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Set success message if items found
        if (riwayat.length > 0) {
          successMessage = `${res.data.total || riwayat.length} data riwayat ditemukan`;
          autoClearMessage('success');
        } else {
          successMessage = 'Tidak ada data yang sesuai dengan filter';
          autoClearMessage('success');
        }
      } else {
        riwayat = [];
        totalPages = 1;
        console.warn('Format respon tidak sesuai yang diharapkan:', res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat:', err);
      errorMessage = err.response?.data?.message || 'Gagal memuat riwayat, coba lagi nanti.';
      autoClearMessage('error');
      riwayat = [];
    } finally {
      loading = false;
      isFilterLoading = false;
    }
  };

  // Handle filter button click
  const handleFilter = () => {
    isFilterLoading = true;
    currentPage = 1; // Reset ke halaman pertama saat filter
    fetchRiwayat();
  };

  // Handle reset filter button
  const resetFilter = () => {
    filterNama = '';
    filterStatus = '';
    filterStartDate = '';
    filterEndDate = '';
    currentPage = 1;
    fetchRiwayat();
  };

  // Handle tombol Enter pada input filter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  // Navigate to specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      currentPage = page;
      fetchRiwayat();
    }
  };

  // Generate page numbers for pagination
  function getPageNumbers() {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 2) {
        endPage = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  }

  // Initialize on component mount
  onMount(() => {
    // Check authentication
    token = localStorage.getItem('token');
    if (!token) {
      goto('/');
      return;
    }
    
    // Fetch initial data
    fetchRiwayat();
  });

  // Export data to CSV
  const exportToCSV = () => {
    if (riwayat.length === 0) {
      errorMessage = 'Tidak ada data untuk diekspor';
      autoClearMessage('error');
      return;
    }
    
    try {
      // Create CSV headers
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Nama Barang,Peminjam,Tanggal Pinjam,Tanggal Kembali,Status\n";
      
      // Add data rows
      riwayat.forEach(item => {
        let row = [
          item.nama_barang || '-',
          item.peminjam || '-',
          formatDate(item.tanggal_pinjam),
          item.tanggal_kembali ? formatDate(item.tanggal_kembali) : 'Belum dikembalikan',
          item.status || '-'
        ].map(cell => `"${cell}"`).join(',');
        
        csvContent += row + "\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `riwayat-peminjaman-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      successMessage = 'Data berhasil diekspor ke CSV';
      autoClearMessage('success');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      errorMessage = 'Gagal mengekspor data';
      autoClearMessage('error');
    }
  };
</script>

<main class="max-w-5xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Riwayat Peminjaman</h1>
    
    <!-- Export Button -->
    <button
      on:click={exportToCSV}
      class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition"
      disabled={loading || riwayat.length === 0}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Ekspor CSV
    </button>
  </div>

  {#if loading}
    <!-- Skeleton Loading State -->
    <div class="space-y-6 animate-pulse">
      <!-- Skeleton Filter -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="h-10 bg-gray-200 rounded-lg"></div>
        <div class="h-10 bg-gray-200 rounded-lg"></div>
        <div class="h-10 bg-gray-200 rounded-lg"></div>
        <div class="h-10 bg-gray-200 rounded-lg"></div>
      </div>

      <!-- Skeleton Table -->
      <div class="overflow-x-auto bg-white rounded-lg border">
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-50 text-left">
              <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Peminjam</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal Pinjam</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal Kembali</th>
              <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each Array(5) as _}
              <tr class="border-t">
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-36"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-36"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-20"></div></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Skeleton Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="w-24 h-8 bg-gray-200 rounded"></div>
        <div class="flex gap-2">
          {#each Array(3) as _}
            <div class="w-8 h-8 bg-gray-200 rounded"></div>
          {/each}
        </div>
        <div class="w-24 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  {:else}
    <!-- Filter Controls -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 border">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label for="filterNama" class="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
          <input
            id="filterNama"
            type="text"
            bind:value={filterNama}
            on:keydown={handleKeyDown}
            placeholder="Masukkan nama..."
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>
        
        <div>
          <label for="filterStatus" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="filterStatus"
            bind:value={filterStatus}
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="dikembalikan">Dikembalikan</option>
          </select>
        </div>
        
        <div>
          <label for="filterStartDate" class="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
          <input
            id="filterStartDate"
            type="date"
            bind:value={filterStartDate}
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>
        
        <div>
          <label for="filterEndDate" class="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
          <input
            id="filterEndDate"
            type="date"
            bind:value={filterEndDate}
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>
      </div>
      
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
          on:click={resetFilter}
          disabled={isFilterLoading}
        >
          Reset Filter
        </button>
        
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium flex items-center"
          on:click={handleFilter}
          disabled={isFilterLoading}
        >
          {#if isFilterLoading}
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          {/if}
          Terapkan Filter
        </button>
      </div>
    </div>

    <!-- Messages -->
    {#if successMessage}
      <div in:fly={{ y: -10, duration: 300 }} class="bg-green-100 text-green-800 px-4 py-3 rounded mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {successMessage}
      </div>
    {/if}
    
    {#if errorMessage}
      <div in:fly={{ y: -10, duration: 300 }} class="bg-red-100 text-red-800 px-4 py-3 rounded mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {errorMessage}
      </div>
    {/if}

    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded-lg border">
      <table class="w-full table-auto border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left">
            <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
            <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
            <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
            <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Kembali</th>
            <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#if riwayat.length === 0}
            <tr>
              <td colspan="5" class="text-center px-6 py-4 text-sm text-gray-500">
                {filterNama || filterStatus || filterStartDate || filterEndDate
                  ? 'Tidak ada data yang sesuai dengan filter'
                  : 'Tidak ada riwayat peminjaman'}
              </td>
            </tr>
          {:else}
            {#each riwayat as item (item.id)}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-800 font-medium">{item.nama_barang || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-800">{item.peminjam || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{formatDate(item.tanggal_pinjam)}</td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {item.tanggal_kembali ? formatDate(item.tanggal_kembali) : 
                    <span class="text-yellow-600">Belum dikembalikan</span>}
                </td>
                <td class="px-4 py-3 text-sm">
                  {#if item.status}
                    <span class="px-2 py-1 text-xs font-medium rounded-full {formatStatus(item.status).class}">
                      {formatStatus(item.status).text}
                    </span>
                  {:else}
                    <span>-</span>
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex justify-between items-center mt-6">
        <button
          class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
          on:click={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Sebelumnya
        </button>

        <div class="flex items-center gap-1">
          {#each getPageNumbers() as page}
            {#if page === '...'}
              <span class="px-2 py-1 text-sm text-gray-500">...</span>
            {:else}
              <button
                class="px-3 py-1 rounded-md text-sm {currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}"
                on:click={() => goToPage(page)}
              >
                {page}
              </button>
            {/if}
          {/each}
        </div>

        <button
          class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
          on:click={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Selanjutnya
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    {/if}

    <!-- Summary -->
    {#if riwayat.length > 0}
      <div class="mt-4 text-sm text-gray-500">
        Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
      </div>
    {/if}
  {/if}
</main>