import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../libs/firebase';

const Login = () => {
    const handleGoogleLogin = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const idToken = await result.user.getIdToken();
          console.log('ID Token:', idToken);
      
          // 👇 ここから追記部分
          const res = await fetch("http://localhost:3000/api/users/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
      
          if (!res.ok) {
            console.error("サーバーからエラー:", await res.text());
            return;
          }
      
          const data = await res.json();
          console.log("ログインユーザー情報:", data);
        } catch (error) {
          console.error('Error signing in with Google:', error);
        }
      };
      
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          QR Menu
        </h1>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Googleでログイン
        </button>
      </div>
    </div>
  );
};

export default Login; 