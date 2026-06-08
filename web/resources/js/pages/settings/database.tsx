import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, Files, HardDrive, RotateCcw, Search, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Database settings',
        href: '/settings/database',
    },
];

// Async functions (logic only, no state management)
const performScan = async () => {
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 3000));
};

const performClearDocuments = async () => {
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

const performClearChunks = async () => {
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

const performResetDatabase = async () => {
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 2000));
};

export default function Database() {
    const [isScanning, setIsScanning] = useState(false);
    const [isClearingDocuments, setIsClearingDocuments] = useState(false);
    const [isClearingChunks, setIsClearingChunks] = useState(false);
    const [isResettingDatabase, setIsResettingDatabase] = useState(false);

    // In-component functions (state management + async logic)
    const handleScan = async () => {
        setIsScanning(true);
        try {
            await performScan();
            console.log('Scan completed');
        } catch (error) {
            console.error('Failed to scan database:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleClearDocuments = async () => {
        setIsClearingDocuments(true);
        try {
            await performClearDocuments();
            console.log('Documents cache cleared');
        } catch (error) {
            console.error('Failed to clear documents cache:', error);
        } finally {
            setIsClearingDocuments(false);
        }
    };

    const handleClearChunks = async () => {
        setIsClearingChunks(true);
        try {
            await performClearChunks();
            console.log('Chunks cache cleared');
        } catch (error) {
            console.error('Failed to clear chunks cache:', error);
        } finally {
            setIsClearingChunks(false);
        }
    };

    const handleResetDatabase = async () => {
        setIsResettingDatabase(true);
        try {
            await performResetDatabase();
            console.log('Database reset');
        } catch (error) {
            console.error('Failed to reset database:', error);
        } finally {
            setIsResettingDatabase(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Vector Database Info */}
                    <div className="space-y-4">
                        <HeadingSmall title="Vector Database" description="Status and analytics of your vector database (ChromaDB)" />
                        <div className="grid gap-4 text-sm md:grid-cols-3">
                            {/* Database Status Row */}
                            <div className="col-start-1 flex items-center justify-start">
                                <span className="flex items-center gap-2 font-bold text-slate-200">
                                    <Activity />
                                    Database Status
                                </span>
                            </div>
                            <div className="col-start-2 flex items-center justify-start">
                                <span>Active</span>
                            </div>
                            <div className="col-start-3 flex items-center justify-start">
                                <Button
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    className="cursor-pointer rounded-lg border border-slate-200/50 bg-transparent px-4 py-0 text-sm font-semibold text-slate-200 uppercase transition-all hover:bg-slate-100/10 disabled:opacity-50"
                                >
                                    <Search size={15} />
                                    {isScanning ? 'Scanning…' : 'Scan'}
                                </Button>
                            </div>

                            {/* Database Storage Row */}
                            <div className="col-start-1 flex justify-start align-middle">
                                <span className="flex items-center gap-2 font-bold text-slate-200">
                                    <HardDrive />
                                    Storage Size
                                </span>
                            </div>
                            <div className="col-start-2 flex justify-start align-middle">2.4 GB</div>

                            {/* Database Collections Row */}
                            <div className="col-start-1 flex justify-start align-middle">
                                <span className="flex items-center gap-2 font-bold text-slate-200">
                                    <Files />
                                    Active Collections
                                </span>
                            </div>
                            <div className="col-start-2 flex justify-start align-middle">12</div>
                        </div>
                    </div>

                    {/* Cache Status */}
                    <div className="space-y-4">
                        <HeadingSmall title="Cache Management" description="Manage document and chunk caches" />
                        <div className="grid gap-4 text-sm md:grid-cols-3">
                            {/* Cached Documents Row */}
                            <div className="col-start-1 flex items-center justify-start">
                                <span className="flex items-center gap-2 font-bold text-slate-200">
                                    <Zap />
                                    Cached Documents
                                </span>
                            </div>
                            <div className="col-start-2 flex items-center justify-start">
                                <span>156</span>
                            </div>
                            <div className="col-start-3 flex items-center justify-start">
                                <Button
                                    onClick={handleClearDocuments}
                                    disabled={isClearingDocuments}
                                    className="cursor-pointer rounded-lg border border-slate-200/50 bg-transparent px-4 py-0 text-sm font-semibold text-slate-200 uppercase transition-all hover:bg-slate-100/10 disabled:opacity-50"
                                >
                                    <RotateCcw size={15} />
                                    {isClearingDocuments ? 'Clearing…' : 'Clear'}
                                </Button>
                            </div>

                            {/* Cached Chunks Row */}
                            <div className="col-start-1 flex items-center justify-start">
                                <span className="flex items-center gap-2 font-bold text-slate-200">
                                    <Zap />
                                    Cached Chunks
                                </span>
                            </div>
                            <div className="col-start-2 flex items-center justify-start">
                                <span>4,821</span>
                            </div>
                            <div className="col-start-3 flex items-center justify-start">
                                <Button
                                    onClick={handleClearChunks}
                                    disabled={isClearingChunks}
                                    className="cursor-pointer rounded-lg border border-slate-200/50 bg-transparent px-4 py-0 text-sm font-semibold text-slate-200 uppercase transition-all hover:bg-slate-100/10 disabled:opacity-50"
                                >
                                    <RotateCcw size={15} />
                                    {isClearingChunks ? 'Clearing…' : 'Clear'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Reset Database Section */}
                    <div className="space-y-4">
                        <HeadingSmall title="Danger Zone" description="Irreversible database operations" />
                        <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-6">
                            <div>
                                <p className="font-medium text-slate-100">Reset Database</p>
                                <p className="text-sm text-slate-400">Delete all collections and vectors (irreversible)</p>
                            </div>
                            <Button
                                onClick={handleResetDatabase}
                                disabled={isResettingDatabase}
                                className="cursor-pointer rounded-sm bg-red-900 text-sm font-semibold text-red-100 transition-all hover:bg-red-800 disabled:opacity-50"
                            >
                                <Trash2 size={15} />
                                {isResettingDatabase ? 'Resetting…' : 'Reset Database'}
                            </Button>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
