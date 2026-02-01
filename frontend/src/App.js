// App.js
import { Routes, Route } from 'react-router-dom';
import { HomePage } from "./pages/homePage/homePage";
import { Signup } from './pages/signup/signup';
import { UserPage } from './pages/userPage/userPage';
import { EmailVerification as EmailVereficated } from './pages/verefEmail/emailVereficated';
// Замість старого імпорту напиши так:
import { VerifyEmail } from './pages/verefEmail/verefEmail';
import { EmailVerification } from './pages/verefEmail/emailVereficated';

// І в самому списку Routes (внизу файлу) заміни компоненти:


import "./App.css";

const App = () => {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/email_veref" element={<VerifyEmail />} />
                <Route path="/email_vereficated" element={<EmailVerification />} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/user_page" element={<UserPage/>} />
                <Route path="/email_vereficated" element={<EmailVereficated/>} />
            </Routes>
        </div>
    );
}
export default App;