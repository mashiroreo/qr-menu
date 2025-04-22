import { useState, useEffect } from "react";
import { auth } from "../../libs/firebase";

interface UserProfile {
  publicId: string;
  email: string;
  displayName: string;
}

export const UserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch("http://localhost:3000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUserProfile(data);
        setDisplayName(data.displayName);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("http://localhost:3000/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName }),
      });
      const data = await response.json();
      setUserProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">プロフィール</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <div className="mt-1">{userProfile.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            表示名
          </label>
          {isEditing ? (
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                onClick={handleUpdate}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                保存
              </button>
            </div>
          ) : (
            <div className="mt-1 flex justify-between items-center">
              <div>{userProfile.displayName}</div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                編集
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 