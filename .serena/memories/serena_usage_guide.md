# Serena工具使用指南

## 🎯 核心原则
**所有项目任务必须优先使用serena工具完成，禁止绕过serena使用其他工具**
**开始新任务前必须全面检查上一个任务是否完成，这是绝对不可违反的准则**

## 📋 必须使用的Serena工具清单

### 任务分析和规划
- `mcp_serena_think_about_task_adherence` - 确认任务理解和执行方向
- `mcp_serena_read_memory` - 读取项目相关内存文件
- `mcp_serena_list_memories` - 查看可用的内存文件

### 代码分析和探索
- `mcp_serena_list_dir` - 查看项目目录结构
- `mcp_serena_find_file` - 查找特定文件
- `mcp_serena_get_symbols_overview` - 获取文件符号概览
- `mcp_serena_find_symbol` - 查找特定符号
- `mcp_serena_find_referencing_symbols` - 查找符号引用
- `mcp_serena_search_for_pattern` - 搜索代码模式

### 代码修改和创建
- `mcp_serena_replace_symbol_body` - 替换符号内容
- `mcp_serena_insert_after_symbol` - 在符号后插入代码
- `mcp_serena_insert_before_symbol` - 在符号前插入代码
- `mcp_serena_replace_regex` - 使用正则表达式替换

### 任务完成和记录
- `mcp_serena_think_about_collected_information` - 分析收集的信息
- `mcp_serena_think_about_whether_you_are_done` - 确认任务完成
- `mcp_serena_write_memory` - 记录任务完成情况

## 🔄 标准工作流程

### -1. 开始新任务前的强制检查（绝对必须执行）
```
🚨 这是最重要的步骤，绝对不能跳过！

1. mcp_serena_search_for_pattern (tasks.md)
   - 搜索上一个任务的状态：- \[x\] 任务名称
   - 确认上一个任务已标记为完成

2. mcp_serena_list_memories
   - 查看是否有上一个任务的完成记录

3. mcp_serena_read_memory (上一个任务的内存记录)
   - 读取上一个任务应该完成的内容
   - 了解需要检查的文件和功能

4. mcp_serena_find_file (上一个任务的关键文件)
   - 验证上一个任务创建的文件是否存在
   - 检查文件是否在正确位置

5. mcp_serena_get_symbols_overview (关键文件)
   - 检查关键符号是否已实现
   - 验证代码结构是否正确

6. mcp_serena_find_symbol (核心功能)
   - 检查核心功能的具体实现
   - 确认功能完整性

7. 如发现问题：
   - 立即停止，不得开始新任务
   - 使用serena工具补完缺失功能
   - 重新进行完整性检查
   - 更新任务状态和内存记录

8. mcp_serena_write_memory (检查结果记录)
   - 记录检查过程和结果
   - 确认可以安全开始新任务
```

### 1. 任务开始阶段
```
1. mcp_serena_think_about_task_adherence
   - 确认对任务的理解是否正确
   - 检查是否需要额外信息

2. mcp_serena_list_memories
   - 查看可用的内存文件

3. mcp_serena_read_memory (相关内存文件)
   - 读取项目规范、代码风格等

4. mcp_serena_list_dir (项目根目录)
   - 了解项目整体结构
```

### 2. 代码分析阶段
```
1. mcp_serena_find_file (查找相关文件)
   - 定位需要修改或参考的文件

2. mcp_serena_get_symbols_overview (目标文件)
   - 了解文件的符号结构

3. mcp_serena_find_symbol (特定符号)
   - 获取需要修改的符号详情

4. mcp_serena_find_referencing_symbols (如需要)
   - 了解符号的使用情况
```

### 3. 代码实现阶段
```
1. mcp_serena_replace_symbol_body (修改现有代码)
   - 替换函数、组件的实现

2. mcp_serena_insert_after_symbol (添加新代码)
   - 在现有符号后添加新功能

3. mcp_serena_insert_before_symbol (添加导入等)
   - 在现有符号前添加必要代码

4. mcp_serena_replace_regex (批量替换)
   - 使用正则表达式进行批量修改
```

### 4. 验证和完成阶段
```
1. mcp_serena_think_about_collected_information
   - 确认收集的信息是否充分
   - 验证实现是否完整

2. mcp_serena_search_for_pattern (验证修改)
   - 搜索相关模式确认修改正确

3. mcp_serena_think_about_whether_you_are_done
   - 最终确认任务完成

4. mcp_serena_write_memory (记录完成情况)
   - 记录任务完成的详细信息
   - 为下一个任务的检查做准备
```

## ⚠️ 常见错误和解决方案

### 错误1：跳过上一个任务检查
**错误做法**：直接开始新任务而不检查上一个任务
**正确做法**：严格按照-1步骤检查上一个任务完成情况
**后果**：这是最严重的违规，会导致项目不一致

### 错误2：绕过serena使用其他工具
**错误做法**：直接使用 `fsWrite`, `strReplace` 等工具
**正确做法**：使用 `mcp_serena_replace_symbol_body`, `mcp_serena_insert_after_symbol` 等

### 错误3：不使用serena分析代码
**错误做法**：直接修改代码而不了解现有结构
**正确做法**：先使用 `mcp_serena_get_symbols_overview`, `mcp_serena_find_symbol` 分析

### 错误4：不记录任务完成情况
**错误做法**：完成任务后直接结束
**正确做法**：使用 `mcp_serena_write_memory` 记录完成情况

### 错误5：遇到serena问题就放弃
**错误做法**：serena报错就切换到其他工具
**正确做法**：分析错误原因，调整参数重试

## 🛠️ Serena工具使用技巧

### 上一个任务检查技巧
- 使用精确的正则表达式搜索任务状态：`- \[x\] \d+\.`
- 检查内存文件时注意文件命名规律：`task_\d+_.*_completion`
- 验证文件存在时使用通配符：`*.tsx`, `*.ts`
- 检查符号时使用 `include_body: true` 获取完整内容

### 文件路径
- 始终使用相对路径（如 `src/components/Button.tsx`）
- 不要使用绝对路径

### 符号查找
- 使用精确的符号名称
- 可以使用 `substring_matching: true` 进行模糊匹配
- 使用 `depth` 参数获取子符号

### 代码替换
- 使用 `include_body: true` 获取完整的符号内容
- 替换时保持正确的缩进和格式
- 注意TypeScript类型定义

### 内存管理
- 为每个重要任务创建内存记录
- 使用描述性的内存文件名
- 定期更新项目相关的内存文件

## 📝 任务完成检查清单

每个任务完成时必须确认：

- [ ] **🔍 已检查上一个任务完成情况**（最重要）
- [ ] 全程使用serena工具
- [ ] 使用 `mcp_serena_think_about_task_adherence` 确认任务理解
- [ ] 使用 `mcp_serena_get_symbols_overview` 分析代码结构
- [ ] 使用适当的serena工具进行代码修改
- [ ] 使用 `mcp_serena_think_about_collected_information` 验证信息
- [ ] 使用 `mcp_serena_think_about_whether_you_are_done` 确认完成
- [ ] 使用 `mcp_serena_write_memory` 记录任务完成情况

## 🚫 禁止行为

1. **🚨 禁止跳过上一个任务检查**：这是最严重的违规行为
2. **禁止绕过serena**：不得因为serena报错就切换到其他工具
3. **禁止跳过分析**：不得不分析现有代码就直接修改
4. **禁止不记录**：不得完成任务后不记录完成情况
5. **禁止盲目修改**：不得不了解符号引用就修改代码

## 💡 最佳实践

1. **严格按顺序执行**：绝不跳过上一个任务检查
2. **始终从分析开始**：先了解现有代码结构再进行修改
3. **逐步验证**：每个修改步骤后都验证结果
4. **详细记录**：记录任务完成的详细过程和结果
5. **保持一致性**：遵循项目的代码风格和架构模式

## 🔄 上一个任务检查的详细流程

### 检查任务状态
```bash
# 搜索任务状态
mcp_serena_search_for_pattern
- relative_path: .kiro/specs/web3-defi-vocab-battle/tasks.md
- substring_pattern: "- \[x\] \d+\."
- 确认上一个任务已标记完成
```

### 检查内存记录
```bash
# 查看内存文件
mcp_serena_list_memories
# 读取上一个任务的记录
mcp_serena_read_memory
- memory_file_name: task_N_*_completion
```

### 验证代码实现
```bash
# 检查文件是否存在
mcp_serena_find_file
- relative_path: src
- file_mask: "*.tsx"

# 检查符号是否实现
mcp_serena_get_symbols_overview
- relative_path: src/components/...

# 验证核心功能
mcp_serena_find_symbol
- name_path: "ComponentName"
- include_body: true
```

### 记录检查结果
```bash
# 记录检查过程
mcp_serena_write_memory
- memory_name: task_N_completion_check
- content: 详细的检查结果和发现的问题
```

遵循这个更新的指南，确保每个任务都建立在前一个任务的坚实基础上，绝不允许跳过任何检查步骤！