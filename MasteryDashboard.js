
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function MasteryDashboard() {
  const [user, setUser] = useState(null);
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "journals", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setJournal(docSnap.data().entry);
          }
        } catch (error) {
          console.error("Failed to load journal:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const saveJournal = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docRef = doc(db, "journals", user.uid);
      await setDoc(docRef, { entry: journal });
    } catch (error) {
      console.error("Failed to save journal:", error);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Mastery System</h1>
        <Button onClick={handleLogin}>Login with Google</Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Hello, {user.displayName}</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-2">Daily Journal</h2>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            rows={6}
          />
          <Button onClick={saveJournal} disabled={loading}>
            {loading ? "Saving..." : "Save Journal"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
