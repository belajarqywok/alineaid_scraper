/**
 * 
 *  Copy and Paste in Browser Console
 * 
 */

 class FileSaver {
  saveToFile = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = filename

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

class FetchService {
  fetchData = async (nextValue) => {
    let scripts = document.querySelectorAll('script')
    let token = null

    scripts.forEach((script) => {
      let scriptContent = script.textContent
      let tokenMatch = scriptContent.match(/"_token":"(.*?)"/)

      if (tokenMatch) token = tokenMatch[1]
    })

    const response = await fetch("https://www.alinea.id/more", {
      method: "POST",
      headers: {
        "accept": "text/html, */*; q=0.01",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      referrer: "https://www.alinea.id/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: new URLSearchParams({
        "_token": token,
        "next": nextValue,
        "categorynext": ""
      }),
      mode: "cors",
      credentials: "include"
    })

    return await response.text()
  }
}

class UrlExtractor {
  extractUrls = (text) => {
    const urlPattern = /https:\/\/www\.alinea\.id\/peristiwa\/[^\s'"]+/g
    return text.match(urlPattern) || []
  }
}

class DataFetcher {
  constructor(fetchService, urlExtractor, fileSaver, iteration, filename) {
    this.fetchService = fetchService
    this.urlExtractor = urlExtractor
    this.fileSaver = fileSaver
    this.iteration = iteration
    this.filename = filename
  }

  fetchMultiplePages = async () => {
    const uniqueUrls = new Set()

    for (let i = 1; i <= this.iteration; i++) {
      const nextValue = (i * 10).toString()
      console.log(`fetching urls [ ${nextValue} ]`)

      try {
        const text = await this.fetchService.fetchData(nextValue)
        const urls = this.urlExtractor.extractUrls(text)

        urls.forEach(url => uniqueUrls.add(url))
        console.log(`urls found: ${uniqueUrls.size}`)
      } catch (error) {
        console.error(`error fetching data for next=${nextValue}:`, error)
      }
    }

    if (uniqueUrls.size > 0) {
      const content = { links: Array.from(uniqueUrls) }
      const jsonString = JSON.stringify(content, null, 2)
      this.fileSaver.saveToFile(jsonString, this.filename)
    } else {
      console.log('no urls found')
    }
  }
}

let iteration = parseInt(prompt("iteration (example input: 1000): "), 10)
let filename = prompt("file save (example input: links): ")

const fetchService = new FetchService()
const urlExtractor = new UrlExtractor()
const fileSaver = new FileSaver()

const dataFetcher = new DataFetcher(fetchService, urlExtractor, fileSaver, iteration, filename)

dataFetcher.fetchMultiplePages()

