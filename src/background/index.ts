// Sample code if using extensionpay.com
// import { extPay } from 'src/utils/payment/extPay'
// extPay.startBackground()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Lắng nghe tin nhắn có action là 'submitData'
  if (request.action === "loadStore") {
    console.log("Load store");
    async function loadStore() {
      try {
        console.info("Start fetch store https://product.1stshirtcorp.com")
        const response = await fetch("https://product.1stshirtcorp.com/stores", {
          method: "GET"
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        sendResponse({ success: true, data: data })
      } catch (error) {
        // Gửi phản hồi lỗi về cho popup
        console.error(error)
      }
    }
    loadStore()
    return true
  }
  if (request.action === "submitData") {
    const { formData } = request
    console.log("Start", formData)

    // Dùng fetch để gọi API
    async function postData() {
      try {
        const response = await fetch("https://product.1stshirtcorp.com/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Success", data)
        // Gửi phản hồi thành công về cho popup
        sendResponse({ success: true, data: data?.message })
      } catch (error) {
        // Gửi phản hồi lỗi về cho popup
        sendResponse({ success: false, error: error.message })
      }
    }

    postData()
    // Quan trọng: return true để báo rằng sendResponse sẽ được gọi bất đồng bộ
    return true
  }
})

// Lắng nghe sự kiện click vào icon của extension
// chrome.action.onClicked.addListener((tab) => {
//   console.info(tab)
//   // Gửi một tin nhắn đến content script của tab đang hoạt động
//   chrome.tabs.sendMessage(tab.id, { action: "changeColor", color: "#FFC0CB" }, (response) => {
//     if (chrome.runtime.lastError) {
//       console.error(chrome.runtime.lastError.message);
//     } else {
//       console.info('Phản hồi từ content script:', response.status);
//     }
//   });
// });

// chrome.runtime.onInstalled.addListener(async (opt) => {
//   // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
//   // opt.reason === 'update' // If extension is updated.
//   if (opt.reason === "install") {
//     chrome.tabs.create({
//       active: true,
//       // Open the setup page and append `?type=install` to the URL so frontend
//       // can know if we need to show the install page or update page.
//       url: chrome.runtime.getURL("src/ui/setup/index.html"),
//     })

//     return
//   }

//   if (opt.reason === "update") {
//     chrome.tabs.create({
//       active: true,
//       url: chrome.runtime.getURL("src/ui/setup/index.html?type=update"),
//     })

//     return
//   }
// })

self.onerror = function(message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from background")

export {}
