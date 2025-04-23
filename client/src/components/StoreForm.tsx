  <div className="flex justify-end">
    <button
      type="submit"
      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      disabled={loading}
    >
      {loading ? '保存中...' : '保存'}
    </button>
  </div> 