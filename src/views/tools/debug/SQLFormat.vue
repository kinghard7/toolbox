<template>
  <ToolContainer title="SQL 格式化" description="SQL语句格式化和美化工具">
    <div class="sql-format-tool">
      <div class="tool-header">
        <div class="sql-type-selector">
          <el-radio-group v-model="selectedSQLType" @change="handleSQLTypeChange">
            <el-radio-button label="mysql">MySQL</el-radio-button>
            <el-radio-button label="postgresql">PostgreSQL</el-radio-button>
            <el-radio-button label="sqlserver">SQL Server</el-radio-button>
            <el-radio-button label="oracle">Oracle</el-radio-button>
            <el-radio-button label="generic">通用SQL</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="formatSQL" :disabled="!inputSQL.trim()">
            <el-icon><Document /></el-icon>
            格式化
          </el-button>
          <el-button @click="minifySQL" :disabled="!inputSQL.trim()">
            <el-icon><Delete /></el-icon>
            压缩
          </el-button>
          <el-button @click="clearSQL">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <div class="sql-editor-section">
        <div class="input-section">
          <div class="section-header">
            <h3>输入SQL</h3>
            <div class="input-actions">
              <el-button size="small" @click="pasteSQL">粘贴</el-button>
              <el-button size="small" @click="loadSampleSQL">加载示例</el-button>
            </div>
          </div>
          <el-input
            v-model="inputSQL"
            type="textarea"
            :rows="12"
            :placeholder="getPlaceholder()"
            class="sql-input"
          />
        </div>

        <div class="output-section">
          <div class="section-header">
            <h3>格式化结果</h3>
            <div class="output-actions">
              <el-button size="small" @click="copyOutput">复制</el-button>
              <el-button size="small" @click="downloadOutput">下载</el-button>
            </div>
          </div>
          <el-input
            v-model="outputSQL"
            type="textarea"
            :rows="12"
            readonly
            class="sql-output"
          />
        </div>
      </div>

      <div class="options-section">
        <el-card class="options-card">
          <template #header>
            <span>格式化选项</span>
          </template>
          
          <div class="options-grid">
            <div class="option-item">
              <el-checkbox v-model="options.uppercaseKeywords">关键字大写</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.indentWithSpaces">使用空格缩进</el-checkbox>
            </div>
            <div class="option-item">
              <el-input-number
                v-model="options.indentSize"
                :min="2"
                :max="8"
                size="small"
                label="缩进大小"
              />
              <span class="option-label">缩进大小</span>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.alignClauses">对齐子句</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.commaFirst">逗号前置</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.removeComments">移除注释</el-checkbox>
            </div>
          </div>
        </el-card>
      </div>

      <div class="analysis-section">
        <el-card class="analysis-card">
          <template #header>
            <span>SQL分析</span>
          </template>
          
          <div class="analysis-content">
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="analysis-label">语句类型:</span>
                <span class="analysis-value">{{ sqlAnalysis.type }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">表数量:</span>
                <span class="analysis-value">{{ sqlAnalysis.tableCount }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">字段数量:</span>
                <span class="analysis-value">{{ sqlAnalysis.columnCount }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">嵌套层级:</span>
                <span class="analysis-value">{{ sqlAnalysis.nestingLevel }}</span>
              </div>
            </div>
            
            <div class="tables-info" v-if="sqlAnalysis.tables.length > 0">
              <h4>涉及表:</h4>
              <div class="table-list">
                <el-tag
                  v-for="table in sqlAnalysis.tables"
                  :key="table"
                  size="small"
                  type="info"
                  class="table-tag"
                >
                  {{ table }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="stats-section">
        <el-card class="stats-card">
          <template #header>
            <span>统计信息</span>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">原始大小:</span>
              <span class="stat-value">{{ formatFileSize(inputSQL.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">处理后大小:</span>
              <span class="stat-value">{{ formatFileSize(outputSQL.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">压缩率:</span>
              <span class="stat-value">{{ compressionRatio }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">行数:</span>
              <span class="stat-value">{{ lineCount }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// SQL类型
type SQLType = 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' | 'generic'

// 格式化选项
interface FormatOptions {
  uppercaseKeywords: boolean
  indentWithSpaces: boolean
  indentSize: number
  alignClauses: boolean
  commaFirst: boolean
  removeComments: boolean
}

// SQL分析结果
interface SQLAnalysis {
  type: string
  tableCount: number
  columnCount: number
  nestingLevel: number
  tables: string[]
}

// 响应式数据
const selectedSQLType = ref<SQLType>('mysql')
const inputSQL = ref('')
const outputSQL = ref('')

const options = ref<FormatOptions>({
  uppercaseKeywords: true,
  indentWithSpaces: true,
  indentSize: 2,
  alignClauses: true,
  commaFirst: false,
  removeComments: false
})

// 计算属性
const compressionRatio = computed(() => {
  if (!inputSQL.value || !outputSQL.value) return 0
  const ratio = ((inputSQL.value.length - outputSQL.value.length) / inputSQL.value.length) * 100
  return Math.round(ratio)
})

const lineCount = computed(() => {
  return outputSQL.value ? outputSQL.value.split('\n').length : 0
})

const sqlAnalysis = computed<SQLAnalysis>(() => {
  return analyzeSQL(inputSQL.value)
})

// 方法
const getPlaceholder = () => {
  return '请输入要格式化的SQL语句...'
}

const handleSQLTypeChange = () => {
  // 切换SQL类型时清空输出
  outputSQL.value = ''
}

const formatSQL = () => {
  if (!inputSQL.value.trim()) {
    ElMessage.warning('请先输入SQL语句')
    return
  }

  try {
    outputSQL.value = formatSQLCode(inputSQL.value, options.value, selectedSQLType.value)
    ElMessage.success('SQL格式化完成')
  } catch (error) {
    ElMessage.error('SQL格式化失败：' + (error as Error).message)
  }
}

const minifySQL = () => {
  if (!inputSQL.value.trim()) {
    ElMessage.warning('请先输入SQL语句')
    return
  }

  try {
    outputSQL.value = minifySQLCode(inputSQL.value, options.value)
    ElMessage.success('SQL压缩完成')
  } catch (error) {
    ElMessage.error('SQL压缩失败：' + (error as Error).message)
  }
}

const clearSQL = () => {
  inputSQL.value = ''
  outputSQL.value = ''
}

const pasteSQL = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputSQL.value = text
    ElMessage.success('SQL已粘贴')
  } catch (error) {
    ElMessage.error('无法访问剪贴板')
  }
}

const copyOutput = async () => {
  if (!outputSQL.value) {
    ElMessage.warning('没有输出内容可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(outputSQL.value)
    ElMessage.success('SQL已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadOutput = () => {
  if (!outputSQL.value) {
    ElMessage.warning('没有输出内容可下载')
    return
  }

  const filename = 'formatted-sql.sql'
  const blob = new Blob([outputSQL.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const loadSampleSQL = () => {
  const samples = {
    mysql: `SELECT u.id, u.username, u.email, u.created_at, 
       COUNT(o.id) as order_count, 
       SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active' 
  AND u.created_at >= '2024-01-01'
  AND (u.email LIKE '%@gmail.com' OR u.email LIKE '%@yahoo.com')
GROUP BY u.id, u.username, u.email, u.created_at
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC, u.created_at ASC
LIMIT 100;`,
    postgresql: `WITH user_stats AS (
  SELECT 
    user_id,
    COUNT(*) as order_count,
    AVG(total_amount) as avg_order_value,
    SUM(total_amount) as total_spent
  FROM orders 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  u.id,
  u.username,
  u.email,
  us.order_count,
  us.avg_order_value,
  us.total_spent,
  CASE 
    WHEN us.total_spent > 1000 THEN 'VIP'
    WHEN us.total_spent > 500 THEN 'Premium'
    ELSE 'Regular'
  END as customer_tier
FROM users u
INNER JOIN user_stats us ON u.id = us.user_id
WHERE u.status = 'active'
ORDER BY us.total_spent DESC;`,
    sqlserver: `SELECT 
  p.ProductID,
  p.ProductName,
  p.UnitPrice,
  c.CategoryName,
  s.CompanyName as SupplierName,
  ISNULL(od.TotalQuantity, 0) as TotalSold,
  p.UnitPrice * ISNULL(od.TotalQuantity, 0) as TotalRevenue
FROM Products p
INNER JOIN Categories c ON p.CategoryID = c.CategoryID
INNER JOIN Suppliers s ON p.SupplierID = s.SupplierID
LEFT JOIN (
  SELECT 
    ProductID, 
    SUM(Quantity) as TotalQuantity
  FROM [Order Details]
  GROUP BY ProductID
) od ON p.ProductID = od.ProductID
WHERE p.Discontinued = 0
  AND p.UnitPrice BETWEEN 10 AND 100
ORDER BY TotalRevenue DESC;`,
    oracle: `SELECT 
  e.employee_id,
  e.first_name || ' ' || e.last_name as full_name,
  e.salary,
  d.department_name,
  m.first_name || ' ' || m.last_name as manager_name,
  ROUND(MONTHS_BETWEEN(SYSDATE, e.hire_date)) as months_employed,
  CASE 
    WHEN e.salary > 8000 THEN 'High'
    WHEN e.salary > 5000 THEN 'Medium'
    ELSE 'Low'
  END as salary_level
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id
LEFT JOIN employees m ON e.manager_id = m.employee_id
WHERE e.hire_date >= TO_DATE('2020-01-01', 'YYYY-MM-DD')
  AND e.salary > (
    SELECT AVG(salary) 
    FROM employees 
    WHERE department_id = e.department_id
  )
ORDER BY e.salary DESC, e.hire_date ASC;`,
    generic: `SELECT 
  t1.id,
  t1.name,
  t1.created_date,
  COUNT(t2.id) as related_count,
  AVG(t2.value) as avg_value
FROM table1 t1
LEFT JOIN table2 t2 ON t1.id = t2.table1_id
WHERE t1.status = 'active'
  AND t1.created_date >= '2024-01-01'
  AND t1.name LIKE '%test%'
GROUP BY t1.id, t1.name, t1.created_date
HAVING COUNT(t2.id) > 0
ORDER BY t1.created_date DESC, related_count DESC;`
  }
  
  inputSQL.value = samples[selectedSQLType.value]
  ElMessage.success('示例SQL已加载')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// SQL分析函数
const analyzeSQL = (sql: string): SQLAnalysis => {
  if (!sql.trim()) {
    return {
      type: '未知',
      tableCount: 0,
      columnCount: 0,
      nestingLevel: 0,
      tables: []
    }
  }

  const upperSQL = sql.toUpperCase()
  let type = 'SELECT'
  
  if (upperSQL.includes('INSERT INTO')) type = 'INSERT'
  else if (upperSQL.includes('UPDATE')) type = 'UPDATE'
  else if (upperSQL.includes('DELETE FROM')) type = 'DELETE'
  else if (upperSQL.includes('CREATE TABLE')) type = 'CREATE'
  else if (upperSQL.includes('ALTER TABLE')) type = 'ALTER'
  else if (upperSQL.includes('DROP TABLE')) type = 'DROP'

  // 简单的表名提取（实际项目中需要更复杂的解析）
  const tableMatches = sql.match(/(?:FROM|JOIN|UPDATE|INSERT INTO|DELETE FROM)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi) || []
  const tables = [...new Set(tableMatches.map(match => {
    const parts = match.split(/\s+/)
    return parts[parts.length - 1]
  }))]

  // 简单的字段提取
  const columnMatches = sql.match(/(?:SELECT|INSERT INTO|UPDATE)\s+([^FROM|WHERE|GROUP|ORDER|LIMIT]+)/gi) || []
  let columnCount = 0
  columnMatches.forEach(match => {
    const columns = match.replace(/(?:SELECT|INSERT INTO|UPDATE)\s+/i, '').split(',').length
    columnCount += columns
  })

  // 嵌套层级（通过括号数量估算）
  const openParens = (sql.match(/\(/g) || []).length
  const closeParens = (sql.match(/\)/g) || []).length
  const nestingLevel = Math.max(openParens, closeParens)

  return {
    type,
    tableCount: tables.length,
    columnCount,
    nestingLevel,
    tables
  }
}

// SQL格式化函数
const formatSQLCode = (sql: string, options: FormatOptions, sqlType: SQLType): string => {
  let formatted = sql.trim()

  // 移除注释
  if (options.removeComments) {
    formatted = formatted.replace(/--.*$/gm, '') // 单行注释
    formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释
  }

  // 关键字大写
  if (options.uppercaseKeywords) {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
      'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'INSERT', 'UPDATE', 'DELETE',
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'PROCEDURE',
      'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA', 'CASCADE', 'RESTRICT',
      'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'NOT NULL', 'DEFAULT',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'ON', 'AND', 'OR',
      'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'
    ]
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword)
    })
  }

  // 添加换行和缩进
  formatted = formatted
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',\n')
    .replace(/\s*(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|GROUP BY|ORDER BY|HAVING|UNION|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\s+/gi, '\n$1 ')
    .replace(/\s*(AND|OR)\s+/gi, '\n$1 ')
    .replace(/\s*(\()/g, '\n$1')
    .replace(/\s*(\))/g, '$1\n')

  // 处理缩进
  const lines = formatted.split('\n')
  let indentLevel = 0
  const indent = options.indentWithSpaces ? ' '.repeat(options.indentSize) : '\t'
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    // 调整缩进级别
    if (trimmed.includes('(')) indentLevel++
    if (trimmed.includes(')')) indentLevel = Math.max(0, indentLevel - 1)
    
    const currentIndent = indent.repeat(Math.max(0, indentLevel))
    return currentIndent + trimmed
  })

  return formattedLines.filter(line => line !== '').join('\n')
}

// SQL压缩函数
const minifySQLCode = (sql: string, options: FormatOptions): string => {
  let minified = sql.trim()

  // 移除注释
  if (options.removeComments) {
    minified = minified.replace(/--.*$/gm, '')
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')
  }

  // 压缩空白字符
  minified = minified
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*=\s*/g, '=')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*<\s*/g, '<')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .trim()

  return minified
}
</script>

<style scoped lang="scss">
.sql-format-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .sql-type-selector {
      .el-radio-group {
        .el-radio-button__inner {
          padding: 8px 16px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;

      .el-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  .sql-editor-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .input-section,
    .output-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        h3 {
          margin: 0;
          color: #333;
        }

        .input-actions,
        .output-actions {
          display: flex;
          gap: 0.5rem;
        }
      }

      .sql-input,
      .sql-output {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;

        :deep(.el-textarea__inner) {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          padding: 1rem;
          border-radius: 8px;
        }
      }

      .sql-output {
        :deep(.el-textarea__inner) {
          background-color: #f8f9fa;
          color: #666;
        }
      }
    }
  }

  .options-section {
    margin-bottom: 1.5rem;

    .options-card {
      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: center;

        .option-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .option-label {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }

  .analysis-section {
    margin-bottom: 1.5rem;

    .analysis-card {
      .analysis-content {
        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;

          .analysis-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background-color: #f8f9fa;
            border-radius: 4px;

            .analysis-label {
              font-size: 14px;
              color: #666;
            }

            .analysis-value {
              font-weight: 600;
              color: #67c23a;
            }
          }
        }

        .tables-info {
          h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 16px;
          }

          .table-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;

            .table-tag {
              margin: 0;
            }
          }
        }
      }
    }
  }

  .stats-section {
    .stats-card {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 4px;

          .stat-label {
            font-size: 14px;
            color: #666;
          }

          .stat-value {
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
