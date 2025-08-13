/**
 * JSON 处理工具
 */
export class JSONTool {
  /**
   * 格式化 JSON
   */
  static format(json: string, indent = 2): string {
    try {
      const obj = JSON.parse(json)
      return JSON.stringify(obj, null, indent)
    } catch (error) {
      throw new Error('JSON 格式错误：' + (error as Error).message)
    }
  }

  /**
   * 压缩 JSON
   */
  static minify(json: string): string {
    try {
      const obj = JSON.parse(json)
      return JSON.stringify(obj)
    } catch (error) {
      throw new Error('JSON 格式错误：' + (error as Error).message)
    }
  }

  /**
   * 验证 JSON
   */
  static validate(json: string): { valid: boolean; error?: string; position?: number } {
    try {
      JSON.parse(json)
      return { valid: true }
    } catch (error) {
      const err = error as Error
      const match = err.message.match(/position (\d+)/)
      const position = match ? parseInt(match[1]!) : undefined
      return { 
        valid: false, 
        error: err.message,
        position: position
      }
    }
  }

  /**
   * 转义 JSON 字符串
   */
  static escape(json: string): string {
    return JSON.stringify(json)
  }

  /**
   * 反转义 JSON 字符串
   */
  static unescape(json: string): string {
    try {
      return JSON.parse(json)
    } catch (error) {
      throw new Error('反转义失败：输入不是有效的 JSON 字符串')
    }
  }

  /**
   * 获取 JSON 统计信息
   */
  static getStatistics(json: string): {
    size: number
    lines: number
    depth: number
    keys: number
    arrays: number
    objects: number
    strings: number
    numbers: number
    booleans: number
    nulls: number
  } {
    try {
      const obj = JSON.parse(json)
      const stats = {
        size: json.length,
        lines: json.split('\n').length,
        depth: 0,
        keys: 0,
        arrays: 0,
        objects: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0
      }

      const traverse = (value: any, currentDepth = 0) => {
        stats.depth = Math.max(stats.depth, currentDepth)

        if (Array.isArray(value)) {
          stats.arrays++
          value.forEach(item => traverse(item, currentDepth + 1))
        } else if (value && typeof value === 'object') {
          stats.objects++
          Object.keys(value).forEach(key => {
            stats.keys++
            traverse(value[key], currentDepth + 1)
          })
        } else if (typeof value === 'string') {
          stats.strings++
        } else if (typeof value === 'number') {
          stats.numbers++
        } else if (typeof value === 'boolean') {
          stats.booleans++
        } else if (value === null) {
          stats.nulls++
        }
      }

      traverse(obj)
      return stats
    } catch (error) {
      throw new Error('JSON 格式错误')
    }
  }
}

/**
 * 文本处理工具
 */
export class TextTool {
  /**
   * 统计文本信息
   */
  static getStatistics(text: string): {
    characters: number
    charactersNoSpaces: number
    words: number
    lines: number
    paragraphs: number
    bytes: number
  } {
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length,
      paragraphs: text.split('\n\n').filter(p => p.trim()).length,
      bytes: new Blob([text]).size
    }
  }

  /**
   * 大小写转换
   */
  static changeCase(text: string, type: 'upper' | 'lower' | 'title' | 'camel' | 'pascal' | 'snake' | 'kebab'): string {
    switch (type) {
      case 'upper':
        return text.toUpperCase()
      case 'lower':
        return text.toLowerCase()
      case 'title':
        return text.replace(/\w\S*/g, txt => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      case 'camel':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '')
      case 'pascal':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, word => 
          word.toUpperCase()
        ).replace(/\s+/g, '')
      case 'snake':
        return text.replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('_')
      case 'kebab':
        return text.replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('-')
      default:
        return text
    }
  }

  /**
   * 去重
   */
  static deduplicate(text: string, type: 'lines' | 'words'): string {
    if (type === 'lines') {
      const lines = text.split('\n')
      const uniqueLines = [...new Set(lines)]
      return uniqueLines.join('\n')
    } else {
      const words = text.split(/\s+/)
      const uniqueWords = [...new Set(words)]
      return uniqueWords.join(' ')
    }
  }

  /**
   * 排序
   */
  static sort(text: string, type: 'lines' | 'words', order: 'asc' | 'desc' = 'asc'): string {
    if (type === 'lines') {
      const lines = text.split('\n')
      lines.sort((a, b) => {
        const result = a.localeCompare(b)
        return order === 'asc' ? result : -result
      })
      return lines.join('\n')
    } else {
      const words = text.split(/\s+/)
      words.sort((a, b) => {
        const result = a.localeCompare(b)
        return order === 'asc' ? result : -result
      })
      return words.join(' ')
    }
  }

  /**
   * 查找替换
   */
  static findReplace(text: string, searchText: string, replaceText: string, options: {
    global?: boolean
    ignoreCase?: boolean
    regex?: boolean
  } = {}): string {
    const { global = true, ignoreCase = false, regex = false } = options

    if (regex) {
      const flags = (global ? 'g' : '') + (ignoreCase ? 'i' : '')
      const regExp = new RegExp(searchText, flags)
      return text.replace(regExp, replaceText)
    } else {
      if (global) {
        const regExp = new RegExp(
          searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          ignoreCase ? 'gi' : 'g'
        )
        return text.replace(regExp, replaceText)
      } else {
        const index = ignoreCase 
          ? text.toLowerCase().indexOf(searchText.toLowerCase())
          : text.indexOf(searchText)
        
        if (index === -1) return text
        
        return text.substring(0, index) + 
               replaceText + 
               text.substring(index + searchText.length)
      }
    }
  }

  /**
   * 清理文本
   */
  static clean(text: string, options: {
    removeSpaces?: boolean
    removeLineBreaks?: boolean
    removeSpecialChars?: boolean
    removePunctuation?: boolean
    removeNumbers?: boolean
  } = {}): string {
    let result = text

    if (options.removeSpaces) {
      result = result.replace(/\s+/g, '')
    }

    if (options.removeLineBreaks) {
      result = result.replace(/\r?\n|\r/g, '')
    }

    if (options.removeSpecialChars) {
      result = result.replace(/[^\w\s]/g, '')
    }

    if (options.removePunctuation) {
      result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    }

    if (options.removeNumbers) {
      result = result.replace(/\d/g, '')
    }

    return result
  }
}

/**
 * 随机生成工具
 */
export class RandomTool {
  /**
   * 生成随机字符串
   */
  static generateString(length: number, options: {
    includeUppercase?: boolean
    includeLowercase?: boolean
    includeNumbers?: boolean
    includeSymbols?: boolean
    excludeSimilar?: boolean
    customChars?: string
  } = {}): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = false,
      excludeSimilar = false,
      customChars
    } = options

    let charset = ''

    if (customChars) {
      charset = customChars
    } else {
      if (includeUppercase) {
        charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      }
      if (includeLowercase) {
        charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
      }
      if (includeNumbers) {
        charset += excludeSimilar ? '23456789' : '0123456789'
      }
      if (includeSymbols) {
        charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }
    }

    if (!charset) {
      throw new Error('请至少选择一种字符类型')
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return result
  }

  /**
   * 生成随机密码
   */
  static generatePassword(length: number = 12): string {
    return this.generateString(length, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true
    })
  }

  /**
   * 密码强度检测
   */
  static checkPasswordStrength(password: string): {
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []

    // 长度检查
    if (password.length >= 8) score += 1
    else suggestions.push('密码长度至少8位')

    if (password.length >= 12) score += 1
    else if (password.length >= 8) suggestions.push('建议密码长度12位以上')

    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1
    else suggestions.push('包含小写字母')

    if (/[A-Z]/.test(password)) score += 1
    else suggestions.push('包含大写字母')

    if (/[0-9]/.test(password)) score += 1
    else suggestions.push('包含数字')

    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    else suggestions.push('包含特殊字符')

    // 复杂度检查
    if (password.length >= 16) score += 1
    if (!/(.)\1{2,}/.test(password)) score += 1 // 没有连续重复字符

    let level: 'weak' | 'fair' | 'good' | 'strong'
    if (score <= 2) level = 'weak'
    else if (score <= 4) level = 'fair'
    else if (score <= 6) level = 'good'
    else level = 'strong'

    return { score, level, suggestions }
  }
}
