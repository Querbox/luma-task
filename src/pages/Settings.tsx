import React, { useRef, useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Shield, Download, Upload, Cloud, ChevronRight, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Settings.module.css';

export const Settings: React.FC = () => {
    const { exportTasks, importTasks } = useTasks();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPersistent, setIsPersistent] = useState<boolean | null>(null);
    const [importing, setImporting] = useState(false);
    const [exported, setExported] = useState(false);

    useEffect(() => {
        if (navigator.storage && navigator.storage.persisted) {
            navigator.storage.persisted().then(setIsPersistent);
        }
    }, []);

    const handleExport = async () => {
        const data = await exportTasks();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luma-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExported(true);
        setTimeout(() => setExported(false), 2000);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            try {
                await importTasks(content);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                console.error('Import failed', err);
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <header className={styles.header}>
                <h1 className={styles.title}>Einstellungen</h1>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Datenschutz & Speicher</h2>
                <div className={styles.card}>
                    <div className={styles.item}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: '#32D74B' }}>
                                <Shield size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Speicher-Persistenz</span>
                                <span className={styles.itemDescription}>
                                    {isPersistent
                                        ? 'Deine Daten sind geschützt.'
                                        : 'Daten könnten gelöscht werden.'}
                                </span>
                            </div>
                        </div>
                        {isPersistent && <span className={styles.status}>Ein</span>}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Backup</h2>
                <div className={styles.card}>
                    <button className={styles.item} onClick={handleExport}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: '#007AFF' }}>
                                {exported ? <Check size={18} /> : <Download size={18} />}
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Backup erstellen</span>
                            </div>
                        </div>
                        {exported ? <span className={styles.status} style={{ color: 'var(--color-accent)' }}>Gespeichert</span> : <ChevronRight size={18} color="var(--color-text-tertiary)" />}
                    </button>

                    <button className={styles.item} onClick={handleImportClick} disabled={importing}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: '#FF9F0A' }}>
                                <Upload size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Daten importieren</span>
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--color-text-tertiary)" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className={styles.hiddenInput}
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>System</h2>
                <div className={styles.card}>
                    <button className={styles.item} onClick={handleReload}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: '#8E8E93' }}>
                                <RefreshCw size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>App neu laden</span>
                                <span className={styles.itemDescription}>Erzwingt einen Neustart der Anwendung.</span>
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--color-text-tertiary)" />
                    </button>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Mehr</h2>
                <div className={styles.card}>
                    <div className={styles.item} style={{ opacity: 0.6 }}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: '#AF52DE' }}>
                                <Cloud size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Cloud Sync</span>
                                <span className={styles.itemDescription}>Coming soon...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.footer}>
                <p>Version 1.2.0 • Made with ❤️</p>
            </div>
        </motion.div>
    );
};
