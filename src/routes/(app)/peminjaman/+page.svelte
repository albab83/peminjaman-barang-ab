<!-- <script>
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

  function autoClearMessage() {
  setTimeout(() => {
    successMessage = '';
    errorMessage = '';
  }, 3000); // 3 detik
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
    } catch (err) {
      successMessage = "";
      errorMessage = err.response.data.message;
    } finally {
      autoClearMessage();
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
</div> -->


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
  let listLoading = true;
  let peminjamList = [];
  let kembalikanLoadingId = null;

  onMount(async () => {
    token = localStorage.getItem('token');
    await fetchItems();
    await fetchPeminjam();
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
      console.error('Gagal mengambil data:', err);
    }
  };

  const fetchPeminjam = async () => {
    listLoading = true;
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/barang-dipinjam', {
        headers: { Authorization: `Bearer ${token}` }
      });
      peminjamList = res.data.data;
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
      successMessage = "";
      errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
    } finally {
      autoClearMessage();
      loading = false;
    }
  };

  const kembalikanBarang = async (id) => {
    kembalikanLoadingId = id;
    try {
      const res = await axios.put(`https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/kembalikan/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      successMessage = res.data.message;
      errorMessage = '';
      await fetchItems();
      await fetchPeminjam();
    } catch (err) {
      successMessage = "";
      errorMessage = err.response?.data?.message || 'Gagal mengembalikan';
    } finally {
      autoClearMessage();
      kembalikanLoadingId = null;
    }
  };
</script>

<div class="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
  <h2 class="text-xl font-semibold mb-4 text-center">Form Peminjaman Barang</h2>

  <form on:submit|preventDefault={pinjamBarang} class="space-y-4">
    <div>
      <label for ="id_barang" class="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
      <select bind:value={id_barang} class="w-full border rounded px-3 py-2">
        <option value="">-- Pilih Barang --</option>
        {#each items as item}
          <option value={item.id}>{item.nama_barang} ({item.stok})</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="peminjam" class="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
      <input type="text" bind:value={peminjam} placeholder="Masukkan nama" class="w-full border rounded px-3 py-2" />
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

<!-- Daftar peminjam -->
<div class="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-lg">
  <h2 class="text-xl font-semibold mb-4 text-center">Barang yang Sedang Dipinjam</h2>

  {#if listLoading}
    <!-- Skeleton loading -->
    <div class="space-y-3">
      {#each Array(3) as _}
        <div class="animate-pulse flex space-x-4">
          <div class="rounded bg-gray-300 h-6 w-1/4"></div>
          <div class="rounded bg-gray-300 h-6 w-1/4"></div>
          <div class="rounded bg-gray-300 h-6 w-1/4"></div>
          <div class="rounded bg-gray-300 h-6 w-1/6"></div>
        </div>
      {/each}
    </div>
  {:else if peminjamList.length === 0}
    <p class="text-center text-gray-500">Tidak ada barang yang sedang dipinjam.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border mt-4">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="py-2 px-4 border-b">Nama Peminjam</th>
            <th class="py-2 px-4 border-b">Barang</th>
            <th class="py-2 px-4 border-b">Tanggal Pinjam</th>
            <th class="py-2 px-4 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#each peminjamList as p}
            <tr class="hover:bg-gray-50">
              <td class="py-2 px-4 border-b">{p.peminjam}</td>
              <td class="py-2 px-4 border-b">{p.item.nama_barang}</td>
              <td class="py-2 px-4 border-b">{new Date(p.tanggal_pinjam).toLocaleDateString()}</td>
              <td class="py-2 px-4 border-b">
                <button
                  on:click={() => kembalikanBarang(p.id)}
                  class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={kembalikanLoadingId === p.id}
                >
                  {#if kembalikanLoadingId === p.id}
                    <svg class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Mengembalikan...
                  {:else}
                    Kembalikan
                  {/if}
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
