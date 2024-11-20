export default function Login() {

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-zinc-800">
        <div className="px-6 py-4">

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-200">Recipe App</h3>

          <p className="mt-1 text-center text-gray-500 dark:text-gray-400">Login or create account</p>

          <form className="my-8">
            <div className="w-full mt-16">
              <input className="block w-full px-4 py-2 mt-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300" type="email" placeholder="Username" aria-label="Username" />
            </div>

            <div className="w-full mt-4">
              <input className="block w-full px-4 py-2 mt-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300" type="password" placeholder="Password" aria-label="Password" />
            </div>

            <button className="px-6 py-2 mt-4 w-full text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-lime-600 rounded-lg hover:bg-lime-700 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50">
              Login
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-zinc-700">
          <span className="text-sm text-gray-600 dark:text-gray-200">Don't have an account? </span>
          <a href="/register" className="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
}