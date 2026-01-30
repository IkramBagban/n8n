import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/signin');
    }

    const settingsCategories = [
        {
            icon: User,
            title: "Personal Information",
            description: "Update your name, email, and profile picture",
            disabled: true,
        },
        {
            icon: Bell,
            title: "Notifications",
            description: "Manage email and push notifications",
            disabled: true,
        },
        {
            icon: Shield,
            title: "Security",
            description: "Password, two-factor authentication, and sessions",
            disabled: true,
        },
        {
            icon: Palette,
            title: "Appearance",
            description: "Customize theme and display preferences",
            disabled: true,
        },
    ];

    return (
        <div className="flex flex-col min-h-full">
            <div className="border-b border-gray-200 bg-white">
                <div className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="w-6 h-6 text-gray-700" />
                        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Manage your account preferences and settings</p>
                </div>
            </div>

            <div className="flex-1 px-8 py-6">
                <div className="max-w-4xl">
                    <div className="grid gap-4">
                        {settingsCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div
                                    key={category.title}
                                    className={`bg-white rounded-lg border border-gray-200 p-6 transition-all ${
                                        category.disabled
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:border-gray-300 hover:shadow-sm cursor-pointer'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {category.title}
                                                </h3>
                                                {category.disabled && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                        Coming Soon
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                        <p className="text-sm text-gray-600">
                            If you need assistance with your account settings or have questions about security, 
                            please reach out to your administrator or contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
