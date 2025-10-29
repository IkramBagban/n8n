export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 bg-gray-50">
            {children}
        </main>
    )
}