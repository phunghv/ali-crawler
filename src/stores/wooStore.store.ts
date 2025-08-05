import { set } from "zod"

export const useWooStoreStore = defineStore("wooStore", () => {
  const { data: wooStores } = useBrowserLocalStorage("wooStores", [])
  const { data: currentWooStore } = useBrowserLocalStorage("currentWooStore", 0)
  const { data: storeCategory } = useBrowserLocalStorage("storeCategory", "Shoes")
  const stores = computed({
    get: () => wooStores.value,
    set: (value) => {
      wooStores.value = value
    },
  })
  const category = computed({
    get: () => storeCategory.value,
    set: (value) => {
      storeCategory.value = value
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
    category
  }
})
