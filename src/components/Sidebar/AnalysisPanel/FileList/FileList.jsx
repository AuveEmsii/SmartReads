import React from 'react';
import styles from './FileList.module.css';
import { useAppContext } from '../../../../contexts/AppContext';
import Checkbox from '../../../common/Checkbox/Checkbox';

const FileList = () => {
    const { chapterFiles, toggleChapterSelection, selectAllFiles, deselectAllFiles } = useAppContext();

    const handleFileClick = (fileId) => {
        toggleChapterSelection(fileId);
    };

    // 计算选中状态
    const selectedCount = chapterFiles?.filter(file => file.selected).length || 0;
    const totalCount = chapterFiles?.length || 0;
    const allSelected = totalCount > 0 && selectedCount === totalCount;

    const handleSelectAll = (checked) => {
        if (checked) {
            selectAllFiles();
        } else {
            deselectAllFiles();
        }
    };

    return (
        <div className={styles.listSection}>
            <div className={styles.headerRow}>
                <label className={styles.label}>
                    章节文件: ({selectedCount}/{totalCount} 个已选中)
                </label>
                {totalCount > 0 && (
                    <Checkbox
                        checked={allSelected}
                        indeterminate={!allSelected && selectedCount > 0}
                        onChange={(ck) => handleSelectAll(ck)}
                        label={allSelected ? '全不选' : '全选'}
                        size="md"
                    />
                )}
            </div>
            <div className={styles.fileList}>
                {!chapterFiles || chapterFiles.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📁</div>
                        <p>暂无章节文件</p>
                        <p className={styles.emptyHint}>请先在预处理或上方"选择拆分结果"中加载文件</p>
                    </div>
                ) : (
                    chapterFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`${styles.fileItem} ${file.selected ? styles.selected : ''}`}
                            onClick={() => handleFileClick(file.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.fileIcon}>
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{file.name}</div>
                                <div className={styles.fileDetails}>
                                    <span className={styles.fileSize}>{Math.round(file.size / 1024)} KB</span>
                                    {file.chapters && (
                                        <span className={styles.chapterCount}>约 {file.chapters} 段</span>
                                    )}
                                    {file.source && (
                                        <span className={styles.fileSource}>
                                            {file.source === 'cache_split' ? '来自缓存' : (file.source === 'folder_upload' ? '文件夹' : '手动上传')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.selectIndicator}>
                                {file.selected && <i className="fas fa-check"></i>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileList; 