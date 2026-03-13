import { useEffect, useState } from 'react'
import { getAdminSessions, getAdminStats, getAdminTopNames } from '../api/admin'
import { AdminLayout } from '../components/AdminLayout'
import { Card } from '../components/Card'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [topNames, setTopNames] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, sessionsData, topNamesData] = await Promise.all([
                    getAdminStats(),
                    getAdminSessions(),
                    getAdminTopNames(),
                ])
                setStats(statsData)
                setSessions(sessionsData.items)
                setTopNames(topNamesData)
            } catch (error) {
                console.error('Failed to fetch admin data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading">Betöltés...</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <h1>Áttekintés</h1>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <Card>
                        <h3>Összes Szoba</h3>
                        <div className="stat-value">{stats?.totalSessions}</div>
                    </Card>
                    <Card>
                        <h3>Összes Résztvevő</h3>
                        <div className="stat-value">{stats?.totalParticipants}</div>
                    </Card>
                    <Card>
                        <h3>Összes Swipe</h3>
                        <div className="stat-value">{stats?.totalSwipes}</div>
                    </Card>
                    <Card>
                        <h3>Összes Match</h3>
                        <div className="stat-value">{stats?.totalMatches}</div>
                    </Card>
                </div>

                <div className="dashboard-content">
                    {/* Recent Sessions */}
                    <div className="dashboard-section">
                        <h2>Legutóbbi Szobák</h2>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Kód</th>
                                        <th>Vezetéknév</th>
                                        <th>Létrehozva</th>
                                        <th>Résztvevők</th>
                                        <th>Fázis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => (
                                        <tr key={session.id}>
                                            <td>{session.code}</td>
                                            <td>{session.lastName}</td>
                                            <td>{new Date(session.createdAt).toLocaleDateString()}</td>
                                            <td>{session.participants?.length || 0}</td>
                                            <td>{session.phase}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Names */}
                    <div className="dashboard-section">
                        <h2>Top Nevek</h2>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Név</th>
                                        <th>Nem</th>
                                        <th>Likeok</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topNames.map((name) => (
                                        <tr key={name.id}>
                                            <td>{name.value}</td>
                                            <td>{name.gender === 'MALE' ? 'Fiú' : 'Lány'}</td>
                                            <td>{name.likeCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
