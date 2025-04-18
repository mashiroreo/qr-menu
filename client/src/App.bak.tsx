// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <h1 className="text-3xl font-bold text-pink-500">Hello Tailwind!</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App



// import { useEffect, useState } from "react";

// function App() {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     fetch("http://localhost:3000/users")
//       .then((res) => res.json())
//       .then((data) => setUser(data))
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">ユーザー情報</h1>
//       {user ? (
//         <div className="bg-white text-black p-4 rounded shadow">
//           <p><strong>名前：</strong>{user.name}</p>
//           <p><strong>メール：</strong>{user.email}</p>
//         </div>
//       ) : (
//         <p>読み込み中...</p>
//       )}
//     </div>
//   );
// }

// export default App;



// import LoginButton from "./components/LoginButton";

// function App() {
//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">QRメニュー管理画面</h1>
//       <LoginButton />
//     </div>
//   );
// }

// export default App;
