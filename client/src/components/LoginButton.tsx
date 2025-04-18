// import { signInWithPopup } from "firebase/auth";
// import { auth, provider } from "../libs/firebase";

// export default function LoginButton() {
//   const handleLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const token = await result.user.getIdToken();
//       console.log("🔥 IDトークン:", token);
//     } catch (error) {
//       console.error("ログイン失敗:", error);
//     }
//   };

//   return (
//     <button
//       onClick={handleLogin}
//       className="px-4 py-2 bg-blue-500 text-white rounded"
//     >
//       Googleでログイン
//     </button>
//   );
// }
