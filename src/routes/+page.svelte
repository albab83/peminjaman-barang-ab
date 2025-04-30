<script>
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import axios from 'axios';

  let email = '';
  let password = '';
  let successMessage = '';
  let errorMessage = '';

  const handleLogin = async () => {
    successMessage = '';
    errorMessage = '';

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
  };
</script>

<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
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
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Masuk
      </button>
    </form>
  </div>
</div>
