import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../api/admin'
import { Button } from '../components/Button'

export default function AdminLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await loginAdmin(password)
            navigate('/admin/dashboard')
        } catch (err) {
            setError('Hibás jelszó')
        }
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <h2>Admin Belépés</h2>
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="field">
                        <label className="field__label">Jelszó</label>
                        <input
                            type="password"
                            className="field__input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Add meg az admin jelszót"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <Button type="submit" variant="primary">
                        Belépés
                    </Button>
                </form>
            </div>
        </div>
    )
}
