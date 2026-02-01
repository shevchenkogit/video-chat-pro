import React, { useState, useEffect} from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Internal assets and logic
import { userActions } from '../../redux/slices/userSlice';
import "./authGoogle.css";

/**
 * AuthGoogle Component
 * Handles Google OAuth2 authentication flow
 */
const AuthGoogle = ({ disabled }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Context & Redux State
    const { OAuth2User, isAuth, getToken } = useSelector(state => state.user);

    // Local State
    const [isPending, setIsPending] = useState(false);

    // Google Login Configuration
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            if (codeResponse) {
                dispatch(userActions.OAuth2logIn(codeResponse.access_token));
            }
        },
        onError: (error) => console.error('Login Failed:', error)
    });

    // Auth Side Effects
    useEffect(() => {
        // Trigger backend login when Google user data is received
        if (OAuth2User?.email && !isPending && !getToken) {
            setIsPending(true);
            dispatch(userActions.logInWithGoogle({
                email: OAuth2User.email, 
                userName: OAuth2User.name
            }));
        }
    
        // Navigation logic based on auth result
        if (getToken) {
            setIsPending(false);
            if (getToken.msg === "user not exist!" || getToken.error) {
                navigate("/");
            } else if (typeof getToken === 'string' && isAuth) {
                navigate("/user_page");
            }
        }
    }, [OAuth2User, getToken, isAuth, isPending, dispatch, navigate]);

    // Cleanup: logOut function (optional, kept per your request)
    const logOut = () => {
        googleLogout();
        // Note: setProfile was not defined, consider adding if needed
    };

    return (
        <button 
            type="button"
            className="google-button"
            onClick={() => !disabled && login()} 
            disabled={disabled}
        >
            <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
        </button>
    );
};

export { AuthGoogle };