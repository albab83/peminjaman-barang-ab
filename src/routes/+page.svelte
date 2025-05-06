<script>
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import axios from 'axios';

  let email = '';
  let password = '';
  let successMessage = '';
  let errorMessage = '';
  let isLoading = false;

  const handleLogin = async () => {
    successMessage = '';
    errorMessage = '';
    isLoading = true;


    try {
      const res = await axios.post('https://backend-peminjaman-barang-production.up.railway.app/api/auth/login', {
        email,
        password
      });

      const { token } = res.data;
      localStorage.setItem('token', token);
      successMessage = 'Login berhasil! Mengarahkan ke dashboard...';

      setTimeout(() => {
        goto('/dashboard');
      }, 1500);
    } catch (err) {
      errorMessage = err.response?.data?.error || 'Login gagal. Silakan coba lagi.';
    }

    isLoading = false;
  };
</script>

<div class="flex justify-center items-center min-h-screen">
  <div class="bg-white p-8 rounded-2xl w-full max-w-md">
    <h2 class="text-2xl font-bold mb-6 text-center">Login Admin</h2>

    <!-- Notifikasi -->
    {#if successMessage}
      <div
        in:fly={{ y: -10, duration: 300 }}
        class="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded mb-4 text-sm"
      >
        {successMessage}
      </div>
    {/if}

    {#if errorMessage}
      <div
        in:fly={{ y: -10, duration: 300 }}
        class="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded mb-4 text-sm"
      >
        {errorMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block mb-1 font-medium text-sm">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="password" class="block mb-1 font-medium text-sm">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
        disabled={isLoading}
      >
      {#if isLoading}
        <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Loading...
      {:else}
      Masuk
    {/if}
  </button>
    </form>
  </div>
</div>
