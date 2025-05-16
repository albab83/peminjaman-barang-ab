<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let barangList = [];
  let nama_barang = '';
  let kategori = '';
  let stok = 0;
  let editMode = false;
  let currentItemId = null;
  let showFormModal = false;

  const fetchBarang = async () => {
    try {
      const res = await axios.get('/api/items');
      barangList = res.data;
    } catch (err) {
      console.error('Gagal fetch barang:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await axios.put(`/api/items/ubah-stok/${currentItemId}`, {
          nama_barang,
          kategori,
          stok,
        });
      } else {
        await axios.post('/api/items/tambah-barang', {
          nama_barang,
          kategori,
          stok,
        });
      }

      await fetchBarang();
      resetForm();
    } catch (err) {
      console.error('Gagal submit:', err);
    }
  };

  const editBarang = (item) => {
    nama_barang = item.nama_barang;
    kategori = item.kategori;
    stok = item.stok;
    currentItemId = item.id;
    editMode = true;
    showFormModal = true;
  };

  const resetForm = () => {
    nama_barang = '';
    kategori = '';
    stok = 0;
    currentItemId = null;
    editMode = false;
  };

  onMount(fetchBarang);
</script>

<!-- Tombol Tambah -->
<div class="mb-4">
  <button
    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    on:click={() => {
      resetForm();
      showFormModal = true;
    }}
  >
    Tambah Barang
  </button>
</div>

<!-- Tabel Barang -->
<table class="w-full table-auto border-collapse border">
  <thead class="bg-gray-200">
    <tr>
      <th class="border p-2">Nama Barang</th>
      <th class="border p-2">Kategori</th>
      <th class="border p-2">Stok</th>
      <th class="border p-2">Aksi</th>
    </tr>
  </thead>
  <tbody>
    {#each barangList as item}
      <tr>
        <td class="border p-2">{item.nama_barang}</td>
        <td class="border p-2">{item.kategori}</td>
        <td class="border p-2">{item.stok}</td>
        <td class="border p-2">
          <button
            class="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            on:click={() => editBarang(item)}
          >
            Edit
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<!-- Modal Form -->
{#if showFormModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
      <button
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        on:click={() => {
          showFormModal = false;
          resetForm();
        }}
      >
        ✕
      </button>

      <h2 class="text-xl font-semibold mb-4">{editMode ? 'Edit Barang' : 'Tambah Barang Baru'}</h2>

      <form on:submit|preventDefault={() => { handleSubmit(); showFormModal = false; }} class="space-y-4">
        <div>
          <label class="block font-semibold mb-1">Nama Barang:</label>
          <input type="text" bind:value={nama_barang} required class="w-full border rounded-lg p-2" />
        </div>

        <div>
          <label class="block font-semibold mb-1">Kategori:</label>
          <select bind:value={kategori} required class="w-full border rounded-lg p-2">
            <option value="">Pilih Kategori</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Alat Tulis">Alat Tulis</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-1">Stok:</label>
          <input type="number" bind:value={stok} min="0" required class="w-full border rounded-lg p-2" />
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          {editMode ? 'Simpan Perubahan' : 'Tambah Barang'}
        </button>
      </form>
    </div>
  </div>
{/if}
