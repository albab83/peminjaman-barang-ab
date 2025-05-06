<script>
  import { onMount } from 'svelte';
  import Select from 'svelte-select';
  import axios from 'axios';

  let token;
  let items = [];
  let id_barang = '';
  let selectedItem = null;
  let peminjam = '';
  let successMessage = '';
  let errorMessage = '';
  let loading = false;

  onMount(async () => {
    token = localStorage.getItem('token');
    await fetchItems();
  });

  function autoClearMessage() {
    setTimeout(() => {
      successMessage = '';
      errorMessage = '';
    }, 3000);
  }

  const fetchItems = async () => {
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/items/barang', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeItems = res.data.data.filter(item => !item.is_deleted);
      items = activeItems;
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  const pinjamBarang = async () => {
    if (!selectedItem) {
      errorMessage = 'Pilih barang yang ingin dipinjam';
      successMessage = '';
      autoClearMessage();
      return;
    }

    if (!peminjam.trim()) {
      errorMessage = 'Nama peminjam harus diisi';
      successMessage = '';
      autoClearMessage();
      return;
    }

    loading = true;
    try {
      id_barang = selectedItem.value;

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
      selectedItem = null;
      peminjam = '';
      await fetchItems();
    } catch (err) {
      successMessage = '';
      errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
    } finally {
      autoClearMessage();
      loading = false;
    }
  };

  // Ubah data ke format yang dibutuhkan oleh svelte-select
  $: options = items.map(item => ({
    label: `${item.nama_barang} (${item.stok})`,
    value: item.id
  }));
</script>


<div class="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
  <h1 class="text-2xl font-bold text-gray-800 mb-4 text-center sm:text-xs">Form Peminjaman Barang</h1>

  <form on:submit|preventDefault={pinjamBarang} class="space-y-4">
    <div>
      <label for="id_barang" class="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
      <Select
        items={options}
        bind:value={selectedItem}
        placeholder="Cari dan pilih barang..."
        clearable={true}
        class="w-full"
        inputClass="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        menuClass="bg-white border border-gray-200 mt-1 rounded shadow-lg z-10"
        optionClass="px-4 py-2 hover:bg-blue-100 cursor-pointer"
        groupClass="text-sm text-gray-600"
      />
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


<!-- <script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let token;
  let items = [];
  let peminjamList = [];
  let id_barang = '';
  let peminjam = '';
  let successMessage = '';
  let errorMessage = '';
  let loading = false;
  let listLoading = true;
  let loadingId = null;


  onMount(async () => {
    try {
      token = localStorage.getItem('token');
      await fetchItems();
      await fetchPeminjam();
    } catch (err) {
      console.error('Kesalahan onMount:', err);
    }
  });

  function autoClearMessage() {
    setTimeout(() => {
      successMessage = '';
      errorMessage = '';
    }, 3000);
  }

  const fetchItems = async () => {
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/items/barang', {
        headers: { Authorization: `Bearer ${token}` }
      });
      items = res.data.data.filter(item => !item.is_deleted);
    } catch (err) {
      console.error('Gagal mengambil data barang:', err);
    }
  };

  const fetchPeminjam = async () => {
    listLoading = true;
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/barang-dipinjam', {
        headers: { Authorization: `Bearer ${token}` }
      });
      peminjamList = res.data?.data ?? [];
    } catch (err) {
      console.error('Gagal mengambil daftar peminjam:', err);
    } finally {
      listLoading = false;
    }
  };

  const pinjamBarang = async () => {
    if (!id_barang) {
      errorMessage = 'Pilih barang yang ingin dipinjam';
      successMessage = '';
      autoClearMessage();
      return;
    }
    if (!peminjam.trim()) {
      errorMessage = 'Nama peminjam harus diisi';
      successMessage = '';
      autoClearMessage();
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
      await fetchPeminjam();
    } catch (err) {
      successMessage = '';
      errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
    } finally {
      autoClearMessage();
      loading = false;
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
      autoClearMessage()
    } catch (err) {
      successMessage = '';
      errorMessage = err.response?.data?.message || 'Gagal mengembalikan barang';
      autoClearMessage()
    }
    loadingId = null;
  };

</script>

<div class="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
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

<!--  Table Peminjam -->
<!-- <div class="mt-8 m-10 max-w-4xl mx-auto">
  <h2 class="text-xl font-semibold mb-4 pl-5">Barang yang Sedang Dipinjam</h2>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Peminjam</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Barang</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Tanggal Pinjam</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#if listLoading}
          {#each Array(5) as _}
            <tr class="border-t animate-pulse">
              <td class="px-4 py-2">
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td class="px-4 py-2">
                <div class="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td class="px-4 py-2">
                <div class="h-4 bg-gray-200 rounded w-36"></div>
              </td>
              <td class="px-4 py-2">
                <div class="h-8 bg-gray-300 rounded w-24"></div>
              </td>
            </tr>
          {/each}
        {:else if peminjamList.length === 0}
          <tr>
            <td colspan="4" class="text-center px-4 py-2 text-sm text-gray-500">Tidak ada barang yang sedang dipinjam</td>
          </tr>
        {:else}
          {#each peminjamList as item}
            <tr class="border-t">
              <td class="px-4 py-2 text-sm text-gray-800">{item.peminjam}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{item.nama_barang}</td>
              <td class="px-4 py-2 text-sm text-gray-800">
                {new Date(item.tanggal_pinjam).toLocaleString('id-ID', {
                  timeZone: 'Asia/Jakarta',
                  dateStyle: 'medium',
                  timeStyle: 'short'
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
</div> -->


