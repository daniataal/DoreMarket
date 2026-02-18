'use client';

import { useActionState, useState } from 'react';
import { updateProfile } from '@/lib/actions';
import { User, Building2, ShieldCheck, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsForm({ user }: { user: any }) {
    const [message, dispatch, isPending] = useActionState(updateProfile, undefined);
    const [userType, setUserType] = useState(user?.userType || 'INDIVIDUAL');

    return (
        <form action={dispatch} className="space-y-10">
            {/* Account Information Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground text-lg">Account Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={user?.name || ''}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                        <div className="p-3 bg-secondary/10 rounded-lg text-muted-foreground border border-transparent cursor-not-allowed">
                            {user?.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="password">New Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Leave blank to keep current"
                            minLength={6}
                        />
                    </div>
                </div>
            </div>

            {/* KYC & Verification Section */}
            <div id="kyc" className="space-y-6 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground text-lg">KYC & Identity Verification</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${user?.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                        user?.kycStatus === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                            user?.kycStatus === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-secondary text-muted-foreground'
                        }`}>
                        {user?.kycStatus === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                            user?.kycStatus === 'PENDING' ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                        {user?.kycStatus || 'PENDING'}
                    </div>
                </div>

                {/* User Type Selection */}
                <div className="flex gap-4 p-1 bg-secondary/30 rounded-xl w-fit">
                    <button
                        type="button"
                        onClick={() => setUserType('INDIVIDUAL')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${userType === 'INDIVIDUAL'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Individual
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType('COMPANY')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${userType === 'COMPANY'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Company
                    </button>
                    <input type="hidden" name="userType" value={userType} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic KYC Fields */}
                    {userType === 'INDIVIDUAL' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    defaultValue={user?.firstName || ''}
                                    className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    defaultValue={user?.lastName || ''}
                                    className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="companyName">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    id="companyName"
                                    defaultValue={user?.companyName || ''}
                                    className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all"
                                    placeholder="Registered Company Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="companyRegistration">Trade License / Reg No.</label>
                                <input
                                    type="text"
                                    name="companyRegistration"
                                    id="companyRegistration"
                                    defaultValue={user?.companyRegistration || ''}
                                    className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all"
                                    placeholder="Enter license or registration number"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            defaultValue={user?.phoneNumber || ''}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="nationality">Nationality</label>
                        <input
                            type="text"
                            name="nationality"
                            id="nationality"
                            defaultValue={user?.nationality || ''}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="e.g. United Arab Emirates"
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="address">Full Residential/Business Address</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            defaultValue={user?.address || ''}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Street, City, Building, Country"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="passportNumber">Passport / ID Number</label>
                        <input
                            type="text"
                            name="passportNumber"
                            id="passportNumber"
                            defaultValue={user?.passportNumber || ''}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="passportExpiry">Expiration Date</label>
                        <input
                            type="date"
                            name="passportExpiry"
                            id="passportExpiry"
                            defaultValue={user?.passportExpiry || ''}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                        />
                    </div>
                </div>

                {/* Document Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <label className="text-sm font-medium text-foreground">Identity Document (Passport/ID)</label>
                        </div>
                        <div className="relative group">
                            <input
                                type="file"
                                name="idPassportFile"
                                accept="image/*,.pdf"
                                className="hidden"
                                id="id-upload"
                            />
                            <label
                                htmlFor="id-upload"
                                className="flex flex-col items-center justify-center w-full min-h-[120px] bg-secondary/20 hover:bg-secondary/40 border-2 border-dashed border-border group-hover:border-primary/50 rounded-xl cursor-pointer transition-all p-4"
                            >
                                <Upload className="w-6 h-6 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-xs text-center text-muted-foreground group-hover:text-foreground">
                                    {user?.idPassportUrl ? 'Replace current ID/Passport' : 'Upload ID or Passport Copy'}
                                </span>
                                {user?.idPassportUrl && (
                                    <span className="mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-full">
                                        Document Uploaded
                                    </span>
                                )}
                            </label>
                        </div>
                    </div>

                    {userType === 'COMPANY' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <label className="text-sm font-medium text-foreground">Company Documents</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="companyDocFile"
                                    accept=".pdf,image/*"
                                    className="hidden"
                                    id="company-upload"
                                />
                                <label
                                    htmlFor="company-upload"
                                    className="flex flex-col items-center justify-center w-full min-h-[120px] bg-secondary/20 hover:bg-secondary/40 border-2 border-dashed border-border group-hover:border-primary/50 rounded-xl cursor-pointer transition-all p-4"
                                >
                                    <Upload className="w-6 h-6 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground">
                                        {user?.companyDocUrl ? 'Replace current company docs' : 'Upload Trade License / Cert of Inc.'}
                                    </span>
                                    {user?.companyDocUrl && (
                                        <span className="mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-full">
                                            Document Uploaded
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm font-medium">
                    {message && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.includes('success') ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                            {message.includes('success') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {message}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto bg-primary text-primary-foreground py-3 px-8 rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                    {isPending ? 'Updating Profile...' : 'Update Settings & KYC'}
                </button>
            </div>
        </form>
    );
}

