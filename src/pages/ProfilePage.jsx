// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect to fetch user data from Firestore
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch data from the user's document in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Assuming 'favorites' and 'history' are arrays in the user's document
          setFavorites(userData.favorites || []);
          setHistory(userData.history || []);
        } else {
          console.log("No such user document!");
        }
      } else {
        setUser(null); // No user is signed in
      }
      setLoading(false); // Set loading to false after checking auth and fetching data
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-[#111827] p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          {/* You can use the user's photoURL or display initials */}
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full mr-4" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-xl font-bold mr-4">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.displayName || "My Profile"}</h1>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Favorites Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">⭐ Favorites</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-400 text-center py-4">You haven't added any favorites yet.</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favorites.map((manga) => (
                <li key={manga.id} className="text-center">
                  {/* It's better to create a reusable MangaCard component for this */}
                  <img src={manga.coverImage} alt={manga.title} className="rounded shadow-md aspect-[2/3] object-cover" />
                  <p className="text-sm mt-2 truncate">{manga.title}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* History Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">📖 Reading History</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No reading history found.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((item) => (
                <li key={item.id} className="bg-[#1f2937] p-3 rounded-md flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-400">Last read: Chapter {item.lastReadChapter}</p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-full">
                    Continue
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}