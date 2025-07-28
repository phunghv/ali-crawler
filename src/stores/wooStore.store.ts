export const useWooStoreStore = defineStore("wooStore", () => {
  const { data: stores } = useBrowserLocalStorage("wooStores", [])
  const { data: currentStore } = useBrowserLocalStorage("currentWooStore", null)

  const loadStore = () => {
    console.info("Load wooo")
  }
  const setCurrentStore = (current: object) => {
    currentStore.value = current
  }
  const setStores = (data: Array<object>) => {
    stores.value = data
  }

  return {
    stores,
    currentStore,
    setStores,
    loadS                                                                                                                                                                               tore,
    setCurrentStore,
  }
})
