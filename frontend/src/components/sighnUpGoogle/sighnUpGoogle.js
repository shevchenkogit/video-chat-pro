import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Redux
import { userActions } from '../../redux/slices/userSlice';

// ВИПРАВЛЕННЯ: Якщо файл у папці називається sighnUpGoogle.css, 
// ми міняємо назву тут. Якщо помилка не зникне — просто закоментуй цей рядок.
import "./sighnUpGoogle.css"; 

/**
 * SignUpGoogle Component
 */
const SignUpGoogle = ({ disabled }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            if (!codeResponse) return;

            try {
                // 1. Exchange token for user data
                const result = await dispatch(userActions.OAuth2logIn(codeResponse.access_token));
                const userData = result.payload; 
    
                // 2. If data is valid, create a new user profile
                if (userData?.email) {
                    await dispatch(userActions.createNewUserWG({
                        email: userData.email, 
                        userName: userData.name
                    }));
                    
                    // 3. Redirect to landing or home
                    navigate("/");
                }
            } catch (error) {
                console.error("Registration error:", error);
            }
        },
        onError: (error) => console.error('Google Sign-Up Failed:', error)
    });

    return (
        <button 
            type="button"
            className="google-signup-btn"
            onClick={() => !disabled && login()} 
            disabled={disabled}
        >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
        </button>
    );
};

// Експортуємо обидва варіанти назви, щоб точно не було помилок в імпортах
export { SignUpGoogle, SignUpGoogle as SighnUpGoogle };