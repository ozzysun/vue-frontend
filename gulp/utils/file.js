'use strict'
const fs = require('fs-extra')
const jsonfile = require('jsonfile')
const yaml = require('js-yaml')
const path = require('path')
// -- File ---------
const isFileExist = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      fs.open(filePath, 'r', (err, fd) => {
        if (err) {
          resolve(false)
        } else {
          fs.close(fd)
          resolve(true)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}
const readFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
const writeFile = async (filePath, str) => {
  return new Promise((resolve, reject) => {
    fs.outputFile(filePath, str, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
// 取得指定目錄內所有檔案 type: default:檔名＋ext| name: 只有檔名 不含 ext | full 完整路徑
const loadFolderFiles = async (folderPath, ext = null, type = 'default') => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err)
      } else {
        let allowFiles = []
        if (ext !== null) files = files.filter((item) => item.indexOf(`.${ext}`) !== -1)
        if (type === 'name') {
          files.forEach(item => {
            allowFiles.push(item.replace(`.${ext}`, ''))
          })
        } else if (type === 'full') {
          files.forEach(item => {
            allowFiles.push(path.resolve(folderPath, item))
          })
        } else {
          allowFiles = files
        }
        resolve(allowFiles)
      }
    })
  })
}
// -- Folder ----
const copyFolder = async (sourcePath, targetPath) => {
  return new Promise((resolve, reject) => {
    fs.copy(sourcePath, targetPath, err => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
const removeFolder = async (targetPath) => {
  return new Promise((resolve, reject) => {
    fs.remove(targetPath, err => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
// -- JSON -------
const readJSON = async (sourceFile) => {
  // sourceFile is path.resolve path
  return new Promise((resolve, reject) => {
    jsonfile.readFile(sourceFile, (err, obj) => {
      if (err) {
        reject(err)
      } else {
        resolve(obj)
      }
    })
  })
}
const writeJSON = async (filePath, jsonObj = null) => {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(filePath, jsonObj, { spaces: 2 }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
// --- YAML --------
const readYAML = async (sourceFile) => {
  const filePath = path.resolve(sourceFile)
  return new Promise((resolve, reject) => {
    try {
      const doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
      resolve(doc)
    } catch (e) {
      reject(e)
    }
  })
}
const writeYAML = async (filePath, jsonObj = null) => {
  filePath = path.resolve(filePath)
  return new Promise((resolve, reject) => {
    try {
      const doc = yaml.safeDump(jsonObj)
      writeFile(filePath, doc).then(() => {
        resolve(true)
      }).catch(e => {
        reject(e)
      })
    } catch (e) {
      reject(e)
    }
  })
}
// -- KeyValue Text ------------
// 讀取env 並轉成物件輸出
const readEnv = async (envPath) => {
  let data = await readFile(envPath)
  // 解析字串成物件
  data = data.split('\n')
  console.log('env data===')
  console.log(data)
  let result = {}
  data.forEach((item, index) => {
    if (item.indexOf('=') === -1) return
    const tmp = item.trim().split('=')
    const key = tmp[0].trim()
    let value = tmp[1].trim()
    if (isFinite(value)) value = parseFloat(value)
    if (value === 'true') value = true
    if (value === 'false') value = false
    result[key] = value
  })
  console.log(result)
  return result
}
// 將物件寫入env
const writeEnv = async (envPath, dataObj) => {
  let envStr = ''
  for (const prop in dataObj) {
    envStr += `${prop} = ${dataObj[prop]}\n`
  }
  const result = await writeFile(envPath, envStr)
  return result
}
const updateEnv = async (envPath, updateObj) => {
  let dataObj = await readEnv(envPath)
  for (const prop in updateObj) {
    dataObj[prop] = updateObj[prop]
  }
  const result = await writeEnv(envPath, dataObj)
  return result
}
module.exports = {
  readFile,
  writeFile,
  isFileExist,
  loadFolderFiles,
  copyFolder,
  removeFolder,
  readJSON,
  writeJSON,
  readYAML,
  writeYAML,
  readEnv,
  writeEnv,
  updateEnv
}
