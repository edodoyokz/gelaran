"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle,
    Building2,
    Globe,
    Instagram,
    Twitter,
    Facebook,
    Sparkles,
    Users,
    TrendingUp,
    Shield,
    Clock,
    ChevronRight,
    PartyPopper,
} from "lucide-react";

interface ApplicationData {
    id: string;
    organizationName: string;
    organizationSlug: string;
    organizationDescription: string | null;
    websiteUrl: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTwitter: string | null;
    socialTiktok: string | null;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    isVerified: boolean;
    createdAt: string;
}

interface FormData {
    organizationName: string;
    organizationDescription: string;
    websiteUrl: string;
    socialFacebook: string;
    socialInstagram: string;
    socialTwitter: string;
    socialTiktok: string;
}

const BENEFITS = [
    {
        icon: Users,
        title: "Reach Millions",
        description: "Access our growing community of event-goers looking for their next experience",
    },
    {
        icon: TrendingUp,
        title: "Powerful Analytics",
        description: "Track sales, understand your audience, and optimize your events with real-time data",
    },
    {
        icon: Shield,
        title: "Secure Payments",
        description: "Get paid reliably with our secure payment processing and fast payouts",
    },
    {
        icon: Sparkles,
        title: "Easy Management",
        description: "Create, manage, and promote your events all from one intuitive dashboard",
    },
];

export default function BecomeOrganizerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hasApplication, setHasApplication] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [application, setApplication] = useState<ApplicationData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        organizationName: "",
        organizationDescription: "",
        websiteUrl: "",
        socialFacebook: "",
        socialInstagram: "",
        socialTwitter: "",
        socialTiktok: "",
    });
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    const checkStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/organizer/apply");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/become-organizer");
                    return;
                }
                setError(data.error?.message || "Failed to check status");
                return;
            }

            if (data.success) {
                setHasApplication(data.data.hasApplication);
                setIsOrganizer(data.data.isOrganizer);
                setApplication(data.data.application);
            }
        } catch {
            setError("Failed to check application status");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};

        if (!formData.organizationName.trim()) {
            errors.organizationName = "Organization name is required";
        } else if (formData.organizationName.trim().length < 3) {
            errors.organizationName = "Organization name must be at least 3 characters";
        } else if (formData.organizationName.trim().length > 100) {
            errors.organizationName = "Organization name must be less than 100 characters";
        }

        if (formData.websiteUrl && !formData.websiteUrl.match(/^https?:\/\/.+/)) {
            errors.websiteUrl = "Please enter a valid URL starting with http:// or https://";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const res = await fetch("/api/organizer/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error?.message || "Failed to submit application");
                return;
            }

            setSuccess(true);
            setHasApplication(true);
            setApplication(data.data.organizerProfile);
        } catch {
            setError("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (isOrganizer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re Already an Organizer!</h1>
                    <p className="text-gray-600 mb-8">
                        You already have organizer privileges. Start creating amazing events!
                    </p>
                    <Link
                        href="/organizer/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                    >
                        Go to Dashboard
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        );
    }

    if (hasApplication && application) {
        if (application.verificationStatus === "PENDING") {
            return (
                <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="h-10 w-10 text-yellow-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Under Review</h1>
                        <p className="text-gray-600 mb-4">
                            Your application for <strong>{application.organizationName}</strong> is being reviewed by our team.
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                            Submitted on {new Date(application.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
                            <p className="text-sm text-gray-500 mb-2">What happens next?</p>
                            <ul className="text-left text-sm text-gray-700 space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>We&apos;ll review your application within 1-3 business days</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>You&apos;ll receive an email notification once approved</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Then you can start creating and managing events</span>
                                </li>
                            </ul>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            );
        }

        if (application.verificationStatus === "REJECTED") {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Not Approved</h1>
                        <p className="text-gray-600 mb-8">
                            Unfortunately, your application for <strong>{application.organizationName}</strong> was not approved.
                            Please contact support for more information.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                            >
                                Contact Support
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PartyPopper className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for applying to become an organizer. We&apos;ll review your application and get back to you within 1-3 business days.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                    >
                        Back to Home
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Become an Organizer</h1>
                            <p className="text-sm text-gray-500">Start hosting amazing events</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
                            <Building2 className="h-12 w-12 mb-4 opacity-90" />
                            <h2 className="text-2xl font-bold mb-2">Host Your Events</h2>
                            <p className="text-indigo-100 mb-4">
                                Join thousands of organizers who trust our platform to create unforgettable experiences.
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <p className="text-2xl font-bold">10K+</p>
                                    <p className="text-indigo-200">Events Hosted</p>
                                </div>
                                <div className="w-px h-10 bg-indigo-400" />
                                <div>
                                    <p className="text-2xl font-bold">500K+</p>
                                    <p className="text-indigo-200">Tickets Sold</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Why become an organizer?</h3>
                            <div className="space-y-4">
                                {BENEFITS.map((benefit) => (
                                    <div key={benefit.title} className="flex items-start gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                                            <benefit.icon className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{benefit.title}</p>
                                            <p className="text-sm text-gray-500">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Details</h2>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Organization Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="organizationName"
                                            value={formData.organizationName}
                                            onChange={(e) => handleInputChange("organizationName", e.target.value)}
                                            placeholder="Your organization or brand name"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                formErrors.organizationName ? "border-red-300" : "border-gray-200"
                                            }`}
                                        />
                                    </div>
                                    {formErrors.organizationName && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.organizationName}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        id="organizationDescription"
                                        rows={4}
                                        value={formData.organizationDescription}
                                        onChange={(e) => handleInputChange("organizationDescription", e.target.value)}
                                        placeholder="Tell us about your organization, the types of events you plan to host, and your experience..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        Website
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="url"
                                            id="websiteUrl"
                                            value={formData.websiteUrl}
                                            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                                            placeholder="https://yourwebsite.com"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                formErrors.websiteUrl ? "border-red-300" : "border-gray-200"
                                            }`}
                                        />
                                    </div>
                                    {formErrors.websiteUrl && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.websiteUrl}</p>
                                    )}
                                </div>

                                <div>
                                    <span className="block text-sm font-medium text-gray-700 mb-3">Social Media</span>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="socialInstagram"
                                                value={formData.socialInstagram}
                                                onChange={(e) => handleInputChange("socialInstagram", e.target.value)}
                                                placeholder="Instagram username"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="socialFacebook"
                                                value={formData.socialFacebook}
                                                onChange={(e) => handleInputChange("socialFacebook", e.target.value)}
                                                placeholder="Facebook page URL"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="socialTwitter"
                                                value={formData.socialTwitter}
                                                onChange={(e) => handleInputChange("socialTwitter", e.target.value)}
                                                placeholder="Twitter/X username"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                            </svg>
                                            <input
                                                type="text"
                                                id="socialTiktok"
                                                value={formData.socialTiktok}
                                                onChange={(e) => handleInputChange("socialTiktok", e.target.value)}
                                                placeholder="TikTok username"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-500 mb-4">
                                        By submitting this application, you agree to our{" "}
                                        <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Submit Application
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
