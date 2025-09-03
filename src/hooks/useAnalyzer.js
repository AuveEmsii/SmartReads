import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAppContext } from '../contexts/AppContext';

/**
 * AI分析Hook
 * 使用与Python版本完全一致的提示词模板，确保分析结果的一致性
 * 提示词来源：config.py -> _get_default_prompt_template()
 */
export const useAnalyzer = () => {
    const { addNotification } = useNotification();
    const { settings } = useAppContext();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 分析提示词模板（与Python版本完全一致）
    const getAnalysisPrompt = useCallback((content) => {
        return `# 角色
你是一位经验丰富的小说编辑和金牌剧情分析师。你擅长解构故事，洞察每一章节的功能、节奏和情感，并能将其转化为高度结构化的分析报告。

# 任务
我将提供一部小说的部分章节正文。你的任务是通读并深刻理解这些章节，然后逐章进行分析，最终输出一个单一、完整的Markdown格式的章节规划分析表。

# 表格结构与规则
输出的表格必须严格遵循以下8列结构和内容要求：

| 栏目 | 填写指南 |
| :--- | :--- |
| **1. 章节号** | **准确提取**章节标题中的数字（无论是阿拉伯数字还是中文数字），并统一转换为阿拉伯数字。**必须与原文的章节号保持一致**，例如，如果章节标题是"第五十一章"，则此列应填写"51"。 |
| **2. 章节标题** | 准确提取该章节的标题。 |
| **3. 章节核心剧情梗概** | **[摘要能力]** 用2-3句精炼地概括本章的核心事件。必须清晰地回答：**谁？做了什么？导致了什么？** |
| **4. 本章核心功能/目的** | **[分析能力]** 站在作者的角度，分析本章对整个故事的战略意义。例如：**引入核心冲突、塑造主角性格、制造关键误会、为后期剧情埋下伏笔、揭示世界观设定、推动感情线发展**等。 |
| **5. 画面感/镜头序列** | **[视觉化能力]** 想象本章的影视化改编。列出3-5个最关键、最具代表性的视觉画面或镜头。**必须使用JSON数组格式**，例如：\`["主角在雨中奔跑", "反派在暗处微笑的特写", "一个重要信物掉落在地"]\`。 |
| **6. 关键情节点 (Key Points)** | **[结构化能力]** 提炼出本章情节发展的几个关键节点，这些是驱动本章故事前进的骨架。**必须使用JSON数组格式**，例如：\`["主角接到一个神秘电话", "主角与盟友发生争执", "结尾处发现新的线索"]\`。 |
| **7. 本章氛围/情绪** | **[情感洞察能力]** 描述本章带给读者的主要情感体验或整体氛围。**必须使用JSON数组格式**，例如：\`["紧张悬疑", "温馨治愈", "悲伤压抑", "轻松幽默"]\`。 |
| **8. 结尾"钩子" (Hook)** | **[悬念设置能力]** 提炼出章节结尾留给读者的最大悬念、疑问或期待。是什么让读者迫不及待地想看下一章？ |

# 学习范例
为了确保你完全理解任务要求，请参考以下范例：

| 章节号 | 章节标题 | 章节核心剧情梗概 | 本章核心功能/目的 | 画面感/镜头序列 | 关键情节点 (Key Points) | 本章氛围/情绪 | 结尾"钩子" (Hook) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 重逢 | 女主角倪雾带女儿岁岁去医院看病，偶遇主治医生竟是七年前的前男友裴淮聿。他没认出改名换姓且变瘦的她。回家后，岁岁问给她看病的医生叔叔是不是爸爸。 | 引入男女主及核心人物（女儿），建立七年后再遇的核心戏剧冲突，抛出"他没认出她"和"女儿身世"两大悬念。 | \`["诊室门被推开", "裴淮聿戴着金丝眼镜抬头", "倪雾脸色煞白，匆忙戴上口罩", "过去与现在的裴淮聿形象重叠", "女儿仰头问妈妈：那是爸爸吗？"]\` | \`["倪雾与裴淮聿在诊室重逢。", "裴淮聿未认出已改名换姓的倪雾。", "裴淮聿从高中班长电话中听到旧名"程青渺"，情绪波动。", "女儿岁岁直接提问："医生叔叔是爸爸吗？""]\` | \`["震惊", "紧张", "心痛", "昔日回忆的苦涩", "悬念感"]\` | 女儿关于"爸爸"的惊人提问，直接将剧情推向第一个小高潮。 |

# 输出要求
请严格按照上述规则和范例，开始分析我接下来提供的正文，并生成完整的章节分析
**绝对禁止**在你的回答中包含任何Markdown表格之外的内容。
你的回答**必须**以 \`| 章节号 |\` 开头，并以表格的最后一行结束。
不要添加任何介绍、总结、解释或任何其他文字。

以下是小说正文：

${content}`;
    }, []);

    // 调用API进行分析
    const callAnalysisAPI = useCallback(async (content, onProgress) => {
        try {
            const response = await fetch(settings.baseUrl + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [
                        {
                            role: 'user',
                            content: getAnalysisPrompt(content)
                        }
                    ],
                    temperature: settings.temperature,
                    max_tokens: settings.maxTokens,
                    stream: true // 启用流式响应
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API调用失败: ${response.status} ${errorData.error?.message || response.statusText}`);
            }

            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                result += content;
                                // 调用进度回调
                                if (onProgress) {
                                    onProgress({ text: content });
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }

            return result;

        } catch (error) {
            throw new Error(`分析请求失败: ${error.message}`);
        }
    }, [settings, getAnalysisPrompt]);

    // 分析单个文件
    const analyzeSingleFile = useCallback(async (fileName, content, onProgress) => {
        try {
            if (!settings.apiKey) {
                throw new Error('请先在设置中配置API密钥');
            }

            if (!content || content.trim().length === 0) {
                throw new Error('文件内容为空，无法进行分析');
            }

            // 内容长度检查
            if (content.length < 100) {
                throw new Error('文件内容过短，建议至少100字符以上');
            }

            // 如果内容过长，截取前80%用于分析
            let analysisContent = content;
            if (content.length > settings.maxTokens * 3) { // 粗略估算token数
                analysisContent = content.substring(0, Math.floor(content.length * 0.8));
                if (onProgress) {
                    onProgress({ 
                        text: `\n⚠️ 注意：由于内容较长，将分析前80%的内容（约${Math.round(analysisContent.length/1000)}千字）\n\n` 
                    });
                }
            }

            // 调用API分析
            const result = await callAnalysisAPI(analysisContent, onProgress);

            if (!result || result.trim().length === 0) {
                throw new Error('API返回结果为空');
            }

            return result;

        } catch (error) {
            const errorMessage = `分析文件 ${fileName} 失败: ${error.message}`;
            if (onProgress) {
                onProgress({ error: errorMessage });
            }
            throw new Error(errorMessage);
        }
    }, [settings, callAnalysisAPI]);

    // 批量分析文件
    const analyzeMultipleFiles = useCallback(async (files, onProgress, onFileComplete) => {
        try {
            setIsAnalyzing(true);
            
            if (!files || files.length === 0) {
                throw new Error('没有文件需要分析');
            }

            if (!settings.apiKey) {
                throw new Error('请先在设置中配置API密钥');
            }

            const results = {};
            const totalFiles = files.length;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = file.name || `文件${i + 1}`;
                
                try {
                    // 更新整体进度
                    if (onProgress) {
                        onProgress({
                            fileIndex: i,
                            fileName,
                            totalFiles,
                            status: 'analyzing'
                        });
                    }

                    // 文件级别的进度回调
                    const fileProgressCallback = (data) => {
                        if (onProgress) {
                            onProgress({
                                fileIndex: i,
                                fileName,
                                totalFiles,
                                status: 'streaming',
                                data
                            });
                        }
                    };

                    // 分析单个文件
                    const result = await analyzeSingleFile(fileName, file.content, fileProgressCallback);
                    
                    results[fileName] = {
                        success: true,
                        result,
                        timestamp: Date.now()
                    };

                    // 文件完成回调
                    if (onFileComplete) {
                        onFileComplete(fileName, result, i + 1, totalFiles);
                    }

                    // 文件间添加延迟，避免API限制
                    if (i < files.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                } catch (error) {
                    results[fileName] = {
                        success: false,
                        error: error.message,
                        timestamp: Date.now()
                    };

                    if (onFileComplete) {
                        onFileComplete(fileName, null, i + 1, totalFiles, error.message);
                    }
                }
            }

            return results;

        } catch (error) {
            addNotification(`批量分析失败: ${error.message}`, 'error');
            throw error;
        } finally {
            setIsAnalyzing(false);
        }
    }, [settings, analyzeSingleFile, addNotification]);

    // 测试API连接，支持覆盖参数（未保存时使用控件值）
    const testAPIConnection = useCallback(async (overrides = {}) => {
        try {
            const apiKey = overrides.apiKey ?? settings.apiKey;
            const baseUrl = overrides.baseUrl ?? settings.baseUrl;
            if (!apiKey) throw new Error('请先配置API密钥');

            const response = await fetch(baseUrl + '/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (response.ok) {
                return { success: true, message: 'API连接成功' };
            } else {
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    message: `连接失败: ${response.status} ${errorData.error?.message || response.statusText}` 
                };
            }
        } catch (error) {
            return { success: false, message: `连接失败: ${error.message}` };
        }
    }, [settings]);

    return {
        isAnalyzing,
        analyzeSingleFile,
        analyzeMultipleFiles,
        testAPIConnection
    };
}; 