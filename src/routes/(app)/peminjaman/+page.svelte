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
  let peminjamList = [];
  let id_barang = '';
  let peminjam = '';
  let successMessage = '';
  let errorMessage = '';
  let loading = false;
  let listLoading = true;

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
    try {
      const res = await axios.get('https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/sedang-dipinjam', {
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
    try {
      await axios.put(`https://backend-peminjaman-barang-production.up.railway.app/api/peminjaman/kembalikan/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchItems();
      await fetchPeminjam();
    } catch (err) {
      console.error('Gagal mengembalikan barang:', err);
    }
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

<!-- Table Peminjam -->
<div class="max-w-4xl mx-auto mt-8">
  <h3 class="text-lg font-semibold mb-4 text-center">Barang Sedang Dipinjam</h3>
  {#if listLoading}
    <div class="space-y-2">
      {#each Array(3) as _}
        <div class="animate-pulse bg-gray-200 h-10 rounded"></div>
      {/each}
    </div>
  {:else if peminjamList.length === 0}
    <p class="text-center text-gray-500">Tidak ada barang yang sedang dipinjam</p>
  {:else}
    <table class="w-full border border-gray-300 text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">No</th>
          <th class="border p-2">Nama Barang</th>
          <th class="border p-2">Peminjam</th>
          <th class="border p-2">Tanggal Pinjam</th>
          <th class="border p-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#each peminjamList as data, i}
          <tr>
            <td class="border p-2 text-center">{i + 1}</td>
            <td class="border p-2">{data.nama_barang}</td>
            <td class="border p-2">{data.peminjam}</td>
            <td class="border p-2">{new Date(data.tanggal_pinjam).toLocaleDateString()}</td>
            <td class="border p-2 text-center">
              <button
                class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                on:click={() => kembalikanBarang(data.id)}
              >Kembalikan</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

