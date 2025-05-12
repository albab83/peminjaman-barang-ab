<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';

  let currentPath = '';

  const unsubscribe = page.subscribe(($page) => {
    currentPath = $page.url.pathname;
  });

  onDestroy(unsubscribe);

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
    <div class="text-xl font-bold">
      <a href="/dashboard" class="text-white text-xl" >DASHBOARD PINJAMIN</a>
    </div>

    <!-- Mobile Menu Button -->
    <button class="md:hidden focus:outline-none" on:click={toggleMenu} aria-label="Toggle Menu">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="{menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}" />
      </svg>
    </button>

    <!-- Desktop Menu -->
    <div class="hidden md:flex space-x-4">
      <!-- <a href="/dashboard" class="hover:underline" class:font-bold={currentPath.startsWith('/dashboard')}>Dashboard</a>
      <a href="/peminjaman" class="hover:underline" class:font-bold={currentPath.startsWith('/peminjaman')}>Peminjaman</a>
      <a href="/barang-dipinjam" class="hover:underline" class:font-bold={currentPath.startsWith('/barang-dipinjam')}>Dipinjam</a>
      <a href="/tambah-barang" class="hover:underline" class:font-bold={currentPath.startsWith('/tambah-barang')}>Tambah Barang</a>
      <a href="/riwayat" class="hover:underline" class:font-bold={currentPath.startsWith('/riwayat')}>Riwayat</a> -->
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
    <div class="md:hidden px-6 pb-4 space-y-2"
      transition:slide>
      <a href="/dashboard" class="block hover:underline" class:font-bold={currentPath.startsWith('/dashboard')}>Dashboard</a>
      <a href="/barang-dipinjam" class="block hover:underline" class:font-bold={currentPath.startsWith('/barang-dipinjam')}>Dipinjam</a>
      <a href="/tambah-barang" class="block hover:underline" class:font-bold={currentPath.startsWith('/tambah-barang')}>Tambah Barang</a>
      <a href="/riwayat" class="block hover:underline" class:font-bold={currentPath.startsWith('/riwayat')}>Riwayat</a>
      <button
        on:click={handleLogout}
        class="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-sm text-center"
      >
        Logout
      </button>
    </div>
  {/if}
</nav>
