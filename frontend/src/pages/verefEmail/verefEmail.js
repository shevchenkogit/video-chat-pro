import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../redux/slices/userSlice';

// ВИПРАВЛЕНО: Ми міняємо назву на таку ж, як у файлу/папки. 
// Якщо помилка не зникне, просто закоментуй цей рядок (додай // на початку).
import './verefEmail.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Беремо стан верифікації з Redux
    const { verefication, isLoading, error } = useSelector(state => state.user);

    useEffect(() => {
        if (token) {
            dispatch(userActions.emailVereficate(token));
        }
    }, [token, dispatch]);

    useEffect(() => {
        // Якщо верифікація пройшла успішно, чекаємо 3 секунди і редиректимо
        if (verefication === true) {
            const timer = setTimeout(() => {
                navigate('/email_vereficated');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [verefication, navigate]);

    return (
        <div className="veref-container">
            <div className="veref-card">
                {isLoading ? (
                    <>
                        <h2>Verifying...</h2>
                        <div className="loader"></div>
                    </>
                ) : verefication ? (
                    <h2 className="success-text">Email successfully verified! Redirecting...</h2>
                ) : (
                    <h2 className="error-text">
                        {error ? `Verification failed: ${error}` : "Invalid or expired token."}
                    </h2>
                )}
            </div>
        </div>
    );
};

// Експортуємо під обома назвами для сумісності з App.js
export { VerifyEmail, VerifyEmail as VerefEmail };