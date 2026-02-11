import React, { useRef, useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Shield, Download, Upload, Cloud, Info, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <header className={styles.header}>
                <h1 className={styles.title}>Einstellungen</h1>
                <p className={styles.subtitle}>Verwalte deine Daten und Sicherheit</p>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Datenschutz & Speicher</h2>
                <div className={styles.card}>
                    <div className={styles.item}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: 'var(--color-success)' }}>
                                <Shield size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Speicher-Persistenz</span>
                                <span className={styles.itemDescription}>
                                    {isPersistent
                                        ? 'Dein Browser schützt deine Daten vor automatischer Löschung.'
                                        : 'Daten könnten bei geringem Speicherplatz gelöscht werden.'}
                                </span>
                            </div>
                        </div>
                        {isPersistent && <span className={styles.status}>Aktiv</span>}
                    </div>
                </div>
                <div className={styles.infoBox}>
                    <Info size={18} className={styles.infoIcon} />
                    <p className={styles.infoText}>
                        Luma nutzt IndexedDB. Für maximale Sicherheit solltest du regelmäßig Backups erstellen.
                    </p>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Backup & Wiederherstellung</h2>
                <div className={styles.card}>
                    <button className={styles.item} onClick={handleExport}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: 'var(--color-accent)' }}>
                                {exported ? <Check size={18} /> : <Download size={18} />}
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Daten exportieren</span>
                                <span className={styles.itemDescription}>Lade alle deine Aufgaben als JSON-Datei herunter.</span>
                            </div>
                        </div>
                        {exported ? <span className={styles.status} style={{ color: 'var(--color-accent)' }}>Gespeichert</span> : <ChevronRight size={18} color="var(--color-text-tertiary)" />}
                    </button>

                    <button className={styles.item} onClick={handleImportClick} disabled={importing}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: 'var(--color-warning)' }}>
                                <Upload size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Daten importieren</span>
                                <span className={styles.itemDescription}>Lade ein Backup hoch, um deine Liste zu ergänzen.</span>
                            </div>
                        </div>
                        <AnimatePresence mode="wait">
                            {importing ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    ...
                                </motion.div>
                            ) : (
                                <ChevronRight size={18} color="var(--color-text-tertiary)" />
                            )}
                        </AnimatePresence>
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
                <h2 className={styles.sectionTitle}>Cloud Sync (Beta)</h2>
                <div className={styles.card}>
                    <div className={styles.item} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                        <div className={styles.itemContent}>
                            <div className={styles.iconWrapper} style={{ background: 'var(--color-bg-tertiary)' }}>
                                <Cloud size={18} />
                            </div>
                            <div className={styles.itemLabel}>
                                <span className={styles.itemName}>Mit Cloud verbinden</span>
                                <span className={styles.itemDescription}>Synchronisiere deine Aufgaben über alle Geräte hinweg.</span>
                            </div>
                        </div>
                        <span className={styles.itemDescription}>In Kürze</span>
                    </div>
                </div>
                <div className={styles.infoBox} style={{ background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.1)' }}>
                    <p className={styles.infoText} style={{ color: 'var(--color-danger)', fontSize: '13px' }}>
                        Hinweis: Cloud-Sync ermöglicht die Speicherung außerhalb deines Browsers, sodass Daten auch nach dem Löschen der App erhalten bleiben.
                    </p>
                </div>
            </section>
        </motion.div>
    );
};
