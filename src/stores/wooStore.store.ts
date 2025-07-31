export const useWooStoreStore = defineStore("wooStore", () => {
  const { data: wooStores } = useBrowserLocalStorage("wooStores", [])
  const { data: currentWooStore } = useBrowserLocalStorage("currentWooStore", 0)
  const stores = computed({
    get: () => wooStores.value,
    set: (value) => {
      wooStores.value = value
    },
  })

  const currentStore = computed({
    get: () => currentWooStore.value,
    set: (value) => {
      currentWooStore.value = value
    },
  })
  return {
    stores,
    currentStore,
  }
})
