import CryptoJS from 'crypto-js'

/**
 * Base64 编码解码工具
 */
export class Base64Tool {
  /**
   * 文本 Base64 编码
   */
  static encodeText(text: string): string {
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (error) {
      throw new Error('编码失败：输入包含无效字符')
    }
  }

  /**
   * 文本 Base64 解码
   */
  static decodeText(base64: string): string {
    try {
      return decodeURIComponent(escape(atob(base64)))
    } catch (error) {
      throw new Error('解码失败：输入不是有效的 Base64 格式')
    }
  }

  /**
   * 文件 Base64 编码
   */
  static async encodeFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除 data:type;base64, 前缀
        const base64 = result.split(',')[1] || result
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Base64 解码为 Blob
   */
  static decodeToBlob(base64: string, mimeType = 'application/octet-stream'): Blob {
    try {
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return new Blob([bytes], { type: mimeType })
    } catch (error) {
      throw new Error('解码失败：输入不是有效的 Base64 格式')
    }
  }

  /**
   * 验证 Base64 格式
   */
  static validate(base64: string): boolean {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    return base64Regex.test(base64) && base64.length % 4 === 0
  }
}

/**
 * URL 编码解码工具
 */
export class URLTool {
  /**
   * URL 编码
   */
  static encode(text: string): string {
    try {
      return encodeURIComponent(text)
    } catch (error) {
      throw new Error('编码失败')
    }
  }

  /**
   * URL 解码
   */
  static decode(text: string): string {
    try {
      return decodeURIComponent(text)
    } catch (error) {
      throw new Error('解码失败：输入包含无效的编码序列')
    }
  }

  /**
   * 完整 URL 编码（包括特殊字符）
   */
  static encodeComplete(text: string): string {
    return encodeURIComponent(text)
      .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
  }
}

/**
 * HTML 实体编码解码工具
 */
export class HTMLEntityTool {
  private static entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }

  private static reverseEntityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' '
  }

  /**
   * HTML 实体编码
   */
  static encode(text: string): string {
    return text.replace(/[&<>"'\/]/g, (char) => this.entityMap[char] || char)
  }

  /**
   * HTML 实体解码
   */
  static decode(text: string): string {
    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
      if (this.reverseEntityMap[entity]) {
        return this.reverseEntityMap[entity]!
      }
      
      // 处理数字实体
      if (entity.startsWith('&#')) {
        const num = entity.slice(2, -1)
        if (num.startsWith('x')) {
          // 十六进制
          const code = parseInt(num.slice(1), 16)
          return String.fromCharCode(code)
        } else {
          // 十进制
          const code = parseInt(num, 10)
          return String.fromCharCode(code)
        }
      }
      
      return entity
    })
  }
}

/**
 * Unicode 转换工具
 */
export class UnicodeTool {
  /**
   * 字符转 Unicode 码点
   */
  static charToUnicode(char: string): string {
    const codePoint = char.codePointAt(0)
    if (codePoint === undefined) return ''
    return 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')
  }

  /**
   * 文本转 Unicode 列表
   */
  static textToUnicode(text: string): Array<{ char: string; unicode: string; decimal: number; hex: string }> {
    const result = []
    for (const char of text) {
      const codePoint = char.codePointAt(0)
      if (codePoint !== undefined) {
        result.push({
          char,
          unicode: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0'),
          decimal: codePoint,
          hex: '0x' + codePoint.toString(16).toUpperCase()
        })
      }
    }
    return result
  }

  /**
   * Unicode 码点转字符
   */
  static unicodeToChar(unicode: string): string {
    const codePoint = unicode.replace(/^U\+/, '')
    const num = parseInt(codePoint, 16)
    if (isNaN(num)) throw new Error('无效的 Unicode 码点')
    return String.fromCodePoint(num)
  }

  /**
   * 文本转 UTF-8 字节
   */
  static textToUTF8Bytes(text: string): number[] {
    const encoder = new TextEncoder()
    return Array.from(encoder.encode(text))
  }

  /**
   * UTF-8 字节转文本
   */
  static utf8BytesToText(bytes: number[]): string {
    const decoder = new TextDecoder()
    return decoder.decode(new Uint8Array(bytes))
  }
}

/**
 * 哈希工具
 */
export class HashTool {
  /**
   * MD5 哈希
   */
  static md5(input: string): string {
    return CryptoJS.MD5(input).toString()
  }

  /**
   * SHA1 哈希
   */
  static sha1(input: string): string {
    return CryptoJS.SHA1(input).toString()
  }

  /**
   * SHA256 哈希
   */
  static sha256(input: string): string {
    return CryptoJS.SHA256(input).toString()
  }

  /**
   * SHA512 哈希
   */
  static sha512(input: string): string {
    return CryptoJS.SHA512(input).toString()
  }

  /**
   * 文件哈希计算
   */
  static async fileHash(file: File, algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const wordArray = CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer)
          let hash: string
          
          switch (algorithm) {
            case 'md5':
              hash = CryptoJS.MD5(wordArray).toString()
              break
            case 'sha1':
              hash = CryptoJS.SHA1(wordArray).toString()
              break
            case 'sha256':
              hash = CryptoJS.SHA256(wordArray).toString()
              break
            case 'sha512':
              hash = CryptoJS.SHA512(wordArray).toString()
              break
            default:
              throw new Error('不支持的算法')
          }
          
          resolve(hash)
        } catch (error) {
          reject(new Error('哈希计算失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }
}

/**
 * AES/DES 加密解密工具
 */
export class CryptoTool {
  /**
   * AES 加密
   */
  static aesEncrypt(plaintext: string, key: string, mode: 'ECB' | 'CBC' = 'CBC'): string {
    try {
      let encrypted: any
      
      if (mode === 'ECB') {
        encrypted = CryptoJS.AES.encrypt(plaintext, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        })
      } else {
        encrypted = CryptoJS.AES.encrypt(plaintext, key, {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        })
      }
      
      return encrypted.toString()
    } catch (error) {
      throw new Error('AES 加密失败')
    }
  }

  /**
   * AES 解密
   */
  static aesDecrypt(ciphertext: string, key: string, mode: 'ECB' | 'CBC' = 'CBC'): string {
    try {
      let decrypted: any
      
      if (mode === 'ECB') {
        decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        })
      } else {
        decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        })
      }
      
      const result = decrypted.toString(CryptoJS.enc.Utf8)
      if (!result) {
        throw new Error('解密失败，请检查密钥和密文')
      }
      
      return result
    } catch (error) {
      throw new Error('AES 解密失败：' + (error as Error).message)
    }
  }

  /**
   * DES 加密
   */
  static desEncrypt(plaintext: string, key: string): string {
    try {
      const encrypted = CryptoJS.DES.encrypt(plaintext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
      return encrypted.toString()
    } catch (error) {
      throw new Error('DES 加密失败')
    }
  }

  /**
   * DES 解密
   */
  static desDecrypt(ciphertext: string, key: string): string {
    try {
      const decrypted = CryptoJS.DES.decrypt(ciphertext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
      
      const result = decrypted.toString(CryptoJS.enc.Utf8)
      if (!result) {
        throw new Error('解密失败，请检查密钥和密文')
      }
      
      return result
    } catch (error) {
      throw new Error('DES 解密失败：' + (error as Error).message)
    }
  }
}
