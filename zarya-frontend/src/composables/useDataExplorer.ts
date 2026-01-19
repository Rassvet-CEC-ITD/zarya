import { ref } from 'vue';

interface PageInfo {
  page: { number: number; size: number; totalElements: number; totalPages: number };
  content: any[];
}

type DataType = 'cells-categorical' | 'cells-numerical' | 'themes' | 'statements' | 'organs';

const endpoints: Record<DataType, string> = {
  'cells-categorical': '/auth/data/cells/categorical',
  'cells-numerical': '/auth/data/cells/numerical',
  'themes': '/auth/data/themes',
  'statements': '/auth/data/statements',
  'organs': '/auth/data/organs',
};

export function useDataExplorer(apiBaseUrl: string, isAuthenticated: boolean) {
  // State
  const activeTab = ref<DataType>('cells-categorical');
  const data = ref<PageInfo | null>(null);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const isLoading = ref(false);
  const error = ref('');

  // Data fetching
  async function fetchData() {
    if (!isAuthenticated) {
      error.value = 'Please login first';
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      const url = `${apiBaseUrl}${endpoints[activeTab.value]}?page=${currentPage.value}&size=${pageSize.value}`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        data.value = await response.json();
      } else if (response.status === 401 || response.status === 403) {
        error.value = 'Authentication required. Please login again.';
      } else {
        error.value = `Error: ${response.status} ${response.statusText}`;
      }
    } catch (err) {
      error.value = `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      isLoading.value = false;
    }
  }

  // Navigation
  function changeTab(tab: DataType) {
    activeTab.value = tab;
    currentPage.value = 0;
    fetchData();
  }

  function nextPage() {
    if (data.value && currentPage.value < data.value.page.totalPages - 1) {
      currentPage.value++;
      fetchData();
    }
  }

  function prevPage() {
    if (currentPage.value > 0) {
      currentPage.value--;
      fetchData();
    }
  }

  return {
    activeTab,
    data,
    currentPage,
    isLoading,
    error,
    changeTab,
    nextPage,
    prevPage,
  };
}
