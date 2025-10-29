import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserCircle, Mail, Calendar } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/signin');
    }

    const user = session.user;

    return (
        <div className="flex flex-col min-h-full">
            <div className="border-b border-gray-200 bg-white">
                <div className="px-8 py-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
                </div>
            </div>

            <div className="flex-1 px-8 py-6">
                <div className="max-w-3xl">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {user.name || 'User'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Account Information</h3>
                                <div className="space-y-4">
                                    {user.name && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <UserCircle className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                                                <p className="text-sm text-gray-900 mt-1">{user.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                                            <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">User ID</p>
                                            <p className="text-sm text-gray-900 mt-1 font-mono">{user.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> To update your profile information, please contact your administrator or update your settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
