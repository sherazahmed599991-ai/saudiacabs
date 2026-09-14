'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Lock, CheckCircle, AlertCircle, Loader2, Mail, KeyRound } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();

    const [email, setEmail]           = useState('');
    const [displayName, setDisplayName] = useState('');
    const [savingName, setSavingName]  = useState(false);
    const [nameSaved, setNameSaved]    = useState(false);
    const [nameError, setNameError]    = useState('');

    const [newPass, setNewPass]        = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [savingPass, setSavingPass]  = useState(false);
    const [passSaved, setPassSaved]    = useState(false);
    const [passError, setPassError]    = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            setEmail(session.user.email || '');
            setDisplayName(session.user.user_metadata?.display_name || '');
        });
    }, [router]);

    const handleSaveName = async () => {
        if (!displayName.trim()) { setNameError('Name cannot be empty.'); return; }
        setSavingName(true);
        setNameError('');
        const { error } = await supabase.auth.updateUser({
            data: { display_name: displayName.trim() }
        });
        setSavingName(false);
        if (error) { setNameError(error.message); }
        else { setNameSaved(true); setTimeout(() => setNameSaved(false), 3000); }
    };

    const handleChangePassword = async () => {
        setPassError('');
        if (newPass.length < 8) { setPassError('Password must be at least 8 characters.'); return; }
        if (newPass !== confirmPass) { setPassError('Passwords do not match.'); return; }
        setSavingPass(true);
        const { error } = await supabase.auth.updateUser({ password: newPass });
        setSavingPass(false);
        if (error) { setPassError(error.message); }
        else {
            setPassSaved(true);
            setNewPass('');
            setConfirmPass('');
            setTimeout(() => setPassSaved(false), 4000);
        }
    };

    return (
        <div className="text-white max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    Account Settings
                </h1>
                <p className="text-neutral-400 mt-1">Manage your admin profile and security</p>
            </div>

            {/* Profile */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden mb-5">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-300 text-xs uppercase tracking-widest font-bold">
                                Email Address
                            </Label>
                            <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-700 rounded-lg px-3 py-2.5">
                                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                                <span className="text-sm text-neutral-400 font-mono">{email || '...'}</span>
                                <span className="ml-auto text-[10px] text-neutral-600 uppercase tracking-widest">read-only</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="display-name" className="text-neutral-300 text-xs uppercase tracking-widest font-bold">
                                Display Name
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="display-name"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    className="bg-neutral-900 border-neutral-700 text-white"
                                />
                                <Button
                                    onClick={handleSaveName}
                                    disabled={savingName}
                                    className={`shrink-0 font-bold ${nameSaved ? 'bg-green-500 hover:bg-green-500 text-white' : 'bg-primary text-black hover:bg-primary/90'}`}
                                >
                                    {savingName
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : nameSaved
                                        ? <><CheckCircle className="w-4 h-4 mr-1" />Saved</>
                                        : 'Save'}
                                </Button>
                            </div>
                            {nameError && (
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{nameError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Change Password
                    </h2>

                    <div className="space-y-4 max-w-sm">
                        <div className="space-y-2">
                            <Label htmlFor="new-pass" className="text-neutral-300 text-xs uppercase tracking-widest font-bold">
                                New Password
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <Input
                                    id="new-pass"
                                    type="password"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                    placeholder="Min 8 characters"
                                    className="pl-9 bg-neutral-900 border-neutral-700 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-pass" className="text-neutral-300 text-xs uppercase tracking-widest font-bold">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <Input
                                    id="confirm-pass"
                                    type="password"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                    placeholder="Repeat new password"
                                    className="pl-9 bg-neutral-900 border-neutral-700 text-white"
                                />
                            </div>
                        </div>

                        {passError && (
                            <p className="text-sm text-red-400 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />{passError}
                            </p>
                        )}

                        {passSaved && (
                            <p className="text-sm text-green-400 flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 shrink-0" />Password updated successfully!
                            </p>
                        )}

                        <Button
                            onClick={handleChangePassword}
                            disabled={savingPass || !newPass}
                            className="bg-primary text-black hover:bg-primary/90 font-bold w-full"
                        >
                            {savingPass
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                                : 'Update Password'
                            }
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
