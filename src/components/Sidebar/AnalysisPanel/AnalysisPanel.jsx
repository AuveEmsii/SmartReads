import React, { useState, useEffect } from 'react';
import styles from './AnalysisPanel.module.css';
import FileInput from '../../common/FileInput/FileInput';
import FileList from './FileList/FileList';
import QueueList from './QueueList/QueueList';
import Button from '../../common/Button/Button';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import { useAppContext } from '../../../contexts/AppContext';
import { useOptimizedNotifications } from '../../../hooks/useOptimizedNotifications';
import { useAnalyzer } from '../../../hooks/useAnalyzer';
import { useCache } from '../../../contexts/CacheContext';
import { useFileHandler } from '../../../hooks/useFileHandler';
import { FaPlus, FaTrash, FaPlay, FaStop, FaFolder, FaDatabase, FaFileUpload, FaBroom, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AnalysisPanel = () => {
    const { 
        chapterFiles, 
        analysisQueue, 
        addToQueue, 
        clearQueue, 
        loadChapterFiles,
        analysisResults,
        analysisProgress,
        updateAnalysisResult,
        clearAnalysisResults,
        updateAnalysisProgress,
        startAnalysis,
        completeAnalysis
    } = useAppContext();
    const { 
        notifyFileSelected,
        notifyAnalysisProgress,
        notifySuccess,
        notifyError,
        notifyWarning
    } = useOptimizedNotifications();
    
    const { isAnalyzing, analyzeMultipleFiles } = useAnalyzer();
    const { getAllCachedSplitResults } = useCache();
    const { selectFolder, readTextFile } = useFileHandler();
    
    const [folderPath, setFolderPath] = useState('');
    const [activeCacheKey, setActiveCacheKey] = useState('');
    const [isStopping, setIsStopping] = useState(false);
    
    // 页面级分析结果缓存（不持久化）
    const [pageAnalysisCache, setPageAnalysisCache] = useState({});
    
    // 数据源选择：'folder' 或 'cache'
    const [dataSource, setDataSource] = useState('folder');
    
    // 调试信息展开/折叠状态 - 默认折叠
    const [isDebugExpanded, setIsDebugExpanded] = useState(false);
    
    const availableCacheResults = getAllCachedSplitResults();
    const hasAvailableCache = availableCacheResults.length > 0;

    useEffect(() => {
        if (hasAvailableCache && dataSource === 'folder') setDataSource('cache');
    }, [hasAvailableCache]);

    const handleSelectFolder = async () => {
        try {
            const files = await selectFolder();
            const textFiles = files.filter(file => file.name.endsWith('.txt') || file.type === 'text/plain');
            if (textFiles.length === 0) {
                notifyError('文件夹选择', '所选文件夹中没有找到文本文件');
                return;
            }
            const folderName = textFiles[0].webkitRelativePath?.split('/')[0] || '已选择的文件夹';
            setFolderPath(folderName);
            const formattedFiles = [];
            for (let i = 0; i < textFiles.length; i++) {
                const file = textFiles[i];
                try {
                    const content = await readTextFile(file);
                    formattedFiles.push({
                        id: `folder_${i}_${Date.now()}`,
                        name: file.name,
                        content,
                        selected: false,
                        source: 'folder_upload',
                        size: content.length,
                        chapters: content.split('\n\n').filter(line => line.trim()).length
                    });
                } catch (error) { console.warn(`读取文件 ${file.name} 失败:`, error); }
            }
            loadChapterFiles(formattedFiles, true);
            notifySuccess('文件夹选择', `已加载 ${formattedFiles.length} 个文本文件，已自动选中前3个`);
        } catch (error) {
            if (error.message !== '用户取消选择') notifyError('文件夹选择', error.message);
        }
    };

    const handleUseCacheResults = (cacheKey) => {
        const cacheResult = availableCacheResults.find(result => result.key === cacheKey);
        if (!cacheResult) { notifyError('缓存选择', '缓存结果不存在'); return; }
        setActiveCacheKey(cacheKey);
        const formattedFiles = cacheResult.result.map((file, index) => ({
            id: `cache_${cacheKey}_${index}_${Date.now()}`,
            name: file.name,
            content: file.content,
            selected: true,
            source: 'cache_split',
            size: file.content.length,
            chapters: file.content.split('\n\n').filter(line => line.trim()).length
        }));
        loadChapterFiles(formattedFiles);
        const fileInfo = cacheResult.file.name;
        const settingsInfo = `${cacheResult.settings.groupSize}章/组`;
        setFolderPath(`缓存结果: ${fileInfo} (${settingsInfo})`);
        // 滚动到顶部以便用户看到新加载的文件
        requestAnimationFrame(() => {
            const panelContainer = document.querySelector(`.${styles.panelContainer}`);
            if (panelContainer) panelContainer.scrollTop = 0;
        });
        notifySuccess('缓存导入', `已加载 ${formattedFiles.length} 个章节文件并默认选中`);
    };

    const handleClearQueue = () => {
        if (analysisQueue.length === 0) { notifyWarning('分析队列已为空'); return; }
        clearQueue();
        notifySuccess('清空队列', '分析队列已清空');
    };

    const handleClearResults = () => {
        clearAnalysisResults();
        setPageAnalysisCache({});
        notifySuccess('清空结果', '分析结果和页面缓存已清空');
    };

    const handleStartAnalysis = async () => {
        if (analysisQueue.length === 0) { 
            notifyWarning('分析队列为空，请先添加文件到分析队列'); 
            return; 
        }
        
        try {
            setIsStopping(false);
            
            // 检查页面缓存
            const filesToAnalyze = [];
            const cachedResults = {};
            for (const file of analysisQueue) {
                const cached = pageAnalysisCache[file.name];
                if (cached) {
                    cachedResults[file.name] = cached;
                } else {
                    filesToAnalyze.push(file);
                }
            }

            // 开始分析流程
            startAnalysis(analysisQueue.length);
            
            // 先显示缓存结果
            if (Object.keys(cachedResults).length > 0) {
                Object.entries(cachedResults).forEach(([fileName, content]) => {
                    updateAnalysisResult(fileName, content, true, false);
                });
                notifySuccess('页面缓存命中', `${Object.keys(cachedResults).length} 个文件使用页面缓存结果`);
            }

            // 如果所有文件都有缓存，直接完成
            if (filesToAnalyze.length === 0) {
                completeAnalysis();
                notifySuccess('分析完成', '所有结果均来自页面缓存');
                return;
            }

            // 分析进度回调
            const onProgress = (progressData) => {
                if (isStopping) return;
                
                if (progressData.status === 'analyzing') {
                    updateAnalysisProgress({
                        currentFile: progressData.fileName,
                        progress: (progressData.fileIndex / progressData.totalFiles) * 100,
                        completedFiles: progressData.fileIndex
                    });
                    notifyAnalysisProgress(progressData.fileIndex + 1, progressData.totalFiles, progressData.fileName);
                } else if (progressData.status === 'streaming' && progressData.data) {
                    const fileName = progressData.fileName;
                    if (progressData.data.text) {
                        // 实时更新流式内容
                        const currentResult = analysisResults[fileName];
                        const newContent = (currentResult?.content || '') + progressData.data.text;
                        updateAnalysisResult(fileName, newContent, false, false);
                    }
                }
            };

            // 文件完成回调
            const onFileComplete = (fileName, result, currentIndex, totalFiles, error) => {
                if (isStopping) return;
                
                if (error) {
                    updateAnalysisResult(fileName, `分析失败: ${error}`, true, true);
                } else {
                    updateAnalysisResult(fileName, result, true, false);
                    // 保存到页面缓存
                    setPageAnalysisCache(prev => ({ ...prev, [fileName]: result }));
                }
                
                updateAnalysisProgress({
                    completedFiles: currentIndex,
                    progress: (currentIndex / totalFiles) * 100
                });
            };

            // 执行分析
            await analyzeMultipleFiles(filesToAnalyze, onProgress, onFileComplete);
            
            if (!isStopping) {
                completeAnalysis();
                notifySuccess('分析完成', `成功分析 ${filesToAnalyze.length} 个文件`);
            }
        } catch (error) {
            updateAnalysisProgress({
                isAnalyzing: false,
                progress: 0,
                currentFile: ''
            });
            notifyError('分析', error.message);
        }
    };

    const handleStop = () => {
        if (!analysisProgress.isAnalyzing) return;
        setIsStopping(true);
        updateAnalysisProgress({ isAnalyzing: false });
        notifyWarning('分析已请求停止');
    };

    const handleAddToQueue = () => {
        const selectedFiles = chapterFiles.filter(file => file.selected);
        if (selectedFiles.length === 0) { notifyWarning('请先选择要添加的文件'); return; }
        addToQueue();
        notifySuccess('添加到队列', `已添加 ${selectedFiles.length} 个文件`);
    };

    // 调试信息（原始输出）
    const getDebugText = () => {
        const entries = Object.entries(analysisResults);
        if (entries.length === 0) return '';
        return entries.map(([fileName, data]) => `\n\n===== ${fileName} ${data.error ? '❌ 失败' : (data.isComplete ? '✅ 完成' : '🔄 流式中')} =====\n\n${data.content}`).join('\n\n');
    };

    return (
        <div className={styles.panelContainer}>
            {/* 数据源选择 同上省略 */}
            <div className={styles.sourceSelector}>
                <h4>选择数据源</h4>
                <div className={styles.sourceOptions}>
                    <div className={`${styles.sourceOption} ${dataSource === 'folder' ? styles.active : ''}`} onClick={() => setDataSource('folder')}>
                        <FaFileUpload className={styles.icon} />
                        <div className={styles.label}>文件夹上传</div>
                        <div className={styles.description}>选择包含章节文件的文件夹</div>
                    </div>
                    <div className={`${styles.sourceOption} ${dataSource === 'cache' ? styles.active : ''} ${!hasAvailableCache ? styles.disabled : ''}`} onClick={() => hasAvailableCache && setDataSource('cache')}>
                        <FaDatabase className={styles.icon} />
                        <div className={styles.label}>使用拆分结果</div>
                        <div className={styles.description}>{hasAvailableCache ? `${availableCacheResults.length}个可用结果` : '无可用拆分结果'}</div>
                    </div>
                </div>
            </div>

            {dataSource === 'folder' && (
                <div className={styles.folderSection}>
                    <FileInput label="章节文件夹:" placeholder="选择包含章节文件的文件夹..." value={folderPath} onBrowse={handleSelectFolder} icon={<FaFolder />} buttonText="选择文件夹" readOnly />
                </div>
            )}

            {dataSource === 'cache' && hasAvailableCache && (
                <div className={styles.cacheSelector}>
                    <h4>选择拆分结果</h4>
                    {availableCacheResults.map((cacheResult) => (
                        <div key={cacheResult.key} className={`${styles.cacheOption} ${activeCacheKey === cacheResult.key ? styles.active : ''}`} onClick={() => handleUseCacheResults(cacheResult.key)}>
                            <div className={styles.cacheInfo}>
                                <div className={styles.fileName}>{cacheResult.file.name}</div>
                                <div className={styles.cacheDetails}>
                                    <span>{cacheResult.settings.groupSize}章/组</span>
                                    <span>{cacheResult.result.length}个文件</span>
                                    <span>{new Date(cacheResult.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 章节文件列表 */}
            <div className={styles.fileListSection}>
                <FileList />
            </div>

            {/* 分析队列 */}
            <div className={styles.queueSection}>
                <QueueList />
            </div>

            {/* 操作按钮：第一行添加/清空/开始/停止 */}
            <div className={styles.buttonGroup}>
                <Button icon={<FaPlus />} label="添加到队列" onClick={handleAddToQueue} disabled={analysisProgress.isAnalyzing} />
                <Button icon={<FaTrash />} label="清空队列" onClick={handleClearQueue} variant="secondary" disabled={analysisProgress.isAnalyzing} />
                <Button icon={<FaPlay />} label={analysisProgress.isAnalyzing ? '分析中...' : '开始分析'} onClick={handleStartAnalysis} variant="primary" disabled={analysisProgress.isAnalyzing || analysisQueue.length === 0} />
                <Button icon={<FaStop />} label="停止分析" onClick={handleStop} variant="secondary" disabled={!analysisProgress.isAnalyzing} />
            </div>
            
            {/* 第二行：清空结果按钮 */}
            {Object.keys(analysisResults).length > 0 && (
                <div className={styles.buttonGroup} style={{ marginTop: 'var(--spacing-sm)' }}>
                    <Button icon={<FaBroom />} label="清空结果" onClick={handleClearResults} variant="secondary" disabled={analysisProgress.isAnalyzing} />
                </div>
            )}

            {/* 进度显示 */}
            <div className={styles.progressSection}>
                <div className={styles.progressText}>
                    {analysisProgress.isAnalyzing 
                        ? (analysisProgress.currentFile 
                            ? `正在分析: ${analysisProgress.currentFile} (${analysisProgress.completedFiles}/${analysisProgress.totalFiles})`
                            : '正在准备分析...'
                        ) 
                        : (analysisProgress.progress === 100 ? '分析完成' : '等待开始分析')
                    }
                </div>
                <div className={styles.progressContainer}>
                    <ProgressBar percentage={analysisProgress.progress} />
                </div>
            </div>

            {/* 调试信息（原始输出） - 始终显示，但内容根据状态变化 */}
            <div className={styles.resultsPreview}>
                <div 
                    className={styles.debugHeader} 
                    onClick={() => setIsDebugExpanded(!isDebugExpanded)}
                >
                    <h4>调试信息（模型原始输出）</h4>
                    <div className={styles.toggleIcon}>
                        {isDebugExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                </div>
                {isDebugExpanded && (
                    <div className={styles.resultsText}>
                        {Object.keys(analysisResults).length > 0 
                            ? getDebugText() 
                            : (
                                <div className={styles.placeholderText}>
                                    <p>暂无分析结果，请先开始分析以查看调试信息。</p>
                                    <p>调试信息将显示：</p>
                                    <ul>
                                        <li>• 模型的原始输出内容</li>
                                        <li>• 分析过程中的实时流式数据</li>
                                        <li>• 每个文件的处理状态和结果</li>
                                    </ul>
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisPanel; 