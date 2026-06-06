#!/usr/bin/env node

/**
 * Multi-AI Planner - 自动规划和调度 Codex/Gemini 任务
 * 优先使用 Codex 和 Gemini，节省 Claude 额度
 */

const TASK_RULES = {
  backend: {
    ai: 'codex',
    model: 'gpt-5.3-codex',
    keywords: ['api', 'server', 'backend', 'database', 'model', 'controller', 'route', 'test', 'algorithm'],
    command: 'codex exec -m gpt-5.3-codex'
  },
  frontend: {
    ai: 'gemini',
    model: 'gemini-3-pro-preview',
    keywords: ['frontend', 'ui', 'component', 'react', 'vue', 'angular', 'css', 'tailwind', 'typescript', 'jsx', 'tsx'],
    command: 'gemini -m gemini-3-pro-preview -y -p'
  },
  documentation: {
    ai: 'gemini',
    model: 'gemini-3-pro-preview',
    keywords: ['readme', 'document', 'doc', 'guide', 'documentation'],
    command: 'gemini -m gemini-3-pro-preview -y -p'
  },
  architecture: {
    ai: 'codex',
    model: 'gpt-5.3-codex',
    keywords: ['architecture', 'design', 'structure', 'refactor'],
    command: 'codex exec -m gpt-5.3-codex'
  }
};

class MultiAIPlanner {
  constructor() {
    this.claudeUsageCount = 0;
    this.codexUsageCount = 0;
    this.geminiUsageCount = 0;
  }

  /**
   * 分析任务并确定应该使用哪个 AI
   */
  analyzeTask(taskDescription) {
    const desc = taskDescription.toLowerCase();

    // 检查每种任务类型的关键词
    for (const [taskType, config] of Object.entries(TASK_RULES)) {
      const matched = config.keywords.some(keyword => desc.includes(keyword));
      if (matched) {
        return {
          taskType,
          ai: config.ai,
          model: config.model,
          command: config.command
        };
      }
    }

    // 默认：如果无法确定，优先使用 Codex
    return {
      taskType: 'general',
      ai: 'codex',
      model: 'gpt-5.3-codex',
      command: 'codex exec -m gpt-5.3-codex'
    };
  }

  /**
   * 检查 AI 工具是否可用
   */
  async checkAvailability(ai) {
    const { execSync } = require('child_process');

    try {
      if (ai === 'codex') {
        execSync('codex --version', { stdio: 'pipe' });
        return { available: true, ai: 'codex' };
      } else if (ai === 'gemini') {
        execSync('gemini --version', { stdio: 'pipe' });
        return { available: true, ai: 'gemini' };
      }
    } catch (error) {
      return {
        available: false,
        ai,
        error: error.message,
        suggestions: this.getFixSuggestions(ai, error)
      };
    }
  }

  /**
   * 获取修复建议
   */
  getFixSuggestions(ai, error) {
    if (ai === 'codex') {
      return [
        '1. 检查 Codex CLI 是否已安装：npm list -g @openai/codex-cli',
        '2. 重新安装：npm install -g @openai/codex-cli',
        '3. 检查 API 密钥配置',
        '4. 验证网络连接'
      ];
    } else if (ai === 'gemini') {
      return [
        '1. 检查 Gemini CLI 是否已安装：npm list -g @google/gemini-cli',
        '2. 验证模型名称：使用 /model 命令查看可用模型',
        '3. 重新认证：gemini auth',
        '4. 检查 API 配额'
      ];
    }
    return [];
  }

  /**
   * 规划项目任务
   */
  planProject(projectDescription) {
    const tasks = this.extractTasks(projectDescription);
    const plan = {
      codexTasks: [],
      geminiTasks: [],
      integrationTasks: [],
      estimatedCost: {
        codex: 0,
        gemini: 0,
        claude: 0  // 应该总是 0
      }
    };

    tasks.forEach(task => {
      const analysis = this.analyzeTask(task);

      if (analysis.ai === 'codex') {
        plan.codexTasks.push({ task, ...analysis });
        plan.estimatedCost.codex++;
      } else if (analysis.ai === 'gemini') {
        plan.geminiTasks.push({ task, ...analysis });
        plan.estimatedCost.gemini++;
      }
    });

    return plan;
  }

  /**
   * 从项目描述中提取任务
   */
  extractTasks(description) {
    // 简单实现：按行分割或根据关键词分割
    const tasks = [];

    // 后端相关任务
    if (description.match(/后端|backend|api|server/i)) {
      tasks.push('设置后端服务器');
      tasks.push('创建数据模型');
      tasks.push('实现 API 端点');
      tasks.push('编写单元测试');
    }

    // 前端相关任务
    if (description.match(/前端|frontend|ui|界面|组件/i)) {
      tasks.push('创建前端项目');
      tasks.push('设计 UI 组件');
      tasks.push('实现状态管理');
      tasks.push('添加样式');
    }

    return tasks;
  }

  /**
   * 生成任务规划报告
   */
  generateReport(plan) {
    let report = '# 📋 多 AI 任务规划\n\n';

    report += '## 后端任务 → Codex (gpt-5.3-codex)\n';
    if (plan.codexTasks.length > 0) {
      plan.codexTasks.forEach((item, index) => {
        report += `${index + 1}. ${item.task}\n`;
      });
    } else {
      report += '无后端任务\n';
    }

    report += '\n## 前端任务 → Gemini (gemini-3-pro-preview)\n';
    if (plan.geminiTasks.length > 0) {
      plan.geminiTasks.forEach((item, index) => {
        report += `${index + 1}. ${item.task}\n`;
      });
    } else {
      report += '无前端任务\n';
    }

    report += '\n## 成本估算\n';
    report += `- Codex 调用：${plan.estimatedCost.codex} 次\n`;
    report += `- Gemini 调用：${plan.estimatedCost.gemini} 次\n`;
    report += `- Claude 调用：${plan.estimatedCost.claude} 次 `;
    report += plan.estimatedCost.claude === 0 ? '✅ (节省额度)\n' : '⚠️ (使用了 Claude 额度)\n';

    return report;
  }

  /**
   * 记录使用情况
   */
  logUsage(ai) {
    if (ai === 'codex') this.codexUsageCount++;
    else if (ai === 'gemini') this.geminiUsageCount++;
    else if (ai === 'claude') this.claudeUsageCount++;

    console.log(`\n📊 使用统计：`);
    console.log(`Codex: ${this.codexUsageCount} 次`);
    console.log(`Gemini: ${this.geminiUsageCount} 次`);
    console.log(`Claude: ${this.claudeUsageCount} 次 ${this.claudeUsageCount === 0 ? '✅' : '⚠️'}`);
  }
}

module.exports = MultiAIPlanner;

// CLI 使用示例
if (require.main === module) {
  const planner = new MultiAIPlanner();
  const args = process.argv.slice(2);

  if (args[0] === 'plan') {
    const projectDesc = args.slice(1).join(' ');
    const plan = planner.planProject(projectDesc);
    console.log(planner.generateReport(plan));
  } else if (args[0] === 'analyze') {
    const task = args.slice(1).join(' ');
    const result = planner.analyzeTask(task);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node multi-ai-planner.js plan <project-description>');
    console.log('  node multi-ai-planner.js analyze <task-description>');
  }
}
