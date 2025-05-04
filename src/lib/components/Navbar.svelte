<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const isActive = (path) => {
    const current = get(page).url.pathname;
    return current.includes(path) ? 'font-bold text-yellow-300 underline' : '';
  };

  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    goto('/');
  };
</script>

<nav class="bg-blue-600 text-white shadow-md">
  <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
    <div class="text-xl font-bold">Peminjaman Barang</div>

    <!-- Mobile Menu Button -->
    <button class="md:hidden focus:outline-none" on:click={toggleMenu} aria-label="Toggle Menu">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="{menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}" />
      </svg>
    </button>

    <!-- Desktop Menu -->
    <div class="hidden md:flex space-x-4">
      <a href="/dashboard" class={`hover:underline transition ${isActive('/dashboard')}`}>Dashboard</a>
      <a href="/peminjaman" class={`hover:underline transition ${isActive('/peminjaman')}`}>Peminjaman</a>
      <a href="/barang-dipinjam" class={`hover:underline transition ${isActive('/barang-dipinjam')}`}>Dipinjam</a>
      <a href="/tambah-barang" class={`hover:underline transition ${isActive('/tambah-barang')}`}>Tambah Barang</a>
      <a href="/riwayat" class={`hover:underline transition ${isActive('/riwayat')}`}>Riwayat</a>      
      <button
        on:click={handleLogout}
        class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
      >
        Logout
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if menuOpen}
  <div class="md:hidden px-6 pb-4 space-y-2">
    <a href="/dashboard" class={`block hover:underline ${isActive('/dashboard')}`}>Dashboard</a>
    <a href="/peminjaman" class={`block hover:underline ${isActive('/peminjaman')}`}>Peminjaman</a>
    <a href="/barang-dipinjam" class={`block hover:underline ${isActive('/barang-dipinjam')}`}>Dipinjam</a>
    <a href="/tambah-barang" class={`block hover:underline ${isActive('/tambah-barang')}`}>Tambah Barang</a>
    <a href="/riwayat" class={`block hover:underline ${isActive('/riwayat')}`}>Riwayat</a>
    <button
      on:click={handleLogout}
      class="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-sm text-center"
    >
      Logout
    </button>
  </div>
  {/if}

</nav>
