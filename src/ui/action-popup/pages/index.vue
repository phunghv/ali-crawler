<script setup lang="ts">
import { useWooStoreStore } from "@/stores/wooStore.store"
import { onMounted } from "vue-demi"

const wooStore = useWooStoreStore()
const toast = useToast()
const allStores = ref(wooStore.stores)

const product = ref({
  title: null,
  id: null,
  images: [],
  options: [],
  colorOptions: [],
  mainImage: null,
  // store: wooStore.currentStore,
})
onMounted(() => {
  preloadStore()
})

const preloadStore = () => {
  console.log("preload store", wooStore.stores.length)
  if (allStores.value?.length == 0) {
    loadProductLoading.value = true
    chrome.runtime.sendMessage(
      {
        action: "loadStore",
      },
      (response) => {
        loadProductLoading.value = false
        wooStore.stores = response.data
        allStores.value = response.data
      },
    )
  }
}
const isLoading = ref(false)
const loadProductLoading = ref(false)


const selectedImage = ref(product.value.mainImage)

// Hàm để thay đổi ảnh chính khi click vào ảnh thumbnail
const selectImage = (imageUrl) => {
  selectedImage.value = imageUrl
}

// Hàm xử lý khi lưu thay đổi
const saveChanges = () => {
  console.log(
    "Dữ liệu đã được cập nhật:",
    JSON.stringify(product.value, null, 2),
  )
  alert("Đã lưu thay đổi! Kiểm tra console log để xem dữ liệu mới.")
}

const convertColorOption = function(options: Array<object>) {
  return options.map((item) => {
    return {
      hasImage: item.hasSkuImage,
      name: item.skuPropertyName,
      is_color: item.showTypeColor,
      values: item.skuPropertyValues.map((v) => {
        return {
          name: v.propertyValueName,
          color: v.skuColorValue,
          image: v.skuPropertyImagePath,
        }
      }),
    }
  }).filter((item) => item.is_color)
}

const convertOption = function(options: Array<object>) {
  return options.map((item) => {
    return {
      hasImage: item.hasSkuImage,
      name: item.skuPropertyName,
      is_color: item.showTypeColor,
      values: item.skuPropertyValues.map((v) => {
        return {
          name: v.propertyValueName,
          color: v.skuColorValue,
          image: v.skuPropertyImagePath,
        }
      }),
    }
  })
}
const convertProduct = function(data: object) {
  console.log(data)
  return {
    id: data.GLOBAL_DATA.globalData.productId,
    title: data.PRODUCT_TITLE.text,
    desc: data.DESC.pcDescUrl,
    mainImage: data.GLOBAL_DATA.globalData.image,
    images: data.HEADER_IMAGE_PC.imagePathList,
    properties: data.PRODUCT_PROP_PC,
    skuInfo: {
      skuImagesMap: data.HEADER_IMAGE_PC.skuImagesMap,
      skuProperties: data.SKU.skuProperties,
      skuPaths: data.SKU.skuPaths,
    },
    options: convertOption(data.SKU.skuProperties),
    colorOptions: convertColorOption(data.SKU.skuProperties),
  }
}
const test = function() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0]
    if (activeTab) {
      loadProductLoading.value = true
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "getInfo" },
        (response: object) => {
          loadProductLoading.value = false
          if (response == null || response.data == null) {
            toast.add({
              title:'❌Không thể load thông tin sản phẩm'
            })
          } else {
            product.value = convertProduct(response.data)
          }
        },
      )
    }
  })
}

const onSubmit = function(value: any) {
  if (wooStore.currentStore == null || wooStore.currentStore == 0) {
    toast.add({
      title: "❌Cần chọn store trước khi import",
      progress: false,
    })
    return
  }
  isLoading.value = true
  // wooStore.currentStore = product.value.store
  chrome.runtime.sendMessage(
    {
      action: "submitData",
      formData: {
        product: product.value,
        store: wooStore.currentStore,
      },
    },
    (response) => {
      isLoading.value = false
      console.log("Server response:", response.data)
      toast.add({
        title: "✅ " + (response.data || "Gửi dữ liệu thành công!"),
        progress: false,
      })
    },
  )
}
</script>

<template>
  <div>
    <div class="hero">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <UButton
            icon="ph:sneaker"
            size="xl"
            :loading="loadProductLoading"
            @click="test"
          >
            Load product info
          </UButton>
        </div>
      </div>

      <div
        v-if="product.id !== null"
        class="w-full"
      >
        <UForm
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField
            label="ID"
            name="id"
            class="text-center"
          >
            <UBadge
              color="primary"
              variant="solid"
            >
              {{ product.id }}
            </UBadge>
          </UFormField>

          <UFormField
            label="Title"
            name="title"
          >
            <UInput
              v-model="product.title"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="image-gallery">
              <div class="thumbnail-list flex flex-wrap gap-2">
                <div
                  v-for="image in product.images"
                  :key="image"
                  class="cursor-pointer"
                  @click="selectImage(image)"
                >
                  <img
                    :src="image"
                    alt="Product thumbnail"
                    class="w-16 h-16 object-cover rounded-md border-2 transition-all"
                    :class="selectedImage === image ? 'border-primary-500 dark:border-primary-400 scale-105': 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'"
                  />
                </div>
              </div>
            </div>
          </div>
          <UFormField
            label="Description"
            name="password"
          >
            <UTextarea
              v-model="product.desc"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <div class="space-y-6">
            <div
              v-for="(option, index) in product.colorOptions"
              :key="index"
              class="p-4 border rounded-lg dark:border-gray-700"
            >
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Colors:</label>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="value in option.values"
                  :key="value.name"
                  color="white"
                  variant="solid"
                  size="lg"
                >
                  <span
                    v-if="option.is_color"
                    class="w-3 h-3 rounded-full mr-2"
                    :style="{ backgroundColor: value.color }"
                  ></span>
                  <UInput
                    v-model="value.name"
                    placeholder="Ví dụ: Red, Blue"
                  />
                </UBadge>
              </div>
            </div>
          </div>

          <UFormField
            label="Store"
            name="store"
          >
            <USelect
              v-model="wooStore.currentStore"
              value-key="id"
              label-key="name"
              :items="allStores"
              class="w-full"
            />
          </UFormField>
          <div class="hero-content text-center">
            <div class="max-w-md">
              <UButton
                icon="ph:sneaker-move"
                size="xl"
                :loading="isLoading"
                @click="onSubmit"
              >
                Import product
              </UButton>
            </div>
          </div>
        </UForm>
      </div>
      <div
        v-else
        class="w-full"
      >
        <p>Click button to load product info</p>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
