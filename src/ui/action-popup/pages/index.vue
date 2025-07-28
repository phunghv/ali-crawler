<script setup lang="ts">
import { useWooStoreStore } from "@/stores/wooStore.store"
import { onMounted } from "vue-demi"

const wooStore = useWooStoreStore()
const message = ref(null)
const product = ref({
  title: null,
  id: null,
  images: [],
  options: [],
  colorOptions: [],
  mainImage: null,
  store: null,
})
onMounted(() => {
  preloadStore()
})

const preloadStore = () => {
  loadProductLoading.value = true
  chrome.runtime.sendMessage(
    {
      action: "loadStore",
    },
    (response) => {
      loadProductLoading.value = false
      console.log(response)
    },
  )
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
  return {
    id: data.GLOBAL_DATA.globalData.productId,
    title: data.PRODUCT_TITLE.text,
    desc: data.DESC.pcDescUrl,
    mainImage: data.GLOBAL_DATA.globalData.image,
    images: data.HEADER_IMAGE_PC.imagePathList,
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
          product.value = convertProduct(response.data)
          loadProductLoading.value = false
        },
      )
    }
  })
}

const onSubmit = function(value: any) {
  isLoading.value = true
  chrome.runtime.sendMessage(
    {
      action: "submitData",
      formData: product.value,
    },
    (response) => {
      isLoading.value = false
      if (response && response.success) {
        message.value = "Gửi dữ liệu thành công! ✅"
        console.log("Server response:", response.data)
      } else {
        message.value = `Lỗi: ${response ? response.error : "Không nhận được phản hồi."}`
        console.error("Submission failed:", response)
      }
    },
  )
}
</script>

<template>
  <div>
    <div class="hero">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <UButton icon="ph:sneaker" size="xl" @click="test" :loading="loadProductLoading">
            Load product info
          </UButton>
        </div>
        <div class="hero-content text-center">
          <div class="max-w-md">
            <UButton icon="ph:sneaker" size="xl" @click="preloadStore" >
              XXX
            </UButton>
          </div>
        </div>
      </div>

      <div class="w-full" v-if="product.id !== null">
        <UForm class="space-y-4" @submit="onSubmit">
          <UFormField label="ID" name="id" class="text-center">
            <UBadge color="primary" variant="solid">
              {{ product.id }}
            </UBadge>
          </UFormField>

          <UFormField label="Title" name="title">
            <UInput v-model="product.title" size="xl" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="image-gallery">
              <div class="thumbnail-list flex flex-wrap gap-2">
                <div v-for="image in product.images" :key="image" class="cursor-pointer" @click="selectImage(image)">
                  <img
                    :src="image"
                    alt="Product thumbnail"
                    class="w-16 h-16 object-cover rounded-md border-2 transition-all"
                    :class="selectedImage === image ? 'border-primary-500 dark:border-primary-400 scale-105': 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'" />
                </div>
              </div>
            </div>
          </div>
          <UFormField label="Description" name="password">
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
                <UBadge v-for="value in option.values" :key="value.name" color="white" variant="solid" size="lg">
                  <span v-if="option.is_color" class="w-3 h-3 rounded-full mr-2"
                        :style="{ backgroundColor: value.color }"></span>
                  <UInput v-model="value.name" placeholder="Ví dụ: Red, Blue" />
                </UBadge>
              </div>
            </div>
          </div>

          <UFormField label="Store" name="store">
            <USelect v-model="product.store"
                     value-key="id"
                     label-key="name"
                     :items="wooStore.stores" class="w-full" />
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
      <div class="w-full" v-else>
        <p>Click button to load product info</p>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
