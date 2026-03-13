import type { PropsWithChildren } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../api/admin'
import { Button } from './Button'

export function AdminLayout({ children }: PropsWithChildren) {
    const navigate = useNavigate()

    const handleLogout = () => {
        logoutAdmin()
        navigate('/admin/login')
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__logo">
                    <h2>Nameder Admin</h2>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className="admin-nav__link">
                        Dashboard
                    </Link>
                    {/* Add more links here later if needed */}
                </nav>
                <div className="admin-sidebar__footer">
                    <Button variant="ghost" onClick={handleLogout} style={{ width: '100%' }}>
                        Kijelentkezés
                    </Button>
                </div>
            </aside>
            <main className="admin-content">{children}</main>
        </div>
    )
}
