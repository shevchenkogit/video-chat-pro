import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userActions } from '../../redux/slices/userSlice';

export const EmailVerification = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    
    const { verification } = useSelector(state => state.user);
    const [countdown, setCountdown] = useState(20); 
    const [isVerified, setIsVerified] = useState(false);

    const token = searchParams.get('token');

    // 1. Запит на бекенд
    useEffect(() => {
        if (token && token.length > 5) {
            dispatch(userActions.emailVerification(token));
        }
    }, [token, dispatch]);

    // 2. Логіка таймера після успішної верифікації
    useEffect(() => {
        if (verification) {
            setIsVerified(true);
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [verification]);

    // 3. Редирект по завершенню часу
    useEffect(() => {
        if (countdown === 0) {
            navigate('/');
        }
    }, [countdown, navigate]);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            padding: '20px'
        }}>
            {isVerified ? (
                <div className="verification-card" style={{ 
                    backgroundColor: 'white', 
                    padding: '40px', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    maxWidth: '500px',
                    width: '100%',
                    animation: 'slideUp 0.5s ease-out'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                    <h1 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '28px' }}>Готово!</h1>
                    <p style={{ color: '#7f8c8d', fontSize: '18px' }}>Пошту успішно підтверджено.</p>
                    
                    <div style={{ 
                        backgroundColor: '#f0f7ff', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        margin: '25px 0',
                        textAlign: 'left',
                        borderLeft: '5px solid #007bff'
                    }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#0056b3', display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>💡</span> Порада для входу:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                            <li>Якщо через <b>Google</b> — тисніть синю кнопку Google.</li>
                            <li>Якщо через <b>Email</b> — вводьте дані в поля форми.</li>
                        </ul>
                    </div>

                    <p style={{ color: '#95a5a6', fontSize: '14px' }}>
                        Ми перенаправимо вас автоматично через <br/>
                        <strong style={{ fontSize: '22px', color: '#007bff' }}>{countdown}</strong> сек.
                    </p>
                    
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '25px',
                            padding: '14px 40px',
                            fontSize: '16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            width: '100%',
                            transition: 'background 0.3s'
                        }}
                    >
                        Увійти зараз
                    </button>
                </div>
            ) : (
                <div style={{ animation: 'fadeIn 1s infinite alternate' }}>
                    <div className="spinner" style={{ 
                        border: '4px solid rgba(0,0,0,0.1)', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        borderLeftColor: '#007bff', 
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <h2 style={{ color: '#7f8c8d', fontWeight: '400' }}>Перевіряємо ваш токен...</h2>
                </div>
            )}
        </div>
    );
};